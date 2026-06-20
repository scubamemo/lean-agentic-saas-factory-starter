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
function moduleDirs() {
  const modulesRoot = path.join(root, 'project/modules');
  if (!fs.existsSync(modulesRoot)) return [];
  return fs.readdirSync(modulesRoot, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== '_template')
    .map(d => d.name);
}
function hasStrictApiContract(text) {
  return /openapi:\s*3\.1\.0/.test(text) || /"openapi"\s*:\s*"3\.1\.0"/.test(text) || /\$schema\s*:/.test(text) || /"\$schema"\s*:/.test(text);
}
function extractOpenApiEndpoints(contractText) {
  const endpoints = [];
  const lines = contractText.split(/\r?\n/);
  let inPaths = false;
  let currentPath = null;
  for (const line of lines) {
    if (/^paths:\s*$/.test(line.trim())) { inPaths = true; continue; }
    if (inPaths && /^components:\s*$/.test(line.trim())) break;
    if (!inPaths) continue;
    const pathMatch = line.match(/^\s{2}(\/[^:]+):\s*$/);
    if (pathMatch) { currentPath = pathMatch[1].trim(); continue; }
    const methodMatch = line.match(/^\s{4}(get|post|put|patch|delete):\s*$/i);
    if (currentPath && methodMatch) endpoints.push({ method: methodMatch[1].toUpperCase(), path: currentPath, operationId: '' });
    const opMatch = line.match(/^\s{6}operationId:\s*([A-Za-z0-9_]+)/);
    if (opMatch && endpoints.length > 0) endpoints[endpoints.length - 1].operationId = opMatch[1];
  }
  return endpoints;
}
function implementationTextForModule(moduleName) {
  const dir = path.join(root, 'backend/src/modules', moduleName);
  if (!fs.existsSync(dir)) return '';
  return walk(dir).filter(f => /\.(ts|tsx|js|mjs|cjs)$/.test(f)).map(f => fs.readFileSync(f, 'utf8')).join('\n');
}
function endpointLooksImplemented(endpoint, implText, moduleName) {
  if (!implText) return true;
  const methodDecorator = { GET: '@Get', POST: '@Post', PUT: '@Put', PATCH: '@Patch', DELETE: '@Delete' }[endpoint.method];
  const pathWithoutApi = endpoint.path.replace(/^\/api\/?/, '').replace(/\{([^}]+)\}/g, ':$1');
  const moduleBase = endpoint.path.split('/').filter(Boolean).at(-1) ?? moduleName;
  const routeTail = pathWithoutApi.replace(new RegExp(`^${moduleName}/?`), '').replace(/^\/?/, '');
  const candidates = [endpoint.path, pathWithoutApi, endpoint.operationId, moduleBase].filter(Boolean);
  if (candidates.some(c => implText.includes(c))) return true;
  if (methodDecorator && implText.includes(methodDecorator)) {
    if (!routeTail || implText.includes(`'${routeTail}'`) || implText.includes(`"${routeTail}"`) || implText.includes(`\`${routeTail}\``) || implText.includes(`Controller('${moduleName}`) || implText.includes(`Controller("${moduleName}`)) return true;
  }
  return false;
}
function scanDirectImports() {
  const sourceFiles = walk(root).filter(file => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file));
  const importRe = /(?:import\s+(?:type\s+)?(?:[^'";]+\s+from\s+)?|export\s+[^'";]+\s+from\s+|require\()(['"])([^'"]+)\1/g;
  for (const file of sourceFiles) {
    const rel = normalize(path.relative(root, file));
    if (rel.startsWith('scripts/')) continue;
    if (rel.startsWith('frontend/')) {
      const text = fs.readFileSync(file, 'utf8');
      for (const m of text.matchAll(importRe)) {
        const spec = m[2];
        if (spec.includes('backend') || spec.startsWith('../backend') || spec.startsWith('../../backend') || spec.startsWith('@/../backend')) fail(`Frontend file imports backend directly: ${rel} -> ${spec}`);
      }
    }
    if (rel.startsWith('backend/')) {
      const text = fs.readFileSync(file, 'utf8');
      for (const m of text.matchAll(importRe)) {
        const spec = m[2];
        if (spec.includes('frontend') || spec.startsWith('../frontend') || spec.startsWith('../../frontend') || spec.startsWith('@/../frontend')) fail(`Backend file imports frontend directly: ${rel} -> ${spec}`);
      }
    }
  }
}

const requiredFiles = [
  'START-HERE.md','AGENTS.md','project/PROJECT.md','project/UI.md','project/MODULES.md','project/CONTEXT.md','project/work-orders/state.json','project/work-orders/state.schema.json','project/work-orders/history-summary.json','project/work-orders/template-structure-cache.json','project/work-orders/active-work-order.md',
  'project/modules/_template/MODULE.md','project/modules/_template/context.md','project/modules/_template/api.contract.md','project/modules/_template/dto.md','project/modules/_template/data-model.md','project/modules/_template/permissions.md','project/modules/_template/ui.contract.md','project/modules/_template/test-matrix.md','project/modules/_template/handoff.md',
  '.agents/rules/global.md','.agents/rules/context-budget.md','.agents/rules/guardrails.md','.agents/rules/mcp-communication.md','.agents/routing.md','.agents/workflows/cyclic-development.md','.agents/skills/data-engineer/SKILL.md','factory/quality-gates.md','docs/patterns/common-feature-patterns.md','examples/golden/sample-resource-module/MODULE.md','examples/golden/sample-resource-module/api.contract.md','examples/golden/sample-resource-module/ui.contract.md','examples/golden/sample-resource-module/test-matrix.md','examples/golden/sample-resource-module/handoff.md','scripts/task-ready-check.mjs','scripts/check-dto.mjs','scripts/check-contract-artifacts.mjs','scripts/check-dependencies.mjs','scripts/check-template-cache.mjs','scripts/new-module.mjs','scripts/new-work-order.mjs','project/work-orders/bugfix.md','frontend/src/components/COMPONENTS.md','packages/contracts/README.md','packages/contracts/src/index.ts','factory/dependency-cruiser.cjs','.dependency-cruiser.cjs'
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

try {
  const state = JSON.parse(read('project/work-orders/state.json'));
  if (state.schema !== 'agentic.factory.WorkOrderState.v3') fail('state.json must use agentic.factory.WorkOrderState.v3');
  if (!state.last_updated_by) fail('state.json must include last_updated_by');
  if (!Array.isArray(state.validation_errors)) fail('state.json must include validation_errors array');
  if (state.mcp?.source_of_truth !== 'project/work-orders/state.json') fail('state.json must declare itself as MCP source of truth');
  if (state.mcp?.lazy_context_required !== true) fail('state.json must enforce lazy_context_required=true');
  if (state.history_summary !== 'project/work-orders/history-summary.json') fail('state.json must point to history-summary.json');
  if (state.template_cache !== 'project/work-orders/template-structure-cache.json') fail('state.json must point to template-structure-cache.json');
  if (state.delta_policy?.delta_only_writing !== true) fail('state.json must enable delta-only writing');
  if (!state.agent_payloads?.ui_status || !state.agent_payloads?.backend_status || !state.agent_payloads?.qa_status) fail('state.json must define role-scoped agent_payloads');
  if (!state.quality_gates || typeof state.quality_gates.dto_check_passed !== 'boolean') fail('state.json must include quality_gates.dto_check_passed');
  if (!state.quality_gates || typeof state.quality_gates.template_cache_valid !== 'boolean') fail('state.json must include quality_gates.template_cache_valid');
  if (!state.allowed_transitions?.PLANNED?.includes('IN_PROGRESS')) fail('state.json must allow PLANNED -> IN_PROGRESS');
  if (!state.allowed_transitions?.IN_PROGRESS?.includes('VALIDATION_REQUIRED')) fail('state.json must allow IN_PROGRESS -> VALIDATION_REQUIRED');
  if (!state.allowed_transitions?.VALIDATION_REQUIRED?.includes('QA_PENDING') || !state.allowed_transitions?.VALIDATION_REQUIRED?.includes('FAILED')) fail('state.json must allow VALIDATION_REQUIRED -> QA_PENDING / FAILED');
  if (!state.allowed_transitions?.QA_PENDING?.includes('FAILED') || !state.allowed_transitions?.QA_PENDING?.includes('COMPLETED')) fail('state.json must allow QA_PENDING -> FAILED / COMPLETED');
  if (!failed) ok('work-order state.json is structurally valid');
} catch (error) { fail(`project/work-orders/state.json is invalid JSON: ${error.message}`); }

try {
  const history = JSON.parse(read('project/work-orders/history-summary.json'));
  if (history.schema !== 'agentic.factory.HistorySummary.v1') fail('history-summary.json must use agentic.factory.HistorySummary.v1');
  if (!Array.isArray(history.structural_deltas)) fail('history-summary.json must contain structural_deltas array');
  const serialized = JSON.stringify(history);
  if (serialized.length > 12000) fail('history-summary.json is too large; compact historical context before continuing');
  if (!failed) ok('rolling history summary is compact and structured');
} catch (error) { fail(`project/work-orders/history-summary.json is invalid JSON: ${error.message}`); }

try {
  const cache = JSON.parse(read('project/work-orders/template-structure-cache.json'));
  if (cache.schema !== 'agentic.factory.TemplateStructureCache.v1') fail('template-structure-cache.json must use agentic.factory.TemplateStructureCache.v1');
  if (!cache.template_structure_hash || !Array.isArray(cache.required_files)) fail('template-structure-cache.json must include template_structure_hash and required_files');
  if (!failed) ok('template structure cache is present');
} catch (error) { fail(`project/work-orders/template-structure-cache.json is invalid JSON: ${error.message}`); }

const workOrder = read('project/work-orders/active-work-order.md');
for (const heading of ['## State source of truth','## ID','## Task type','## Status','## Context mode','## Target module','## Goal','## Acceptance criteria','## Security / tenancy trigger','## Must read','## Read by role','## Allowed write paths','## Forbidden paths by default','## State Transition DTO']) {
  if (!workOrder.includes(heading)) fail(`active work order missing heading: ${heading}`);
}
if (!workOrder.includes('project/work-orders/state.json')) fail('active work order must point to state.json as primary source of truth');
if (!workOrder.includes('.agents/rules/mcp-communication.md')) fail('active work order must reference MCP communication rule');
if (!workOrder.includes('Data Engineer:')) fail('active work order must include Data Engineer read set');
if (!workOrder.includes('history-summary.json')) fail('active work order must point to history-summary.json for historical context');
if (!workOrder.includes('Delta-only writing')) fail('active work order must document delta-only writing');
for (const phrase of ['node scripts/factory-check.mjs','node scripts/check-contract-artifacts.mjs','node scripts/check-dependencies.mjs','node scripts/task-ready-check.mjs']) {
  if (!workOrder.includes(phrase)) fail(`active work order missing pre-development/handoff control phrase: ${phrase}`);
}
if (!failed) ok('active work order has required headings and validation gates');

const goldenDir = path.join(root, 'examples/golden/sample-resource-module');
const goldenArtifacts = fs.existsSync(goldenDir) ? fs.readdirSync(goldenDir).filter(name => fs.statSync(path.join(goldenDir, name)).isFile()) : [];
for (const artifact of goldenArtifacts) {
  if (!exists(`project/modules/_template/${artifact}`)) fail(`Module template missing golden artifact: ${artifact}`);
}
for (const moduleName of moduleDirs()) {
  for (const artifact of goldenArtifacts) {
    if (!exists(`project/modules/${moduleName}/${artifact}`)) fail(`Module ${moduleName} missing golden artifact: ${artifact}`);
  }
}
if (!failed) ok('module artifacts adhere to golden sample structure');

const allModuleLike = ['_template', ...moduleDirs()];
for (const moduleName of allModuleLike) {
  const rel = `project/modules/${moduleName}/api.contract.md`;
  const contract = read(rel);
  if (!contract) continue;
  if (!hasStrictApiContract(contract)) fail(`${rel} must contain OpenAPI 3.1 or JSON Schema`);
  const implText = moduleName === '_template' ? '' : implementationTextForModule(moduleName);
  if (implText) {
    const endpoints = extractOpenApiEndpoints(contract);
    if (endpoints.length === 0) fail(`${rel} defines implementation-backed module but no OpenAPI endpoints were found`);
    for (const endpoint of endpoints) {
      if (!endpointLooksImplemented(endpoint, implText, moduleName)) fail(`API contract mismatch for module ${moduleName}: ${endpoint.method} ${endpoint.path} not found in backend implementation`);
    }
  }
}
if (!failed) ok('API contracts are strict and implementation alignment checks passed');

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

const contractsReadme = read('packages/contracts/README.md');
for (const phrase of ['mandatory source of truth','must not duplicate business logic','public data models','DTOs']) {
  if (!contractsReadme.toLowerCase().includes(phrase.toLowerCase())) fail(`packages/contracts/README.md missing SoT phrase: ${phrase}`);
}
if (!failed) ok('packages/contracts is documented as mandatory source of truth');

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
for (const phrase of ['Artifact Protocol','State Transition Schema','Task-focused MCP context loading','Lazy-loading context']) {
  if (!mcp.includes(phrase)) fail(`MCP communication rule missing phrase: ${phrase}`);
}
if (!failed) ok('MCP communication rule includes artifact protocol');

const cyclic = read('.agents/workflows/cyclic-development.md');
for (const phrase of ['Plan -> Backend -> Frontend', 'VALIDATION_REQUIRED', 'project/work-orders/bugfix.md', 'No feature is `COMPLETED`']) {
  if (!cyclic.includes(phrase)) fail(`cyclic workflow missing phrase: ${phrase}`);
}
if (!failed) ok('cyclic workflow includes QA feedback loop');

const frontendStandards = read('docs/standards/frontend-standards.md');
for (const phrase of ['Tailwind','Shadcn','ad-hoc CSS','frontend/src/components/COMPONENTS.md','packages/contracts/','must not duplicate business logic']) {
  if (!frontendStandards.includes(phrase)) fail(`frontend standards missing phrase: ${phrase}`);
}
if (!failed) ok('frontend standards enforce design system and contract SoT');

const backendStandards = read('docs/standards/backend-standards.md');
for (const phrase of ['packages/contracts/','mandatory source of truth','must not duplicate business logic','api.contract.md']) {
  if (!backendStandards.includes(phrase)) fail(`backend standards missing phrase: ${phrase}`);
}
if (!failed) ok('backend standards enforce contract SoT');

scanDirectImports();
if (!failed) ok('frontend/backend direct import boundary checks passed');

const componentCatalog = read('frontend/src/components/COMPONENTS.md');
for (const phrase of ['Component creation protocol','Scan existing components','reuse it','refactor','Do not use hardcoded inline styles']) {
  if (!componentCatalog.includes(phrase)) fail(`component catalog missing design-system constraint phrase: ${phrase}`);
}
if (!failed) ok('component catalog enforces reuse before new components');

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



const leanStandard = read('docs/standards/lean-agentic-development.md');
for (const phrase of ['check-dependencies.mjs', 'Dependency cruising', 'state.json is the single source of truth', 'packages/contracts/','Hash-based standard verification','template-structure-cache.json']) {
  if (!leanStandard.includes(phrase)) fail(`lean-agentic-development standard missing phrase: ${phrase}`);
}

const newModuleWorkflow = read('.agents/workflows/new-module.md');
const featureWorkflow = read('.agents/workflows/feature-development.md');
for (const [name, text] of [['new-module workflow', newModuleWorkflow], ['feature-development workflow', featureWorkflow]]) {
  for (const phrase of ['node scripts/factory-check.mjs', 'node scripts/check-dependencies.mjs', 'node scripts/check-template-cache.mjs', 'project/work-orders/state.json']) {
    if (!text.includes(phrase)) fail(`${name} missing blocking phrase: ${phrase}`);
  }
}

for (const skill of walk(path.join(root, '.agents/skills')).filter(f => f.endsWith('SKILL.md'))) {
  const rel = normalize(path.relative(root, skill));
  const text = fs.readFileSync(skill, 'utf8');
  for (const phrase of ['Deterministic state and strict gatekeeping', 'Script-first execution rule', 'project/work-orders/state.json', 'node scripts/factory-check.mjs', 'node scripts/check-dependencies.mjs']) {
    if (!text.includes(phrase)) fail(`${rel} missing strict gatekeeping phrase: ${phrase}`);
  }
}



const routing = read('.agents/routing.md');
for (const phrase of ['Model Tiering Matrix','Tier 1','Tier 2','scripts/new-module.mjs','cheap models']) {
  if (!routing.includes(phrase)) fail(`routing.md missing model tiering phrase: ${phrase}`);
}
const globalRules = read('.agents/rules/global.md');
for (const phrase of ['Script-first execution','Hash-based standard verification','template-structure-cache.json','history-summary.json','Tier 2']) {
  if (!globalRules.includes(phrase)) fail(`global rules missing token-saving phrase: ${phrase}`);
}
const contextBudget = read('.agents/rules/context-budget.md');
for (const phrase of ['Lazy-loading context','history-summary.json','never read historical handoff.md','node scripts/check-template-cache.mjs']) {
  if (!contextBudget.includes(phrase)) fail(`context-budget.md missing lazy context phrase: ${phrase}`);
}

if (failed) process.exit(1);
console.log('OK: token-optimized architectural factory validator passed');
