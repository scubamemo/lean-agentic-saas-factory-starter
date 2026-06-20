export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiPage<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
