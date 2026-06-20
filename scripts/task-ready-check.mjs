import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const allowTbd = process.argv.includes('--allow-tbd');
let failed = false;

const STATUS = ['PLANNED', 'IN_PROGRESS', 'VALIDATION_REQUIRED', 'QA_PENDING', 'COMPLETED', 'FAILED'];
const TASK_TYPES = ['docs-only', 'contract-only', 'backend-only', 'frontend-only', 'data-model', 'full-stack', 'bugfix', 'refactor', 'review', 'release'];
const EXPECTED_TRANSITIONS = {
  PLANNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['VALIDATION_REQUIRED', 'FAILED'],
  VALIDATION_REQUIRED: ['QA_PENDING', 'FAILED'],
  QA_PENDING: ['COMPLETED', 'FAILED'],
  FAILED: ['IN_PROGRESS'],
  COMPLETED: []
};

function fail(message) { console.error(`FAIL: ${message}`); failed = true; }
function ok(message) { console.log(`OK: ${message}`); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) {
  const p = path.join(root, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}
function readJson(rel) {
  try { return JSON.parse(read(rel)); }
  catch (error) { fail(`${rel} is invalid JSON: ${error.message}`); return null; }
}
function hasUnresolvedTbd(text) { return /\bTBD\b|<module>|<module-name>/i.test(text); }
function testMatrixCriteriaMet(rel) {
  const text = read(rel);
  if (!text) return false;
  if (hasUnresolvedTbd(text)) return false;
  if (!/\|/.test(text)) return false;
  if (!/(pass|passed|covered|implemented|verified|planned)/i.test(text)) return false;
  return true;
}
function shallowSameArray(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => x === b[i]);
}
function validateStateSchema(state) {
  const required = ['schema', 'work_order_id', 'module', 'task_type', 'status', 'last_updated_by', 'validation_errors', 'owner', 'next_agent', 'allowed_transitions', 'quality_gates', 'artifacts', 'mcp'];
  for (const key of required) if (!(key in state)) fail(`state.json missing required key: ${key}`);
  if (state.schema !== 'agentic.factory.WorkOrderState.v2') fail(`Invalid state schema: ${state.schema}; expected agentic.factory.WorkOrderState.v2`);
  if (!/^WO-[0-9A-Za-z._-]+$/.test(state.work_order_id ?? '')) fail('state.json work_order_id must match WO-*');
  if (!TASK_TYPES.includes(state.task_type)) fail(`Invalid state task_type: ${state.task_type}`);
  if (!STATUS.includes(state.status)) fail(`Invalid state status: ${state.status}`);
  if (!state.last_updated_by || typeof state.last_updated_by !== 'string') fail('state.json last_updated_by must be set to the updating agent name');
  if (!Array.isArray(state.validation_errors)) fail('state.json validation_errors must be an array');
  for (const [i, error] of (state.validation_errors ?? []).entries()) {
    if (!error || typeof error !== 'object') fail(`validation_errors[${i}] must be an object`);
    if (!error.code || !error.message) fail(`validation_errors[${i}] must include code and message`);
    if (error.severity && !['info', 'warning', 'error'].includes(error.severity)) fail(`validation_errors[${i}].severity is invalid`);
  }
  if (state.mcp?.source_of_truth !== 'project/work-orders/state.json') fail('state.json must declare itself as MCP source of truth');
  if (state.mcp?.structured_handoffs_required !== true) fail('state.json must require structured handoffs');
  for (const status of STATUS) {
    if (!shallowSameArray(state.allowed_transitions?.[status], EXPECTED_TRANSITIONS[status])) {
      fail(`state.json allowed_transitions.${status} must be [${EXPECTED_TRANSITIONS[status].join(', ')}]`);
    }
  }
}

const state = readJson('project/work-orders/state.json');
if (!state) process.exit(1);
validateStateSchema(state);

