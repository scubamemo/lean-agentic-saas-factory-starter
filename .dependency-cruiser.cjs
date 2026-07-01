/**
 * Dependency Cruiser configuration for strict SoC in generated projects.
 *
 * Communication between backend and frontend must flow through packages/contracts
 * or generated packages/api-client outputs. Frontend must not import backend.
 * Backend must not import frontend. packages/shared is not a domain-contract layer;
 * frontend may only import explicitly UI-compatible shared utilities.
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
      comment: 'Backend module-to-module communication must be represented through packages/contracts or a public app boundary, not direct internal imports.',
      severity: 'error',
      from: { path: '^backend/src/modules/([^/]+)/' },
      to: { path: '^backend/src/modules/(?!$1/)' }
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
// Root compatibility adapter. The canonical dependency-boundary rules live under factory/.
module.exports = require('./factory/dependency-cruiser.cjs');
