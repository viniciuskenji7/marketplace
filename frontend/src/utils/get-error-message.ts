import axios from 'axios';

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === 'string' && responseMessage.length > 0) {
      return responseMessage;
    }
    if (
      Array.isArray(responseMessage) &&
      responseMessage.every((message) => typeof message === 'string')
    ) {
      return responseMessage.join(' ');
    }
  }

  return error instanceof Error && error.message ? error.message : fallback;
}
