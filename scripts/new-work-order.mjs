import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const [id, moduleName, taskType = 'backend-only'] = process.argv.slice(2);
if (!id || !moduleName) {
  console.error('Usage: pnpm new:work-order <WO-0001> <module-name> [task-type]');
  process.exit(1);
}

const allowedTaskTypes = new Set(['docs-only', 'contract-only', 'backend-only', 'frontend-only', 'data-model', 'full-stack', 'bugfix', 'refactor', 'review', 'release']);
if (!allowedTaskTypes.has(taskType)) {
  console.error(`Invalid task type: ${taskType}`);
  console.error(`Allowed: ${Array.from(allowedTaskTypes).join(', ')}`);
  process.exit(1);
}

const targetByTaskType = {
  'docs-only': 'pm',
  'contract-only': 'architect',
  'backend-only': 'backend-developer',
  'frontend-only': 'frontend-developer',
  'data-model': 'data-engineer',
  'full-stack': 'architect',
  'bugfix': 'pm',
  'refactor': 'architect',
  'review': 'code-reviewer',
  'release': 'pm',
};

const targetAgent = targetByTaskType[taskType] ?? 'pm';
const owner = taskType === 'review' ? 'code-reviewer' : 'pm';
const template = fs.readFileSync(path.join(root, 'project/work-orders/_template.md'), 'utf8');
let out = template
  .replaceAll('WO-XXXX', id)
  .replace(/## Target module\n\n[^\n]+/, `## Target module\n\n${moduleName}`)
  .replace(/## Task type\n\n[^\n]+/, `## Task type\n\n${taskType}`)
  .replace(/## Status\n\n[^\n]+/, '## Status\n\nPLANNED')
  .replace(/## Owner\n\n[^\n]+/, `## Owner\n\n${owner}`)
  .replaceAll('project/modules/<module>/', `project/modules/${moduleName}/`)
  .replaceAll('backend/src/modules/<module>/', `backend/src/modules/${moduleName}/`)
  .replaceAll('"target_agent": "pm"', `"target_agent": "${targetAgent}"`)
  .replaceAll('"work_order_id": "WO-XXXX"', `"work_order_id": "${id}"`)
  .replaceAll('"module": "TBD"', `"module": "${moduleName}"`);

if (!out.includes('history-summary.json')) {
  out = out.replace('## ID', '## Lazy context and rolling history\n\nHistorical context must come from `project/work-orders/history-summary.json`, not old handoff logs or completed work-order markdown.\n\n## Delta-only writing\n\nAgents update only their assigned `agent_payloads` key in `project/work-orders/state.json`, then mirror a compact summary here.\n\n## ID');
}
if (!out.includes('node scripts/check-template-cache.mjs')) {
  out = out.replace('node scripts/check-dependencies.mjs\nnode scripts/task-ready-check.mjs', 'node scripts/check-dependencies.mjs\nnode scripts/check-template-cache.mjs\nnode scripts/task-ready-check.mjs');
}
fs.writeFileSync(path.join(root, 'project/work-orders/active-work-order.md'), out);

const statePath = path.join(root, 'project/work-orders/state.json');
const payload = (summary) => ({ status: 'pending', summary, updated_by: 'system', changed_artifacts: [] });
const state = {
  schema: 'agentic.factory.WorkOrderState.v3',
  work_order_id: id,
  module: moduleName,
  task_type: taskType,
  status: 'PLANNED',
  last_updated_by: owner,
  validation_errors: [],
  owner,
  next_agent: targetAgent,
  allowed_transitions: {
    PLANNED: ['IN_PROGRESS'],
    IN_PROGRESS: ['VALIDATION_REQUIRED', 'FAILED'],
    VALIDATION_REQUIRED: ['QA_PENDING', 'FAILED'],
    QA_PENDING: ['COMPLETED', 'FAILED'],
    FAILED: ['IN_PROGRESS'],
    COMPLETED: []
  },
  requested_transition: {
    from: 'PLANNED',
    to: 'IN_PROGRESS',
    requested_by: owner,
    reason: `Start ${taskType} work for ${moduleName}`
  },
  quality_gates: {
    factory_check_passed: false,
    dependency_check_passed: false,
    contract_artifacts_valid: false,
    dto_check_passed: false,
    template_cache_valid: false,
    test_matrix_criteria_met: false,
    qa_passed: false,
    review_passed: false
  },
  artifacts: {
    api_contract: `project/modules/${moduleName}/api.contract.md`,
    ui_contract: `project/modules/${moduleName}/ui.contract.md`,
    dto: `project/modules/${moduleName}/dto.md`,
    data_model: `project/modules/${moduleName}/data-model.md`,
    test_matrix: `project/modules/${moduleName}/test-matrix.md`,
    handoff: `project/modules/${moduleName}/handoff.md`
  },
  mcp: {
    source_of_truth: 'project/work-orders/state.json',
    structured_handoffs_required: true,
    active_work_order_md_is_mirror: true,
    lazy_context_required: true
  },
  history_summary: 'project/work-orders/history-summary.json',
  template_cache: 'project/work-orders/template-structure-cache.json',
  delta_policy: {
    delta_only_writing: true,
    forbid_full_markdown_rewrites: true,
    role_payload_keys: {
      pm: 'pm_status',
      architect: 'architect_status',
      designer: 'ui_status',
      'data-engineer': 'data_status',
      'backend-developer': 'backend_status',
      'frontend-developer': 'ui_status',
      qa: 'qa_status',
      'code-reviewer': 'review_status'
    }
  },
  agent_payloads: {
    pm_status: payload(`Created work order ${id} for ${moduleName}.`),
    architect_status: payload('No architecture delta yet.'),
    data_status: payload('No data-model delta yet.'),
    backend_status: payload('No backend delta yet.'),
    ui_status: payload('No UI delta yet.'),
    qa_status: payload('No QA delta yet.'),
    review_status: payload('No review delta yet.')
  },
  notes: [
    'Generated by scripts/new-work-order.mjs.',
    'state.json is the only source of truth; active-work-order.md is a mirror only.',
    'Use history-summary.json for previous-step context.',
    'Use delta-only writes to agent_payloads.*.'
  ]
};
fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);

const historyPath = path.join(root, 'project/work-orders/history-summary.json');
const history = {
  schema: 'agentic.factory.HistorySummary.v1',
  work_order_id: id,
  module: moduleName,
  last_compacted_at: new Date().toISOString(),
  source_of_truth: 'project/work-orders/state.json',
  structural_deltas: [
    {
      state: 'PLANNED',
      agent: owner,
      summary: `Created ${taskType} work order for ${moduleName}.`,
      artifacts_changed: ['project/work-orders/state.json', 'project/work-orders/active-work-order.md'],
      checks_run: []
    }
  ],
  rules: [
    'Agents must not read historical completed work-order markdown directly.',
    'Agents must use this compact summary for previous-step context.',
    'Store only structural deltas, not raw code or long logs.'
  ]
};
fs.writeFileSync(historyPath, `${JSON.stringify(history, null, 2)}\n`);
console.log(`Updated work order state: ${id} for module ${moduleName} (${taskType} -> ${targetAgent})`);
