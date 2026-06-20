import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const [id, moduleName, taskType = 'backend-only'] = process.argv.slice(2);
if (!id || !moduleName) {
  console.error('Usage: pnpm new:work-order <WO-0001> <module-name> [task-type]');
  process.exit(1);
}
const template = fs.readFileSync(path.join(root, 'project/work-orders/_template.md'), 'utf8');
let out = template
  .replaceAll('WO-XXXX', id)
  .replace(/## Target module\n\n[^\n]+/, `## Target module\n\n${moduleName}`)
  .replace(/## Task type\n\n[^\n]+/, `## Task type\n\n${taskType}`)
  .replaceAll('project/modules/<module>/', `project/modules/${moduleName}/`)
  .replaceAll('backend/src/modules/<module>/', `backend/src/modules/${moduleName}/`);
fs.writeFileSync(path.join(root, 'project/work-orders/active-work-order.md'), out);
console.log(`Updated active work order: ${id} for module ${moduleName}`);
