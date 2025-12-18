import type { APIError } from '@/types/common';

export class APIClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'APIClientError';
    this.status = status;
    this.code = code;
  }

  toJSON(): APIError {
    return {
      message: this.message,
      status: this.status,
      code: this.code,
    };
  }
}

export function handleAPIError(error: unknown): APIClientError {
  if (error instanceof APIClientError) {
    return error;
  }

  if (error instanceof Error) {
    return new APIClientError(error.message, 500);
  }

  return new APIClientError('An unexpected error occurred', 500);
}

export function isRateLimitError(error: unknown): boolean {
  return error instanceof APIClientError && error.status === 429;
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof APIClientError && error.status === 404;
}
