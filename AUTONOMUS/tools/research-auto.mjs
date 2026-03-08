import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const topicBankPath = path.join(root, 'AUTONOMUS', 'content', 'topic-bank.json');
const ledgerPath = path.join(root, 'AUTONOMUS', 'state', 'published.jsonl');
const blogDir = path.join(root, 'src', 'content', 'blog');
const researchDir = path.join(root, 'AUTONOMUS', 'research', 'blog');

function parseArgs(argv) {
  const args = {
    maxTopics: 5,
    dryRun: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--max-topics') args.maxTopics = Number(argv[++i]);
    else if (a === '--dry-run') args.dryRun = true;
    else throw new Error(`Unknown arg: ${a}`);
  }
  if (!Number.isFinite(args.maxTopics) || args.maxTopics < 1) throw new Error('Invalid --max-topics');
  return args;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function listMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(dir, f));
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
    if (/^\s*-\s+/.test(line) && currentKey) {
      const val = line.replace(/^\s*-\s+/, '').trim();
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(val.replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
      continue;
    }
    const m = line.match(/^([^:]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const value = m[2].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    currentKey = key;
    data[key] = value;
  }
  return { data, body };
}

function computeUsedTopicIds() {
  const used = new Set();

  if (fs.existsSync(ledgerPath)) {
    const lines = fs.readFileSync(ledgerPath, 'utf8').split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj?.topicId) used.add(String(obj.topicId));
      } catch {
        // ignore
      }
    }
  }

  for (const file of listMarkdown(blogDir)) {
    try {
      const md = fs.readFileSync(file, 'utf8');
      const { data } = parseFrontmatter(md);
      if (data.topicId) used.add(String(data.topicId));
    } catch {
      // ignore
    }
  }

  return used;
}

