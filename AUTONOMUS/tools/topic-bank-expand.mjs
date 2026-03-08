import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const topicBankPath = path.join(root, 'AUTONOMUS', 'content', 'topic-bank.json');
const ledgerPath = path.join(root, 'AUTONOMUS', 'state', 'published.jsonl');
const blogDir = path.join(root, 'src', 'content', 'blog');

function parseArgs(argv) {
  const args = {
    // Keep backward compatibility with older workflow flag: --buffer N
    // Newer flags let us tune expansion more precisely.
    minUnused: 12,
    targetUnused: 40,
    maxAdd: 50,
    dryRun: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--buffer') {
      const v = Number(argv[++i]);
      args.minUnused = v;
      args.targetUnused = Math.max(args.targetUnused, v);
    } else if (a === '--min-unused') args.minUnused = Number(argv[++i]);
    else if (a === '--target-unused') args.targetUnused = Number(argv[++i]);
    else if (a === '--max-add') args.maxAdd = Number(argv[++i]);
    else if (a === '--dry-run') args.dryRun = true;
    else throw new Error(`Unknown arg: ${a}`);
  }

  if (!Number.isFinite(args.minUnused) || args.minUnused < 0) throw new Error('Invalid --min-unused/--buffer');
  if (!Number.isFinite(args.targetUnused) || args.targetUnused < 0) throw new Error('Invalid --target-unused');
  if (!Number.isFinite(args.maxAdd) || args.maxAdd < 0) throw new Error('Invalid --max-add');

  return args;
}

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function listMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => path.join(dir, f));
}

function parseFrontmatter(content) {
  if (!content.startsWith('---')) return { data: {}, body: content };
  const end = content.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: content };
  const fmRaw = content.slice(3, end).trim();
  const body = content.slice(end + 4);
  const data = {};
  const lines = fmRaw.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^([^:]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const value = m[2].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
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

function computeExistingBlogSlugs() {
  const slugs = new Set();
  if (!fs.existsSync(blogDir)) return slugs;
  for (const f of fs.readdirSync(blogDir)) {
    if (f.endsWith('.md')) slugs.add(path.basename(f, '.md'));
  }
  return slugs;
}

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'for',
  'from',
  'how',
  'in',
  'into',
  'is',
  'it',
  'of',
  'on',
  'or',
  'so',
  'that',
  'the',
  'their',
  'then',
  'this',
  'to',
  'vs',
  'we',
  'what',
  'when',
  'with',
  'you',
  'your',
]);

const GENERIC_INTENT_TOKENS = new Set([
  // Intent words
  'alternative',
  'alternatives',
  'best',
  'comparison',
  'compare',
  'guide',
  'how',
  'list',
  'review',
  'reviews',
  'tool',
  'tools',
  'top',
  'vs',
  'workflow',

  // Domain/generic terms (too broad to be a “core entity”)
  'ai',
  'article',
  'browser',
  'chrome',
  'extension',
  'extensions',
  'meeting',
  'note',
  'notes',
  'pdf',
  'prompt',
  'prompts',
  'recording',
  'summaries',
  'summarize',
  'summarizer',
  'summary',
  'timestamp',
  'timestamps',
  'transcript',
  'transcripts',
  'video',
  'videos',
  'web',
  'youtube',
]);

function stemToken(t) {
  const x = String(t).toLowerCase();
  if (x.length <= 3) return x;
  if (x.endsWith('ies') && x.length > 4) return x.slice(0, -3) + 'y';
  if (x.endsWith('s') && !x.endsWith('ss')) return x.slice(0, -1);
  return x;
}

function tokenizeIntentText(text) {
  const s = String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  if (!s) return [];

  return s
    .split(/\s+/)
    .map(stemToken)
    .filter(Boolean)
    .filter((t) => !STOPWORDS.has(t))
    .filter((t) => !/^\d{4}$/.test(t));
}

function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

function coreTokens(tokens) {
  return tokens.filter((t) => !GENERIC_INTENT_TOKENS.has(t));
}

