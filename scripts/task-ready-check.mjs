import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const allowTbd = process.argv.includes('--allow-tbd');
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
function securityAnswer(sectionText) {
  const lines = sectionText.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const exact = lines.find(line => /^(yes|no)$/i.test(line));
  return exact ? exact.toLowerCase() : '';
}

const wo = read('project/work-orders/active-work-order.md');
if (!wo) fail('Missing project/work-orders/active-work-order.md');
for (const h of ['ID','Task type','Status','Context mode','Owner','Target module','Goal','Acceptance criteria','Security / tenancy trigger','Artifact protocol','Must read','Read by role','Allowed write paths','Forbidden paths by default','Required output','State Transition DTO']) {
  if (!wo.includes(`## ${h}`)) fail(`active work order missing heading: ${h}`);
}

const taskType = firstLineValue(section(wo, 'Task type'));
const taskTypes = ['docs-only','contract-only','backend-only','frontend-only','data-model','full-stack','bugfix','refactor','review','release'];
if (!taskTypes.includes(taskType)) fail(`Invalid task type: ${taskType}`);

const mode = firstLineValue(section(wo, 'Context mode'));
if (!['small','medium','large'].includes(mode)) fail(`Invalid context mode: ${mode}`);

const status = firstLineValue(section(wo, 'Status'));
const statuses = ['PLANNED','READY','CONTRACT_IN_PROGRESS','CONTRACT_READY','BACKEND_IN_PROGRESS','BACKEND_IMPLEMENTED','FRONTEND_IN_PROGRESS','FRONTEND_IMPLEMENTED','QA_IN_PROGRESS','REVIEW_IN_PROGRESS','REVISION_IN_PROGRESS','PASSED','DONE','BLOCKED'];
if (!statuses.includes(status)) fail(`Invalid status: ${status}`);

const target = firstLineValue(section(wo, 'Target module'));
if (!allowTbd && (!target || target === 'TBD' || target.includes('<module>'))) fail('Target module must be set before implementation');
if (target && target !== 'TBD' && !target.includes('<module>')) {
  for (const rel of [`project/modules/${target}/MODULE.md`, `project/modules/${target}/context.md`, `project/modules/${target}/handoff.md`]) {
    if (!fs.existsSync(path.join(root, rel))) fail(`Target module missing required file: ${rel}`);
  }
}

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
ok('active work order is ready enough');
