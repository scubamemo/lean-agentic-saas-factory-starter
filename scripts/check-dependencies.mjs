import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
let failed = false;
function fail(message) { console.error(`FAIL: ${message}`); failed = true; }
function ok(message) { console.log(`OK: ${message}`); }
function normalize(rel) { return rel.replaceAll('\\', '/'); }
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules','.git','dist','build','.next','coverage'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}
function resolveImport(fromFile, spec) {
  if (!spec.startsWith('.') && !spec.startsWith('/')) return spec;
  const base = spec.startsWith('/') ? path.join(root, spec) : path.resolve(path.dirname(fromFile), spec);
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.jsx`, `${base}.mjs`, `${base}.cjs`, `${base}.json`, path.join(base, 'index.ts'), path.join(base, 'index.tsx'), path.join(base, 'index.js')];
  for (const c of candidates) if (fs.existsSync(c)) return normalize(path.relative(root, c));
  return normalize(path.relative(root, base));
}
function isUiSafeShared(rel) {
  return rel.startsWith('packages/shared/ui-safe/') || rel.startsWith('packages/shared/src/ui-safe/');
}
function isAllowedPublicContract(rel) {
  return rel.startsWith('packages/contracts/') || rel.startsWith('packages/api-client/');
}
function moduleName(rel, rootPrefix) {
  const parts = rel.split('/');
  const idx = parts.indexOf('modules');
  return idx >= 0 ? parts[idx + 1] : null;
}

const importRe = /(?:import\s+(?:type\s+)?(?:[^'";]+\s+from\s+)?|export\s+[^'";]+\s+from\s+|require\()(['"])([^'"]+)\1/g;
const files = walk(root).filter(file => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file));
for (const file of files) {
  const rel = normalize(path.relative(root, file));
  if (rel.startsWith('scripts/')) continue;
  if (rel.startsWith('factory/')) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(importRe)) {
    const spec = match[2];
    const target = resolveImport(file, spec);

    if (rel.startsWith('frontend/') && (target.startsWith('backend/') || spec.includes('/backend/'))) {
      fail(`Frontend imports backend directly: ${rel} -> ${spec}`);
    }
    if (rel.startsWith('backend/') && (target.startsWith('frontend/') || spec.includes('/frontend/'))) {
      fail(`Backend imports frontend directly: ${rel} -> ${spec}`);
    }
    if (rel.startsWith('frontend/') && target.startsWith('packages/shared/') && !isUiSafeShared(target)) {
      fail(`Frontend imports packages/shared outside UI-safe utilities: ${rel} -> ${spec}`);
    }

    // Backend module-to-module coupling: a backend module may not import another backend module directly.
    // Shared communication must be extracted into packages/contracts or explicitly routed through public APIs.
    if (rel.startsWith('backend/src/modules/') && target.startsWith('backend/src/modules/')) {
      const fromModule = moduleName(rel, 'backend');
      const toModule = moduleName(target, 'backend');
      if (fromModule && toModule && fromModule !== toModule) {
        fail(`Backend module imports another backend module directly; use packages/contracts or a public boundary: ${rel} -> ${spec}`);
      }
    }
    if (rel.startsWith('frontend/src/') && target.startsWith('backend/')) {
      fail(`Frontend/backend communication must go through packages/contracts or api-client: ${rel} -> ${spec}`);
    }
  }
}

const configPath = path.join(root, 'factory/dependency-cruiser.cjs');
if (!fs.existsSync(configPath)) fail('Missing factory/dependency-cruiser.cjs');
else ok('dependency cruiser config is present');

// If dependency-cruiser is installed, run it as an additional enforcement layer.
const depcruise = spawnSync('npx', ['depcruise', '--config', 'factory/dependency-cruiser.cjs', 'backend', 'frontend', 'packages'], { cwd: root, encoding: 'utf8' });
if (depcruise.status === 0) {
  ok('dependency-cruiser passed');
} else if (depcruise.error && depcruise.error.code === 'ENOENT') {
  console.warn('WARN: npx is unavailable; custom dependency boundary checks were still executed.');
} else if ((depcruise.stderr + depcruise.stdout).includes('could not determine executable') || (depcruise.stderr + depcruise.stdout).includes('not found')) {
  console.warn('WARN: dependency-cruiser is not installed in this environment; custom dependency boundary checks were still executed.');
} else {
  fail(`dependency-cruiser failed:\n${depcruise.stdout}\n${depcruise.stderr}`.trim());
}

if (failed) process.exit(1);
ok('dependency boundary checks passed');
