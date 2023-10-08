import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  ActionPromptUseCaseResult,
  actionPromptUseCase,
} from '@use-cases/action-prompt';
import {
  MetricUnits,
  Metrics,
  logMetrics,
} from '@aws-lambda-powertools/metrics';
import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { errorHandler, logger, schemaValidator } from '@shared/index';

import { ActionPromptDto } from '@dto/action-prompt';
import { ValidationError } from '@errors/validation-error';
import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';
import { schema } from './action-prompt.schema';

const tracer = new Tracer();
const metrics = new Metrics();

export const actionPromptAdapter = async ({
  body,
}: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!body) throw new ValidationError('no payload body');

    const prompt = JSON.parse(body) as ActionPromptDto;

    // validate the input prompt from api gateway
    schemaValidator(schema, prompt);

    // call the use case to return the prompt (either new or cached)
    const created: ActionPromptUseCaseResult = await actionPromptUseCase(
      prompt
    );

    metrics.addMetric('SuccessfulActionPromptCreated', MetricUnits.Count, 1);

    return {
      statusCode: 200,
      body: JSON.stringify(created),
    };
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) errorMessage = error.message;
    logger.error(errorMessage);

    metrics.addMetric('ActionPromptCreatedError', MetricUnits.Count, 1);

    return errorHandler(error);
  }
};

export const handler = middy(actionPromptAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
