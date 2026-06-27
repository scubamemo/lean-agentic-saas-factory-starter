import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const results = [];

function relPath(...parts) {
  return path.join(root, ...parts);
}
function exists(rel) {
  return fs.existsSync(relPath(rel));
}
function read(rel) {
  return exists(rel) ? fs.readFileSync(relPath(rel), 'utf8') : '';
}
function readJson(rel) {
  try {
    return JSON.parse(read(rel));
  } catch (error) {
    throw new Error(`${rel} invalid JSON: ${error.message}`);
  }
}
function listDirs(rel) {
  const dir = relPath(rel);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
}
function record(status, name, detail = '') {
  results.push({ status, name, detail });
}
function check(name, fn) {
  try {
    fn();
    record('OK', name);
  } catch (error) {
    record('FAIL', name, error.message);
  }
}
function requireFiles(files) {
  const missing = files.filter(rel => !exists(rel));
  if (missing.length > 0) throw new Error(`missing: ${missing.join(', ')}`);
}
function requirePhrases(rel, phrases) {
  const text = read(rel);
  if (!text) throw new Error(`missing: ${rel}`);
  const missing = phrases.filter(phrase => !text.includes(phrase));
  if (missing.length > 0) throw new Error(`${rel} missing: ${missing.join(', ')}`);
}
function summarizeOutput(output) {
  return output
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => /^(FAIL|ERROR|Error|Missing|Invalid|Cannot)\b/.test(line))
    .slice(0, 6)
    .join('; ');
}
function runScript(name, rel, { optional = false, when = true } = {}) {
  if (!when) {
    record('SKIP', name, 'condition not met');
    return;
  }
  if (!exists(rel)) {
    if (optional) record('SKIP', name, `${rel} not present`);
    else record('FAIL', name, `missing script: ${rel}`);
    return;
  }
  const result = spawnSync(process.execPath, [rel], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
    maxBuffer: 1024 * 1024
  });
  if (result.status === 0) {
    record('OK', name);
    return;
  }
  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  record('FAIL', name, summarizeOutput(output) || `${rel} exited ${result.status}`);
}

check('required root files', () => {
  requireFiles([
    'README.md',
    'START-HERE.md',
    'AGENTS.md',
    'package.json',
    'pnpm-workspace.yaml',
    '.agents/model-routing.json',
    'project/project.config.json',
    'factory/dependency-cruiser.cjs',
    '.dependency-cruiser.cjs',
    'scripts/trace-logger.mjs',
    'project/work-orders/traces/README.md'
  ]);
  const pkg = readJson('package.json');
  if (pkg.scripts?.['check:dependencies'] !== 'node scripts/check-dependencies.mjs') {
    throw new Error('package.json missing check:dependencies script');
  }
  if (pkg.scripts?.['check:security'] !== 'node scripts/security-scanner.mjs') {
    throw new Error('package.json missing check:security script');
  }
  if (pkg.scripts?.trace !== 'node scripts/trace-logger.mjs') {
    throw new Error('package.json missing trace script');
  }
});

check('AGENTS.md', () => {
  requirePhrases('AGENTS.md', [
    'project/work-orders/state.json',
    'project/work-orders/history-summary.json',
    'Script-first validation rule',
    'node scripts/factory-check.mjs',
    'node scripts/security-scanner.mjs',
    'Do not inspect the full codebase'
  ]);
});

check('.agents/rules', () => {
  requireFiles([
    '.agents/rules/global.md',
    '.agents/rules/context-budget.md',
    '.agents/rules/guardrails.md',
    '.agents/rules/mcp-communication.md'
  ]);
  requirePhrases('.agents/rules/global.md', [
    'Script-first execution',
    'node scripts/factory-check.mjs',
    'node scripts/security-scanner.mjs',
    'terminal output'
  ]);
  requirePhrases('.agents/rules/context-budget.md', [
    'Script output before inspection',
    'history-summary.json',
    'never read historical handoff.md'
  ]);
});

