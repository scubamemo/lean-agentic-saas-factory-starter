import { TenancyService } from '../src/tenancy/tenancy.service';

describe('TenancyService starter behavior', () => {
  it('does not invent a tenant before request binding is configured', () => {
    expect(new TenancyService().getCurrentTenant()).toBeNull();
  });
});
