import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const schemaPath = 'packages/contracts/agent-handoff.schema.json';
const schemaVersion = 'agentic.factory.AgentHandoff.v1';
const agents = new Set([
  'pm',
  'architect',
  'designer',
  'data-engineer',
  'backend-developer',
  'frontend-developer',
  'qa',
  'code-reviewer',
  'human'
]);
const states = new Set([
  'PLANNED',
  'IN_PROGRESS',
  'VALIDATION_REQUIRED',
  'QA_PENDING',
  'APPROVED',
  'COMPLETED',
  'FAILED',
  'REVISION_IN_PROGRESS'
]);
const requiredFields = [
  'schema_version',
  'source_agent',
  'target_agent',
  'work_order_id',
  'module',
  'current_state',
  'next_state',
  'contract_version',
  'changed_artifacts',
  'changed_files',
  'scripts_run',
  'validation_errors',
  'blockers',
  'next_action'
];

let failed = false;

function relPath(rel) {
  return path.join(root, rel);
}

function exists(rel) {
  return fs.existsSync(relPath(rel));
}

function read(rel) {
  return exists(rel) ? fs.readFileSync(relPath(rel), 'utf8') : '';
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  failed = true;
}

function ok(message) {
  console.log(`OK: ${message}`);
}

function jsonBlocks(text) {
  const blocks = [];
  const re = /```json\s*([\s\S]*?)```/g;
  let match;
  while ((match = re.exec(text))) blocks.push(match[1].trim());
  return blocks;
}

function moduleHandoffFiles() {
  const modulesDir = relPath('project/modules');
  if (!fs.existsSync(modulesDir)) return [];
  return fs.readdirSync(modulesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => `project/modules/${entry.name}/handoff.md`)
    .filter(exists)
    .sort();
}

function exampleHandoffFiles() {
  const examplesDir = relPath('examples/golden');
  if (!fs.existsSync(examplesDir)) return [];
  const out = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'handoff.md') out.push(path.relative(root, full).replaceAll(path.sep, '/'));
    }
  };
  walk(examplesDir);
  return out.sort();
}

function parseJsonBlock(block, rel) {
  try {
    return JSON.parse(block);
  } catch (error) {
    fail(`${rel}: invalid JSON block: ${error.message}`);
    return null;
  }
}

function isString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateStringArray(dto, key, rel) {
  if (!Array.isArray(dto[key])) {
    fail(`${rel}: ${key} must be an array`);
    return;
  }
  dto[key].forEach((item, index) => {
    if (!isString(item)) fail(`${rel}: ${key}[${index}] must be a non-empty string`);
  });
}

function validateHandoff(dto, rel) {
  for (const field of requiredFields) {
    if (!(field in dto)) fail(`${rel}: missing required field ${field}`);
  }
  if (dto.schema_version !== schemaVersion) fail(`${rel}: schema_version must be ${schemaVersion}`);
  if (!agents.has(dto.source_agent)) fail(`${rel}: invalid source_agent ${dto.source_agent}`);
  if (!agents.has(dto.target_agent)) fail(`${rel}: invalid target_agent ${dto.target_agent}`);
  if (!isString(dto.work_order_id) || !/^WO-[0-9A-Za-z._-]+$/.test(dto.work_order_id)) {
    fail(`${rel}: work_order_id must start with WO-`);
  }
  if (!isString(dto.module)) fail(`${rel}: module must be a non-empty string`);
  if (!states.has(dto.current_state)) fail(`${rel}: invalid current_state ${dto.current_state}`);
  if (!states.has(dto.next_state)) fail(`${rel}: invalid next_state ${dto.next_state}`);
  if (!isString(dto.contract_version)) fail(`${rel}: contract_version must be a non-empty string`);
  for (const key of ['changed_artifacts', 'changed_files', 'scripts_run', 'validation_errors', 'blockers']) {
    validateStringArray(dto, key, rel);
  }
  if (!isString(dto.next_action)) fail(`${rel}: next_action must be a non-empty string`);
}

function validateSchema() {
  if (!exists(schemaPath)) {
    fail(`${schemaPath} missing`);
    return;
  }
  let schema;
  try {
    schema = JSON.parse(read(schemaPath));
  } catch (error) {
    fail(`${schemaPath} invalid JSON: ${error.message}`);
    return;
  }
  if (schema.$id !== schemaVersion) fail(`${schemaPath}: invalid $id`);
  for (const field of requiredFields) {
    if (!schema.required?.includes(field)) fail(`${schemaPath}: required missing ${field}`);
    if (!schema.properties?.[field]) fail(`${schemaPath}: properties missing ${field}`);
  }
  if (schema.additionalProperties !== false) fail(`${schemaPath}: additionalProperties must be false`);
}

function validateFile(rel) {
  const text = read(rel);
  if (!text) {
    fail(`${rel}: missing or empty`);
    return;
  }
  const parsed = jsonBlocks(text)
    .map(block => parseJsonBlock(block, rel))
    .filter(Boolean);
  const handoffs = parsed.filter(dto => dto.schema_version === schemaVersion);
  if (handoffs.length !== 1) {
    fail(`${rel}: expected exactly one ${schemaVersion} JSON block, found ${handoffs.length}`);
    return;
  }
  validateHandoff(handoffs[0], rel);
}

validateSchema();

const files = [
  ...moduleHandoffFiles(),
  ...exampleHandoffFiles()
];

if (files.length === 0) fail('no module handoff.md files found');
for (const rel of files) validateFile(rel);

if (failed) process.exit(1);
ok('agent handoff schema and handoff payloads are valid');
