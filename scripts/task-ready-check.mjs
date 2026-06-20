import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const allowTbd = process.argv.includes('--allow-tbd');
let failed = false;

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
function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function section(text, heading) {
  const re = new RegExp(`## ${escapeRegExp(heading)}\\s+([\\s\\S]*?)(\\n## |$)`);
  const m = text.match(re);
  return m ? m[1].trim() : '';
}
function firstLineValue(text) { return text.split(/\r?\n/).map(x => x.trim()).find(Boolean) ?? ''; }
function securityAnswer(sectionText) {
  const lines = sectionText.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const exact = lines.find(line => /^(yes|no)$/i.test(line));
  return exact ? exact.toLowerCase() : '';
}
function hasUnresolvedTbd(text) { return /\bTBD\b|<module>|<module-name>/i.test(text); }
function testMatrixCriteriaMet(rel) {
  const text = read(rel);
  if (!text) return false;
  if (hasUnresolvedTbd(text)) return false;
  if (!/\|/.test(text)) return false;
  if (!/(pass|passed|planned|covered|implemented|verified)/i.test(text)) return false;
  return true;
}

const state = readJson('project/work-orders/state.json');
if (!state) process.exit(1);

const allowedStatuses = ['PLANNED', 'IN_PROGRESS', 'QA_PENDING', 'FAILED', 'COMPLETED'];
const allowedTaskTypes = ['docs-only', 'contract-only', 'backend-only', 'frontend-only', 'data-model', 'full-stack', 'bugfix', 'refactor', 'review', 'release'];
const requiredStateKeys = ['schema', 'work_order_id', 'module', 'task_type', 'status', 'owner', 'next_agent', 'allowed_transitions', 'quality_gates', 'artifacts', 'mcp'];
for (const key of requiredStateKeys) if (!(key in state)) fail(`state.json missing required key: ${key}`);
if (state.schema !== 'agentic.factory.WorkOrderState.v1') fail(`Invalid state schema: ${state.schema}`);
if (!allowedTaskTypes.includes(state.task_type)) fail(`Invalid state task_type: ${state.task_type}`);
if (!allowedStatuses.includes(state.status)) fail(`Invalid state status: ${state.status}`);
if (!state.mcp || state.mcp.source_of_truth !== 'project/work-orders/state.json') fail('state.json must declare itself as MCP source of truth');
if (!state.mcp || state.mcp.structured_handoffs_required !== true) fail('state.json must require structured handoffs');

const transition = state.requested_transition;
if (transition) {
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
if ((state.status === 'QA_PENDING' || transition?.to === 'QA_PENDING') && !matrixMet && !state.quality_gates?.test_matrix_criteria_met) {
  fail('Cannot move to QA_PENDING until test-matrix.md criteria are met or quality_gates.test_matrix_criteria_met=true');
}
if (state.status === 'COMPLETED') {
  if (!state.quality_gates?.qa_passed) fail('COMPLETED requires quality_gates.qa_passed=true');
  if (!state.quality_gates?.review_passed) fail('COMPLETED requires quality_gates.review_passed=true');
  if (!state.quality_gates?.factory_check_passed) fail('COMPLETED requires quality_gates.factory_check_passed=true');
  if (!state.quality_gates?.contract_artifacts_valid) fail('COMPLETED requires quality_gates.contract_artifacts_valid=true');
}

const wo = read('project/work-orders/active-work-order.md');
if (!wo) fail('Missing project/work-orders/active-work-order.md');
if (!wo.includes('project/work-orders/state.json')) fail('active-work-order.md must declare state.json as the source of truth');
for (const h of ['ID','Task type','Status','Context mode','Owner','Target module','Goal','Acceptance criteria','Security / tenancy trigger','Artifact protocol','Must read','Read by role','Allowed write paths','Forbidden paths by default','Required output','State Transition DTO']) {
  if (!wo.includes(`## ${h}`)) fail(`active work order missing heading: ${h}`);
}

const taskType = firstLineValue(section(wo, 'Task type'));
if (taskType && taskType !== state.task_type) fail(`active-work-order.md task type (${taskType}) must mirror state.json (${state.task_type})`);
const status = firstLineValue(section(wo, 'Status'));
if (status && !['PLANNED','READY','CONTRACT_IN_PROGRESS','CONTRACT_READY','BACKEND_IN_PROGRESS','BACKEND_IMPLEMENTED','FRONTEND_IN_PROGRESS','FRONTEND_IMPLEMENTED','QA_IN_PROGRESS','REVIEW_IN_PROGRESS','REVISION_IN_PROGRESS','PASSED','DONE','BLOCKED','IN_PROGRESS','QA_PENDING','FAILED','COMPLETED'].includes(status)) fail(`Invalid active-work-order.md status: ${status}`);
const target = firstLineValue(section(wo, 'Target module'));
if (!allowTbd && target !== state.module) fail(`active-work-order.md target module (${target}) must mirror state.json (${state.module})`);

if (!allowTbd) {
  for (const h of ['Goal','Acceptance criteria']) {
    const s = section(wo, h);
    if (!s || /\bTBD\b/.test(s)) fail(`${h} must be filled before implementation`);
  }
}

const sec = section(wo, 'Security / tenancy trigger');
const secAnswer = securityAnswer(sec);
if (!secAnswer) fail('Security / tenancy trigger must answer Yes or No on its own line');
if (secAnswer === 'yes') {
  for (const rel of ['docs/SECURITY.md','docs/TENANCY.md','docs/RBAC.md']) {
    if (!wo.includes(rel)) fail(`Security/tenancy work must include ${rel} in the work order context`);
  }
  if (!/Data Engineer|data-engineer|Architect|architect|Code Reviewer|code-reviewer/.test(wo)) {
    fail('Security/tenancy work must route or include Architect, Data Engineer, or Code Reviewer context');
  }
}

if (!wo.includes('Plan -> Backend -> Frontend -> QA')) fail('active work order must define the development chain');
if (!wo.includes('api.contract.md') || !wo.includes('ui.contract.md')) fail('active work order must include artifact protocol for api.contract.md and ui.contract.md');
if (!wo.includes('project/work-orders/bugfix.md')) fail('active work order must allow QA/review bugfix routing');
if (!wo.includes('```json')) fail('State Transition DTO must be present as JSON block');

if (failed) process.exit(1);
ok('work-order state is ready enough');
