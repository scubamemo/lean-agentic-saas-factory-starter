export interface QueryClientOptions {
  baseUrl: string;
  tenantId?: string;
}

export function createQueryKey(parts: Array<string | number | undefined>): string[] {
  return parts.filter((part): part is string | number => part !== undefined).map(String);
}
