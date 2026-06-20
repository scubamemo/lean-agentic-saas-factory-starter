import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const [id, moduleName, taskType = 'backend-only'] = process.argv.slice(2);
if (!id || !moduleName) {
  console.error('Usage: pnpm new:work-order <WO-0001> <module-name> [task-type]');
  process.exit(1);
}

const allowedTaskTypes = new Set(['docs-only', 'contract-only', 'backend-only', 'frontend-only', 'data-model', 'full-stack', 'bugfix', 'refactor', 'review', 'release']);
if (!allowedTaskTypes.has(taskType)) {
  console.error(`Invalid task type: ${taskType}`);
  console.error(`Allowed: ${Array.from(allowedTaskTypes).join(', ')}`);
  process.exit(1);
}

const targetByTaskType = {
  'docs-only': 'pm',
  'contract-only': 'architect',
  'backend-only': 'backend-developer',
  'frontend-only': 'frontend-developer',
  'data-model': 'data-engineer',
  'full-stack': 'architect',
  'bugfix': 'pm',
  'refactor': 'architect',
  'review': 'code-reviewer',
  'release': 'pm',
};

const targetAgent = targetByTaskType[taskType] ?? 'pm';
const owner = taskType === 'review' ? 'code-reviewer' : 'pm';
const template = fs.readFileSync(path.join(root, 'project/work-orders/_template.md'), 'utf8');
let out = template
  .replaceAll('WO-XXXX', id)
  .replace(/## Target module\n\n[^\n]+/, `## Target module\n\n${moduleName}`)
  .replace(/## Task type\n\n[^\n]+/, `## Task type\n\n${taskType}`)
  .replace(/## Status\n\n[^\n]+/, '## Status\n\nPLANNED')
  .replace(/## Owner\n\n[^\n]+/, `## Owner\n\n${owner}`)
  .replaceAll('project/modules/<module>/', `project/modules/${moduleName}/`)
  .replaceAll('backend/src/modules/<module>/', `backend/src/modules/${moduleName}/`)
  .replaceAll('"target_agent": "pm"', `"target_agent": "${targetAgent}"`)
  .replaceAll('"work_order_id": "WO-XXXX"', `"work_order_id": "${id}"`)
  .replaceAll('"module": "TBD"', `"module": "${moduleName}"`)
  .replaceAll('"current_state": "PLANNED"', '"current_state": "PLANNED"')
  .replaceAll('"next_state": "READY"', '"next_state": "READY"');

fs.writeFileSync(path.join(root, 'project/work-orders/active-work-order.md'), out);
console.log(`Updated active work order: ${id} for module ${moduleName} (${taskType} -> ${targetAgent})`);
