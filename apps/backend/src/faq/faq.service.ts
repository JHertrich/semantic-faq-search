import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import type { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { INDEX_NAME } from '../elastic/mapping';

interface SemanticTextField {
  text: string | string[];
  inference?: unknown;
}

interface FaqRawSource {
  id: string;
  questions: SemanticTextField;
  answer: SemanticTextField;
  answerHtml?: string;
}

export interface FaqDocument {
  id: string;
  questions: string[];
  answer: string;
}

function extractTexts(field: SemanticTextField): string[] {
  return Array.isArray(field.text) ? field.text : [field.text];
}

function extractText(field: SemanticTextField): string {
  return Array.isArray(field.text) ? field.text[0] ?? '' : field.text;
}

export interface SearchResultItem extends FaqDocument {
  score: number;
  highlight: {
    questions?: string[];
    answer?: string[];
  };
}

@Injectable()
export class FaqService {
  private readonly logger = new Logger(FaqService.name);

  constructor(private readonly esService: ElasticsearchService) {}

  async findAll(): Promise<FaqDocument[]> {
    try {
      const response = await this.esService.search<FaqRawSource>({
        index: INDEX_NAME,
        size: 100,
        query: { match_all: {} },
      });

      return response.hits.hits.map((hit) => ({
        id: hit._source!.id,
        questions: extractTexts(hit._source!.questions),
        answer: hit._source!.answerHtml ?? extractText(hit._source!.answer),
      }));
    } catch (err) {
      this.logger.error('findAll failed', err);
      throw new ServiceUnavailableException('Elasticsearch is not reachable');
    }
  }

  async search(query: string): Promise<SearchResultItem[]> {
    try {
      const searchParams: SearchRequest = {
        index: INDEX_NAME,
        query: {
          bool: {
            should: [
              { semantic: { field: 'questions', query } },
              { semantic: { field: 'answer',    query } },
            ],
            minimum_should_match: 1,
          },
        },
        highlight: {
          fields: {
            questions: { fragment_size: 200, number_of_fragments: 1 },
            answer:    { fragment_size: 200, number_of_fragments: 1 },
          },
          pre_tags:  ['<mark>'],
          post_tags: ['</mark>'],
        },
        min_score: 1.80,
      };
      const response = await this.esService.search<FaqRawSource>(searchParams);

      return response.hits.hits
        .map((hit) => ({
          id:        hit._source!.id,
          questions: extractTexts(hit._source!.questions),
          answer:    hit._source!.answerHtml ?? extractText(hit._source!.answer),
          score:     hit._score ?? 0,
          highlight: {
            questions: hit.highlight?.['questions'],
            answer:    hit.highlight?.['answer'],
          },
        }))
        .sort((a, b) => b.score - a.score);
    } catch (err) {
      this.logger.error('search failed', err);
      throw new ServiceUnavailableException('Search failed – Elasticsearch may be unreachable');
    }
  }
}
