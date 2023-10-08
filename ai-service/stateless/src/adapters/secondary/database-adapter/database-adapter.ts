import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { PromptDto } from '@dto/action-prompt';
import { config } from '@config/config';
import { logger } from '@shared/index';

const dynamoDb = new DynamoDBClient({});

// cache a prompt in the dynamodb table
export async function savePrompt(
  actionPromptDto: PromptDto
): Promise<PromptDto> {
  const tableName = config.get('tableName');

  const params = {
    TableName: tableName,
    Item: marshall(actionPromptDto),
  };

  try {
    await dynamoDb.send(new PutItemCommand(params));

    logger.info(`Prompt created with ${actionPromptDto.id} into ${tableName}`);

    return actionPromptDto;
  } catch (error) {
    console.error('Error creating prompt:', error);
    throw error;
  }
}

// retrieve a cached prompt based on the deterministic v5 uuid id
export async function retrievePrompt(id: string): Promise<PromptDto | null> {
  const tableName = config.get('tableName');

  const params = {
    TableName: tableName,
    Key: marshall({ id }),
  };

  try {
    const { Item } = await dynamoDb.send(new GetItemCommand(params));

    if (Item) {
      const prompt = unmarshall(Item) as PromptDto;
      logger.info(`Prompt retrieved with ${prompt.id} from ${tableName}`);
      return prompt;
    } else {
      return null;
    }
  } catch (error) {
    logger.error(`Error retrieving prompt: ${error}`);
    throw error;
  }
}
