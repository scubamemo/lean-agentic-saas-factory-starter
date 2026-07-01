import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const refresh = process.argv.includes('--refresh');
const cacheRel = 'project/work-orders/template-structure-cache.json';
const cachePath = path.join(root, cacheRel);
const schema = 'agentic.factory.TemplateStructureCache.v1';

let failed = false;
function fail(message) { console.error(`FAIL: ${message}`); failed = true; }
function ok(message) { console.log(`OK: ${message}`); }
function normalize(rel) { return rel.replaceAll('\\\\', '/').replace(/^\.\//, ''); }
function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function fileSha(rel) { return sha256(fs.readFileSync(path.join(root, rel), 'utf8')); }

const requiredTemplateFiles = [
  'MODULE.md',
  'api.contract.md',
  'context.md',
  'data-model.md',
  'dto.md',
  'handoff.md',
  'permissions.md',
  'test-matrix.md',
  'ui.contract.md'
];

const keyStandards = [
  'docs/standards/software-craftsmanship.md',
  'docs/standards/backend-engineering-quality.md',
  'docs/standards/frontend-engineering-quality.md',
  'docs/standards/testing-quality-bar.md',
  'docs/standards/code-review-quality-bar.md',
  'docs/standards/lean-agentic-development.md',
  'docs/standards/backend-standards.md',
  'docs/standards/frontend-standards.md'
];

function listFiles(baseRel) {
  const base = path.join(root, baseRel);
  if (!fs.existsSync(base)) return [];
  const out = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(normalize(path.relative(base, full)));
    }
  }
  walk(base);
  return out.sort();
}

function hashEntries(entries) {
  return sha256(entries.join('\n'));
}

function templateFileEntries() {
  return listFiles('project/modules/_template').map(rel => {
    const fullRel = normalize(path.join('project/modules/_template', rel));
    return `${rel}:${fileSha(fullRel)}`;
  });
}

function standardEntries() {
  return keyStandards.map(rel => `${rel}:${fileSha(rel)}`);
}

function buildCache() {
  const templateFiles = listFiles('project/modules/_template');
  return {
    schema,
    source: 'project/modules/_template',
    generated_by: 'scripts/check-template-cache.mjs --refresh or scripts/export-template.mjs',
    hash_algorithm: 'sha256(relative-path:content-sha256)',
    template_structure_hash: hashEntries(templateFileEntries()),
    standards_context_hash: hashEntries(standardEntries()),
    required_files: templateFiles,
    expected_template_files: requiredTemplateFiles,
    key_standards: keyStandards,
    standards_bypass_rule: 'If template_structure_hash and standards_context_hash match, agents may skip full docs/standards reads and use assumed standard context plus role-specific artifacts.',
    refresh_command: 'node scripts/check-template-cache.mjs --refresh'
  };
}

function readCache() {
  try {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch (error) {
    fail(`${cacheRel} is missing or invalid JSON: ${error.message}`);
    return null;
  }
}

function requireFile(rel) {
  if (!fs.existsSync(path.join(root, rel))) fail(`Missing required file: ${rel}`);
}

for (const rel of requiredTemplateFiles) requireFile(`project/modules/_template/${rel}`);
for (const rel of keyStandards) requireFile(rel);

if (refresh) {
  if (failed) process.exit(1);
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, `${JSON.stringify(buildCache(), null, 2)}\n`, 'utf8');
  ok(`template structure cache refreshed at ${cacheRel}`);
  process.exit(0);
}

const cache = readCache();
if (!cache) process.exit(1);

if (cache.schema !== schema) fail(`template cache schema must be ${schema}`);
if (!Array.isArray(cache.required_files) || cache.required_files.length === 0) fail('template cache must list required_files');
if (!Array.isArray(cache.expected_template_files) || cache.expected_template_files.length === 0) fail('template cache must list expected_template_files');
if (!Array.isArray(cache.key_standards) || cache.key_standards.length === 0) fail('template cache must list key_standards');

const templateFiles = listFiles('project/modules/_template');
for (const required of requiredTemplateFiles) {
  if (!templateFiles.includes(required)) fail(`Template is missing required structural file: ${required}`);
  if (!cache.required_files.includes(required)) fail(`Cache is missing required structural file: ${required}`);
}

for (const rel of keyStandards) {
  if (!cache.key_standards.includes(rel)) fail(`Cache is missing key standard: ${rel}`);
}

const actualTemplateHash = hashEntries(templateFileEntries());
if (cache.template_structure_hash !== actualTemplateHash) {
  fail(`template structure cache is stale: expected ${cache.template_structure_hash}, actual ${actualTemplateHash}. Run node scripts/check-template-cache.mjs --refresh after intentional structural template changes.`);
}

const actualStandardsHash = hashEntries(standardEntries());
if (cache.standards_context_hash !== actualStandardsHash) {
  fail(`template standards cache is stale: expected ${cache.standards_context_hash}, actual ${actualStandardsHash}. Run node scripts/check-template-cache.mjs --refresh after intentional standards changes.`);
}

const modulesRoot = path.join(root, 'project/modules');
const modules = fs.existsSync(modulesRoot)
  ? fs.readdirSync(modulesRoot, { withFileTypes: true }).filter(d => d.isDirectory() && d.name !== '_template').map(d => d.name)
  : [];
for (const moduleName of modules) {
  const files = listFiles(`project/modules/${moduleName}`);
  for (const required of requiredTemplateFiles) {
    if (!files.includes(required)) fail(`Module ${moduleName} is missing cached structural file: ${required}`);
  }
}

if (failed) process.exit(1);
ok('template structure cache is valid; standards may be lazy-loaded');
