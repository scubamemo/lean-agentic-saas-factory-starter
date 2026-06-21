import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = parseArgs(process.argv.slice(2));
const state = readJson('project/work-orders/state.json') ?? {};
const workOrderId = args['work-order'] || args.work_order_id || state.work_order_id;
const agent = args.agent || state.last_updated_by;
const moduleName = args.module || state.module;
if (!workOrderId || !agent) {
  console.error('Usage: node scripts/trace-logger.mjs --agent <agent> --work-order <WO-ID> --module <module> --decision "..." --evidence "..." --artifacts "a,b" --status <status>');
  process.exit(1);
}
const tracesDir = path.join(root, 'project/work-orders/traces');
fs.mkdirSync(tracesDir, { recursive: true });
const trace = {
  schema: 'agentic.factory.DecisionTrace.v1',
  timestamp: new Date().toISOString(),
  work_order_id: workOrderId,
  module: moduleName || 'TBD',
  agent,
  status: args.status || state.status || 'UNKNOWN',
  decision_summary: clamp(args.decision || args.reason || 'No decision summary provided.', 800),
  evidence_summary: clamp(args.evidence || 'No evidence summary provided.', 1200),
  artifacts: csv(args.artifacts),
  scripts_run: csv(args.scripts),
  next_agent: args['next-agent'] || state.next_agent || 'TBD',
  note: 'Decision trace stores concise rationale and evidence. Do not paste private hidden chain-of-thought or full raw logs.'
};
const traceFile = path.join(tracesDir, `${sanitize(workOrderId)}.trace.jsonl`);
fs.appendFileSync(traceFile, `${JSON.stringify(trace)}\n`);
console.log(`OK: wrote decision trace ${path.relative(root, traceFile)}`);

function parseArgs(parts) {
  const out = {};
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part.startsWith('--')) continue;
    const key = part.slice(2);
    const next = parts[i + 1];
    if (next && !next.startsWith('--')) { out[key] = next; i++; }
    else out[key] = 'true';
  }
  return out;
}
function csv(value) { return value ? String(value).split(',').map(x => x.trim()).filter(Boolean) : []; }
function clamp(value, n) { const s = String(value ?? ''); return s.length > n ? `${s.slice(0, n)}…` : s; }
function sanitize(value) { return String(value).replace(/[^A-Za-z0-9._-]/g, '_'); }
function readJson(rel) { try { return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')); } catch { return null; } }
