export class AuditInterceptor {
  intercept<T>(eventName: string, action: () => T): T {
    // Replace with framework-specific audit logging in generated projects.
    void eventName;
    return action();
  }
}