check('model routing policy', () => {
  const routing = readJson('.agents/model-routing.json');
  if (routing.schema_version !== 'agentic.factory.ModelRouting.v1') {
    throw new Error('.agents/model-routing.json schema_version mismatch');
  }
  if (!routing.default_rule?.includes('Role name alone must not force an expensive model')) {
    throw new Error('.agents/model-routing.json must state role is not model tier');
  }
  for (const tier of ['tier_1', 'tier_2']) {
    if (!routing.tiers?.[tier]?.models?.length) throw new Error(`missing models for ${tier}`);
  }
  const requiredAgents = [
    'pm',
    'architect',
    'designer',
    'backend-developer',
    'frontend-developer',
    'data-engineer',
    'qa',
    'code-reviewer'
  ];
  for (const agent of requiredAgents) {
    const config = routing.agents?.[agent];
    if (!config) throw new Error(`missing model routing for ${agent}`);
    if (!config.default_tier) throw new Error(`${agent} missing default_tier`);
    if (!config.tier_2_model) throw new Error(`${agent} missing tier_2_model`);
    if (!config.tier_1_model) throw new Error(`${agent} missing tier_1_model`);
  }
});

check('.agents/skills', () => {
  const required = [
    'pm',
    'architect',
    'designer',
    'backend-developer',
    'frontend-developer',
    'data-engineer',
    'qa',
    'code-reviewer'
  ];
  requireFiles(required.map(role => `.agents/skills/${role}/SKILL.md`));
  for (const role of required) {
    requirePhrases(`.agents/skills/${role}/SKILL.md`, [
      'Script-first execution rule',
      'Do not spend LLM reasoning tokens',
      'terminal output',
      'node scripts/factory-check.mjs',
      'node scripts/security-scanner.mjs'
    ]);
  }
});

