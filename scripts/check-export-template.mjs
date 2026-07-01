import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'agentic-factory-export-'));
const target = path.join(tempRoot, 'project');
const sourceCachePath = path.join(root, 'project/work-orders/template-structure-cache.json');
const sourceCacheBefore = fs.readFileSync(sourceCachePath, 'utf8');
let failed = false;
const fail = message => { console.error(`FAIL: ${message}`); failed = true; };

try {
  const result = spawnSync(process.execPath, ['scripts/export-template.mjs', root, target], {
    cwd: root,
    encoding: 'utf8'
  });
  if (result.status !== 0) {
    fail(`export-template failed:\n${result.stdout}\n${result.stderr}`.trim());
    process.exitCode = 1;
  } else {

  const state = JSON.parse(fs.readFileSync(path.join(target, 'project/work-orders/state.json'), 'utf8'));
  if (state.status !== 'PLANNED') fail(`exported state must be PLANNED, got ${state.status}`);
  if (state.module !== 'TBD') fail(`exported module must be TBD, got ${state.module}`);
  if (state.work_order_id !== 'WO-0001') fail(`exported work order must be WO-0001, got ${state.work_order_id}`);
  if (Object.values(state.quality_gates).some(Boolean)) fail('exported quality gates must all be false');

  const active = fs.readFileSync(path.join(target, 'project/work-orders/active-work-order.md'), 'utf8');
  const handoff = fs.readFileSync(path.join(target, 'project/modules/_template/handoff.md'), 'utf8');
  const bugfix = fs.readFileSync(path.join(target, 'project/work-orders/bugfix.md'), 'utf8');
  const exportedText = `${active}\n${handoff}\n${bugfix}\n${JSON.stringify(state)}`;
  if (exportedText.includes('WO-FACTORY-ALIGN-001')) fail('maintenance work-order ID leaked into export');
  if (!handoff.includes('## Current status\n\nPLANNED')) fail('template handoff was not reset to PLANNED');
  if (fs.existsSync(path.join(target, 'project/work-orders/factory-handoff.md'))) fail('factory maintenance handoff leaked into export');
  if (fs.existsSync(path.join(target, 'project/work-orders/_bugfix-template.md'))) fail('bugfix seed leaked into export');

  const taskReady = spawnSync(process.execPath, ['scripts/task-ready-check.mjs', '--allow-tbd'], {
    cwd: target,
    encoding: 'utf8'
  });
  if (taskReady.status !== 0) fail(`exported task state is invalid:\n${taskReady.stdout}\n${taskReady.stderr}`.trim());

  const sourceCacheAfter = fs.readFileSync(sourceCachePath, 'utf8');
  if (sourceCacheBefore !== sourceCacheAfter) fail('export mutated the source template cache');
  }
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

if (failed) process.exit(1);
console.log('OK: exported template is clean, reset, and source-preserving');
