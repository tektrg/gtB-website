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

function loadTopicBank() {
  const topicBankPath = path.join(root, 'AUTONOMUS', 'content', 'topic-bank.json');
  if (!fs.existsSync(topicBankPath)) return new Map();
  try {
    const raw = fs.readFileSync(topicBankPath, 'utf8');
    const json = JSON.parse(raw);
    const topics = Array.isArray(json.topics) ? json.topics : Array.isArray(json) ? json : [];
    const map = new Map();
    for (const t of topics) {
      if (t && t.id) map.set(String(t.id), t);
    }
    return map;
  } catch {
    return new Map();
  }
}

function summarizePublished(label, items, skipReason) {
  if (items.length === 0) return `- ${label}: ${skipReason}`;

  const counts = countByChangeType(items);
  const summaryParts = [];
  if (counts.created) summaryParts.push(`created: ${counts.created}`);
  if (counts.updated) summaryParts.push(`updated: ${counts.updated}`);
  if (counts.deleted) summaryParts.push(`deleted: ${counts.deleted}`);
  if (counts.changed && summaryParts.length === 0) summaryParts.push(`changed: ${counts.changed}`);

  return `- ${label}: published (${summaryParts.join(', ')})`;
}

function renderItems(items) {
  if (items.length === 0) return [];
  const lines = [];
  for (const it of items) {
    const change = it.label ? ` (${it.label})` : '';
    const desc = it.desc ? ` — ${it.desc}` : '';
    lines.push(`  - [${it.title}](${it.url})${desc}${change}`);
  }
  return lines;
}

function computeWhyForBlog(items, topicBank) {
  if (items.length === 0) return null;

  const topicIds = items
    .map((it) => it.topicId)
    .filter(Boolean)
    .map(String);

  const pillars = new Set();
  const intents = new Set();
  for (const id of topicIds) {
    const t = topicBank.get(id);
    if (t?.pillar) pillars.add(String(t.pillar));
    if (t?.intent) intents.add(String(t.intent));
  }

  const pillarStr = pillars.size ? Array.from(pillars).join(', ') : 'unknown pillar';
  const intentStr = intents.size ? Array.from(intents).join(', ') : 'unknown intent';
  return `${pillarStr} / ${intentStr}`;
}

// --- main
const args = parseArgs(process.argv);
const topicBank = loadTopicBank();

const statusLines = getStatusLines();
const entries = statusLines.map(parsePorcelainLine);

const blogEntriesRaw = entries
  .filter((e) => e.file.startsWith('src/content/blog/') && e.file.endsWith('.md'))
  .map((e) => ({ ...e, changeType: classify(e.code) }));

const providerEntriesRaw = entries
  .filter((e) => e.file.startsWith('src/content/guide/providers/') && e.file.endsWith('.md'))
  .map((e) => ({ ...e, changeType: classify(e.code) }));

const blogItems = buildItems({ site: args.site, kind: 'blog', entries: blogEntriesRaw }).map((it) => {
  try {
    const abs = path.join(root, it.file);
    const { data } = parseFrontmatter(readText(abs));
    return { ...it, topicId: data.topicId };
  } catch {
    return it;
  }
});

const providerItems = buildItems({ site: args.site, kind: 'provider', entries: providerEntriesRaw });

const out = [];

// Runbook-friendly block
out.push('**Shipped:**');
out.push(summarizePublished('Blog', blogItems, args.blogSkipReason));
out.push(...renderItems(blogItems));
out.push(summarizePublished('Providers', providerItems, args.providerSkipReason));
out.push(...renderItems(providerItems));
out.push('');

const blogWhy = computeWhyForBlog(blogItems, topicBank);
const providerWhy = providerItems.length > 0 ? 'Provider setup / how-to' : null;

out.push('**Why:**');
out.push(`- Blog: ${blogWhy ?? args.blogSkipReason}`);
out.push(`- Providers: ${providerWhy ?? args.providerSkipReason}`);

process.stdout.write(out.join('\n') + '\n');
