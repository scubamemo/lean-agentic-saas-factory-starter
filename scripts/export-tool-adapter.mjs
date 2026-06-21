import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const target = process.argv[2];
const outDir = process.argv[3] ? path.resolve(process.argv[3]) : root;
const adapters = new Set(['antigravity','claude-code','cursor','cline','windsurf','copilot','roo']);
if (!target || !adapters.has(target)) {
  console.error(`Usage: node scripts/export-tool-adapter.mjs <${[...adapters].join('|')}> [output-dir]`);
  process.exit(1);
}
function copyDir(src, dest) {
  if (!fs.existsSync(src)) { console.error(`Missing adapter source: ${path.relative(root, src)}`); process.exit(1); }
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name); const d = path.join(dest, name);
    const st = fs.statSync(s);
    if (st.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}
const source = path.join(root, 'tool-adapters', target);
copyDir(source, outDir);
console.log(`OK: exported ${target} adapter to ${outDir}`);
