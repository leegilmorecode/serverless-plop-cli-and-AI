import { ValidationError } from '@errors/validation-error';

export function extractPromptResult(
  inputString: string,
  inputType: string = 'json'
): Record<string, any> {
  // use the right regex depending on the result type
  const regexString =
    inputType === 'json' ? /```json(.*?)```/s : /```typescript(.*?)```/s;
  const stringMatch = regexString.exec(inputString);

  if (stringMatch && stringMatch[1]) {
    try {
      // return the right type of object depending on the result type
      const resultObject =
        inputType === 'json'
          ? JSON.parse(stringMatch[1])
          : stringMatch[1].trim();
      return resultObject;
    } catch (error) {
      console.error('Error parsing result:', error);
      throw error;
    }
  } else {
    throw new ValidationError('No result found in the input string');
  }
}