function buildBlogIndex() {
  const out = [];
  for (const file of listMarkdown(blogDir)) {
    try {
      const md = fs.readFileSync(file, 'utf8');
      const { data } = parseFrontmatter(md);
      const slug = path.basename(file, '.md');
      const title = data.title ? String(data.title) : '';
      const description = data.description ? String(data.description) : '';
      const tokens = tokenizeIntentText(`${title} ${slug} ${description}`);
      out.push({ slug, file, tokens });
    } catch {
      // ignore
    }
  }
  return out;
}

function isCloseIntentDuplicate(spec, blogIndex) {
  const tTokens = tokenizeIntentText(`${spec?.title ?? ''} ${spec?.id ?? ''} ${spec?.description ?? ''}`);
  const tCore = coreTokens(tTokens);
  if (tTokens.length === 0) return false;

  for (const page of blogIndex) {
    const scoreBase = jaccard(tTokens, page.tokens);

    const pCore = coreTokens(page.tokens);
    const coreOverlap = (() => {
      const A = new Set(tCore);
      let n = 0;
      for (const x of pCore) if (A.has(x)) n++;
      return n;
    })();

    let score = scoreBase;
    if (coreOverlap >= 1) score += 0.35;

    if (score >= 0.6) return true;
    if (coreOverlap >= 1 && score >= 0.45) return true;
  }

  return false;
}

