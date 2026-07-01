import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = parseArgs(process.argv.slice(2));
const state = readJson('project/work-orders/state.json') ?? {};

const workOrderId = args['work-order'] || args.work_order_id || state.work_order_id;
const agent = args.agent || state.last_updated_by;
const moduleName = args.module || state.module;
const action = args.action || 'handoff';
const decision = args.decision || args.reason;
const evidence = args.evidence;
const nextAgent = args['next-agent'] || args.next_agent || state.next_agent || 'TBD';
const riskLevel = args['risk-level'] || args.risk_level || 'low';

if (!workOrderId || !agent || !moduleName || !decision || !evidence) {
  console.error('Usage: node scripts/trace-logger.mjs --agent <agent> --work-order <WO-ID> --module <module> --action <action> --decision "..." --evidence "..." --scripts "cmd1,cmd2" --files "a,b" --next-agent <agent> --risk-level <low|medium|high>');
  process.exit(1);
}

if (!['low', 'medium', 'high'].includes(riskLevel)) {
  console.error('FAIL: --risk-level must be low, medium, or high');
  process.exit(1);
}

const trace = {
  timestamp: new Date().toISOString(),
  agent: clamp(agent, 80),
  work_order_id: clamp(workOrderId, 120),
  module: clamp(moduleName, 120),
  action: clamp(action, 120),
  decision: sanitizeSummary(decision, 600),
  evidence: sanitizeSummary(evidence, 900),
  scripts_run: csv(args.scripts),
  files_changed: csv(args.files || args.artifacts),
  next_agent: clamp(nextAgent, 80),
  risk_level: riskLevel
};

const tracesDir = path.join(root, 'project/work-orders/traces');
fs.mkdirSync(tracesDir, { recursive: true });
const traceFile = path.join(tracesDir, `${sanitizeFileName(workOrderId)}.trace.jsonl`);
fs.appendFileSync(traceFile, `${JSON.stringify(trace)}\n`, 'utf8');
console.log(`OK: wrote decision trace ${path.relative(root, traceFile)}`);

function parseArgs(parts) {
  const out = {};
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part.startsWith('--')) continue;
    const key = part.slice(2);
    const next = parts[i + 1];
    if (next && !next.startsWith('--')) {
      out[key] = next;
      i++;
    } else {
      out[key] = 'true';
    }
  }
  return out;
}
function csv(value) {
  return value
    ? String(value).split(',').map(x => clamp(x.trim(), 180)).filter(Boolean).slice(0, 30)
    : [];
}
function clamp(value, n) {
  const s = String(value ?? '');
  return s.length > n ? `${s.slice(0, n)}…` : s;
}
function sanitizeSummary(value, n) {
  const text = clamp(value, n);
  return text
    .replace(/chain[- ]of[- ]thought/gi, 'private reasoning')
    .replace(/hidden reasoning/gi, 'private reasoning')
    .replace(/\r?\n/g, ' ');
}
function sanitizeFileName(value) {
  return String(value).replace(/[^A-Za-z0-9._-]/g, '_');
}
function readJson(rel) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
  } catch {
    return null;
  }
}
