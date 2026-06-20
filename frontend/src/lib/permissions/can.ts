export function can(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission);
}
