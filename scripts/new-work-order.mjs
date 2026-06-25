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
  out = out.replace('## ID', '## Lazy context and rolling history\n\nHistorical context must come from `project/work-orders/history-summary.json`, not old handoff logs or completed work-order markdown.\n\n## Delta-only writing\n\nAgents update only their assigned `agent_payloads.<role>` slice in `project/work-orders/state.json`, then mirror a compact summary here. Agents must not regenerate the full `state.json` for a role delta.\n\n```text\npm -> agent_payloads.pm\narchitect -> agent_payloads.architect\ndesigner -> agent_payloads.designer\ndata-engineer -> agent_payloads.data_engineer\nbackend-developer -> agent_payloads.backend\nfrontend-developer -> agent_payloads.frontend\nqa -> agent_payloads.qa\ncode-reviewer -> agent_payloads.code_reviewer\n```\n\n## ID');
}
if (!out.includes('node scripts/check-template-cache.mjs')) {
  out = out.replace('node scripts/check-dependencies.mjs\nnode scripts/task-ready-check.mjs', 'node scripts/check-dependencies.mjs\nnode scripts/check-template-cache.mjs\nnode scripts/task-ready-check.mjs');
}
fs.writeFileSync(path.join(root, 'project/work-orders/active-work-order.md'), out);

const statePath = path.join(root, 'project/work-orders/state.json');
const payload = (summary) => ({ status: 'pending', summary, updated_by: 'system', changed_artifacts: [] });
const state = {
  schema: 'agentic.factory.WorkOrderState.v4',
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
    QA_PENDING: ['APPROVED', 'COMPLETED', 'FAILED', 'REVISION_IN_PROGRESS'],
    APPROVED: ['COMPLETED', 'FAILED', 'REVISION_IN_PROGRESS'],
    FAILED: ['REVISION_IN_PROGRESS'],
    REVISION_IN_PROGRESS: ['VALIDATION_REQUIRED', 'FAILED'],
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
    review_passed: false,
    spec_kit_contracts_valid: false,
    security_scan_passed: false,
    trace_logged: false
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
      pm: 'pm',
      architect: 'architect',
      designer: 'designer',
      'data-engineer': 'data_engineer',
      'backend-developer': 'backend',
      'frontend-developer': 'frontend',
      qa: 'qa',
      'code-reviewer': 'code_reviewer'
    }
  },
  agent_payloads: {
    pm: payload(`Created work order ${id} for ${moduleName}.`),
    architect: payload('No architecture delta yet.'),
    designer: payload('No design delta yet.'),
    backend: payload('No backend delta yet.'),
    frontend: payload('No frontend delta yet.'),
    data_engineer: payload('No data-model delta yet.'),
    qa: payload('No QA delta yet.'),
    code_reviewer: payload('No review delta yet.')
  },
  approval_required: false,
  approved_by: null,
  approval_requested_by: null,
  approval_reason: null,
  approval_notes: [],
  observability: {
    trace_dir: 'project/work-orders/traces',
    trace_required_before_completion: true,
    trace_format: 'agentic.factory.DecisionTrace.v1'
  },
  notes: [
    'Generated by scripts/new-work-order.mjs.',
    'state.json is the only source of truth; active-work-order.md is a mirror only.',
    'Use history-summary.json for previous-step context.',
    'Use delta-only writes to agent_payloads.*.',
    'If approval_required=true, only a human may approve or clear the gate.'
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
      completed_work_order_id: id,
      module: moduleName,
      changed_contracts: ['work-order state contract'],
      changed_implementation_areas: ['project/work-orders'],
      decisions: [`Created ${taskType} work order for ${moduleName}.`],
      unresolved_risks: [],
      next_dependencies: [`${targetAgent} must complete the next workflow phase.`]
    }
  ],
  rules: [
    'Agents must never read historical handoff.md files or completed work-order markdown files directly.',
    'Agents must use this compact summary for previous-step context.',
    'Store only structural deltas, not raw code, verbose reasoning or long logs.'
  ]
};
fs.writeFileSync(historyPath, `${JSON.stringify(history, null, 2)}\n`);
console.log(`Updated work order state: ${id} for module ${moduleName} (${taskType} -> ${targetAgent})`);
