import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failed = false;

function fail(message) { console.error(`FAIL: ${message}`); failed = true; }
function ok(message) { console.log(`OK: ${message}`); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return exists(rel) ? fs.readFileSync(path.join(root, rel), 'utf8') : ''; }
function normalize(rel) { return rel.replaceAll('\\', '/'); }
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules','.git','dist','build','.next','coverage'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const requiredFiles = [
  'START-HERE.md','AGENTS.md','project/PROJECT.md','project/UI.md','project/MODULES.md','project/CONTEXT.md','project/work-orders/active-work-order.md',
  'project/modules/_template/MODULE.md','project/modules/_template/context.md','project/modules/_template/api.contract.md','project/modules/_template/dto.md','project/modules/_template/data-model.md','project/modules/_template/permissions.md','project/modules/_template/ui.contract.md','project/modules/_template/test-matrix.md','project/modules/_template/handoff.md',
  '.agents/rules/global.md','.agents/rules/context-budget.md','.agents/rules/guardrails.md','.agents/rules/mcp-communication.md','.agents/routing.md','.agents/workflows/cyclic-development.md','.agents/skills/data-engineer/SKILL.md','factory/quality-gates.md','docs/patterns/common-feature-patterns.md','examples/golden/sample-resource-module/MODULE.md','scripts/task-ready-check.mjs','scripts/check-dto.mjs','scripts/check-contract-artifacts.mjs','scripts/new-module.mjs','scripts/new-work-order.mjs','project/work-orders/bugfix.md','frontend/src/components/COMPONENTS.md'
];
for (const rel of requiredFiles) if (!exists(rel)) fail(`Missing required file: ${rel}`);
if (!failed) ok('required files are present');

try {
  const config = JSON.parse(read('project/project.config.json'));
  const profiles = ['poc', 'mvp', 'production', 'enterprise'];
  if (!profiles.includes(config.profile)) fail(`Invalid project profile: ${config.profile}`);
  if (!config.tenancyMode) fail('project.config.json must define tenancyMode');
  if (config.mcpStructuredHandoffs !== true) fail('project.config.json must enable mcpStructuredHandoffs');
  if (config.dataEngineerOwnsPrisma !== true) fail('project.config.json must set dataEngineerOwnsPrisma=true');
  if (!failed) ok('project config is valid enough');
} catch (error) { fail(`project/project.config.json is invalid JSON: ${error.message}`); }

const workOrder = read('project/work-orders/active-work-order.md');
for (const heading of ['## ID','## Task type','## Status','## Context mode','## Target module','## Goal','## Acceptance criteria','## Security / tenancy trigger','## Must read','## Read by role','## Allowed write paths','## Forbidden paths by default','## State Transition DTO']) {
  if (!workOrder.includes(heading)) fail(`active work order missing heading: ${heading}`);
}
if (!workOrder.includes('.agents/rules/mcp-communication.md')) fail('active work order must reference MCP communication rule');
if (!workOrder.includes('Data Engineer:')) fail('active work order must include Data Engineer read set');
for (const phrase of ['node scripts/factory-check.mjs','node scripts/check-contract-artifacts.mjs','node scripts/task-ready-check.mjs','active work order is the source of truth']) {
  if (!workOrder.includes(phrase)) fail(`active work order missing pre-development/handoff control phrase: ${phrase}`);
}
if (!failed) ok('active work order has required lean/cyclic headings and validation gates');

const handoff = read('project/modules/_template/handoff.md');
for (const phrase of ['Current status','Current dependencies','Next agent','Artifact sync','State Transition DTO','agentic.factory.StateTransition.v1']) {
  if (!handoff.includes(phrase)) fail(`module handoff missing required phrase: ${phrase}`);
}
if (!failed) ok('module handoff uses structured DTO and artifact protocol');

const uiContract = read('project/modules/_template/ui.contract.md');
for (const section of ['## Design system constraints','## Routes / pages','## Components','## Mock scenarios','## Visual QA expectations']) {
  if (!uiContract.includes(section)) fail(`ui.contract.md missing consolidated section: ${section}`);
}
if (!failed) ok('consolidated UI contract has required sections');

const guardrails = read('.agents/rules/guardrails.md');
for (const phrase of ['Directory Authorization Matrix','Frontend Developers must never write','backend/prisma/','packages/contracts/','Backend Developers must never write','Pre-Write Check','ad-hoc global CSS']) {
  if (!guardrails.includes(phrase)) fail(`guardrails missing required phrase: ${phrase}`);
}
if (!failed) ok('guardrails include directory RBAC');

const de = read('.agents/skills/data-engineer/SKILL.md');
for (const phrase of ['backend/prisma/schema.prisma','Prisma Guard','createdAt','updatedAt','tenantId','Raw query safety','data-model.md','dto.md']) {
  if (!de.includes(phrase)) fail(`data engineer skill missing required phrase: ${phrase}`);
}
if (!failed) ok('data engineer skill covers schema guardrails');