const transition = state.requested_transition;
if (transition) {
  if (!STATUS.includes(transition.from) || !STATUS.includes(transition.to)) fail(`requested_transition must use valid statuses: ${transition.from} -> ${transition.to}`);
  if (transition.from !== state.status) fail(`requested_transition.from (${transition.from}) must match current status (${state.status})`);
  const allowed = state.allowed_transitions?.[transition.from] ?? [];
  if (!allowed.includes(transition.to)) fail(`Invalid transition ${transition.from} -> ${transition.to}`);
}

if (!allowTbd) {
  if (!state.module || state.module === 'TBD' || state.module.includes('<module>')) fail('state.json module must be set before implementation');
  if (!state.work_order_id || state.work_order_id === 'WO-0001') fail('state.json work_order_id must be set for real project work');
}

if (state.module && state.module !== 'TBD' && !state.module.includes('<module>')) {
  for (const rel of [`project/modules/${state.module}/MODULE.md`, `project/modules/${state.module}/context.md`, `project/modules/${state.module}/handoff.md`]) {
    if (!exists(rel)) fail(`Target module missing required file: ${rel}`);
  }
}

for (const [name, rel] of Object.entries(state.artifacts ?? {})) {
  if (!allowTbd && (!rel || rel.includes('TBD') || rel.includes('<module>'))) fail(`state.json artifact path for ${name} must be concrete`);
  if (rel && !rel.includes('TBD') && !rel.includes('<module>') && !exists(rel)) fail(`state.json artifact path does not exist for ${name}: ${rel}`);
}

const testMatrixPath = state.artifacts?.test_matrix;
const matrixMet = testMatrixPath && !testMatrixPath.includes('TBD') && testMatrixCriteriaMet(testMatrixPath);
const wantsQaPending = state.status === 'QA_PENDING' || transition?.to === 'QA_PENDING';
if (wantsQaPending && !matrixMet && !state.quality_gates?.test_matrix_criteria_met) {
  fail('Cannot transition to QA_PENDING until test-matrix.md criteria are met or quality_gates.test_matrix_criteria_met=true');
}

const wantsValidationRequired = state.status === 'VALIDATION_REQUIRED' || transition?.to === 'VALIDATION_REQUIRED';
if (wantsValidationRequired) {
  if (!state.quality_gates || typeof state.quality_gates.factory_check_passed !== 'boolean') fail('VALIDATION_REQUIRED requires quality_gates.factory_check_passed boolean');
  if (!state.quality_gates || typeof state.quality_gates.dependency_check_passed !== 'boolean') fail('VALIDATION_REQUIRED requires quality_gates.dependency_check_passed boolean');
  if (!state.quality_gates || typeof state.quality_gates.contract_artifacts_valid !== 'boolean') fail('VALIDATION_REQUIRED requires quality_gates.contract_artifacts_valid boolean');
}

if (state.status === 'FAILED' && state.validation_errors.length === 0) {
  fail('FAILED state requires at least one validation_errors entry');
}
if (state.status === 'COMPLETED') {
  if (state.validation_errors.length > 0) fail('COMPLETED requires validation_errors=[]');
  for (const gate of ['qa_passed','review_passed','factory_check_passed','dependency_check_passed','contract_artifacts_valid','test_matrix_criteria_met']) {
    if (state.quality_gates?.[gate] !== true) fail(`COMPLETED requires quality_gates.${gate}=true`);
  }
}

const wo = read('project/work-orders/active-work-order.md');
if (!wo) fail('Missing project/work-orders/active-work-order.md mirror');
if (!wo.includes('DEPRECATED AS PRIMARY STATE')) fail('active-work-order.md must clearly state it is deprecated as primary state');
if (!wo.includes('project/work-orders/state.json')) fail('active-work-order.md must declare state.json as the source of truth');
if (!wo.includes('Do not manually advance workflow state')) fail('active-work-order.md must prohibit manual workflow advancement');

if (!allowTbd && (wo.includes('## Target module\n\nTBD') || wo.includes('## Goal\n\nTBD') || wo.includes('- TBD'))) {
  fail('active-work-order.md mirror still has unresolved TBD fields');
}

if (failed) process.exit(1);
ok('deterministic work-order state is ready enough');
