import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failed = false;
const skipDirs = new Set(['node_modules','.git','dist','build','.next','coverage','.factory-meta','docs']);
const skipFiles = new Set(['scripts/security-scanner.mjs']);
const allowedPlaceholders = /(TBD|TODO|example|sample|placeholder|changeme|change-me|dummy|fake|redacted|your_|<|>|\$\{|process\.env)/i;
const rules = [
  { name: 'AWS access key', re: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: 'GitHub token', re: /\bgh[pousr]_[A-Za-z0-9_]{36,}\b/g },
  { name: 'Stripe live secret key', re: /\bsk_live_[A-Za-z0-9]{20,}\b/g },
  { name: 'Slack token', re: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g },
  { name: 'Private key block', re: /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/g },
  { name: 'Hardcoded secret assignment', re: /\b(api[_-]?key|secret|token|password|passwd|pwd|client[_-]?secret)\b\s*[:=]\s*['\"]([^'\"]{12,})['\"]/gi }
];
function normalize(rel) { return rel.replaceAll('\\', '/'); }
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}
function shouldScan(rel) {
  if (skipFiles.has(rel)) return false;
  if (rel === '.env.example') return true;
  return /\.(ts|tsx|js|jsx|mjs|cjs|json|yml|yaml|prisma|env|example)$/.test(rel);
}
function fail(message) { console.error(`FAIL: ${message}`); failed = true; }
for (const file of walk(root)) {
  const rel = normalize(path.relative(root, file));
  if (!shouldScan(rel)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const rule of rules) {
    for (const match of text.matchAll(rule.re)) {
      const matched = match[0];
      const value = match[2] || matched;
      if (allowedPlaceholders.test(value) || allowedPlaceholders.test(matched)) continue;
      const line = text.slice(0, match.index).split(/\r?\n/).length;
      fail(`${rule.name} detected in ${rel}:${line}`);
    }
  }
}
if (failed) process.exit(1);
console.log('OK: security scanner found no obvious secrets');
