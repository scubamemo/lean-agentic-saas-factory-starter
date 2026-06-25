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

requirePhrases('docs/standards/software-craftsmanship.md', [
  'SOLID',
  'DRY',
  'KISS',
  'YAGNI',
  'High cohesion / low coupling',
  'Explicit boundaries',
  'No speculative abstraction',
  'Typed interfaces',
  'Testability',
  'Observability',
  'Pattern selection rules'
]);
requirePhrases('docs/standards/backend-engineering-quality.md', [
  'Controller / route',
  'Service / use case',
  'Controllers must not contain business logic',
  'tenant context',
  'Stable error taxonomy',
  'DTO validation',
  'Transaction and consistency rules',
  'Idempotency',
  'Pagination, filter, and sort standard',
  'Raw query restrictions',
  'Audit logging',
  'Performance guardrails',
  'Design pattern guidance',
  'Adapter for external systems',
  'Strategy for visible business variation',
  'Factory for complex creation',
  'Repository/data-access service when it reduces coupling',
  'a pattern for simple CRUD unless justified',
  'packages/contracts/',
  'Backend testing expectations',
  'Maintainability checks before handoff'
]);
requirePhrases('docs/standards/frontend-engineering-quality.md', [
  'Design system enforcement',
  'Component architecture',
  'Page vs reusable component boundaries',
  'Component API design',
  'State management rules',
  'Colocate state',
  'Local vs global state rules',
  'Query/cache layer expectations',
  'Form validation',
  'Accessibility bar',
  'Keyboard navigation',
  'Responsive behavior',
  'Design system tokens',
  'Component reuse',
  'Frontend testing expectations',
  'Maintainability checks before handoff',
  'inline style objects except explicitly approved dynamic CSS variables'
]);
requirePhrases('docs/standards/testing-quality-bar.md', [
  'test-matrix.md',
  'Every acceptance criteria maps to at least one test row',
  'expected test file',
  'happy path',
  'validation error',
  'permission error',
  'tenant isolation',
  'not found',
  'conflict',
  'pagination/filter behavior',
  'loading',
  'empty',
  'forbidden',
  'form validation',
  'destructive action confirmation',
  'QA pass/fail rule',
  'QA cannot mark pass unless `test-matrix.md` is satisfied',
  'QA failure routing',
  'Test design quality'
]);
requirePhrases('docs/standards/code-review-quality-bar.md', [
  'Craftsmanship review rubric',
  'Blocking review criteria',
  'Overengineering detection',
  'PASS_WITH_WARNINGS',
  'Mandatory review checklist',
  'architecture boundaries',
  'contract alignment',
  '`packages/contracts` usage',
  'tenant isolation',
  'RBAC/permission behavior',
  'test coverage',
  'SOLID/craftsmanship',
  'unnecessary abstraction',
  'stable error handling',
  'performance risk',
  'frontend design-system compliance',
  'accessibility',
  'dependency boundaries',
  'secret scanner result',
  'Reviewer cannot implement code',
  'FAIL finding format',
  'Owner agent',
  'Required fix',
  'Related artifact',
  'Suggested script to run',
  'Do not read the full repository unless explicitly escalated',
  'Lazy standard loading'
]);
requirePhrases('.agents/routing.md', [
  'Tier 1',
  'high-reasoning / expensive',
  'architect',
  'code-reviewer',
  'critical QA failure',
  'security/tenant isolation risk',
  'complex business logic',
  'high-risk refactor',
  'Tier 2',
  'lightweight / cheap',
  'backend/frontend boilerplate',
  'script execution',
  'state updates',
  'straightforward implementation',
  'node scripts/new-module.mjs <module-name>',
  'repeated QA failure',
  'schema/migration impact',
  'auth/session/permission changes',
  'cross-module business rules',
  'critical performance risk',
  'major refactor'
]);
requirePhrases('.agents/rules/global.md', [
  'Tier 1 = high-reasoning / expensive',
  'Tier 2 = lightweight / cheap',
  'Use Tier 2 by default',
  'node scripts/new-module.mjs <module-name>',
  'Use Tier 1 only',
  'repeated QA failure',
  'schema/migration impact',
  'tenant isolation',
  'auth/session/permission changes',
  'cross-module business rules',
  'critical performance risk',
  'major refactor'
]);
requirePhrases('.agents/rules/context-budget.md', [
  'template_structure_hash',
  'standards_context_hash',
  'Agents may skip reading',
  'node scripts/check-template-cache.mjs --refresh',
  'Do not bypass a stale cache'
]);
requirePhrases('.agents/rules/hook-policy.md', [
  'pre-read hook',
  'Read `project/work-orders/state.json` first',
  'history-summary.json` only if',
  'Refuse full repo scan',
  'pre-write hook',
  'Access boundary check',
  'Allowed write path verification',
  'Contract ownership check',
  'pre-handoff hook',
  'Update relevant artifacts',
  'Update module `handoff.md`',
  'node scripts/trace-logger.mjs',
  'delta-only `project/work-orders/state.json`',
  'pre-completion hook',
  'node scripts/factory-check.mjs',
  'node scripts/task-ready-check.mjs',
  'node scripts/check-contract-artifacts.mjs',
  'node scripts/check-dependencies.mjs',
  'node scripts/security-scanner.mjs',
  'node scripts/check-quality-gates.mjs',
  'fail-closed'
]);
requirePhrases('.agents/rules/global.md', [
  '.agents/rules/hook-policy.md',
  'pre-read, pre-write, pre-handoff and',
  'pre-completion'
]);
for (const workflow of ['specify', 'plan', 'tasks', 'implement', 'validate']) {
  requirePhrases(`.agents/workflows/${workflow}.md`, ['pre-read']);
}
requirePhrases('.agents/workflows/specify.md', [
  'business intent',
  'implementation-free',
  'project/PROJECT.md',
  'project/MODULES.md',
  'api.contract.md',
  'ui.contract.md'
]);
requirePhrases('.agents/workflows/plan.md', [
  'technical plan',
  'modules affected',
  'contracts to create or update',
  'required agents',
  'risks'
]);
requirePhrases('.agents/workflows/tasks.md', [
  'work orders',
  'state transitions',
  'implementation as blocked'
]);
requirePhrases('.agents/workflows/implement.md', [
  'script-first',
  'contract-first',
  'allowed',
  'pre-write',
  'Update affected artifacts'
]);
requirePhrases('.agents/workflows/validate.md', [
  'QA',
  'Reviewer',
  'factory-check.mjs',
  'bugfix.md',
  'pre-completion'
]);
requirePhrases('.agents/workflows/feature-development.md', [
  '.agents/workflows/specify.md',
  '.agents/workflows/plan.md',
  '.agents/workflows/tasks.md',
  '.agents/workflows/implement.md',
  '.agents/workflows/validate.md',
  'Implementation is blocked until specification, plan and task ownership are'
]);
requirePhrases('docs/standards/lean-agentic-development.md', [
  'Hash-based standard verification',
  'template_structure_hash',
  'standards_context_hash',
  'node scripts/check-template-cache.mjs --refresh',
  'Do not continue with assumed standard context'
]);

