import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failed = false;
function fail(message) { console.error(`FAIL: ${message}`); failed = true; }
function ok(message) { console.log(`OK: ${message}`); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { const p = path.join(root, rel); return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''; }
function readJson(rel) {
  try { return JSON.parse(read(rel)); }
  catch (error) { fail(`${rel} is invalid JSON: ${error.message}`); return null; }
}
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
function moduleDirs() {
  const modulesRoot = path.join(root, 'project/modules');
  if (!fs.existsSync(modulesRoot)) return [];
  return fs.readdirSync(modulesRoot, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== '_template')
    .map(d => d.name);
}
const goldenDir = path.join(root, 'examples/golden/sample-resource-module');
const goldenArtifacts = fs.existsSync(goldenDir) ? fs.readdirSync(goldenDir).filter(name => fs.statSync(path.join(goldenDir, name)).isFile()) : [];
const requiredArtifacts = goldenArtifacts.filter(name => ['MODULE.md','api.contract.md','handoff.md','test-matrix.md','ui.contract.md'].includes(name));
for (const name of requiredArtifacts) {
  if (!exists(`project/modules/_template/${name}`)) fail(`Module template missing golden artifact ${name}`);
}

function validateSpec(rel, expectedModule = null) {
  const spec = readJson(rel);
  if (!spec) return null;
  if (spec.schema !== 'agentic.factory.SpecKitModuleSpec.v1') fail(`${rel}: schema must be agentic.factory.SpecKitModuleSpec.v1`);
  if (expectedModule && spec.module !== expectedModule) fail(`${rel}: module '${spec.module}' must equal '${expectedModule}'`);
  for (const key of ['spec','plan','data_model','contracts','tasks','quickstart_checks','validation']) if (!(key in spec)) fail(`${rel}: missing ${key}`);
  const openapi = spec.contracts?.openapi;
  if (!openapi || openapi.openapi !== '3.1.0') fail(`${rel}: contracts.openapi must be OpenAPI 3.1.0`);
  if (!openapi?.paths || typeof openapi.paths !== 'object' || Object.keys(openapi.paths).length === 0) fail(`${rel}: OpenAPI paths must not be empty`);
  if (!spec.contracts?.schemas || typeof spec.contracts.schemas !== 'object') fail(`${rel}: contracts.schemas must be present`);
  if (!Array.isArray(spec.contracts?.permissions)) fail(`${rel}: contracts.permissions must be an array`);
  if (!Array.isArray(spec.tasks)) fail(`${rel}: tasks must be an array`);
  if (!Array.isArray(spec.quickstart_checks)) fail(`${rel}: quickstart_checks must be an array`);
  return spec;
}

validateSpec('packages/contracts/specs/_template.spec.json', '<module-name>');
validateSpec('packages/contracts/specs/sample-resource.spec.json', 'sample-resource');
if (!exists('packages/contracts/spec-kit.module.schema.json')) fail('Missing packages/contracts/spec-kit.module.schema.json');

function implementationTextForModule(moduleName) {
  const dir = path.join(root, 'backend/src/modules', moduleName);
  if (!fs.existsSync(dir)) return '';
  return walk(dir).filter(f => /\.(ts|tsx|js|mjs|cjs)$/.test(f)).map(f => fs.readFileSync(f, 'utf8')).join('\n');
}
function endpointLooksImplemented(method, endpointPath, operationId, implText, moduleName) {
  if (!implText) return true;
  const methodDecorator = { GET: '@Get', POST: '@Post', PUT: '@Put', PATCH: '@Patch', DELETE: '@Delete' }[method.toUpperCase()];
  const normalizedPath = endpointPath.replace(/^\/api\/?/, '').replace(/\{([^}]+)\}/g, ':$1');
  const routeTail = normalizedPath.replace(new RegExp(`^${moduleName}/?`), '').replace(/^\/?/, '');
  const candidates = [endpointPath, normalizedPath, operationId].filter(Boolean);
  if (candidates.some(c => implText.includes(c))) return true;
  if (methodDecorator && implText.includes(methodDecorator)) {
    if (!routeTail || implText.includes(`'${routeTail}'`) || implText.includes(`"${routeTail}"`) || implText.includes(`\`${routeTail}\``) || implText.includes(`Controller('${moduleName}`) || implText.includes(`Controller("${moduleName}`)) return true;
  }
  return false;
}
function validateImplementationAgainstSpec(moduleName, spec) {
  const implText = implementationTextForModule(moduleName);
  if (!implText) return;
  const paths = spec.contracts?.openapi?.paths ?? {};
  for (const [endpointPath, methods] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (!['get','post','put','patch','delete'].includes(method.toLowerCase())) continue;
      const operationId = operation?.operationId ?? '';
      if (!endpointLooksImplemented(method, endpointPath, operationId, implText, moduleName)) {
        fail(`Implementation mismatch for ${moduleName}: ${method.toUpperCase()} ${endpointPath} (${operationId || 'no operationId'}) is declared in packages/contracts/specs/${moduleName}.spec.json but not found in backend/src/modules/${moduleName}`);
      }
    }
  }
}

for (const moduleName of moduleDirs()) {
  for (const artifact of requiredArtifacts) {
    if (!exists(`project/modules/${moduleName}/${artifact}`)) fail(`Module ${moduleName} missing golden artifact ${artifact}`);
  }
  const specRel = `packages/contracts/specs/${moduleName}.spec.json`;
  if (!exists(specRel)) { fail(`Module ${moduleName} missing primary JSON spec ${specRel}`); continue; }
  const spec = validateSpec(specRel, moduleName);
  const apiMirror = read(`project/modules/${moduleName}/api.contract.md`);
  if (apiMirror && !apiMirror.includes(specRel)) fail(`project/modules/${moduleName}/api.contract.md must reference ${specRel}`);
  if (spec) validateImplementationAgainstSpec(moduleName, spec);
}

if (failed) process.exit(1);
ok('Spec-Kit JSON contracts and implementation cross-reference checks passed');
