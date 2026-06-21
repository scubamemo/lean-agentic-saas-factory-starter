import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failed = false;
function fail(message) { console.error(`FAIL: ${message}`); failed = true; }
function ok(message) { console.log(`OK: ${message}`); }
function read(rel) {
  const p = path.join(root, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}
function hasAny(text, phrases) { return phrases.some(p => text.includes(p)); }

const api = read('project/modules/_template/api.contract.md');
if (!api) fail('Missing project/modules/_template/api.contract.md');
if (!hasAny(api, ['openapi: 3.1.0', '$schema:', 'JSON Schema', 'packages/contracts/specs/<module-name>.spec.json'])) {
  fail('api.contract.md must contain OpenAPI 3.1, JSON Schema content, or a primary packages/contracts/specs/<module-name>.spec.json reference');
}
if (!fs.existsSync(path.join(root, 'packages/contracts/specs/_template.spec.json'))) fail('Missing primary Spec-Kit JSON template spec: packages/contracts/specs/_template.spec.json');
for (const phrase of ['additionalProperties: false', 'responses:', 'components:', 'Tenant behavior']) {
  if (!api.includes(phrase)) fail(`api.contract.md missing strict contract phrase: ${phrase}`);
}

const ui = read('project/modules/_template/ui.contract.md');
if (!ui) fail('Missing project/modules/_template/ui.contract.md');
for (const phrase of ['Design system constraints', 'Tailwind/Shadcn', 'Components', 'Mock scenarios', 'Visual QA expectations']) {
  if (!ui.includes(phrase)) fail(`ui.contract.md missing required UI phrase: ${phrase}`);
}

const handoff = read('project/modules/_template/handoff.md');
for (const phrase of ['Current status', 'Current dependencies', 'Next agent', 'Artifact sync', 'State Transition DTO']) {
  if (!handoff.includes(phrase)) fail(`handoff.md missing required phrase: ${phrase}`);
}

const frontendStandards = read('docs/standards/frontend-standards.md');
for (const phrase of ['Tailwind', 'Shadcn', 'ad-hoc CSS', 'frontend/src/components/COMPONENTS.md']) {
  if (!frontendStandards.includes(phrase)) fail(`frontend-standards.md missing required phrase: ${phrase}`);
}

if (failed) process.exit(1);
ok('contract artifacts are strict enough');
