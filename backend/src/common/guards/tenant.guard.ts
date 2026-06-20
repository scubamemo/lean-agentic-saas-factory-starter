export class TenantGuard {
  canActivate(context: { tenantId?: string }): boolean {
    return Boolean(context.tenantId);
  }
}