check('.agents/workflows', () => {
  requireFiles([
    '.agents/workflows/cyclic-development.md',
    '.agents/workflows/bugfix.md',
    '.agents/workflows/new-module.md',
    '.agents/workflows/feature-development.md',
    '.agents/workflows/specify.md',
    '.agents/workflows/plan.md',
    '.agents/workflows/tasks.md',
    '.agents/workflows/implement.md',
    '.agents/workflows/validate.md'
  ]);
  requirePhrases('.agents/workflows/cyclic-development.md', [
    'PLANNED',
    'IN_PROGRESS',
    'VALIDATION_REQUIRED',
    'QA_PENDING',
    'FAILED',
    'REVISION_IN_PROGRESS',
    'APPROVED',
    'COMPLETED',
    'Plan',
    'Backend',
    'Frontend',
    'QA',
    'Review',
    'project/work-orders/bugfix.md',
    'QA cannot fix implementation',
    'Reviewer cannot implement fixes',
    'node scripts/factory-check.mjs',
    'node scripts/task-ready-check.mjs',
    'node scripts/check-contract-artifacts.mjs',
    'node scripts/check-dependencies.mjs',
    'node scripts/security-scanner.mjs'
  ]);
  requirePhrases('.agents/workflows/bugfix.md', [
    'QA must not fix code',
    'REVISION_IN_PROGRESS',
    'project/work-orders/bugfix.md',
    'State Transition DTO'
  ]);
  requirePhrases('.agents/workflows/feature-development.md', [
    '.agents/workflows/cyclic-development.md',
    '.agents/workflows/specify.md',
    '.agents/workflows/plan.md',
    '.agents/workflows/tasks.md',
    '.agents/workflows/implement.md',
    '.agents/workflows/validate.md',
    'Implementation is blocked until specification, plan and task ownership are',
    'REVISION_IN_PROGRESS',
    'project/work-orders/bugfix.md',
    'QA and Reviewer cannot fix implementation'
  ]);
  requirePhrases('.agents/workflows/specify.md', [
    'business intent',
    'Do not write backend or frontend implementation',
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
    'ownership',
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
});

check('work-order state', () => {
  requireFiles([
    'project/work-orders/state.json',
    'project/work-orders/state.schema.json',
    'project/work-orders/history-summary.json',
    'project/work-orders/template-structure-cache.json',
    'project/work-orders/active-work-order.md'
  ]);
  const state = readJson('project/work-orders/state.json');
  if (state.schema !== 'agentic.factory.WorkOrderState.v4') throw new Error('state.json schema mismatch');
  if (state.mcp?.source_of_truth !== 'project/work-orders/state.json') throw new Error('state.json source_of_truth mismatch');
  for (const key of ['approval_required','approved_by','approval_requested_by','approval_reason','approval_notes']) {
    if (!(key in state)) throw new Error(`state.json missing HITL field: ${key}`);
  }
  if (state.approved_by !== null && !String(state.approved_by).startsWith('human:')) throw new Error('state.json approved_by must be null or human:<name>');
  for (const key of ['pm','architect','designer','backend','frontend','data_engineer','qa','code_reviewer']) {
    if (!state.agent_payloads?.[key]) throw new Error(`missing agent_payloads.${key}`);
  }
  const stateSchema = readJson('project/work-orders/state.schema.json');
  if (stateSchema.$id !== 'agentic.factory.WorkOrderState.v4') throw new Error('state.schema.json $id mismatch');
  const history = readJson('project/work-orders/history-summary.json');
  if (history.schema !== 'agentic.factory.HistorySummary.v1') throw new Error('history-summary schema mismatch');
  if (!Array.isArray(history.structural_deltas)) throw new Error('history-summary structural_deltas missing');
});

check('module template artifacts', () => {
  requireFiles([
    'project/modules/_template/MODULE.md',
    'project/modules/_template/context.md',
    'project/modules/_template/api.contract.md',
    'project/modules/_template/ui.contract.md',
    'project/modules/_template/dto.md',
    'project/modules/_template/data-model.md',
    'project/modules/_template/permissions.md',
    'project/modules/_template/test-matrix.md',
    'project/modules/_template/handoff.md'
  ]);
  requirePhrases('project/modules/_template/api.contract.md', ['OpenAPI 3.1']);
  requirePhrases('project/modules/_template/ui.contract.md', ['Design system constraints']);
});

check('packages/contracts structure', () => {
  requireFiles([
    'packages/contracts/package.json',
    'packages/contracts/README.md',
    'packages/contracts/src/index.ts',
    'packages/contracts/spec-kit.module.schema.json',
    'packages/contracts/specs/_template.spec.json',
    'packages/contracts/specs/sample-resource.spec.json'
  ]);
  const pkg = readJson('packages/contracts/package.json');
  if (!pkg.name) throw new Error('packages/contracts/package.json missing name');
  const schema = readJson('packages/contracts/spec-kit.module.schema.json');
  if (schema.$id !== 'agentic.factory.SpecKitModuleSpec.v1') throw new Error('spec-kit schema $id mismatch');
});

check('project modules use template shape', () => {
  const moduleNames = listDirs('project/modules').filter(name => name !== '_template');
  for (const moduleName of moduleNames) {
    requireFiles([
      `project/modules/${moduleName}/MODULE.md`,
      `project/modules/${moduleName}/context.md`,
      `project/modules/${moduleName}/api.contract.md`,
      `project/modules/${moduleName}/ui.contract.md`,
      `project/modules/${moduleName}/dto.md`,
      `project/modules/${moduleName}/data-model.md`,
      `project/modules/${moduleName}/permissions.md`,
      `project/modules/${moduleName}/test-matrix.md`,
      `project/modules/${moduleName}/handoff.md`
    ]);
  }
});

check('frontend design-system catalog', () => {
  requireFiles([
    'frontend/src/components/COMPONENTS.md',
    'project/UI.md',
    'docs/standards/frontend-standards.md',
    'docs/standards/frontend-engineering-quality.md'
  ]);
  requirePhrases('frontend/src/components/COMPONENTS.md', [
    'Component name',
    'Purpose',
    'Props summary',
    'Allowed usage',
    'Related module',
    'Accessibility notes',
    'Do not add ad-hoc CSS',
    'inline style objects',
    'Tailwind/Shadcn-compatible',
    'project/UI.md',
    'ui.contract.md'
  ]);
});

runScript('state readiness', 'scripts/task-ready-check.mjs');
runScript('spec-kit JSON specs', 'scripts/check-spec-kit-contracts.mjs');
runScript('contract artifacts', 'scripts/check-contract-artifacts.mjs');
runScript('DTO checks', 'scripts/check-dto.mjs');
runScript('dependency boundaries', 'scripts/check-dependencies.mjs');
runScript('security scanner', 'scripts/security-scanner.mjs');
runScript('quality gates', 'scripts/check-quality-gates.mjs');
runScript('template cache', 'scripts/check-template-cache.mjs');
runScript('constitution check', 'scripts/check-constitution.mjs', {
  optional: true,
  when: exists('docs/constitution.md')
});
runScript('skill metadata', 'scripts/check-skill-metadata.mjs', {
  optional: true,
  when: exists('.agents/skills')
});
runScript('agent handoff schema', 'scripts/check-agent-handoff.mjs');
runScript('untrusted instruction rules', 'scripts/check-untrusted-instructions.mjs', {
  optional: true,
  when: exists('.agents/rules/untrusted-input.md')
});

for (const result of results) {
  const suffix = result.detail ? `: ${result.detail}` : '';
  console.log(`${result.status}: ${result.name}${suffix}`);
}

const failed = results.some(result => result.status === 'FAIL');
if (failed) process.exit(1);
console.log('OK: factory validator passed');