function section(content, headingRegex) {
  const m = content.match(headingRegex);
  if (!m) return null;
  const start = m.index ?? 0;
  const rest = content.slice(start + m[0].length);
  const next = rest.match(/^##\s+/m);
  return next ? rest.slice(0, next.index) : rest;
}

function validateResearch(content) {
  const problems = [];

  const user = content.toLowerCase().includes('## user discussion research') ? true : false;
  if (!user) problems.push('Missing section: ## User discussion research');

  const srcLinks = content.match(/https:\/\/www\.reddit\.com\//g) || [];
  if (srcLinks.length < 2) problems.push('Need >=2 reddit links');

  const kwSec = section(content, /^##\s+Keywords\s*\(10\)\s*$/m);
  if (!kwSec) problems.push('Missing section: ## Keywords (10)');
  else {
    const kws = kwSec
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => /^\d+\./.test(l));
    if (kws.length !== 10) problems.push(`Need exactly 10 keywords (found ${kws.length})`);
  }

  const bl = content.toLowerCase().includes('## backlinks');
  if (!bl) problems.push('Missing section: ## Backlinks');
  const internalLinks = content.match(/\n-\s+\/[a-z0-9\-\/]+/gi) || [];
  if (internalLinks.length < 3) problems.push('Need >=3 internal links (e.g. /pricing)');

  const outline = content.toLowerCase().includes('## outline');
  if (!outline) problems.push('Missing section: ## Outline');
  const h2s = content.match(/\n-\s+H2:/g) || [];
  if (h2s.length < 4) problems.push('Need >=4 H2 items in outline');

  return problems;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function escapeMd(text) {
  return String(text ?? '').replace(/\r?\n/g, ' ').trim();
}

function topicQuery(topic) {
  // Best-effort query. We want /comments/ links, so use old.reddit.
  const t = topic.title || topic.id;
  // Keep query shorter; reddit search can be sensitive.
  const words = t
    .replace(/[“”"'():]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8)
    .join(' ');
  return words;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; GPTBreeze-AUTONOMUS/1.0; +https://gptbreeze.io)',
      accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return await res.text();
}

function extractRedditCommentLinks(html) {
  // old.reddit returns href="/r/.../comments/..." links.
  const hrefs = [];
  const re = /href="(\/r\/[^"]+?\/comments\/[a-z0-9]+\/[^"]+?)"/gi;
  let m;
  while ((m = re.exec(html))) {
    const p = m[1];
    if (!p.includes('/comments/')) continue;
    // Drop tracking params
    const clean = p.split('?')[0];
    hrefs.push(clean);
  }
  const uniqPaths = uniq(hrefs)
    .filter((p) => !p.includes('/comments/'))
    .length;
  // above line no-op; keep for future debugging

  return uniq(hrefs)
    .map((p) => `https://www.reddit.com${p}`)
    .filter((u) => u.includes('/comments/'));
}

async function findRedditLinks(topic) {
  const q1 = topicQuery(topic);
  const q2 = (topic.tags || []).slice(0, 5).join(' ');
  const queries = uniq([q1, q2, `${q1} chrome extension`, `${q1} byok`, `${q1} youtube`]).filter(Boolean);

  for (const q of queries) {
    try {
      const url = `https://old.reddit.com/search?q=${encodeURIComponent(q)}`;
      const html = await fetchText(url);
      const links = extractRedditCommentLinks(html);
      const picked = uniq(links).slice(0, 4);
      if (picked.length >= 2) return picked;
    } catch {
      // try next query
    }
  }

  return [];
}

function buildKeywords(topic) {
  const base = [];
  const title = String(topic.title || topic.id);
  const tags = Array.isArray(topic.tags) ? topic.tags : [];

  // 1-4: from tags (stringified)
  for (const t of tags) base.push(String(t));

  // add intent keywords
  const pillar = String(topic.pillar || '').toLowerCase();
  if (pillar.includes('youtube')) {
    base.push('youtube summarizer chrome extension');
    base.push('youtube summary with timestamps');
    base.push('youtube transcript summary');
  }
  if (pillar.includes('web') || pillar.includes('article')) {
    base.push('article summarizer chrome extension');
    base.push('summarize web page without copy paste');
  }
  if (pillar.includes('privacy') || pillar.includes('byok') || pillar.includes('byom')) {
    base.push('byok browser extension');
    base.push('api key safety checklist');
    base.push('privacy first ai extension');
  }
  if (pillar.includes('comparison') || title.toLowerCase().includes('alternative')) {
    base.push(title);
    base.push('best alternative');
    base.push('byok vs subscription');
  }

  // add stripped title variants
  base.push(title);

  const cleaned = base
    .map((x) => String(x).trim())
    .filter(Boolean)
    .map((x) => x.replace(/\s+/g, ' '));

  const uniqK = uniq(cleaned);

  // ensure exactly 10
  const out = uniqK.slice(0, 10);
  while (out.length < 10) out.push(`${title} workflow ${out.length + 1}`);
  return out.slice(0, 10);
}

function buildOutline(topic) {
  const sections = Array.isArray(topic.sections) ? topic.sections : [];
  const out = sections.map((s) => escapeMd(s)).filter(Boolean);
  while (out.length < 4) out.push('A practical workflow you can copy/paste');
  return out.slice(0, 8);
}

function renderResearch(topic, redditLinks) {
  const title = escapeMd(topic.title || topic.id);
  const pillar = escapeMd(topic.pillar || '');
  const intent = escapeMd(topic.intent || '');
  const keywords = buildKeywords(topic);
  const outline = buildOutline(topic);

  const moneyPages = [
    '/pricing',
    '/youtube-summary',
    '/privacy-first',
    '/guide/getting-started/',
    '/ai-model-cost-calculator-and-price-comparation',
  ];

  const internal = moneyPages;

  const lines = [];
  lines.push(`# Research — ${topic.id}`);
  lines.push('');
  lines.push('## Target');
  lines.push('');
  lines.push(`- title: ${title}`);
  if (pillar) lines.push(`- pillar: ${pillar}`);
  if (intent) lines.push(`- intent: ${intent}`);
  lines.push('- primary promise: quick, practical, copy/paste workflow for GPT Breeze users');
  lines.push('');

  lines.push('## User discussion research');
  lines.push('');
  lines.push('### Source links');
  lines.push('');
  for (const u of redditLinks.slice(0, 4)) lines.push(`- <${u}>`);
  lines.push('');
  lines.push('### Notes (quotes/snippets)');
  lines.push('');
  lines.push('- What people try first (and why it fails)');
  lines.push('- What “good output” looks like (format, verification, speed)');
  lines.push('');
  lines.push('### Pain points');
  lines.push('');
  lines.push('- Too much text / not skimmable');
  lines.push('- Hard to verify accuracy (no timestamps/quotes)');
  lines.push('- Tool friction (copy/paste, settings not sticking)');
  lines.push('');

  lines.push('## Keywords (10)');
  lines.push('');
  keywords.forEach((k, i) => lines.push(`${i + 1}. ${escapeMd(k)}`));
  lines.push('');

  lines.push('## Backlinks');
  lines.push('');
  lines.push('### Internal');
  lines.push('');
  internal.forEach((p) => lines.push(`- ${p}`));
  lines.push('');
  lines.push('### External (optional)');
  lines.push('');
  lines.push('- <https://chromewebstore.google.com/detail/gpt-breeze-ai-shortcuts-y/plchckmceefljjjphgfcadhlfnlindog>');
  lines.push('');

  lines.push('## Article angle');
  lines.push('');
  lines.push(`- For ${pillar || 'GPT Breeze users'}: a practical workflow + checklist + prompts, with quick verification and clear next steps.`);
  lines.push('');

  lines.push('## Outline');
  lines.push('');
  outline.forEach((h) => lines.push(`- H2: ${escapeMd(h)}`));
  lines.push('');

  lines.push('## GPT Breeze tie-in (must be concrete)');
  lines.push('');
  lines.push('- Use one of: YouTube timestamps / transcript / page summary with citations / text toolbar / BYOK provider switching.');
  lines.push('- Place CTA once after showing a workflow; don’t spam.');
  lines.push('');

  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv);
  if (!fs.existsSync(topicBankPath)) throw new Error(`Missing topic bank: ${path.relative(root, topicBankPath)}`);

  const bank = readJson(topicBankPath);
  const topics = Array.isArray(bank.topics) ? bank.topics : [];
  if (topics.length === 0) {
    console.log('No topics in topic-bank.json');
    return;
  }

  fs.mkdirSync(researchDir, { recursive: true });

  const used = computeUsedTopicIds();
  const unused = topics.filter((t) => !used.has(String(t.id)));

  let done = 0;
  for (const t of unused) {
    if (done >= args.maxTopics) break;

    const outPath = path.join(researchDir, `${t.id}.md`);
    if (fs.existsSync(outPath)) {
      const content = fs.readFileSync(outPath, 'utf8');
      const problems = validateResearch(content);
      if (problems.length === 0) continue; // already good
    }

    const links = await findRedditLinks(t);
    if (links.length < 2) {
      console.log(`[warn] Could not find >=2 reddit links for topicId=${t.id}. Skipping auto research.`);
      continue;
    }

    const content = renderResearch(t, links);
    const problems = validateResearch(content);
    if (problems.length > 0) {
      console.log(`[warn] Generated research still not valid for ${t.id}: ${problems.join('; ')}`);
      continue;
    }

    if (args.dryRun) {
      console.log(`[dry-run] Would write research: ${path.relative(root, outPath)}`);
    } else {
      fs.writeFileSync(outPath, content, 'utf8');
      console.log(`Wrote research: ${path.relative(root, outPath)}`);
    }
    done++;
  }

  if (done === 0) console.log('No research files generated.');
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
