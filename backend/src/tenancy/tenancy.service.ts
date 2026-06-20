export type TenantExecutionMode = 'shared-db' | 'dedicated-db' | 'dedicated-app';

export interface TenantContext {
  tenantId: string;
  mode: TenantExecutionMode;
  isSuperAdmin?: boolean;
  impersonatedUserId?: string;
}

export class TenancyService {
  getCurrentTenant(): TenantContext | null {
    // Project-specific request binding should be implemented by an agent work order.
    return null;
  }
}
