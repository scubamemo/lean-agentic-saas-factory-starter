import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failed = false;

function fail(message) {
  console.error(`FAIL: ${message}`);
  failed = true;
}
function ok(message) {
  console.log(`OK: ${message}`);
}
function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}
function read(rel) {
  return exists(rel) ? fs.readFileSync(path.join(root, rel), 'utf8') : '';
}
function normalize(rel) {
  return rel.replaceAll('\\', '/');
}
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}
function moduleDirs() {
  const rootDir = path.join(root, 'project/modules');
  if (!fs.existsSync(rootDir)) return [];
  return fs.readdirSync(rootDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}
function requirePhrases(rel, phrases) {
  const text = read(rel);
  if (!text) return fail(`Missing file: ${rel}`);
  for (const phrase of phrases) {
    if (!text.includes(phrase)) fail(`${rel} missing required quality phrase: ${phrase}`);
  }
}

const requiredStandards = [
  'docs/standards/software-craftsmanship.md',
  'docs/standards/backend-engineering-quality.md',
  'docs/standards/frontend-engineering-quality.md',
  'docs/standards/testing-quality-bar.md',
  'docs/standards/code-review-quality-bar.md'
];
for (const rel of requiredStandards) if (!exists(rel)) fail(`Missing engineering quality standard: ${rel}`);
if (!failed) ok('engineering quality standards are present');

requirePhrases('docs/standards/software-craftsmanship.md', ['SOLID', 'DRY', 'KISS', 'YAGNI', 'Pattern selection rules', 'No speculative abstraction']);
requirePhrases('docs/standards/backend-engineering-quality.md', ['Controller / route', 'Service / use case', 'tenant context', 'packages/contracts/', 'Backend testing expectations']);
requirePhrases('docs/standards/frontend-engineering-quality.md', ['Design system enforcement', 'Component architecture', 'State management rules', 'Accessibility bar', 'Frontend testing expectations']);
requirePhrases('docs/standards/testing-quality-bar.md', ['test-matrix.md', 'happy path', 'permission denied', 'tenant isolation', 'QA failure routing']);
requirePhrases('docs/standards/code-review-quality-bar.md', ['Craftsmanship review rubric', 'Blocking review criteria', 'Overengineering detection', 'PASS_WITH_WARNINGS']);

for (const skill of walk(path.join(root, '.agents/skills')).filter(f => f.endsWith('SKILL.md'))) {
  const rel = normalize(path.relative(root, skill));
  const text = fs.readFileSync(skill, 'utf8');
  if (!text.includes('check-quality-gates.mjs') && !rel.includes('pm/SKILL.md') && !rel.includes('designer/SKILL.md')) {
    fail(`${rel} should reference check-quality-gates.mjs for implementation/review quality enforcement`);
  }
}

requirePhrases('.agents/skills/backend-developer/SKILL.md', ['Backend engineering quality bar', 'SOLID', 'Design pattern rules', 'docs/standards/backend-engineering-quality.md']);
requirePhrases('.agents/skills/frontend-developer/SKILL.md', ['Frontend engineering quality bar', 'Component props', 'Accessibility', 'docs/standards/frontend-engineering-quality.md']);
requirePhrases('.agents/skills/code-reviewer/SKILL.md', ['Code review quality bar', 'SOLID', 'Overengineering', 'docs/standards/code-review-quality-bar.md']);
requirePhrases('.agents/skills/qa/SKILL.md', ['Test quality bar', 'happy path', 'test-matrix.md', 'check-quality-gates.mjs']);
requirePhrases('.agents/skills/architect/SKILL.md', ['Engineering design quality bar', 'Tier 1 escalation triggers', 'speculative architecture']);

const modules = moduleDirs();
for (const mod of modules) {
  const prefix = `project/modules/${mod}`;
  requirePhrases(`${prefix}/api.contract.md`, ['OpenAPI 3.1', 'Contract verification checklist']);
  requirePhrases(`${prefix}/ui.contract.md`, ['Design system constraints', 'Components', 'Visual QA expectations']);
  requirePhrases(`${prefix}/test-matrix.md`, ['Requirement ID', 'Evidence/status', 'Minimum checks']);
  requirePhrases(`${prefix}/handoff.md`, ['checks_run', 'State Transition DTO']);
}
if (!failed) ok('module contract quality sections are present');

requirePhrases('frontend/src/components/COMPONENTS.md', ['Scan existing components', 'reuse', 'refactor', 'Accessibility']);
requirePhrases('packages/contracts/README.md', ['mandatory source of truth', 'Duplication ban', 'public data models']);
requirePhrases('docs/standards/backend-standards.md', ['Engineering quality bar', 'software-craftsmanship.md', 'backend-engineering-quality.md']);
requirePhrases('docs/standards/frontend-standards.md', ['Frontend engineering quality bar', 'frontend-engineering-quality.md', 'testing-quality-bar.md']);
requirePhrases('docs/standards/lean-agentic-development.md', ['Engineering excellence with lazy standards', 'check-quality-gates.mjs']);

if (failed) process.exit(1);
ok('engineering quality gates passed');
