import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
let failed = false;
function fail(message) { console.error(`FAIL: ${message}`); failed = true; }
function ok(message) { console.log(`OK: ${message}`); }
function normalize(rel) { return rel.replaceAll('\\\\', '/'); }
function listFiles(baseRel) {
  const base = path.join(root, baseRel);
  if (!fs.existsSync(base)) return [];
  const out = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules','.git','dist','build','.next','coverage'].includes(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(normalize(path.relative(base, full)));
    }
  }
  walk(base);
  return out.sort();
}
function hashFileList(files) {
  return crypto.createHash('sha256').update(files.join('\n')).digest('hex');
}
function readJson(rel) {
  try { return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')); }
  catch (error) { fail(`${rel} is missing or invalid JSON: ${error.message}`); return null; }
}

const cache = readJson('project/work-orders/template-structure-cache.json');
if (!cache) process.exit(1);
if (cache.schema !== 'agentic.factory.TemplateStructureCache.v1') fail('template cache schema must be agentic.factory.TemplateStructureCache.v1');
if (!Array.isArray(cache.required_files) || cache.required_files.length === 0) fail('template cache must list required_files');
const templateFiles = listFiles('project/modules/_template');
const actualHash = hashFileList(templateFiles);
if (cache.template_structure_hash !== actualHash) {
  fail(`template structure cache is stale: expected ${cache.template_structure_hash}, actual ${actualHash}. Run scripts/export-template.mjs after structural template changes.`);
}

const modulesRoot = path.join(root, 'project/modules');
const modules = fs.existsSync(modulesRoot)
  ? fs.readdirSync(modulesRoot, { withFileTypes: true }).filter(d => d.isDirectory() && d.name !== '_template').map(d => d.name)
  : [];
for (const moduleName of modules) {
  const files = listFiles(`project/modules/${moduleName}`);
  for (const required of cache.required_files) {
    if (!files.includes(required)) fail(`Module ${moduleName} is missing cached structural file: ${required}`);
  }
}
if (failed) process.exit(1);
ok('template structure cache is valid; standards may be lazy-loaded');
