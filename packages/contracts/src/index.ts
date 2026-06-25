/**
 * Mandatory shared contract entry point.
 *
 * Generated projects should export DTOs, JSON schemas, OpenAPI-derived types,
 * permission constants and event payloads from this package instead of duplicating
 * public data structures in backend or frontend modules.
 */
export const CONTRACTS_PACKAGE_VERSION = '0.1.0';


export const SPEC_KIT_SPEC_SCHEMA = 'agentic.factory.SpecKitModuleSpec.v1';
export const SPEC_KIT_SPECS_DIR = 'packages/contracts/specs';
export const SPEC_KIT_REQUIRED_TOP_LEVEL_KEYS = [
  'schema',
  'module',
  'version',
  'resources',
  'dto_schemas',
  'endpoints',
  'permissions',
  'ui_surfaces',
  'events',
  'spec',
  'plan',
  'data_model',
  'contracts',
  'tasks',
  'quickstart_checks',
  'validation'
] as const;
