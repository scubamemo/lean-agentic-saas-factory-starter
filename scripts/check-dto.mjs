import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failed = false;

function fail(message) { console.error(`FAIL: ${message}`); failed = true; }
function ok(message) { console.log(`OK: ${message}`); }
function read(rel) {
  const p = path.join(root, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function section(text, heading) {
  const re = new RegExp(`## ${escapeRegExp(heading)}\\s+([\\s\\S]*?)(\\n## |$)`);
  const m = text.match(re);
  return m ? m[1].trim() : '';
}
function firstLineValue(text) {
  return text.split(/\r?\n/).map(x => x.trim()).find(Boolean) ?? '';
}
function jsonBlocks(text) {
  const blocks = [];
  const re = /```json\s*([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text))) blocks.push(m[1].trim());
  return blocks;
}

const allowedStates = new Set(['PLANNED','IN_PROGRESS','VALIDATION_REQUIRED','QA_PENDING','APPROVED','COMPLETED','FAILED']);
const allowedAgents = new Set(['pm','architect','designer','data-engineer','backend-developer','frontend-developer','qa','code-reviewer']);

function validateDto(dto, rel, { expectedWorkOrderId, expectedModule } = {}) {
  if (dto.schema !== 'agentic.factory.StateTransition.v1') fail(`${rel}: invalid schema`);
  if (!allowedAgents.has(dto.source_agent)) fail(`${rel}: invalid source_agent ${dto.source_agent}`);
  if (!allowedAgents.has(dto.target_agent)) fail(`${rel}: invalid target_agent ${dto.target_agent}`);
  if (!dto.work_order_id) fail(`${rel}: missing work_order_id`);
  if (expectedWorkOrderId && dto.work_order_id !== expectedWorkOrderId) fail(`${rel}: DTO work_order_id ${dto.work_order_id} does not match heading ${expectedWorkOrderId}`);
  if (!dto.contract_version) fail(`${rel}: missing contract_version`);
  if (!dto.module) fail(`${rel}: missing module`);
  if (expectedModule && expectedModule !== 'TBD' && dto.module !== expectedModule) fail(`${rel}: DTO module ${dto.module} does not match target module ${expectedModule}`);
  if (!allowedStates.has(dto.current_state)) fail(`${rel}: invalid current_state ${dto.current_state}`);
  if (!allowedStates.has(dto.next_state)) fail(`${rel}: invalid next_state ${dto.next_state}`);
  if (!dto.payload || typeof dto.payload !== 'object') fail(`${rel}: missing payload object`);
  if (!dto.context_budget || typeof dto.context_budget !== 'object') fail(`${rel}: missing context_budget object`);
  if (dto.context_budget?.full_repo_scan !== false) fail(`${rel}: context_budget.full_repo_scan must be false`);
  if (dto.context_budget?.history_pruned !== true) fail(`${rel}: context_budget.history_pruned must be true`);
  if (!['small','medium','large'].includes(dto.context_budget?.mode)) fail(`${rel}: invalid context_budget.mode`);
  if (typeof dto.context_budget?.files_read_count !== 'number') fail(`${rel}: context_budget.files_read_count must be numeric`);
  if (!Array.isArray(dto.payload?.contracts_updated)) fail(`${rel}: payload.contracts_updated must be an array`);
  const behaviorStates = new Set(['VALIDATION_REQUIRED','QA_PENDING','COMPLETED','FAILED']);
  if (behaviorStates.has(dto.current_state) || behaviorStates.has(dto.next_state)) {
    const artifacts = dto.payload?.contracts_updated ?? [];
    if (!artifacts.some(x => ['api.contract.md','ui.contract.md','dto.md','data-model.md','permissions.md','test-matrix.md'].includes(x))) {
      fail(`${rel}: behavior handoff must list relevant contract artifacts in payload.contracts_updated`);
    }
  }
}

function validateFile(rel, options = {}) {
  const text = read(rel);
  if (!text) { fail(`${rel}: missing`); return; }
  if (!text.includes('State Transition DTO')) { fail(`${rel}: missing State Transition DTO section`); return; }
  const blocks = jsonBlocks(text).filter(block => block.includes('agentic.factory.StateTransition.v1'));
  if (blocks.length !== 1) fail(`${rel}: expected exactly one current StateTransition DTO JSON block, found ${blocks.length}`);
  if (blocks.length >= 1) {
    try { validateDto(JSON.parse(blocks[0]), rel, options); }
    catch (error) { fail(`${rel}: invalid StateTransition JSON: ${error.message}`); }
  }
}

const workOrder = read('project/work-orders/active-work-order.md');
const expectedWorkOrderId = firstLineValue(section(workOrder, 'ID'));
const expectedModule = firstLineValue(section(workOrder, 'Target module'));
validateFile('project/work-orders/active-work-order.md', { expectedWorkOrderId, expectedModule });
validateFile('project/modules/_template/handoff.md');
if (fs.existsSync(path.join(root, 'project/work-orders/bugfix.md'))) {
  validateFile('project/work-orders/bugfix.md');
}
if (fs.existsSync(path.join(root, 'examples/golden/sample-resource-module/handoff.md'))) {
  validateFile('examples/golden/sample-resource-module/handoff.md');
}

if (failed) process.exit(1);
ok('State Transition DTOs are valid enough');
