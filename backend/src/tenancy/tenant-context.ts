export interface TenantContext {
  tenantId: string;
  actorId: string;
  isSuperAdmin?: boolean;
  impersonatedTenantId?: string;
}

export function requireTenantContext(context?: TenantContext): TenantContext {
  if (!context?.tenantId) throw new Error('TENANT_CONTEXT_MISSING');
  return context;
}
