/**
 * Root compatibility adapter for strict SoC in generated projects.
 *
 * Communication between backend and frontend must flow through
 * packages/contracts or generated packages/api-client outputs. Frontend must
 * not import backend, backend must not import frontend, and packages/shared is
 * not a domain-contract layer; frontend may only import explicitly
 * UI-compatible shared utilities.
 *
 * The executable dependency-boundary implementation lives in
 * factory/dependency-cruiser.cjs so root consumers and exported templates share
 * one canonical rule set instead of two drifting module.exports blocks.
 */
module.exports = require('./factory/dependency-cruiser.cjs');
