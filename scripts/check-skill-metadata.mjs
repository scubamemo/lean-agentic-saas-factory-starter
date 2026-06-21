import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const skillsDir = path.join(root, '.agents/skills');
let failed = false;
function fail(message) { console.error(`FAIL: ${message}`); failed = true; }
function ok(message) { console.log(`OK: ${message}`); }

const requiredKeys = ['agent:', 'model_tier:', 'purpose:', 'allowed_read:', 'allowed_write:', 'forbidden_write:', 'required_scripts:', 'handoff_targets:'];
const validAgents = new Set(['pm','architect','designer','data-engineer','backend-developer','frontend-developer','qa','code-reviewer']);
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
  if (!meta.includes('node scripts/factory-check.mjs')) fail(`${path.relative(root, file)} metadata must require factory-check`);
  if (!meta.includes('node scripts/check-dependencies.mjs')) fail(`${path.relative(root, file)} metadata must require dependency check`);
}
if (failed) process.exit(1);
ok('skill metadata front matter is present and aligned');
