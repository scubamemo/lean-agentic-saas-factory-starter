import fs from 'node:fs';
import path from 'node:path';

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
  return rel.replaceAll('\\', '/').replace(/^\.\//, '');
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

fs.rmSync(target, { recursive: true, force: true });
copyDir(source, target);
console.log(`Exported clean template to ${target}`);
