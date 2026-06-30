import type { MappingProperty } from '@elastic/elasticsearch/lib/api/types';

export const INDEX_NAME = 'faqs';
export const INFERENCE_ENDPOINT_ID = 'my-e5-endpoint';

export const faqMapping: Record<string, MappingProperty> = {
  id: {
    type: 'keyword',
  },
  questions: {
    type: 'semantic_text' as unknown as 'text',
    inference_id: INFERENCE_ENDPOINT_ID,
  } as any,
  answer: {
    type: 'semantic_text' as unknown as 'text',
    inference_id: INFERENCE_ENDPOINT_ID,
  } as any,
  answerHtml: {
    type: 'text',
    index: false,
  },
};
