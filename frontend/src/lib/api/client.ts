export interface ApiClientOptions {
  baseUrl: string;
  tenantId?: string;
}

export function createApiClient(options: ApiClientOptions) {
  return {
    async get<T>(path: string): Promise<T> {
      const response = await fetch(`${options.baseUrl}${path}`, {
        headers: options.tenantId ? { 'x-tenant-id': options.tenantId } : undefined,
      });
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      return response.json() as Promise<T>;
    },
  };
}
