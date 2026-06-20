import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const name = process.argv[2];
if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
  console.error('Usage: pnpm new:module <kebab-case-module-name>');
  process.exit(1);
}
const src = path.join(root, 'project/modules/_template');
const dest = path.join(root, `project/modules/${name}`);
if (fs.existsSync(dest)) {
  console.error(`Module already exists: project/modules/${name}`);
  process.exit(1);
}
copyDir(src, dest);
for (const file of walk(dest)) {
  if (!file.endsWith('.md')) continue;
  const text = fs.readFileSync(file, 'utf8')
    .replaceAll('<module-name>', name)
    .replaceAll('<module>', name)
    .replaceAll('TBD', 'TBD');
  fs.writeFileSync(file, text);
}
console.log(`Created module: project/modules/${name}`);
console.log('Next: fill MODULE.md, context.md, contracts, and active work order.');

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}
