import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const allowTbd = process.argv.includes('--allow-tbd');
let failed = false;

const STATUS = ['PLANNED', 'IN_PROGRESS', 'VALIDATION_REQUIRED', 'QA_PENDING', 'APPROVED', 'COMPLETED', 'FAILED', 'REVISION_IN_PROGRESS'];
const TASK_TYPES = ['docs-only', 'contract-only', 'backend-only', 'frontend-only', 'data-model', 'full-stack', 'bugfix', 'refactor', 'review', 'release'];
const AGENTS = ['pm','architect','designer','data-engineer','backend-developer','frontend-developer','qa','code-reviewer'];
const EXPECTED_TRANSITIONS = {
  PLANNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['VALIDATION_REQUIRED', 'FAILED'],
  VALIDATION_REQUIRED: ['QA_PENDING', 'FAILED'],
  QA_PENDING: ['APPROVED', 'COMPLETED', 'FAILED', 'REVISION_IN_PROGRESS'],
  APPROVED: ['COMPLETED', 'FAILED', 'REVISION_IN_PROGRESS'],
  FAILED: ['REVISION_IN_PROGRESS'],
  REVISION_IN_PROGRESS: ['VALIDATION_REQUIRED', 'FAILED'],
  COMPLETED: []
};
const ROLE_PAYLOAD_KEYS = {
  pm: 'pm',
  architect: 'architect',
  designer: 'designer',
  'data-engineer': 'data_engineer',
  'backend-developer': 'backend',
  'frontend-developer': 'frontend',
  qa: 'qa',
  'code-reviewer': 'code_reviewer'
};
const PAYLOAD_KEYS = ['pm','architect','designer','backend','frontend','data_engineer','qa','code_reviewer'];

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
function validateStateSchemaDocument(schema) {
  if (!schema) return;
  if (schema.$id !== 'agentic.factory.WorkOrderState.v4') fail('state.schema.json $id must be agentic.factory.WorkOrderState.v4');
  const required = schema.required ?? [];
  for (const key of ['work_order_id','module','task_type','status','last_updated_by','validation_errors','approval_required','approved_by','approval_requested_by','approval_reason','approval_notes','agent_payloads','quality_gates','template_cache','history_summary']) {
    if (!required.includes(key)) fail(`state.schema.json must require ${key}`);
  }
  const statusEnum = schema.properties?.status?.enum ?? [];
  for (const status of STATUS) if (!statusEnum.includes(status)) fail(`state.schema.json status enum missing ${status}`);
  const transitionRequired = schema.properties?.allowed_transitions?.required ?? [];
  for (const status of STATUS) if (!transitionRequired.includes(status)) fail(`state.schema.json allowed_transitions must require ${status}`);
}
function validateStateSchema(state) {
  const required = ['schema', 'work_order_id', 'module', 'task_type', 'status', 'last_updated_by', 'validation_errors', 'owner', 'next_agent', 'allowed_transitions', 'quality_gates', 'artifacts', 'mcp', 'history_summary', 'template_cache', 'delta_policy', 'agent_payloads', 'approval_required', 'approved_by', 'approval_requested_by', 'approval_reason', 'approval_notes', 'observability'];
  for (const key of required) if (!(key in state)) fail(`state.json missing required key: ${key}`);
  if (state.schema !== 'agentic.factory.WorkOrderState.v4') fail(`Invalid state schema: ${state.schema}; expected agentic.factory.WorkOrderState.v4`);
  if (!/^WO-[0-9A-Za-z._-]+$/.test(state.work_order_id ?? '')) fail('state.json work_order_id must match WO-*');
  if (!TASK_TYPES.includes(state.task_type)) fail(`Invalid state task_type: ${state.task_type}`);
  if (!STATUS.includes(state.status)) fail(`Invalid state status: ${state.status}`);
  if (!state.last_updated_by || typeof state.last_updated_by !== 'string') fail('state.json last_updated_by must be set to the updating agent name');
  if (!Array.isArray(state.validation_errors)) fail('state.json validation_errors must be an array');
  if (typeof state.approval_required !== 'boolean') fail('state.json approval_required must be a boolean');
  if (!(state.approved_by === null || typeof state.approved_by === 'string')) fail('state.json approved_by must be null or a string');
  if (!(state.approval_requested_by === null || typeof state.approval_requested_by === 'string')) fail('state.json approval_requested_by must be null or a string');
  if (!(state.approval_reason === null || typeof state.approval_reason === 'string')) fail('state.json approval_reason must be null or a string');
  if (!Array.isArray(state.approval_notes)) fail('state.json approval_notes must be an array');
  if (state.approved_by !== null && !/^human:[A-Za-z0-9 ._-]+$/.test(state.approved_by)) fail('state.json approved_by must be null or a manual human approval marker like human:Jane Reviewer');
  if (state.approval_required === true) {
    if (state.status !== 'APPROVED') fail('HITL pause: approval_required=true blocks automation until a human manually updates state.json status=APPROVED');
    if (!state.approval_requested_by) fail('HITL pause: approval_required=true requires approval_requested_by');
    if (!state.approval_reason) fail('HITL pause: approval_required=true requires approval_reason');
    if (!state.approved_by) fail('HITL pause: approval_required=true requires approved_by=human:<name>');
    if (state.approval_notes.length === 0) fail('HITL pause: approval_required=true requires at least one approval_notes entry');
  }
  for (const [i, error] of (state.validation_errors ?? []).entries()) {
    if (!error || typeof error !== 'object') fail(`validation_errors[${i}] must be an object`);
    if (!error.code || !error.message) fail(`validation_errors[${i}] must include code and message`);
    if (error.severity && !['info', 'warning', 'error'].includes(error.severity)) fail(`validation_errors[${i}].severity is invalid`);
  }
  if (state.mcp?.source_of_truth !== 'project/work-orders/state.json') fail('state.json must declare itself as MCP source of truth');
  if (state.mcp?.structured_handoffs_required !== true) fail('state.json must require structured handoffs');
  if (state.mcp?.active_work_order_md_is_mirror !== true) fail('state.json must mark active-work-order.md as mirror only');
  if (state.mcp?.lazy_context_required !== true) fail('state.json must require lazy context loading');
  if (state.history_summary !== 'project/work-orders/history-summary.json') fail('state.json must point to history-summary.json');
  if (state.template_cache !== 'project/work-orders/template-structure-cache.json') fail('state.json must point to template-structure-cache.json');
  if (state.delta_policy?.delta_only_writing !== true) fail('state.json delta_policy.delta_only_writing must be true');
  if (state.delta_policy?.forbid_full_markdown_rewrites !== true) fail('state.json delta_policy.forbid_full_markdown_rewrites must be true');
  for (const agent of AGENTS) {
    const key = state.delta_policy?.role_payload_keys?.[agent];
    if (!key) fail(`delta_policy.role_payload_keys missing ${agent}`);
    if (key && !(key in (state.agent_payloads ?? {}))) fail(`agent_payloads missing assigned key for ${agent}: ${key}`);
  }
  for (const key of PAYLOAD_KEYS) {
    const payload = state.agent_payloads?.[key];
    if (!payload) fail(`agent_payloads missing ${key}`);
    else {
      for (const required of ['status','summary','updated_by','changed_artifacts']) if (!(required in payload)) fail(`agent_payloads.${key} missing ${required}`);
      if (!Array.isArray(payload.changed_artifacts)) fail(`agent_payloads.${key}.changed_artifacts must be an array`);
    }
  }
  for (const key of Object.keys(state.agent_payloads ?? {})) {
    if (!PAYLOAD_KEYS.includes(key)) fail(`agent_payloads contains unsupported role slice: ${key}`);
  }
  for (const status of STATUS) {
    if (!shallowSameArray(state.allowed_transitions?.[status], EXPECTED_TRANSITIONS[status])) {
      fail(`state.json allowed_transitions.${status} must be [${EXPECTED_TRANSITIONS[status].join(', ')}]`);
    }
  }
  for (const [from, targets] of Object.entries(state.allowed_transitions ?? {})) {
    if (!STATUS.includes(from)) fail(`state.json allowed_transitions contains unsupported status: ${from}`);
    if (!Array.isArray(targets)) fail(`state.json allowed_transitions.${from} must be an array`);
    for (const to of targets ?? []) if (!STATUS.includes(to)) fail(`state.json allowed_transitions.${from} contains unsupported target status: ${to}`);
  }
}
function validateHistorySummary(history) {
  if (history.schema !== 'agentic.factory.HistorySummary.v1') fail('history-summary.json schema must be agentic.factory.HistorySummary.v1');
  if (history.source_of_truth !== 'project/work-orders/state.json') fail('history-summary.json source_of_truth must be project/work-orders/state.json');
  if (!Array.isArray(history.structural_deltas)) fail('history-summary.json structural_deltas must be an array');
  const allowedDeltaKeys = new Set([
    'completed_work_order_id',
    'module',
    'changed_contracts',
    'changed_implementation_areas',
    'decisions',
    'unresolved_risks',
    'next_dependencies'
  ]);
  for (const [i, delta] of (history.structural_deltas ?? []).entries()) {
    if (!delta || typeof delta !== 'object' || Array.isArray(delta)) fail(`history-summary.json structural_deltas[${i}] must be an object`);
    for (const key of Object.keys(delta ?? {})) {
      if (!allowedDeltaKeys.has(key)) fail(`history-summary.json structural_deltas[${i}] contains non-structural key: ${key}`);
    }
    for (const key of allowedDeltaKeys) {
      if (!(key in (delta ?? {}))) fail(`history-summary.json structural_deltas[${i}] missing ${key}`);
    }
    if (delta?.completed_work_order_id && !/^WO-[0-9A-Za-z._-]+$/.test(delta.completed_work_order_id)) fail(`history-summary.json structural_deltas[${i}].completed_work_order_id must match WO-*`);
    for (const key of ['changed_contracts','changed_implementation_areas','decisions','unresolved_risks','next_dependencies']) {
      if (!Array.isArray(delta?.[key])) fail(`history-summary.json structural_deltas[${i}].${key} must be an array`);
    }
  }
  const text = JSON.stringify(history);
  for (const forbidden of ['checks_run','artifacts_changed','summary','raw_log','command_output','handoff_text']) {
    if (text.includes(`"${forbidden}"`)) fail(`history-summary.json must not store verbose/log key: ${forbidden}`);
  }
  if (!history.rules?.some?.(rule => rule.includes('must never read historical handoff.md files'))) {
    fail('history-summary.json rules must forbid reading historical handoff.md files directly');
  }
}
function validateTraceFile(rel, workOrderId) {
  const text = read(rel).trim();
  if (!text) {
    fail(`COMPLETED requires at least one compact trace record in ${rel}`);
    return;
  }
  const required = ['timestamp','agent','work_order_id','module','action','decision','evidence','scripts_run','files_changed','next_agent','risk_level'];
  let matching = 0;
  for (const [i, line] of text.split(/\r?\n/).entries()) {
    let record;
    try {
      record = JSON.parse(line);
    } catch (error) {
      fail(`${rel}:${i + 1} invalid JSON trace record: ${error.message}`);
      continue;
    }
    for (const key of required) if (!(key in record)) fail(`${rel}:${i + 1} trace missing ${key}`);
    if (record.work_order_id === workOrderId) matching++;
    if (!Array.isArray(record.scripts_run)) fail(`${rel}:${i + 1} scripts_run must be an array`);
    if (!Array.isArray(record.files_changed)) fail(`${rel}:${i + 1} files_changed must be an array`);
    if (!['low','medium','high'].includes(record.risk_level)) fail(`${rel}:${i + 1} risk_level must be low, medium, or high`);
    const serialized = JSON.stringify(record).toLowerCase();
    if (serialized.includes('chain-of-thought') || serialized.includes('hidden reasoning')) fail(`${rel}:${i + 1} trace must not contain private reasoning labels`);
    if (serialized.length > 3000) fail(`${rel}:${i + 1} trace record is too verbose; keep traces compact`);
  }
  if (matching === 0) fail(`COMPLETED requires at least one trace record for ${workOrderId} in ${rel}`);
}

