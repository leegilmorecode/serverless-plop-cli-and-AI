import { getISOString, logger, schemaValidator } from '@shared/index';
import {
  retrievePrompt,
  savePrompt,
} from '@adapters/secondary/database-adapter';

import { ActionPromptDto } from '@dto/action-prompt';
import { config } from '@config/config';
import { createPrompt } from '@adapters/secondary/prompt-adapter';
import { schema } from '@schemas/prompt';
import { v5 as uuid } from 'uuid';

const namespace = config.get('namespace');

export type ActionPromptUseCaseResult = {
  type: string;
  result: string;
};

// generate or return a cached response from amazon bedrock
export async function actionPromptUseCase(
  prompt: ActionPromptDto
): Promise<ActionPromptUseCaseResult> {
  const createdDate = getISOString();
  const id = uuid(JSON.stringify(prompt), namespace);

  // validate the prompt
  schemaValidator(schema, prompt);

  const cachedPromptResult = await retrievePrompt(id);

  // if we already have a cached prompt result then return it
  if (cachedPromptResult) {
    logger.info(`Returning cached response for id: ${id}`);

    return {
      type: prompt.type,
      result: cachedPromptResult.result,
    };
  }

  const promptResult = await createPrompt(prompt);

  logger.info(`New prompt result: ${promptResult}`);

  // we use uuid v5 for caching as it is determinstic given the same payload
  await savePrompt({
    id,
    createdDate: createdDate,
    prompt: JSON.stringify(prompt),
    result: JSON.stringify(promptResult),
  });

  logger.info(`Cached response for id: ${id}`);

  return {
    type: prompt.type,
    result: JSON.stringify(promptResult),
  };
}
