import convict from 'convict';

export const config = convict({
  apiKey: {
    doc: 'The api key for the api',
    format: String,
    default: 'api-key-here',
  },
  api: {
    doc: 'The ai api for prompts',
    format: String,
    default:
      'https://your-url.execute-api.us-east-1.amazonaws.com/prod/prompts/',
  },
}).validate({ allowed: 'strict' });