const stateSchema = readJson('project/work-orders/state.schema.json');
validateStateSchemaDocument(stateSchema);
const state = readJson('project/work-orders/state.json');
if (!state) process.exit(1);
validateStateSchema(state);

const history = readJson('project/work-orders/history-summary.json');
if (history) {
  validateHistorySummary(history);
  if (history.work_order_id && history.work_order_id !== state.work_order_id && !allowTbd) fail('history-summary.json work_order_id must match state.json');
}
const cache = readJson('project/work-orders/template-structure-cache.json');
if (cache) {
  if (cache.schema !== 'agentic.factory.TemplateStructureCache.v1') fail('template-structure-cache.json schema must be agentic.factory.TemplateStructureCache.v1');
  if (!Array.isArray(cache.required_files) || cache.required_files.length === 0) fail('template-structure-cache.json must include required_files');
}

const transition = state.requested_transition;
if (transition) {
  if (state.approval_required === true && state.status !== 'APPROVED') fail('HITL pause: requested transition is blocked until human approval manually sets status=APPROVED in state.json');
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
  for (const gate of ['factory_check_passed','dependency_check_passed','contract_artifacts_valid','dto_check_passed','template_cache_valid']) {
    if (typeof state.quality_gates?.[gate] !== 'boolean') fail(`VALIDATION_REQUIRED requires quality_gates.${gate} boolean`);
  }
}

