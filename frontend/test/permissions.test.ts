import { describe, expect, it } from 'vitest';
import { can } from '../src/lib/permissions/can';

describe('permission helper', () => {
  it('allows only permissions explicitly assigned to the user', () => {
    expect(can(['users.read'], 'users.read')).toBe(true);
    expect(can(['users.read'], 'users.write')).toBe(false);
  });
});
