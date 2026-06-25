/**
 * Dependency Cruiser configuration for strict SoC in generated projects.
 *
 * Communication between backend and frontend must flow through packages/contracts
 * or generated packages/api-client outputs. Frontend must not import backend.
 * Backend must not import frontend. packages/shared is not a domain-contract layer;
 * frontend may only import explicitly UI-compatible shared utilities.
 * Direct feature-to-feature imports are discouraged; public shapes belong in
 * packages/contracts and behavior crosses modules through approved APIs/events.
 */
module.exports = {
  forbidden: [
    {
      name: 'no-frontend-to-backend-imports',
      severity: 'error',
      from: { path: '^frontend/' },
      to: { path: '^backend/' }
    },
    {
      name: 'no-frontend-to-prisma-imports',
      comment: 'Frontend must never import Prisma schema, generated Prisma types, migrations or backend persistence internals.',
      severity: 'error',
      from: { path: '^frontend/' },
      to: { path: '^backend/prisma/' }
    },
    {
      name: 'no-backend-to-frontend-imports',
      severity: 'error',
      from: { path: '^backend/' },
      to: { path: '^frontend/' }
    },
    {
      name: 'no-frontend-to-shared-domain',
      comment: 'Frontend may not import packages/shared except explicitly UI-compatible utilities under packages/shared/ui-safe or packages/shared/src/ui-safe.',
      severity: 'error',
      from: { path: '^frontend/' },
      to: { path: '^packages/shared/(?!ui-safe/|src/ui-safe/)' }
    },
    {
      name: 'no-backend-module-to-other-backend-module',
      comment: 'Backend feature-to-feature imports are discouraged unless Architect-approved; public data structures belong in packages/contracts.',
      severity: 'warn',
      from: { path: '^backend/src/modules/([^/]+)/' },
      to: { path: '^backend/src/modules/' }
    },
    {
      name: 'no-frontend-feature-to-feature-imports',
      comment: 'Frontend feature-to-feature imports are discouraged unless Architect-approved; shared public shapes belong in packages/contracts.',
      severity: 'warn',
      from: { path: '^frontend/src/(modules|features)/([^/]+)/' },
      to: { path: '^frontend/src/(modules|features)/' }
    },
    {
      name: 'no-frontend-domain-to-backend-domain',
      comment: 'Frontend/backend communication must go through packages/contracts or packages/api-client.',
      severity: 'error',
      from: { path: '^frontend/' },
      to: { path: '^(backend/|backend/src/modules/)' }
    }
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json']
    }
  }
};
