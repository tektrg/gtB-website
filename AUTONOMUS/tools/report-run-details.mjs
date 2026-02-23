import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();

function parseArgs(argv) {
  const args = {
    site: 'https://gptbreeze.io',
    blogSkipReason: 'skipped (missing/incomplete research or no available topic)',
    providerSkipReason: 'none',
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--site') args.site = argv[++i];
    else if (a === '--blog-skip-reason') args.blogSkipReason = argv[++i];
    else if (a === '--provider-skip-reason') args.providerSkipReason = argv[++i];
    else throw new Error(`Unknown arg: ${a}`);
  }
  return args;
}

function readText(p) {
  return fs.readFileSync(p, 'utf8');
}

function parseFrontmatter(content) {
  if (!content.startsWith('---')) return { data: {}, body: content };
  const end = content.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: content };
  const fmRaw = content.slice(3, end).trim();
  const body = content.slice(end + 4);
  const data = {};

  const lines = fmRaw.split(/\r?\n/);
  let currentKey = null;
  for (const line of lines) {
    if (!line.trim()) continue;

    // YAML list item continuation:
    if (/^\s*-\s+/.test(line) && currentKey) {
      const val = line.replace(/^\s*-\s+/, '').trim();
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(val.replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
      continue;
    }

    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    let value = match[2].trim();
    currentKey = key;

    if (!value) {
      data[key] = data[key] ?? [];
      continue;
    }

    // Inline JSON-ish arrays: tags: ["a", "b"]
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        const json = value.replace(/'/g, '"');
        data[key] = JSON.parse(json);
      } catch {
        data[key] = value;
      }
    } else {
      data[key] = value.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    }
  }

  return { data, body };
}

function summarizeDescription({ data, body }) {
  if (data.description) return String(data.description).trim();
  const text = String(body || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.slice(0, 160);
}

function getStatusLines() {
  const out = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  if (!out) return [];
  return out.split(/\r?\n/).filter(Boolean);
}

function parsePorcelainLine(line) {
  if (line.startsWith('??')) {
    return { code: '??', file: line.slice(3).trim() };
  }
  return { code: line.slice(0, 2), file: line.slice(3).trim() };
}

function classify(code) {
  // We run this before `git add -A`, so new files show as ??
  if (code === '??' || code.includes('A')) return 'created';
  if (code.includes('M')) return 'updated';
  if (code.includes('D')) return 'deleted';
  return 'changed';
}

function toUrl({ site, kind, slug }) {
  const base = site.replace(/\/$/, '');
  if (kind === 'blog') return `${base}/blog/${slug}/`;
  if (kind === 'provider') return `${base}/guide/providers/${slug}/`;
  return base;
}

function buildItems({ site, kind, entries }) {
  return entries.map((e) => {
    const abs = path.join(root, e.file);
    const slug = path.basename(e.file, '.md');
    const content = readText(abs);
    const parsed = parseFrontmatter(content);
    const title = parsed.data.title ? String(parsed.data.title).trim() : slug;
    const desc = summarizeDescription(parsed);
    const url = toUrl({ site, kind, slug });
    const label = e.changeType;
    return { ...e, slug, title, desc, url, label };
  });
}

function countByChangeType(entries) {
  const counts = { created: 0, updated: 0, deleted: 0, changed: 0 };
  for (const e of entries) {
    counts[e.changeType] = (counts[e.changeType] ?? 0) + 1;
  }
  return counts;
}

function renderSection(title, { skipReason, items }) {
  if (items.length === 0) {
    return `### ${title}\n- Status: ${skipReason}\n`;
  }

  const counts = countByChangeType(items);
  const summaryParts = [];
  if (counts.created) summaryParts.push(`created: ${counts.created}`);
  if (counts.updated) summaryParts.push(`updated: ${counts.updated}`);
  if (counts.deleted) summaryParts.push(`deleted: ${counts.deleted}`);
  if (counts.changed && summaryParts.length === 0) summaryParts.push(`changed: ${counts.changed}`);

  const lines = [];
  lines.push(`### ${title}`);
  lines.push(`- Status: published (${summaryParts.join(', ')})`);
  lines.push('');

  for (const it of items) {
    const suffix = it.label ? ` (${it.label})` : '';
    const desc = it.desc ? ` — ${it.desc}` : '';
    lines.push(`- [${it.title}](${it.url})${desc}${suffix}`);
  }
  lines.push('');
  return lines.join('\n');
}

const args = parseArgs(process.argv);
const lines = getStatusLines();
const entries = lines.map(parsePorcelainLine);

const blogEntriesRaw = entries
  .filter((e) => e.file.startsWith('src/content/blog/') && e.file.endsWith('.md'))
  .map((e) => ({ ...e, changeType: classify(e.code) }));

const providerEntriesRaw = entries
  .filter((e) => e.file.startsWith('src/content/guide/providers/') && e.file.endsWith('.md'))
  .map((e) => ({ ...e, changeType: classify(e.code) }));

const blogItems = buildItems({ site: args.site, kind: 'blog', entries: blogEntriesRaw });
const providerItems = buildItems({ site: args.site, kind: 'provider', entries: providerEntriesRaw });

const out = [];
out.push('## Shipped (details)');
out.push('');
out.push(renderSection('Blog post(s)', { skipReason: args.blogSkipReason, items: blogItems }).trimEnd());
out.push('');
out.push(renderSection('Provider guide(s)', { skipReason: args.providerSkipReason, items: providerItems }).trimEnd());
out.push('');

process.stdout.write(out.join('\n') + '\n');
