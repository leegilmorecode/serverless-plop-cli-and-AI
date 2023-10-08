export const schema = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    contentType: { type: 'string' },
    accept: { type: 'string' },
    prompt: { type: 'string' },
    temperature: { type: 'number' },
    top_p: { type: 'number' },
    top_k: { type: 'number' },
    max_tokens_to_sample: { type: 'number' },
    stop_sequences: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: [
    'type',
    'contentType',
    'accept',
    'prompt',
    'temperature',
    'top_p',
    'top_k',
    'max_tokens_to_sample',
    'stop_sequences',
  ],
};
