import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const blogDir = path.join(root, 'src', 'content', 'blog');

const MONEY_LINKS = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'YouTube summary', href: '/youtube-summary' },
  { label: 'Privacy-first workflow', href: '/privacy-first' },
  { label: 'Getting started', href: '/guide/getting-started/' },
  { label: 'AI model cost calculator', href: '/ai-model-cost-calculator-and-price-comparation' },
];

const MARKER_START = '<!-- autonomus:money-links:start -->';
const MARKER_END = '<!-- autonomus:money-links:end -->';

function parseArgs(argv) {
  const args = { date: null, slug: null, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--date') args.date = argv[++i];
    else if (a === '--slug') args.slug = argv[++i];
    else if (a === '--dry-run') args.dryRun = true;
    else throw new Error(`Unknown arg: ${a}`);
  }
  return args;
}

function toIsoUpdatedDate(dateStr) {
  // Content collection uses z.date(); we can use full ISO with timezone.
  if (!dateStr) {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T00:00:00+07:00`;
  }
  if (dateStr.includes('T')) return dateStr;
  return `${dateStr}T00:00:00+07:00`;
}

function splitFrontmatter(md) {
  if (!md.startsWith('---')) return { fm: '', body: md, hasFm: false };
  const end = md.indexOf('\n---', 3);
  if (end === -1) return { fm: '', body: md, hasFm: false };
  const fm = md.slice(3, end).trim();
  const body = md.slice(end + 4);
  return { fm, body, hasFm: true, endIndex: end };
}

function upsertUpdatedDate(fmRaw, updatedIso) {
  const lines = fmRaw.split(/\r?\n/);
  const hasUpdated = lines.some((l) => l.trim().startsWith('updatedDate:'));

  if (hasUpdated) {
    return lines
      .map((l) => (l.trim().startsWith('updatedDate:') ? `updatedDate: ${updatedIso}` : l))
      .join('\n');
  }

  const out = [];
  let inserted = false;
  for (const l of lines) {
    out.push(l);
    if (!inserted && l.trim().startsWith('pubDate:')) {
      out.push(`updatedDate: ${updatedIso}`);
      inserted = true;
    }
  }

  if (!inserted) out.push(`updatedDate: ${updatedIso}`);
  return out.join('\n');
}

function buildMoneyLinksBlock() {
  const lines = [];
  lines.push(MARKER_START);
  lines.push('');
  lines.push('## Continue reading');
  lines.push('');
  for (const l of MONEY_LINKS) {
    lines.push(`- [${l.label}](${l.href})`);
  }
  lines.push('');
  lines.push(MARKER_END);
  lines.push('');
  return lines.join('\n');
}

function countMoneyLinks(body) {
  let count = 0;
  for (const l of MONEY_LINKS) {
    if (body.includes(`(${l.href})`) || body.includes(l.href)) count++;
  }
  return count;
}

function listBlogFiles() {
  if (!fs.existsSync(blogDir)) return [];
  return fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(blogDir, f));
}

function extractPubDate(fmRaw) {
  const m = fmRaw.match(/^pubDate:\s*(.+)$/m);
  return m ? m[1].trim() : null;
}

function toComparableDate(pubDateVal) {
  if (!pubDateVal) return 0;
  const d = new Date(pubDateVal.replace(/^"|"$/g, ''));
  const t = +d;
  return Number.isFinite(t) ? t : 0;
}

function chooseTarget(files) {
  const candidates = [];

  for (const file of files) {
    const md = fs.readFileSync(file, 'utf8');
    const { fm, body, hasFm } = splitFrontmatter(md);
    if (!hasFm) continue;

    // Only published (draft false)
    const isDraft = /\bdraft:\s*true\b/.test(fm);
    if (isDraft) continue;

    const pubDate = extractPubDate(fm);
    const pubT = toComparableDate(pubDate);
    const moneyCount = countMoneyLinks(body);
    const hasBlock = body.includes(MARKER_START) && body.includes(MARKER_END);

    candidates.push({ file, pubT, moneyCount, hasBlock });
  }

  if (candidates.length === 0) return null;

  // Prefer the weakest internal link coverage; tie-breaker: oldest.
  candidates.sort((a, b) => {
    if (a.moneyCount !== b.moneyCount) return a.moneyCount - b.moneyCount;
    if (a.hasBlock !== b.hasBlock) return a.hasBlock ? 1 : -1;
    return a.pubT - b.pubT;
  });

  return candidates[0].file;
}

function applyRefresh(md, updatedIso) {
  const { fm, body, hasFm } = splitFrontmatter(md);
  if (!hasFm) throw new Error('Missing frontmatter');

  const fm2 = upsertUpdatedDate(fm, updatedIso);
  let body2 = body;
  const block = buildMoneyLinksBlock();

  if (body2.includes(MARKER_START) && body2.includes(MARKER_END)) {
    const start = body2.indexOf(MARKER_START);
    const end = body2.indexOf(MARKER_END);
    const after = body2.slice(end + MARKER_END.length);
    body2 = body2.slice(0, start).trimEnd() + '\n\n' + block + after;
  } else {
    body2 = body2.trimEnd() + '\n\n' + block;
  }

  return `---\n${fm2}\n---${body2}`;
}

const args = parseArgs(process.argv);
const updatedIso = toIsoUpdatedDate(args.date);

const files = listBlogFiles();
if (files.length === 0) {
  console.log('No blog files found.');
  process.exit(0);
}

let target = null;
if (args.slug) {
  target = path.join(blogDir, `${args.slug}.md`);
  if (!fs.existsSync(target)) throw new Error(`Blog slug not found: ${args.slug}`);
} else {
  target = chooseTarget(files);
}

if (!target) {
  console.log('No eligible blog post to refresh.');
  process.exit(0);
}

const md = fs.readFileSync(target, 'utf8');
const out = applyRefresh(md, updatedIso);

if (args.dryRun) {
  console.log(`[dry-run] Would refresh: ${path.relative(root, target)}`);
  process.exit(0);
}

if (out === md) {
  console.log(`No changes needed: ${path.relative(root, target)}`);
  process.exit(0);
}

fs.writeFileSync(target, out, 'utf8');
console.log(`Refreshed blog post: ${path.relative(root, target)}`);
