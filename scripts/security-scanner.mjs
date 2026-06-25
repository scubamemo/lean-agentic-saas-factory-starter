import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failed = false;

const skipDirs = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.factory-meta'
]);

const skipFiles = new Set([
  'scripts/security-scanner.mjs',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock'
]);

const scanExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.jsonc',
  '.yml',
  '.yaml',
  '.prisma',
  '.env',
  '.example',
  '.md',
  '.txt',
  '.sh',
  '.bash',
  '.zsh'
]);

const fakeExampleRe = /\b(example|sample|dummy|fake|changeme|change-me|placeholder|redacted|not-a-secret|test-only|your[_-]?token|your[_-]?key)\b|<[^>\n]*(TOKEN|KEY|SECRET|PASSWORD)[^>\n]*>|\$\{[^}\n]+}/i;

const lineRules = [
  {
    name: 'AWS access key',
    re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g
  },
  {
    name: 'AWS secret access key assignment',
    re: /\b(?:aws[_-]?)?secret[_-]?access[_-]?key\b\s*[:=]\s*['"]([A-Za-z0-9/+=]{40})['"]/gi,
    group: 1
  },
  {
    name: 'GitHub token',
    re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}\b/g
  },
  {
    name: 'GitHub fine-grained token',
    re: /\bgithub_pat_[A-Za-z0-9_]{80,}\b/g
  },
  {
    name: 'Stripe live secret key',
    re: /\bsk_live_[A-Za-z0-9]{20,}\b/g
  },
  {
    name: 'Slack token',
    re: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g
  },
  {
    name: 'SendGrid API key',
    re: /\bSG\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g
  },
  {
    name: 'Google API key',
    re: /\bAIza[0-9A-Za-z_-]{35}\b/g
  },
  {
    name: 'JWT-like hardcoded token',
    re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g
  },
  {
    name: 'Generic bearer token',
    re: /\bBearer\s+([A-Za-z0-9._~+/=-]{24,})\b/gi,
    group: 1
  },
  {
    name: 'Hardcoded credential assignment',
    re: /\b(api[_-]?key|secret|token|password|passwd|pwd|client[_-]?secret|private[_-]?key|access[_-]?token|refresh[_-]?token)\b\s*[:=]\s*['"]([^'"]{12,})['"]/gi,
    group: 2
  }
];

function fail(message) {
  console.error(`FAIL: ${message}`);
  failed = true;
}
function normalize(rel) {
  return rel.replaceAll('\\', '/');
}
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
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
  const ext = path.extname(rel);
  if (scanExtensions.has(ext)) return true;
  return rel.includes('.env');
}
function lineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}
function sourceLine(text, index) {
  const start = text.lastIndexOf('\n', index) + 1;
  const end = text.indexOf('\n', index);
  return text.slice(start, end === -1 ? text.length : end);
}
function looksFake(line, value) {
  return fakeExampleRe.test(line) || fakeExampleRe.test(value);
}
function looksLikeEnvReference(value) {
  return /^(process\.env\.|import\.meta\.env\.|\$\{?[A-Z0-9_]+\}?$)/.test(value);
}
function hasUsefulSecretEntropy(value) {
  if (value.length < 12) return false;
  const hasLetter = /[A-Za-z]/.test(value);
  const hasDigitOrSymbol = /[0-9+/=_-]/.test(value);
  return hasLetter && hasDigitOrSymbol;
}
function reportMatch(rule, rel, text, match) {
  const value = match[rule.group ?? 0] ?? match[0];
  const line = sourceLine(text, match.index);
  if (looksFake(line, value)) return;
  if (looksLikeEnvReference(value)) return;
  if (rule.name === 'Hardcoded credential assignment' && !hasUsefulSecretEntropy(value)) return;
  fail(`${rule.name} detected in ${rel}:${lineNumber(text, match.index)}`);
}

for (const file of walk(root)) {
  const rel = normalize(path.relative(root, file));
  if (!shouldScan(rel)) continue;

  const text = fs.readFileSync(file, 'utf8');
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text) && !fakeExampleRe.test(text)) {
    fail(`Private key block detected in ${rel}`);
  }

  for (const rule of lineRules) {
    rule.re.lastIndex = 0;
    for (const match of text.matchAll(rule.re)) {
      reportMatch(rule, rel, text, match);
    }
  }
}

if (failed) process.exit(1);
console.log('OK: security scanner found no obvious secrets');