const mcp = read('.agents/rules/mcp-communication.md');
for (const phrase of ['Artifact Protocol','State Transition Schema','Task-focused MCP context loading','active-work-order.md` is the single source of truth']) {
  if (!mcp.includes(phrase)) fail(`MCP communication rule missing phrase: ${phrase}`);
}
if (!failed) ok('MCP communication rule includes artifact protocol');

const cyclic = read('.agents/workflows/cyclic-development.md');
for (const phrase of ['Plan -> Backend -> Frontend -> QA','REVISION_IN_PROGRESS','project/work-orders/bugfix.md','No feature is `DONE`']) {
  if (!cyclic.includes(phrase)) fail(`cyclic workflow missing phrase: ${phrase}`);
}
if (!failed) ok('cyclic workflow includes QA feedback loop');

const frontendStandards = read('docs/standards/frontend-standards.md');
for (const phrase of ['Tailwind','Shadcn','ad-hoc CSS','frontend/src/components/COMPONENTS.md']) {
  if (!frontendStandards.includes(phrase)) fail(`frontend standards missing phrase: ${phrase}`);
}
if (!failed) ok('frontend standards enforce design system');

const componentCatalog = read('frontend/src/components/COMPONENTS.md');
for (const phrase of ['Component creation protocol','Scan existing components','reuse it','refactor','Do not use hardcoded inline styles']) {
  if (!componentCatalog.includes(phrase)) fail(`component catalog missing design-system constraint phrase: ${phrase}`);
}
if (!failed) ok('component catalog enforces reuse before new components');

const qaSkill = read('.agents/skills/qa/SKILL.md');
for (const phrase of ['Autonomous failure triage','code-level','project/work-orders/bugfix.md','REVISION_IN_PROGRESS','STDOUT/STDERR']) {
  if (!qaSkill.includes(phrase)) fail(`QA skill missing autonomous self-healing phrase: ${phrase}`);
}
if (!failed) ok('QA skill includes autonomous bugfix routing');

const bugfixWorkflow = read('.agents/workflows/bugfix.md');
for (const phrase of ['Autonomous QA-created bugfix work order','Required handoff log update','Assigned owner','REVISION_IN_PROGRESS']) {
  if (!bugfixWorkflow.includes(phrase)) fail(`bugfix workflow missing autonomous routing phrase: ${phrase}`);
}
if (!failed) ok('bugfix workflow supports autonomous QA feedback');

const architectSkill = read('.agents/skills/architect/SKILL.md');
for (const phrase of ['Read-only data model validator','backend/prisma/schema.prisma','api.contract.md','do **not** change or approve the schema','Data Engineer']) {
  if (!architectSkill.includes(phrase)) fail(`architect skill missing read-only schema validation phrase: ${phrase}`);
}
if (!failed) ok('architect skill includes read-only data model validation');

const removedSplitUiReferences = [
  'components.contract.md','routes.contract.md','mock-data.md','visual-qa-checklist.md',
  'project/ui/component-inventory.md','docs/standards/design-system-contract.md','docs/standards/mock-api-standard.md','contracts/mock-data.md'
];
const allowedReferenceFiles = new Set(['scripts/factory-check.mjs']);
for (const file of walk(root)) {
  const relPath = normalize(path.relative(root, file));
  if (relPath.startsWith('.factory-meta/')) continue;
  if (relPath.startsWith('scripts/') && relPath !== 'scripts/factory-check.mjs') continue;
  if (!/\.(md|txt|json|ts|tsx|mjs|js|yml|yaml|prisma|example)$/.test(relPath)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const removed of removedSplitUiReferences) {
    if (text.includes(removed) && !allowedReferenceFiles.has(relPath)) fail(`Stale split-UI reference '${removed}' in ${relPath}; use ui.contract.md instead`);
  }
}
if (!failed) ok('no stale split-UI references in operational files');

const prohibitedTemplateTerms = ['stock management','inventory management','warehouse management'];
for (const file of walk(root)) {
  const relPath = normalize(path.relative(root, file));
  if (relPath.startsWith('scripts/')) continue;
  if (relPath.startsWith('.factory-meta/')) continue;
  if (!/\.(md|json|ts|tsx|mjs|js|yml|yaml|prisma|example)$/.test(relPath)) continue;
  const text = fs.readFileSync(file, 'utf8').toLowerCase();
  for (const term of prohibitedTemplateTerms) if (text.includes(term)) fail(`Potential domain leakage '${term}' in ${relPath}`);
}
if (!failed) ok('no obvious template domain leakage');

if (failed) process.exit(1);
console.log('OK: v15 lean artifact-loop factory check passed');
