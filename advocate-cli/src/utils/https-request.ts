import axios from 'axios';

export async function httpsRequest(
  prompt: Record<string, any>,
  apiKey: string,
  apiUrl: string
): Promise<any> {
  try {
    const response = await axios.post(
      apiUrl,
      {
        ...prompt,
      },
      {
        headers: {
          'x-api-key': apiKey,
        },
      }
    );

    return response.data;
  } catch (e) {
    console.error('Error:', e);
  }
}