for (const skill of walk(path.join(root, '.agents/skills')).filter(f => f.endsWith('SKILL.md'))) {
  const rel = normalize(path.relative(root, skill));
  const text = fs.readFileSync(skill, 'utf8');
  if (!text.includes('check-quality-gates.mjs') && !rel.includes('pm/SKILL.md') && !rel.includes('designer/SKILL.md')) {
    fail(`${rel} should reference check-quality-gates.mjs for implementation/review quality enforcement`);
  }
}

requirePhrases('.agents/skills/backend-developer/SKILL.md', ['Backend engineering quality bar', 'SOLID', 'Design pattern rules', 'docs/standards/backend-engineering-quality.md']);
requirePhrases('.agents/skills/backend-developer/SKILL.md', [
  'Do not write `frontend/**`',
  'Do not change `backend/prisma/schema.prisma` directly',
  'Do not duplicate public DTOs',
  'No business logic in controllers',
  'Tenant-owned data always requires tenant context',
  'Raw queries require Data Engineer approval'
]);
requirePhrases('.agents/skills/frontend-developer/SKILL.md', ['Frontend engineering quality bar', 'Component props', 'Accessibility', 'docs/standards/frontend-engineering-quality.md']);
requirePhrases('.agents/skills/frontend-developer/SKILL.md', [
  '`project/UI.md`',
  '`ui.contract.md`',
  '`frontend/src/components/COMPONENTS.md` before creating reusable UI',
  'Do not import backend implementation',
  'Do not duplicate backend DTOs manually',
  'inline hardcoded styles',
  'Frontend architecture rule',
  'query/cache layer',
  'keyboard navigation',
  'Responsive behavior'
]);
requirePhrases('.agents/skills/code-reviewer/SKILL.md', ['Code review quality bar', 'SOLID', 'Overengineering', 'docs/standards/code-review-quality-bar.md']);
requirePhrases('.agents/skills/code-reviewer/SKILL.md', [
  'Do not implement required fixes',
  'Do not read the full repository unless explicitly escalated',
  'PASS_WITH_WARNINGS',
  'precise issue',
  'owner agent',
  'required fix',
  'related artifact',
  'suggested script to run',
  'architecture boundaries',
  'contract alignment',
  '`packages/contracts` usage',
  'tenant isolation',
  'RBAC/permission behavior',
  'test coverage mapped to `test-matrix.md`',
  'SOLID/craftsmanship',
  'unnecessary abstraction',
  'stable error handling',
  'performance risk',
  'frontend design-system compliance',
  'accessibility',
  'dependency boundaries',
  'secret scanner result'
]);
requirePhrases('.agents/skills/qa/SKILL.md', ['Test quality bar', 'happy path', 'test-matrix.md', 'check-quality-gates.mjs']);
requirePhrases('.agents/skills/qa/SKILL.md', [
  'QA cannot mark pass unless',
  'every acceptance criteria maps to at least one',
  'validation error',
  'permission error',
  'tenant isolation',
  'not found',
  'conflict',
  'pagination/filter behavior',
  'loading',
  'empty',
  'forbidden',
  'destructive action confirmation'
]);
requirePhrases('.agents/skills/backend-developer/SKILL.md', [
  'Backend test evidence must update `test-matrix.md`',
  'happy path',
  'validation error',
  'permission error',
  'tenant isolation',
  'not found',
  'conflict',
  'pagination/filter behavior'
]);
requirePhrases('.agents/skills/frontend-developer/SKILL.md', [
  'Frontend test evidence must update `test-matrix.md`',
  'loading',
  'empty',
  'error',
  'forbidden',
  'success',
  'form validation',
  'destructive action confirmation'
]);
requirePhrases('.agents/skills/architect/SKILL.md', ['Engineering design quality bar', 'Tier 1 escalation triggers', 'speculative architecture']);
for (const role of [
  'backend-developer',
  'frontend-developer',
  'code-reviewer',
  'qa',
  'architect',
  'data-engineer',
  'pm',
  'designer'
]) {
  requirePhrases(`.agents/skills/${role}/SKILL.md`, ['Lazy standard reference']);
  requirePhrases(`.agents/skills/${role}/SKILL.md`, ['Model routing note']);
}

