import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const allowTbd = process.argv.includes('--allow-tbd');
let failed = false;
function fail(message){ console.error(`FAIL: ${message}`); failed = true; }
function ok(message){ console.log(`OK: ${message}`); }
function read(rel){ return fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), 'utf8') : ''; }
function section(text, heading){
  const re = new RegExp(`## ${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+([\\s\\S]*?)(\\n## |$)`);
  const m = text.match(re);
  return m ? m[1].trim() : '';
}
const wo = read('project/work-orders/active-work-order.md');
if (!wo) fail('Missing project/work-orders/active-work-order.md');
for (const h of ['ID','Task type','Status','Context mode','Owner','Target module','Goal','Acceptance criteria','Security / tenancy trigger','Must read','Read by role','Allowed write paths','Forbidden paths by default','Required output','State Transition DTO']) {
  if (!wo.includes(`## ${h}`)) fail(`active work order missing heading: ${h}`);
}
const mode = section(wo, 'Context mode').split(/\s+/)[0];
if (!['small','medium','large'].includes(mode)) fail(`Invalid context mode: ${mode}`);
const status = section(wo, 'Status').split(/\s+/)[0];
const statuses = ['PLANNED','READY','CONTRACT_IN_PROGRESS','CONTRACT_READY','BACKEND_IN_PROGRESS','BACKEND_IMPLEMENTED','FRONTEND_IN_PROGRESS','FRONTEND_IMPLEMENTED','QA_IN_PROGRESS','REVIEW_IN_PROGRESS','REVISION_IN_PROGRESS','PASSED','DONE','BLOCKED','planned','ready','in_progress','blocked','review','done'];
if (!statuses.includes(status)) fail(`Invalid status: ${status}`);
const target = section(wo, 'Target module').split(/\s+/)[0];
if (!allowTbd && (!target || target === 'TBD' || target.includes('<module>'))) fail('Target module must be set before implementation');
if (target && target !== 'TBD' && !target.includes('<module>')) {
  for (const rel of [`project/modules/${target}/MODULE.md`, `project/modules/${target}/context.md`, `project/modules/${target}/handoff.md`]) {
    if (!fs.existsSync(path.join(root, rel))) fail(`Target module missing required file: ${rel}`);
  }
}
const mustNotBeTbd = ['Goal','Acceptance criteria'];
if (!allowTbd) {
  for (const h of mustNotBeTbd) {
    const s = section(wo, h);
    if (!s || /\bTBD\b/.test(s)) fail(`${h} must be filled before implementation`);
  }
}
const trigger = section(wo, 'Security / tenancy trigger');
if (!/Yes|No/i.test(trigger)) fail('Security / tenancy trigger must answer Yes or No');
if (!wo.includes('```json')) fail('State Transition DTO must be present as JSON block');
if (failed) process.exit(1);
ok('active work order is ready enough');
