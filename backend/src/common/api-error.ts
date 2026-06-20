export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'TENANT_CONTEXT_MISSING'
  | 'TENANT_ACCESS_DENIED'
  | 'RATE_LIMITED'
  | 'DEPENDENCY_UNAVAILABLE'
  | 'INTERNAL_ERROR';

export interface ApiErrorResponse {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
  traceId?: string;
}
