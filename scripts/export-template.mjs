import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const [,, sourceArg = '.', targetArg = '../generated-project'] = process.argv;
const source = path.resolve(sourceArg);
const target = path.resolve(targetArg);
const ignoreFile = path.join(source, '.templateignore');
const ignorePatterns = fs.existsSync(ignoreFile)
  ? fs.readFileSync(ignoreFile, 'utf8')
      .split(/\r?\n/)
      .map(x => x.trim())
      .filter(x => x && !x.startsWith('#'))
  : [];

function normalize(rel) {
  return rel.replaceAll('\\\\', '/').replace(/^\.\//, '');
}
function globToRegExp(pattern) {
  let p = normalize(pattern);
  if (p.endsWith('/')) p += '**';
  p = p.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  p = p.replace(/\*\*/g, '§DOUBLESTAR§');
  p = p.replace(/\*/g, '[^/]*');
  p = p.replace(/§DOUBLESTAR§/g, '.*');
  return new RegExp(`^${p}$`);
}
const normalizedPatterns = ignorePatterns.map(normalize);
const ignoreRegex = normalizedPatterns.map(globToRegExp);
function shouldIgnore(rel) {
  const r = normalize(rel);
  return ignoreRegex.some(re => re.test(r));
}
function listFiles(base) {
  if (!fs.existsSync(base)) return [];
  const out = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules','.git','dist','build','.next','coverage'].includes(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(normalize(path.relative(base, full)));
    }
  }
  walk(base);
  return out.sort();
}
const requiredTemplateFiles = [
  'MODULE.md',
  'api.contract.md',
  'context.md',
  'data-model.md',
  'dto.md',
  'handoff.md',
  'permissions.md',
  'test-matrix.md',
  'ui.contract.md'
];
const keyStandards = [
  'docs/standards/software-craftsmanship.md',
  'docs/standards/backend-engineering-quality.md',
  'docs/standards/frontend-engineering-quality.md',
  'docs/standards/testing-quality-bar.md',
  'docs/standards/code-review-quality-bar.md',
  'docs/standards/lean-agentic-development.md',
  'docs/standards/backend-standards.md',
  'docs/standards/frontend-standards.md'
];
function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}
function fileSha(baseDir, rel) {
  return sha256(fs.readFileSync(path.join(baseDir, rel), 'utf8'));
}
function hashEntries(entries) {
  return sha256(entries.join('\n'));
}
function writeTemplateStructureCache(baseDir) {
  const templateDir = path.join(baseDir, 'project/modules/_template');
  const cachePath = path.join(baseDir, 'project/work-orders/template-structure-cache.json');
  if (!fs.existsSync(templateDir)) return;
  const files = listFiles(templateDir);
  const templateEntries = files.map(rel => `${rel}:${fileSha(baseDir, normalize(path.join('project/modules/_template', rel)))}`);
  const standardEntries = keyStandards.map(rel => `${rel}:${fileSha(baseDir, rel)}`);
  const cache = {
    schema: 'agentic.factory.TemplateStructureCache.v1',
    source: 'project/modules/_template',
    generated_by: 'scripts/export-template.mjs',
    hash_algorithm: 'sha256(relative-path:content-sha256)',
    template_structure_hash: hashEntries(templateEntries),
    standards_context_hash: hashEntries(standardEntries),
    required_files: files,
    expected_template_files: requiredTemplateFiles,
    key_standards: keyStandards,
    standards_bypass_rule: 'If template_structure_hash and standards_context_hash match, agents may skip full docs/standards reads and use assumed standard context plus role-specific artifacts.',
    refresh_command: 'node scripts/check-template-cache.mjs --refresh'
  };
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
}
function resetWorkflowState(baseDir, seedBaseDir) {
  const workOrdersDir = path.join(baseDir, 'project/work-orders');
  const statePath = path.join(workOrdersDir, 'state.json');
  const templatePath = path.join(workOrdersDir, '_template.md');
  const activePath = path.join(workOrdersDir, 'active-work-order.md');
  const historyPath = path.join(workOrdersDir, 'history-summary.json');
  const bugfixPath = path.join(workOrdersDir, 'bugfix.md');
  const bugfixSeedPath = path.join(seedBaseDir, 'project/work-orders/_bugfix-template.md');

  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const pending = summary => ({ status: 'pending', summary, updated_by: 'system', changed_artifacts: [] });
  state.work_order_id = 'WO-0001';
  state.module = 'TBD';
  state.task_type = 'docs-only';
  state.status = 'PLANNED';
  state.last_updated_by = 'system';
  state.validation_errors = [];
  state.owner = 'pm';
  state.next_agent = 'pm';
  state.requested_transition = {
    from: 'PLANNED',
    to: 'IN_PROGRESS',
    requested_by: 'pm',
    reason: 'Fill project details before implementation.'
  };
  for (const gate of Object.keys(state.quality_gates)) state.quality_gates[gate] = false;
  state.artifacts = {
    api_contract: 'project/modules/TBD/api.contract.md',
    ui_contract: 'project/modules/TBD/ui.contract.md',
    dto: 'project/modules/TBD/dto.md',
    data_model: 'project/modules/TBD/data-model.md',
    test_matrix: 'project/modules/TBD/test-matrix.md',
    handoff: 'project/modules/TBD/handoff.md'
  };
  state.delta_policy = {
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
  };
  state.agent_payloads = {
    pm: pending('Fill application scope and create the first concrete work order.'),
    architect: pending('No architecture delta yet.'),
    designer: pending('No design delta yet.'),
    backend: pending('No backend delta yet.'),
    frontend: pending('No frontend delta yet.'),
    data_engineer: pending('No data-model delta yet.'),
    qa: pending('No QA delta yet.'),
    code_reviewer: pending('No review delta yet.')
  };
  state.approval_required = false;
  state.approved_by = null;
  state.approval_requested_by = null;
  state.approval_reason = null;
  state.approval_notes = [];
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');

  const active = fs.readFileSync(templatePath, 'utf8').replaceAll('WO-XXXX', 'WO-0001');
  fs.writeFileSync(activePath, active, 'utf8');
  const history = {
    schema: 'agentic.factory.HistorySummary.v1',
    work_order_id: 'WO-0001',
    module: 'TBD',
    last_compacted_at: 'TBD',
    source_of_truth: 'project/work-orders/state.json',
    structural_deltas: [{
      completed_work_order_id: 'WO-0001',
      module: 'TBD',
      changed_contracts: ['work-order state contract'],
      changed_implementation_areas: ['project/work-orders'],
      decisions: ['Clean exported template; define application scope before implementation.'],
      unresolved_risks: [],
      next_dependencies: ['PM must define the first concrete module and work order.']
    }],
    rules: [
      'Agents must never read historical handoff.md files or completed work-order markdown files directly.',
      'Agents must use this compact summary for previous-step context.',
      'Store only structural deltas, not raw code, verbose reasoning or long logs.'
    ]
  };
  fs.writeFileSync(historyPath, `${JSON.stringify(history, null, 2)}\n`, 'utf8');
  fs.copyFileSync(bugfixSeedPath, bugfixPath);
}
function copyDir(src, dst, relBase = '') {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(entry.name)) continue;
    const rel = normalize(path.join(relBase, entry.name));
    if (shouldIgnore(rel)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d, rel);
    else fs.copyFileSync(s, d);
  }
}

fs.rmSync(target, { recursive: true, force: true });
copyDir(source, target);
resetWorkflowState(target, source);
writeTemplateStructureCache(target);
console.log(`Exported clean template to ${target}`);
console.log('Updated project/work-orders/template-structure-cache.json for hash-based standard verification.');
