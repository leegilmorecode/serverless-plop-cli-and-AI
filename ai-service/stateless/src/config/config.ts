const convict = require('convict');

export const config = convict({
  tableName: {
    doc: 'The database table where we store cached prompts',
    format: String,
    default: 'tableName',
    env: 'TABLE_NAME',
  },
  modelId: {
    doc: 'The modelId we are using for bedrock',
    format: String,
    default: 'anthropic.claude-v2',
  },
  namespace: {
    doc: 'The namespace for uuid v5',
    format: String,
    default: 'd3579aab-2727-4533-92fd-e5a4ef7ef1a9',
  },
}).validate({ allowed: 'strict' });
