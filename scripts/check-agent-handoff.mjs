import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failed = false;
function fail(message) { console.error(`FAIL: ${message}`); failed = true; }
function ok(message) { console.log(`OK: ${message}`); }
function read(rel) { return fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), 'utf8') : ''; }
function jsonBlocks(text) { const out = []; const re = /```json\s*([\s\S]*?)```/g; let m; while ((m = re.exec(text))) out.push(m[1].trim()); return out; }
const agents = new Set(['pm','architect','designer','data-engineer','backend-developer','frontend-developer','qa','code-reviewer']);
const states = new Set(['PLANNED','IN_PROGRESS','VALIDATION_REQUIRED','QA_PENDING','APPROVED','COMPLETED','FAILED']);

const schemaText = read('packages/contracts/agent-handoff.schema.json');
if (!schemaText) fail('packages/contracts/agent-handoff.schema.json missing');
else {
  try {
    const schema = JSON.parse(schemaText);
    if (schema.$id !== 'agentic.factory.AgentHandoff.v1') fail('agent handoff schema has invalid $id');
  } catch (error) { fail(`agent handoff schema invalid JSON: ${error.message}`); }
}

function validateDto(dto, rel) {
  if (dto.schema !== 'agentic.factory.StateTransition.v1') fail(`${rel}: invalid schema`);
  if (!agents.has(dto.source_agent)) fail(`${rel}: invalid source_agent`);
  if (!agents.has(dto.target_agent)) fail(`${rel}: invalid target_agent`);
  if (!dto.work_order_id) fail(`${rel}: missing work_order_id`);
  if (!dto.contract_version) fail(`${rel}: missing contract_version`);
  if (!dto.module) fail(`${rel}: missing module`);
  if (!states.has(dto.current_state)) fail(`${rel}: invalid current_state`);
  if (!states.has(dto.next_state)) fail(`${rel}: invalid next_state`);
  if (!dto.payload || typeof dto.payload !== 'object') fail(`${rel}: missing payload`);
  for (const key of ['summary','changed_files','contracts_updated','diff_refs','checks_run','blockers','feedback','next_actions']) {
    if (!(key in (dto.payload ?? {}))) fail(`${rel}: payload missing ${key}`);
  }
  if (dto.context_budget?.history_pruned !== true) fail(`${rel}: context_budget.history_pruned must be true`);
  if (dto.context_budget?.full_repo_scan !== false) fail(`${rel}: context_budget.full_repo_scan must be false`);
}

const files = [
  'project/work-orders/active-work-order.md',
  'project/work-orders/bugfix.md',
  'project/modules/_template/handoff.md',
  'examples/golden/sample-resource-module/handoff.md'
].filter(rel => fs.existsSync(path.join(root, rel)));

for (const rel of files) {
  const blocks = jsonBlocks(read(rel)).filter(block => block.includes('agentic.factory.StateTransition.v1'));
  if (blocks.length !== 1) { fail(`${rel}: expected exactly one current StateTransition DTO, found ${blocks.length}`); continue; }
  try { validateDto(JSON.parse(blocks[0]), rel); } catch (error) { fail(`${rel}: invalid handoff JSON: ${error.message}`); }
}
if (failed) process.exit(1);
ok('agent handoff schema and current DTOs are valid');
