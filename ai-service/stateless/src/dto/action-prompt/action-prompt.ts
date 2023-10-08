export type ActionPromptDto = {
  id?: string;
  createdDate?: string;
  type: 'json' | 'typescript';
  contentType: string;
  accept: string;
  prompt: string;
  temperature: number;
  top_p: number;
  top_k: number;
  max_tokens_to_sample: number;
  stop_sequences: string[];
};

export type PromptDto = {
  id: string;
  createdDate: string;
  prompt: string;
  result: string;
};