if (state.status === 'FAILED' && state.validation_errors.length === 0) {
  fail('FAILED state requires at least one validation_errors entry');
}
if (state.status === 'COMPLETED') {
  if (state.validation_errors.length > 0) fail('COMPLETED requires validation_errors=[]');
  for (const gate of ['qa_passed','review_passed','factory_check_passed','dependency_check_passed','contract_artifacts_valid','dto_check_passed','template_cache_valid','test_matrix_criteria_met','spec_kit_contracts_valid','security_scan_passed','trace_logged']) {
    if (state.quality_gates?.[gate] !== true) fail(`COMPLETED requires quality_gates.${gate}=true`);
  }
}
const traceRel = `project/work-orders/traces/${state.work_order_id}.trace.jsonl`;
if (state.quality_gates?.trace_logged === true && !exists(traceRel)) {
  fail(`quality_gates.trace_logged=true requires decision trace file: ${traceRel}`);
}
if (state.quality_gates?.trace_logged === true && exists(traceRel)) {
  validateTraceFile(traceRel, state.work_order_id);
}
if (state.status === 'COMPLETED' || transition?.to === 'COMPLETED') {
  if (!exists(traceRel)) fail(`COMPLETED requires decision trace file: ${traceRel}`);
  else validateTraceFile(traceRel, state.work_order_id);
}

const wo = read('project/work-orders/active-work-order.md');
if (!wo) fail('Missing project/work-orders/active-work-order.md mirror');
if (!wo.includes('DEPRECATED AS PRIMARY STATE')) fail('active-work-order.md must clearly state it is deprecated as primary state');
if (!wo.includes('project/work-orders/state.json')) fail('active-work-order.md must declare state.json as the source of truth');
if (!wo.includes('Do not manually advance workflow state')) fail('active-work-order.md must prohibit manual workflow advancement');
if (!wo.includes('history-summary.json')) fail('active-work-order.md mirror must point agents to history-summary.json for historical context');
if (!wo.includes('Delta-only writing')) fail('active-work-order.md mirror must document delta-only writing');

if (!allowTbd && (wo.includes('## Target module\n\nTBD') || wo.includes('## Goal\n\nTBD') || wo.includes('- TBD'))) {
  fail('active-work-order.md mirror still has unresolved TBD fields');
}

if (failed) process.exit(1);
ok('token-optimized deterministic work-order state is ready enough');
