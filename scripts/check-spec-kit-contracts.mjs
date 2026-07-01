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
  for (const key of [
    'version',
    'resources',
    'dto_schemas',
    'endpoints',
    'permissions',
    'ui_surfaces',
    'events',
    'spec',
    'plan',
    'data_model',
    'contracts',
    'tasks',
    'quickstart_checks',
    'validation'
  ]) if (!(key in spec)) fail(`${rel}: missing ${key}`);
  if (typeof spec.version !== 'string' || spec.version.length === 0) fail(`${rel}: version must be a non-empty string`);
  if (!Array.isArray(spec.resources) || spec.resources.length === 0) fail(`${rel}: resources must be a non-empty array`);
  for (const resource of spec.resources ?? []) {
    if (!resource?.name) fail(`${rel}: each resource requires name`);
    if (!['tenant-owned','platform-owned','mixed','none'].includes(resource?.ownership)) fail(`${rel}: resource ${resource?.name ?? '(unknown)'} has invalid ownership`);
    if (!resource?.dto) fail(`${rel}: resource ${resource?.name ?? '(unknown)'} requires dto`);
    if (typeof resource?.tenant_owned !== 'boolean') fail(`${rel}: resource ${resource?.name ?? '(unknown)'} requires boolean tenant_owned`);
  }
  if (!spec.dto_schemas || typeof spec.dto_schemas !== 'object' || Array.isArray(spec.dto_schemas) || Object.keys(spec.dto_schemas).length === 0) {
    fail(`${rel}: dto_schemas must be a non-empty object`);
  }
  for (const [name, schema] of Object.entries(spec.dto_schemas ?? {})) {
    if (!schema || typeof schema !== 'object' || !schema.type) fail(`${rel}: dto_schemas.${name} must be a JSON schema object with type`);
    if (schema.type === 'object' && schema.additionalProperties !== false) fail(`${rel}: dto_schemas.${name} object schemas must set additionalProperties false`);
  }
  if (!Array.isArray(spec.endpoints) || spec.endpoints.length === 0) fail(`${rel}: endpoints must be a non-empty array`);
  const permissionNames = new Set((spec.permissions ?? []).map(p => typeof p === 'string' ? p : p?.name).filter(Boolean));
  for (const endpoint of spec.endpoints ?? []) {
    for (const key of ['operationId','method','path','response_schema','permission']) if (!endpoint?.[key]) fail(`${rel}: endpoint missing ${key}`);
    if (!['GET','POST','PUT','PATCH','DELETE'].includes(endpoint?.method)) fail(`${rel}: endpoint ${endpoint?.operationId ?? '(unknown)'} has invalid method`);
    if (!Array.isArray(endpoint?.error_codes)) fail(`${rel}: endpoint ${endpoint?.operationId ?? '(unknown)'} requires error_codes array`);
    if (endpoint?.permission && permissionNames.size > 0 && !permissionNames.has(endpoint.permission)) fail(`${rel}: endpoint ${endpoint.operationId} references unknown permission ${endpoint.permission}`);
  }
  if (!Array.isArray(spec.permissions)) fail(`${rel}: permissions must be an array`);
  for (const permission of spec.permissions ?? []) {
    if (!permission?.name || typeof permission.name !== 'string') fail(`${rel}: each permission requires name`);
    if (typeof permission?.description !== 'string') fail(`${rel}: permission ${permission?.name ?? '(unknown)'} requires description`);
  }
  if (!Array.isArray(spec.ui_surfaces)) fail(`${rel}: ui_surfaces must be an array`);
  for (const surface of spec.ui_surfaces ?? []) {
    for (const key of ['route','purpose']) if (!surface?.[key]) fail(`${rel}: ui surface missing ${key}`);
    if (!Array.isArray(surface?.states)) fail(`${rel}: ui surface ${surface?.route ?? '(unknown)'} requires states array`);
    if (!Array.isArray(surface?.actions)) fail(`${rel}: ui surface ${surface?.route ?? '(unknown)'} requires actions array`);
  }
  if (!Array.isArray(spec.events)) fail(`${rel}: events must be an array`);
  for (const event of spec.events ?? []) {
    for (const key of ['name','schema','when']) if (!event?.[key]) fail(`${rel}: event missing ${key}`);
  }
  const openapi = spec.contracts?.openapi;
  if (!openapi || openapi.openapi !== '3.1.0') fail(`${rel}: contracts.openapi must be OpenAPI 3.1.0`);
  if (!openapi?.paths || typeof openapi.paths !== 'object' || Object.keys(openapi.paths).length === 0) fail(`${rel}: OpenAPI paths must not be empty`);
  if (!spec.contracts?.schemas || typeof spec.contracts.schemas !== 'object') fail(`${rel}: contracts.schemas must be present`);
  if (!Array.isArray(spec.contracts?.permissions)) fail(`${rel}: contracts.permissions must be an array`);
  for (const endpoint of spec.endpoints ?? []) {
    const methods = openapi?.paths?.[endpoint.path];
    if (!methods) fail(`${rel}: endpoint ${endpoint.path} missing from contracts.openapi.paths`);
    const operation = methods?.[endpoint.method?.toLowerCase()];
    if (!operation) fail(`${rel}: endpoint ${endpoint.method} ${endpoint.path} missing from OpenAPI`);
    if (operation?.operationId && operation.operationId !== endpoint.operationId) fail(`${rel}: endpoint ${endpoint.path} operationId mismatch between endpoints and OpenAPI`);
  }
  if (!Array.isArray(spec.tasks)) fail(`${rel}: tasks must be an array`);
  if (!Array.isArray(spec.quickstart_checks)) fail(`${rel}: quickstart_checks must be an array`);
  if (spec.validation?.contract_source_of_truth !== rel) fail(`${rel}: validation.contract_source_of_truth must equal ${rel}`);
  return spec;
}

validateSpec('packages/contracts/specs/_template.spec.json', '<module-name>');
validateSpec('packages/contracts/specs/sample-resource.spec.json', 'sample-resource');
const schema = readJson('packages/contracts/spec-kit.module.schema.json');
if (!schema) fail('Missing or invalid packages/contracts/spec-kit.module.schema.json');
if (schema && schema.$id !== 'agentic.factory.SpecKitModuleSpec.v1') fail('spec-kit.module.schema.json has invalid $id');
for (const key of ['module','version','resources','dto_schemas','endpoints','permissions','ui_surfaces','events']) {
  if (!schema?.required?.includes(key)) fail(`spec-kit.module.schema.json must require ${key}`);
}

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
