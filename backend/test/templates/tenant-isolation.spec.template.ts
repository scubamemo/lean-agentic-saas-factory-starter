describe('tenant isolation', () => {
  it('does not allow one tenant to read another tenant owned record', async () => {
    // Arrange tenant A and tenant B records.
    // Act with tenant A context against tenant B record.
    // Assert 403 or 404 according to module contract.
  });

  it('scopes list results by tenant context', async () => {
    // Assert list endpoint only returns records for the active tenant.
  });

  it('records super admin impersonation audit events', async () => {
    // Assert impersonation actions create audit evidence.
  });
});
