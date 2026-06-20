import type { ApiErrorBody } from './types';

export class ApiError extends Error {
  constructor(public readonly body: ApiErrorBody, public readonly status: number) {
    super(body.message);
  }
}
