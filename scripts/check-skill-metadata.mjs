import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const skillsDir = path.join(root, '.agents/skills');
let failed = false;
function fail(message) { console.error(`FAIL: ${message}`); failed = true; }
function ok(message) { console.log(`OK: ${message}`); }

const requiredKeys = [
  'agent:',
  'model_tier:',
  'purpose:',
  'allowed_read:',
  'allowed_write:',
  'forbidden_write:',
  'required_scripts:',
  'primary_handoff_targets:',
  'handoff_targets:'
];
const validAgents = new Set(['pm','architect','designer','data-engineer','backend-developer','frontend-developer','qa','code-reviewer']);
const requiredScripts = [
  'node scripts/factory-check.mjs',
  'node scripts/task-ready-check.mjs',
  'node scripts/check-contract-artifacts.mjs',
  'node scripts/check-dto.mjs',
  'node scripts/check-dependencies.mjs',
  'node scripts/check-template-cache.mjs',
  'node scripts/check-quality-gates.mjs',
  'node scripts/check-spec-kit-contracts.mjs',
  'node scripts/security-scanner.mjs'
];
for (const dir of fs.readdirSync(skillsDir)) {
  const file = path.join(skillsDir, dir, 'SKILL.md');
  if (!fs.existsSync(file)) { fail(`missing skill file for ${dir}`); continue; }
  const text = fs.readFileSync(file, 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) { fail(`${path.relative(root, file)} missing YAML metadata front matter`); continue; }
  const meta = match[1];
  for (const key of requiredKeys) if (!meta.includes(key)) fail(`${path.relative(root, file)} metadata missing ${key}`);
  const agentLine = meta.match(/(?:^|\n)agent:\s*([^\n]+)/);
  const agent = agentLine?.[1]?.trim();
  if (!validAgents.has(agent)) fail(`${path.relative(root, file)} has invalid agent metadata: ${agent}`);
  if (agent !== dir) fail(`${path.relative(root, file)} agent metadata (${agent}) must match directory (${dir})`);
  for (const script of requiredScripts) {
    if (!meta.includes(script)) fail(`${path.relative(root, file)} metadata must require ${script}`);
    if (!text.includes(script)) fail(`${path.relative(root, file)} script-first rule must mention ${script}`);
  }
  if (!text.includes('Do not spend LLM reasoning tokens')) fail(`${path.relative(root, file)} missing script-first phrase: Do not spend LLM reasoning tokens`);
  if (!text.includes('terminal output')) fail(`${path.relative(root, file)} missing script-first phrase: terminal output`);
  if (!/work\s+order explicitly requires implementation/.test(text)) fail(`${path.relative(root, file)} missing script-first phrase: work order explicitly requires implementation`);
}
if (failed) process.exit(1);
ok('skill metadata front matter is present and aligned');