const modules = moduleDirs();
for (const mod of modules) {
  const prefix = `project/modules/${mod}`;
  requirePhrases(`${prefix}/api.contract.md`, ['OpenAPI 3.1', 'Contract verification checklist']);
  requirePhrases(`${prefix}/ui.contract.md`, ['Design system constraints', 'Components', 'Visual QA expectations']);
  requirePhrases(`${prefix}/test-matrix.md`, [
    'requirement id',
    'acceptance criteria',
    'test type',
    'expected test file',
    'status',
    'owner',
    'Minimum checks'
  ]);
  requirePhrases(`${prefix}/handoff.md`, ['checks_run', 'Agent Handoff Payload', 'State Transition DTO']);
}
if (!failed) ok('module contract quality sections are present');

requirePhrases('frontend/src/components/COMPONENTS.md', [
  'Component name',
  'Purpose',
  'Props summary',
  'Allowed usage',
  'Related module',
  'Accessibility notes',
  'Inspect `frontend/src/components/`',
  'reuse',
  'refactor',
  'Do not add ad-hoc CSS',
  'inline style objects'
]);
requirePhrases('packages/contracts/README.md', ['mandatory source of truth', 'Duplication ban', 'public data models']);
requirePhrases('docs/standards/backend-standards.md', ['Engineering quality bar', 'software-craftsmanship.md', 'backend-engineering-quality.md']);
requirePhrases('docs/standards/frontend-standards.md', ['Frontend engineering quality bar', 'frontend-engineering-quality.md', 'testing-quality-bar.md']);
requirePhrases('docs/standards/lean-agentic-development.md', ['Engineering excellence with lazy standards', 'check-quality-gates.mjs']);

if (failed) process.exit(1);
ok('engineering quality gates passed');
