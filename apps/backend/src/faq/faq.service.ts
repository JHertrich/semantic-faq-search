import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { INDEX_NAME } from '../elastic/mapping';

interface SemanticTextField {
  text: string;
  inference?: unknown;
}

interface FaqRawSource {
  id: string;
  question: string | SemanticTextField;
  answer: string | SemanticTextField;
}

export interface FaqDocument {
  id: string;
  question: string;
  answer: string;
}

function extractText(field: string | SemanticTextField): string {
  if (typeof field === 'string') return field;
  return field?.text ?? '';
}

export interface SearchResultItem extends FaqDocument {
  score: number;
  highlight: {
    question?: string[];
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
        question: extractText(hit._source!.question),
        answer: extractText(hit._source!.answer),
      }));
    } catch (err) {
      this.logger.error('findAll failed', err);
      throw new ServiceUnavailableException('Elasticsearch is not reachable');
    }
  }

  async search(query: string): Promise<SearchResultItem[]> {
    try {
      const response = await this.esService.search<FaqRawSource>({
        index: INDEX_NAME,
        query: {
          bool: {
            should: [
              { semantic: { field: 'question', query } } as any,
              { semantic: { field: 'answer',   query } } as any,
            ],
            minimum_should_match: 1,
          },
        },
        highlight: {
          fields: {
            question: { fragment_size: 200, number_of_fragments: 1 },
            answer:   { fragment_size: 200, number_of_fragments: 1 },
          },
          pre_tags:  ['<mark>'],
          post_tags: ['</mark>'],
        },
        min_score: 1.80,
      } as any);

      return response.hits.hits
        .map((hit) => ({
          id:       hit._source!.id,
          question: extractText(hit._source!.question),
          answer:   extractText(hit._source!.answer),
          score:    hit._score ?? 0,
          highlight: {
            question: hit.highlight?.['question'] as string[] | undefined,
            answer:   hit.highlight?.['answer']   as string[] | undefined,
          },
        }))
        .sort((a, b) => b.score - a.score);
    } catch (err) {
      this.logger.error('search failed', err);
      throw new ServiceUnavailableException('Search failed – Elasticsearch may be unreachable');
    }
  }
}
