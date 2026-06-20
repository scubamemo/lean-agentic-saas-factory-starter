import fs from 'node:fs';
import path from 'node:path';

const [,, sourceArg = '.', targetArg = '../generated-project'] = process.argv;
const source = path.resolve(sourceArg);
const target = path.resolve(targetArg);
const ignoreFile = path.join(source, '.templateignore');
const ignorePatterns = fs.existsSync(ignoreFile)
  ? fs.readFileSync(ignoreFile, 'utf8').split(/\r?\n/).map(x => x.trim()).filter(Boolean)
  : [];

function shouldIgnore(rel) {
  return ignorePatterns.some(pattern => {
    const p = pattern.replace(/\/$/, '');
    return rel === p || rel.startsWith(`${p}/`) || (p.startsWith('*.') && rel.endsWith(p.slice(1)));
  });
}

function copyDir(src, dst, relBase = '') {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const rel = path.join(relBase, entry.name).replaceAll('\\', '/');
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
