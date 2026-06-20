import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failed = false;
function fail(message) { console.error(`FAIL: ${message}`); failed = true; }
function ok(message) { console.log(`OK: ${message}`); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return exists(rel) ? fs.readFileSync(path.join(root, rel), 'utf8') : ''; }

const requiredFiles = [
  'START-HERE.md','AGENTS.md','project/PROJECT.md','project/UI.md','project/MODULES.md','project/CONTEXT.md','project/work-orders/active-work-order.md',
  'project/modules/_template/MODULE.md','project/modules/_template/context.md','project/modules/_template/api.contract.md','project/modules/_template/dto.md','project/modules/_template/data-model.md','project/modules/_template/permissions.md','project/modules/_template/ui.contract.md','project/modules/_template/test-matrix.md','project/modules/_template/handoff.md',
  '.agents/rules/global.md','.agents/rules/context-budget.md','.agents/rules/guardrails.md','.agents/rules/mcp-communication.md','.agents/routing.md','.agents/workflows/cyclic-development.md','.agents/skills/data-engineer/SKILL.md','factory/quality-gates.md','docs/patterns/common-feature-patterns.md','examples/golden/sample-resource-module/MODULE.md','scripts/task-ready-check.mjs','scripts/new-module.mjs','scripts/new-work-order.mjs'
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
if (!failed) ok('active work order has required lean/cyclic headings');

const handoff = read('project/modules/_template/handoff.md');
if (!handoff.includes('State Transition DTO') || !handoff.includes('agentic.factory.StateTransition.v1')) fail('module handoff must include State Transition DTO schema');
if (!failed) ok('module handoff uses structured DTO');

const uiContract = read('project/modules/_template/ui.contract.md');
for (const section of ['## Routes / pages','## Components','## Mock scenarios','## Visual QA expectations']) {
  if (!uiContract.includes(section)) fail(`ui.contract.md missing consolidated section: ${section}`);
}
if (!failed) ok('consolidated UI contract has required sections');

const guardrails = read('.agents/rules/guardrails.md');
for (const phrase of ['Directory Authorization Matrix','Frontend Developers must never write','backend/prisma/','packages/contracts/','Backend Developers must never write','Pre-Write Check']) {
  if (!guardrails.includes(phrase)) fail(`guardrails missing required phrase: ${phrase}`);
}
if (!failed) ok('guardrails include directory RBAC');

const de = read('.agents/skills/data-engineer/SKILL.md');
for (const phrase of ['backend/prisma/schema.prisma','Prisma Guard','createdAt','updatedAt','tenantId','Raw query safety']) {
  if (!de.includes(phrase)) fail(`data engineer skill missing required phrase: ${phrase}`);
}
if (!failed) ok('data engineer skill covers schema guardrails');

const removedSplitUiFiles = ['components.contract.md','routes.contract.md','mock-data.md','visual-qa-checklist.md'];
const allowedMentions = new Set(['scripts/factory-check.mjs']);
const agentFiles = walk(path.join(root, '.agents')).filter(file => /\.(md|txt)$/.test(file));
for (const file of agentFiles) {
  const relPath = path.relative(root, file).replaceAll('\\', '/');
  const text = fs.readFileSync(file, 'utf8');
  for (const removed of removedSplitUiFiles) {
    if (text.includes(removed) && !allowedMentions.has(relPath)) fail(`Agent file references removed split UI file '${removed}' in ${relPath}; use ui.contract.md instead`);
  }
}
if (!failed) ok('agent skills align with lean canonical module files');

const prohibitedTemplateTerms = ['stock management','inventory management','warehouse management'];
for (const file of walk(root)) {
  const relPath = path.relative(root, file).replaceAll('\\','/');
  if (relPath.startsWith('scripts/')) continue;
  if (relPath.startsWith('.factory-meta/')) continue;
  if (!/\.(md|json|ts|tsx|mjs|js|yml|yaml|prisma|example)$/.test(file)) continue;
  const text = fs.readFileSync(file, 'utf8').toLowerCase();
  for (const term of prohibitedTemplateTerms) if (text.includes(term)) fail(`Potential domain leakage '${term}' in ${relPath}`);
}
if (!failed) ok('no obvious template domain leakage');

if (failed) process.exit(1);
console.log('OK: v13 lean cyclic factory check passed');

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
