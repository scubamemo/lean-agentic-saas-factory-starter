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
  return ignoreRegex.some(re => re.test(r)) || normalizedPatterns.some(pattern => pattern.startsWith(`${r}/`) || pattern.startsWith(`${r}/**`));
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
function writeTemplateStructureCache(baseDir) {
  const templateDir = path.join(baseDir, 'project/modules/_template');
  const cachePath = path.join(baseDir, 'project/work-orders/template-structure-cache.json');
  if (!fs.existsSync(templateDir)) return;
  const files = listFiles(templateDir);
  const hash = crypto.createHash('sha256').update(files.join('\n')).digest('hex');
  const cache = {
    schema: 'agentic.factory.TemplateStructureCache.v1',
    source: 'project/modules/_template',
    generated_by: 'scripts/export-template.mjs',
    hash_algorithm: 'sha256(file-list)',
    template_structure_hash: hash,
    required_files: files,
    standards_bypass_rule: 'If a target module has this structure, agents may skip full docs/standards reads and use assumed standard context plus role-specific artifacts.'
  };
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
}
function copyDir(src, dst, relBase = '') {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const rel = normalize(path.join(relBase, entry.name));
    if (shouldIgnore(rel)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d, rel);
    else fs.copyFileSync(s, d);
  }
}

writeTemplateStructureCache(source);
fs.rmSync(target, { recursive: true, force: true });
copyDir(source, target);
writeTemplateStructureCache(target);
console.log(`Exported clean template to ${target}`);
console.log('Updated project/work-orders/template-structure-cache.json for hash-based standard verification.');
