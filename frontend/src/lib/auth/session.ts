export interface SessionUser {
  id: string;
  tenantId: string;
  permissions: string[];
  isSuperAdmin?: boolean;
  impersonatedTenantId?: string;
}
