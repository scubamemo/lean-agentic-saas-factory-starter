import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const refresh = process.argv.includes('--refresh');
const constitutionPath = 'docs/constitution.md';
const cachePath = 'project/work-orders/constitution-cache.json';
const schema = 'agentic.factory.ConstitutionCache.v1';

let failed = false;
function fail(message) { console.error(`FAIL: ${message}`); failed = true; }
function ok(message) { console.log(`OK: ${message}`); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return exists(rel) ? fs.readFileSync(path.join(root, rel), 'utf8') : ''; }
function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }

function readJson(rel) {
  try {
    return JSON.parse(read(rel));
  } catch (error) {
    fail(`${rel} is missing or invalid JSON: ${error.message}`);
    return null;
  }
}

const constitution = read(constitutionPath);
if (!constitution) fail(`${constitutionPath} is missing`);

const requiredPhrases = [
  'Contract-first development',
  'Script-first validation',
  '`state.json` source of truth',
  'Tenant isolation',
  'Design-system only UI',
  'No direct frontend/backend imports',
  '`packages/contracts` as shared source of truth',
  'QA cannot fix code',
  'Reviewer cannot implement code',
  'Trace every decision',
  'No untrusted instruction execution',
  'No full-repo scan',
  'Security scanner must pass',
  'node scripts/security-scanner.mjs',
  'node scripts/check-constitution.mjs --refresh',
  'Silent constitution drift is a failure'
];

for (const phrase of requiredPhrases) {
  if (!constitution.includes(phrase)) fail(`${constitutionPath} missing principle phrase: ${phrase}`);
}

const constitutionSha = constitution ? sha256(constitution) : null;

function writeCache() {
  const cache = {
    schema,
    constitution_path: constitutionPath,
    constitution_sha256: constitutionSha,
    hash_algorithm: 'sha256(file-content)',
    refreshed_by: 'node scripts/check-constitution.mjs --refresh',
    verification_command: 'node scripts/check-constitution.mjs',
    required_principles: requiredPhrases,
    notes: [
      'Agents may skip rereading docs/constitution.md when this hash is valid.',
      'If docs/constitution.md changes intentionally, rerun node scripts/check-constitution.mjs --refresh.',
      'If this hash mismatches unexpectedly, stop and route to Architect/Code Reviewer.'
    ]
  };
  fs.mkdirSync(path.dirname(path.join(root, cachePath)), { recursive: true });
  fs.writeFileSync(path.join(root, cachePath), `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
}

if (refresh) {
  if (failed) process.exit(1);
  writeCache();
  ok(`constitution cache refreshed at ${cachePath}`);
  process.exit(0);
}

const cache = readJson(cachePath);
if (cache) {
  if (cache.schema !== schema) fail(`${cachePath} has invalid schema`);
  if (cache.constitution_path !== constitutionPath) fail(`${cachePath} must point to ${constitutionPath}`);
  if (cache.hash_algorithm !== 'sha256(file-content)') fail(`${cachePath} hash_algorithm must be sha256(file-content)`);
  if (cache.constitution_sha256 !== constitutionSha) {
    fail(`${cachePath} hash mismatch; run node scripts/check-constitution.mjs --refresh only after intentional constitution changes`);
  }
  if (!Array.isArray(cache.required_principles) || cache.required_principles.length < requiredPhrases.length) {
    fail(`${cachePath} must list required_principles`);
  }
}

if (failed) process.exit(1);
ok('constitution is present and hash-verified');
