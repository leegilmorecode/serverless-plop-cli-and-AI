import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { extractPromptResult, logger } from '@shared/index';

import { ActionPromptDto } from '@dto/action-prompt';
import { config } from '@config/config';

const client = new BedrockRuntimeClient({
  region: 'us-east-1',
  apiVersion: '2023-09-30',
});
const modelId = config.get('modelId');

export async function createPrompt(
  actionPromptDto: ActionPromptDto
): Promise<Record<string, any>> {
  const {
    accept,
    contentType,
    max_tokens_to_sample,
    top_p,
    top_k,
    prompt,
    stop_sequences,
    temperature,
  } = actionPromptDto;

  const body = JSON.stringify({
    prompt: `Human:${prompt} Assistant:`,
    temperature,
    top_k,
    top_p,
    max_tokens_to_sample,
    stop_sequences,
  });

  logger.info(`Prompt body: ${body}`);

  const input = {
    body,
    contentType,
    accept,
    modelId,
  };
  const command = new InvokeModelCommand(input);
  const { body: promptResponse } = await client.send(command);

  const promptResponseJson = JSON.parse(
    new TextDecoder().decode(promptResponse)
  );

  const result = promptResponseJson.completion;

  logger.info(`Full prompt response: ${result}`);

  // extract the json specifically from the response
  return extractPromptResult(result, actionPromptDto.type);
}
