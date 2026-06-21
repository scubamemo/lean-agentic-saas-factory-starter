import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
let failed = false;
function fail(message) { console.error(`FAIL: ${message}`); failed = true; }
function ok(message) { console.log(`OK: ${message}`); }
function read(rel) { return fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), 'utf8') : ''; }
function readJson(rel) { try { return JSON.parse(read(rel)); } catch (error) { fail(`${rel} is invalid JSON: ${error.message}`); return null; } }

const constitutionPath = 'docs/constitution.md';
const cachePath = 'project/work-orders/constitution-cache.json';
const constitution = read(constitutionPath);
if (!constitution) fail(`${constitutionPath} is missing`);
for (const phrase of [
  'Contract-first development',
  'Script-first validation',
  'Deterministic state management',
  'Separation of concerns',
  'Tenant isolation and security',
  'Design-system-only UI',
  'Traceability and auditability',
  'Tool-agnostic operation'
]) {
  if (!constitution.includes(phrase)) fail(`${constitutionPath} missing principle: ${phrase}`);
}
const cache = readJson(cachePath);
if (cache) {
  if (cache.schema !== 'agentic.factory.ConstitutionCache.v1') fail(`${cachePath} has invalid schema`);
  if (cache.constitution_path !== constitutionPath) fail(`${cachePath} must point to ${constitutionPath}`);
  const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, constitutionPath))).digest('hex');
  if (cache.constitution_sha256 !== actual) fail(`${cachePath} hash mismatch; update cache intentionally after constitution changes`);
}
if (failed) process.exit(1);
ok('constitution is present and hash-verified');
