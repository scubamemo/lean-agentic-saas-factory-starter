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
    .replaceAll('<module>', name);
  fs.writeFileSync(file, text);
}
createSpecKitJson(name);
console.log(`Created module: project/modules/${name}`);
console.log(`Created primary JSON spec: packages/contracts/specs/${name}.spec.json`);
console.log('Next: fill MODULE.md, context.md, JSON spec, markdown mirrors, and state.json.');

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

function pascalCase(input) {
  return input.split('-').filter(Boolean).map(x => x.charAt(0).toUpperCase() + x.slice(1)).join('');
}
function createSpecKitJson(moduleName) {
  const templatePath = path.join(root, 'packages/contracts/specs/_template.spec.json');
  if (!fs.existsSync(templatePath)) {
    console.error('Missing packages/contracts/specs/_template.spec.json; cannot create module spec');
    process.exit(1);
  }
  const specPath = path.join(root, `packages/contracts/specs/${moduleName}.spec.json`);
  if (fs.existsSync(specPath)) return;
  const pascal = pascalCase(moduleName);
  const spec = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  function replaceDeep(value) {
    if (typeof value === 'string') return value.replaceAll('<module-name>', moduleName).replaceAll('<module>', moduleName).replaceAll('<ModuleName>', pascal);
    if (Array.isArray(value)) return value.map(replaceDeep);
    if (value && typeof value === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(value)) out[k.replaceAll('<ModuleName>', pascal)] = replaceDeep(v);
      return out;
    }
    return value;
  }
  const next = replaceDeep(spec);
  next.module = moduleName;
  next.validation = next.validation || {};
  next.validation.contract_source_of_truth = `packages/contracts/specs/${moduleName}.spec.json`;
  next.validation.markdown_mirror = `project/modules/${moduleName}/api.contract.md`;
  fs.mkdirSync(path.dirname(specPath), { recursive: true });
  fs.writeFileSync(specPath, `${JSON.stringify(next, null, 2)}\n`);
}
