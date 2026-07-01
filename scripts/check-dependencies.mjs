import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
let failed = false;

function fail(message) {
  console.error(`FAIL: ${message}`);
  failed = true;
}
function ok(message) {
  console.log(`OK: ${message}`);
}
function warn(message) {
  console.log(`WARN: ${message}`);
}
function normalize(rel) {
  return rel.replaceAll('\\', '/');
}
function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.factory-meta'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}
function sourceFiles() {
  return ['backend', 'frontend', 'packages']
    .flatMap(dir => walk(path.join(root, dir)))
    .filter(file => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file));
}
function resolveImport(fromFile, spec) {
  if (!spec.startsWith('.') && !spec.startsWith('/')) return spec;
  const base = spec.startsWith('/') ? path.join(root, spec) : path.resolve(path.dirname(fromFile), spec);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.mjs`,
    `${base}.cjs`,
    `${base}.json`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
    path.join(base, 'index.js')
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return normalize(path.relative(root, candidate));
  }
  return normalize(path.relative(root, base));
}
function isUiSafeShared(rel) {
  return rel.startsWith('packages/shared/ui-safe/') || rel.startsWith('packages/shared/src/ui-safe/');
}
function moduleName(rel, marker) {
  const parts = rel.split('/');
  const idx = parts.indexOf(marker);
  return idx >= 0 ? parts[idx + 1] : null;
}
function sourceLine(text, index) {
  const start = text.lastIndexOf('\n', index) + 1;
  const end = text.indexOf('\n', index);
  return text.slice(start, end === -1 ? text.length : end);
}
function previousLine(text, index) {
  const before = text.slice(0, Math.max(0, text.lastIndexOf('\n', index)));
  const start = before.lastIndexOf('\n') + 1;
  return before.slice(start);
}
function hasBoundaryApproval(text, index) {
  const approvalToken = 'dependency-boundary-approved';
  return sourceLine(text, index).includes(approvalToken) || previousLine(text, index).includes(approvalToken);
}
function importLooksLikeBackend(spec, target) {
  return target.startsWith('backend/') || spec.includes('backend/');
}
function importLooksLikeFrontend(spec, target) {
  return target.startsWith('frontend/') || spec.includes('frontend/');
}
function importLooksLikePrisma(spec, target) {
  return target.startsWith('backend/prisma/') || spec.includes('backend/prisma') || spec.includes('/prisma/');
}
function importLooksLikeShared(spec, target) {
  return target.startsWith('packages/shared/') || spec === 'packages/shared' || spec.startsWith('packages/shared/');
}

const importRe = /(?:import\s+(?:type\s+)?(?:[^'";]+\s+from\s+)?|export\s+[^'";]+\s+from\s+|require\()(['"])([^'"]+)\1/g;

for (const file of sourceFiles()) {
  const rel = normalize(path.relative(root, file));
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(importRe)) {
    const spec = match[2];
    const target = resolveImport(file, spec);

    if (rel.startsWith('frontend/') && importLooksLikeBackend(spec, target)) {
      fail(`Frontend imports backend directly: ${rel} -> ${spec}`);
    }
    if (rel.startsWith('backend/') && importLooksLikeFrontend(spec, target)) {
      fail(`Backend imports frontend directly: ${rel} -> ${spec}`);
    }
    if (rel.startsWith('frontend/') && importLooksLikePrisma(spec, target)) {
      fail(`Frontend imports backend/prisma directly: ${rel} -> ${spec}`);
    }
    if (rel.startsWith('frontend/') && importLooksLikeShared(spec, target) && !isUiSafeShared(target)) {
      fail(`Frontend imports packages/shared outside UI-safe utilities: ${rel} -> ${spec}`);
    }

    if (rel.startsWith('backend/src/modules/') && target.startsWith('backend/src/modules/')) {
      const fromModule = moduleName(rel, 'modules');
      const toModule = moduleName(target, 'modules');
      if (fromModule && toModule && fromModule !== toModule && !hasBoundaryApproval(text, match.index)) {
        fail(`Backend feature-to-feature import requires Architect approval or packages/contracts boundary: ${rel} -> ${spec}`);
      }
    }
    if (rel.startsWith('frontend/src/modules/') && target.startsWith('frontend/src/modules/')) {
      const fromModule = moduleName(rel, 'modules');
      const toModule = moduleName(target, 'modules');
      if (fromModule && toModule && fromModule !== toModule && !hasBoundaryApproval(text, match.index)) {
        fail(`Frontend feature-to-feature import requires Architect approval or packages/contracts boundary: ${rel} -> ${spec}`);
      }
    }
    if (rel.startsWith('frontend/src/features/') && target.startsWith('frontend/src/features/')) {
      const fromFeature = moduleName(rel, 'features');
      const toFeature = moduleName(target, 'features');
      if (fromFeature && toFeature && fromFeature !== toFeature && !hasBoundaryApproval(text, match.index)) {
        fail(`Frontend feature-to-feature import requires Architect approval or packages/contracts boundary: ${rel} -> ${spec}`);
      }
    }
  }
}

if (!exists('factory/dependency-cruiser.cjs')) fail('Missing factory/dependency-cruiser.cjs');
else ok('dependency cruiser config is present');

if (!exists('.dependency-cruiser.cjs')) fail('Missing root .dependency-cruiser.cjs adapter');
else ok('root dependency cruiser adapter is present');

const localBinary = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'depcruise.cmd' : 'depcruise');
if (!fs.existsSync(localBinary)) {
  warn('dependency-cruiser package is not installed; fallback static import scan was used. Run pnpm install --frozen-lockfile for full graph validation.');
} else {
  const depcruise = spawnSync(localBinary, ['--config', 'factory/dependency-cruiser.cjs', 'backend', 'frontend', 'packages'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024
  });
  if (depcruise.status === 0) {
    ok('dependency-cruiser passed');
  } else {
    const details = `${depcruise.stdout ?? ''}\n${depcruise.stderr ?? ''}`.trim();
    fail(`dependency-cruiser failed${details ? `: ${details}` : ''}`);
  }
}

if (failed) process.exit(1);
ok('dependency boundary checks passed');
