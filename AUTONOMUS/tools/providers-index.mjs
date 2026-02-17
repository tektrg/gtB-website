import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const modelsPath = path.join(root, 'src', 'data', 'models-api.json');

function loadModelsApi() {
  const raw = fs.readFileSync(modelsPath, 'utf8');
  return JSON.parse(raw);
}

function modelCount(v) {
  if (!v || !v.models) return 0;
  if (Array.isArray(v.models)) return v.models.length;
  if (typeof v.models === 'object') return Object.keys(v.models).length;
  return 0;
}

const data = loadModelsApi();
const providers = Object.entries(data)
  .map(([key, val]) => ({
    key,
    id: val.id,
    name: val.name,
    doc: val.doc,
    api: val.api,
    env: val.env,
    count: modelCount(val),
  }))
  .sort((a, b) => b.count - a.count);

console.log('Providers index');
console.log('==============');
console.log(`Total providers: ${providers.length}`);
console.log('Top 30 by model count:');
for (const p of providers.slice(0, 30)) {
  console.log(`${p.key}\t${p.count}\t${p.name ?? ''}\t${p.doc ?? ''}`);
}

// Optional: write a machine-readable snapshot for other tools.
const outPath = path.join(root, 'AUTONOMUS', 'content', 'providers-index.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), providers }, null, 2));
console.log(`\nWrote: ${path.relative(root, outPath)}`);