function topicSpecCatalog() {
  // Deterministic, research-friendly topic specs aligned with docs/SEO-op-alignment.md pillars.
  // Expandable catalogs: keep these broad so the topic bank never runs dry.
  // Guardrail: all topics must map to the pillar clusters in docs/SEO-op-alignment.md.

  const competitorNames = [
    'Monica',
    'HARPA AI',
    'Sider',
    'Wiseone',
    'Glarity',
    'MaxAI',
    'Merlin AI',
    'Eightify',
    'YouTube Summary with ChatGPT',
    'ChatGPT for Chrome',
    'Perplexity extension',
    'AIPRM',
    'WebChatGPT',
    'LINER',
    'Tactiq',
    'Fireflies',
    'Notta',
    'Otter',
    'Readwise Reader',
    'Glasp',
    'Recall AI',
    'SciSpace',
    'Scholarcy',
    'Upword',
    'QuillBot',
    'Grammarly',
    'Jasper',
    'Writesonic',
    'Copy.ai',
  ];

  const youtubeVariants = [
    'YouTube Shorts',
    'YouTube playlists',
    'podcasts (2–3 hours)',
    'tutorials (step-by-step)',
    'lectures (notes + action items)',
    'webinars (takeaways + follow-ups)',
    'product demos (feature checklist)',
    'conference talks (summary + quotes)',
    'news videos (claims + verification)',
    'interviews (themes + quotes)',
    'language-learning videos (vocab + drills)',
    'coding videos (snippets + steps)',
    'finance videos (numbers + risks)',
    'fitness videos (routine + schedule)',
  ];

  const webVariants = [
    'PDFs in the browser',
    'documentation pages',
    'research papers',
    'newsletters',
    'long reports',
    'product pages (feature comparison)',
    'GitHub issues (decision summary)',
    'StackOverflow threads (best answer + caveats)',
    'Hacker News threads (arguments + consensus)',
    'Product Hunt pages (pros/cons)',
    'Google Docs pages',
    'Notion pages',
    'legal policies (what changed)',
    'pricing pages (what you really pay)',
  ];

  /** @type {Array<{id:string,title:string,description:string,pillar:string,intent:string,tags:string[],sections:string[]}>} */
  const specs = [];

  // YouTube summarizer
  for (const v of youtubeVariants) {
    const id = `youtube-summary-${slugify(v)}`;
    specs.push({
      id,
      title: `How to Summarize ${v} with Timestamps (Fast Workflow)`,
      description: `A practical workflow to summarize ${v} with clickable timestamps, key takeaways, and action items using a Chrome extension.`,
      pillar: 'YouTube summarizer',
      intent: 'how-to',
      tags: ['YouTube', 'summarizer', 'timestamps', 'Chrome extension', 'productivity'],
      sections: [
        'When this workflow beats a plain summary',
        'Step-by-step: timestamps + sections + action items',
        'Prompt templates (copy/paste)',
        'How to verify accuracy quickly',
        'Privacy notes (BYOK/BYOM)',
        'FAQ',
      ],
    });
  }

  // Web/article summary
  for (const v of webVariants) {
    const id = `summarize-${slugify(v)}`;
    specs.push({
      id,
      title: `How to Summarize ${v} (Without Copy-Pasting Everything)`,
      description: `A step-by-step workflow to summarize ${v} in Chrome, extract key points/quotes, and keep the output reusable.`,
      pillar: 'Web/article summary',
      intent: 'how-to',
      tags: ['article summarizer', 'Chrome', 'research', 'notes', 'productivity'],
      sections: [
        'When summaries help (and when they don’t)',
        'Step-by-step workflow',
        'Extract-ready outputs (bullets/quotes/tables)',
        'Common mistakes + fixes',
        'Privacy notes',
        'FAQ',
      ],
    });
  }

  // Prompt shortcuts / productivity
  specs.push({
    id: 'prompt-shortcuts-starter-pack',
    title: '10 Prompt Shortcuts to Save (So You Stop Rewriting the Same Instructions)',
    description: 'A starter pack of high-leverage shortcuts for summarizing, extracting, rewriting, and decision-making—plus how to organize them.' ,
    pillar: 'Chrome extension AI',
    intent: 'how-to',
    tags: ['shortcuts', 'prompts', 'workflow', 'productivity', 'Chrome extension'],
    sections: [
      'Why shortcuts beat “typing prompts”',
      '10 shortcuts you can reuse daily',
      'How to name/organize shortcuts',
      'How to iterate safely',
      'Team sharing patterns',
      'FAQ',
    ],
  });

  // BYOK / Privacy
  specs.push({
    id: 'byok-api-key-safety',
    title: 'How to Use API Keys Safely in AI Browser Extensions (BYOK Checklist)',
    description: 'A practical BYOK checklist: key storage, permissions, provider settings, and the fastest ways keys leak in browser workflows.',
    pillar: 'BYOK / Privacy',
    intent: 'trust',
    tags: ['BYOK', 'API keys', 'security', 'Chrome extension', 'privacy'],
    sections: [
      'Threat model: what can go wrong',
      'Key storage + rotation basics',
      'Browser permissions to avoid',
      'Provider settings that matter',
      'A safe default workflow',
      'FAQ',
    ],
  });

  // Comparisons
  for (const name of competitorNames) {
    const id = `${slugify(name)}-alternative`;
    specs.push({
      id,
      title: `${name} Alternative: Better Summaries with BYOK + More Control`,
      description: `A comparison guide for people switching from ${name}: what features matter (timestamps, privacy, BYOK) and how to evaluate alternatives.`,
      pillar: 'Competitor comparisons',
      intent: 'commercial',
      tags: [`${name} alternative`, 'Chrome extension', 'summarizer', 'BYOK', 'privacy'],
      sections: [
        'Why people look for alternatives',
        'Comparison checklist (what matters)',
        'BYOK vs subscription cost',
        'Privacy & data handling',
        'Migration tips',
        'FAQ',
      ],
    });
  }

  // Use-cases (meeting/video notes + research workflows)
  const useCases = [
    {
      id: 'turn-youtube-into-study-notes',
      title: 'Turn YouTube Videos into Study Notes (with Timestamps + Flashcards)',
      description: 'A study workflow: timestamped notes, key terms, and quick flashcards you can review later.',
      pillar: 'YouTube summarizer',
      intent: 'use-case',
      tags: ['YouTube', 'study notes', 'timestamps', 'learning', 'productivity'],
      sections: [
        'What good study notes look like',
        'Step-by-step workflow',
        'Prompt templates (notes + flashcards)',
        'How to verify the hard parts',
        'Privacy notes',
        'FAQ',
      ],
    },
    {
      id: 'turn-youtube-into-meeting-notes',
      title: 'Turn YouTube (or a recording) into Meeting Notes + Action Items',
      description: 'A workflow to convert a video into structured notes: agenda, decisions, action items, and follow-ups.',
      pillar: 'Meeting/video notes',
      intent: 'use-case',
      tags: ['meeting notes', 'video notes', 'action items', 'productivity'],
      sections: [
        'What good meeting notes look like',
        'Step-by-step workflow: transcript → notes',
        'Prompt templates: decisions + action items',
        'How to handle long recordings',
        'Privacy notes',
        'FAQ',
      ],
    },
    {
      id: 'turn-article-into-executive-summary',
      title: 'Turn Any Long Article into an Executive Summary (1 page)',
      description: 'A workflow to extract the 10% that matters: TL;DR, key claims, risks, and what to verify.',
      pillar: 'Web/article summary',
      intent: 'use-case',
      tags: ['executive summary', 'article summarizer', 'research', 'productivity'],
      sections: [
        'What an executive summary should include',
        'Step-by-step workflow',
        'Extract-ready templates (bullets, tables)',
        'Verification checklist',
        'Privacy notes',
        'FAQ',
      ],
    },
    {
      id: 'competitor-research-from-video',
      title: 'Competitor Research from YouTube: Feature Checklist + Positioning',
      description: 'A repeatable workflow to turn competitor videos into a feature matrix, positioning notes, and messaging angles.',
      pillar: 'YouTube summarizer',
      intent: 'use-case',
      tags: ['competitor research', 'YouTube', 'product marketing', 'notes'],
      sections: [
        'What to capture (features, claims, proof)',
        'Step-by-step workflow',
        'Prompt templates (matrix + angles)',
        'How to avoid hallucinated features',
        'Privacy notes',
        'FAQ',
      ],
    },
  ];

  for (const u of useCases) specs.push(u);

  return specs;
}

