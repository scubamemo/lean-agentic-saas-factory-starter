import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failed = false;
function fail(message) { console.error(`FAIL: ${message}`); failed = true; }
function ok(message) { console.log(`OK: ${message}`); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return exists(rel) ? fs.readFileSync(path.join(root, rel), 'utf8') : ''; }

for (const rel of ['docs/standards/prompt-injection-safety.md', '.agents/rules/untrusted-input.md']) {
  const text = read(rel);
  if (!text) fail(`${rel} missing`);
  for (const phrase of ['untrusted', 'must not obey', 'canonical', 'override']) {
    if (!text.toLowerCase().includes(phrase)) fail(`${rel} missing safety phrase: ${phrase}`);
  }
}

const untrustedRoots = ['project/imports', 'project/inbox', 'project/external', 'project/user-input'];
const suspicious = [
  /ignore (all )?(previous|above) instructions/i,
  /disable (validation|checks|security|guardrails)/i,
  /send (me )?(the )?(secret|token|password|api key)/i,
  /read (the )?(entire|whole) repo/i,
  /exfiltrate/i,
  /do not run .*check/i,
  /bypass/i
];
function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}
for (const relRoot of untrustedRoots) {
  for (const file of walk(path.join(root, relRoot))) {
    const text = fs.readFileSync(file, 'utf8');
    for (const re of suspicious) if (re.test(text)) fail(`${path.relative(root, file)} contains instruction-like untrusted content matching ${re}`);
  }
}
if (failed) process.exit(1);
ok('untrusted input rules are present and no suspicious imported instructions were found');