function uniqueByIdAndSlug(specs, { existingIds, existingSlugs, blogIndex }) {
  const out = [];
  for (const t of specs) {
    if (existingIds.has(t.id)) continue;

    // Exact slug de-dup.
    const slug = slugify(t.title);
    if (existingSlugs.has(slug)) continue;

    // Close-intent de-dup (title/slug similarity).
    if (isCloseIntentDuplicate(t, blogIndex)) continue;

    out.push(t);
  }
  return out;
}

const args = parseArgs(process.argv);
if (!fs.existsSync(topicBankPath)) throw new Error(`Missing topic bank: ${path.relative(root, topicBankPath)}`);

const bank = readJson(topicBankPath);
const topics = Array.isArray(bank.topics) ? bank.topics : [];

const used = computeUsedTopicIds();
const existingIds = new Set(topics.map((t) => String(t.id)));
const existingSlugs = computeExistingBlogSlugs();
const blogIndex = buildBlogIndex();

const unusedCount = topics.filter((t) => !used.has(String(t.id))).length;

if (unusedCount >= args.minUnused) {
  console.log(`Topic bank OK: unused=${unusedCount} (min=${args.minUnused}). No expand needed.`);
  process.exit(0);
}

const catalog = topicSpecCatalog();
const candidates = uniqueByIdAndSlug(catalog, { existingIds, existingSlugs, blogIndex });

if (candidates.length === 0) {
  console.log('No topic candidates available (all would duplicate existing ids/slugs).');
  process.exit(0);
}

let addCount = 0;
for (const c of candidates) {
  if (unusedCount + addCount >= args.targetUnused) break;
  if (addCount >= args.maxAdd) break;
  topics.push(c);
  existingIds.add(c.id);
  addCount++;
}

if (addCount === 0) {
  console.log(`No topics added (unused=${unusedCount}).`);
  process.exit(0);
}

const newUnused = topics.filter((t) => !used.has(String(t.id))).length;

if (args.dryRun) {
  console.log(`[dry-run] Would add ${addCount} topics. unused: ${unusedCount} -> ${newUnused}`);
  process.exit(0);
}

writeJson(topicBankPath, { ...bank, topics });
console.log(`Expanded topic bank: added=${addCount}; unused: ${unusedCount} -> ${newUnused}; total=${topics.length}`);
