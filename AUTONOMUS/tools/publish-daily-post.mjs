import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const topicBankPath = path.join(
  root,
  "AUTONOMUS",
  "content",
  "topic-bank.json",
);
const stateDir = path.join(root, "AUTONOMUS", "state");
const ledgerPath = path.join(stateDir, "published.jsonl");
const blogDir = path.join(root, "src", "content", "blog");
const planPath = path.join(root, "AUTONOMUS", "plan.md");
const researchDir = path.join(root, "AUTONOMUS", "research", "blog");

function parseArgs(argv) {
  const args = { dryRun: false, date: null, topicId: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--date") args.date = argv[++i];
    else if (a === "--topic") args.topicId = argv[++i];
    else throw new Error(`Unknown arg: ${a}`);
  }
  return args;
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function toISODate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function loadLedger() {
  if (!fs.existsSync(ledgerPath)) return [];
  const lines = fs
    .readFileSync(ledgerPath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean);
  const items = [];
  for (const line of lines) {
    try {
      items.push(JSON.parse(line));
    } catch {
      // ignore corrupted lines
    }
  }
  return items;
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
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    let value = match[2].trim();
    currentKey = key;
    if (!value) {
      data[key] = data[key] ?? [];
      continue;
    }
    data[key] = value.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  }
  return { data, body };
}

function computeUsedTopicIds() {
  const used = new Set();

  // Prefer the committed ledger when present.
  const ledger = loadLedger();
  for (const x of ledger) if (x?.topicId) used.add(x.topicId);

  // Also scan existing content; this makes rotation robust even if the ledger is missing.
  for (const file of listMarkdown(blogDir)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const { data } = parseFrontmatter(content);
      if (data.topicId) used.add(String(data.topicId));
    } catch {
      // ignore
    }
  }

  return used;
}

function pickTopicStrict(topics, forcedId) {
  if (forcedId) {
    const t = topics.find((x) => x.id === forcedId);
    if (!t) throw new Error(`Unknown topic id: ${forcedId}`);
    return t;
  }

  const used = computeUsedTopicIds();
  const unused = topics.filter((t) => !used.has(t.id));
  if (unused.length === 0) {
    throw new Error(
      `Topic bank exhausted (strict mode). Add more topics in AUTONOMUS/content/topic-bank.json before publishing again.`,
    );
  }
  return unused[0];
}

function mdEscapeInline(text) {
  return String(text).replace(/\n/g, " ").trim();
}

function loadResearchOrSkip(topicId) {
  const res = loadResearch(topicId);
  if (!res.ok) {
    return { ok: false, reason: res.reason };
  }

  const problems = validateResearch(res.content);
  if (problems.length > 0) {
    return {
      ok: false,
      reason: `Research not ready: ${path.relative(root, res.file)}\n- ${problems.join('\n- ')}`,
    };
  }

  const urls = res.content.match(/https?:\/\/\S+/g) || [];
  return {
    ok: true,
    research: {
      path: res.file,
      text: res.content,
      urls,
    },
  };
}

function extractSectionBullets(md, headingRegex) {
  const lines = md.split(/\r?\n/);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headingRegex.test(lines[i])) {
      start = i + 1;
      break;
    }
  }
  if (start === -1) return [];
  const out = [];
  for (let i = start; i < lines.length; i++) {
    const l = lines[i];
    if (/^#{1,6}\s+/.test(l)) break;
    const m = l.match(/^\s*[-*]\s+(.*)$/);
    if (m) out.push(m[1].trim());
  }
  return out.filter(Boolean);
}

function renderPost({ topic, pubDate, research }) {
  const title = topic.title;
  const description = topic.description;
  const tags = topic.tags || [];

  const painPoints = extractSectionBullets(research?.text ?? '', /###\s+Pain points/i);
  const sourceLinks = extractSectionBullets(research?.text ?? '', /###\s+Source links/i).slice(0, 8);

  const topicText = `${title} ${description} ${tags.join(" ")}`.toLowerCase();
  const isYouTube =
    topicText.includes("youtube") ||
    topicText.includes("transcript") ||
    topicText.includes("timestamps") ||
    topicText.includes("video");
  const isPrivacy =
    topicText.includes("privacy") ||
    topicText.includes("byok") ||
    topicText.includes("byom") ||
    topicText.includes("api key");
  const isComparison =
    topicText.includes("alternative") ||
    topicText.includes("compare") ||
    topicText.includes("best");

  const keywords = (() => {
    const kwSec = section(research?.text ?? '', /^##\s+Keywords\s*\(10\)\s*$/m);
    if (!kwSec) return [];
    return kwSec
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => /^\d+\./.test(l))
      .map((l) => l.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 10);
  })();

  const internalLinks = (() => {
    // Capture internal links from the research backlinks section.
    const links = (research?.text ?? '').match(/\n-\s+(\/[a-z0-9\-\/]+)\b/gi) || [];
    const cleaned = links
      .map((l) => l.replace(/^\n-\s+/i, '').trim())
      .filter((x) => x.startsWith('/'));
    return Array.from(new Set(cleaned)).slice(0, 12);
  })();

  const outlineH2 = (() => {
    const outSec = section(research?.text ?? '', /^##\s+Outline\s*$/m);
    if (!outSec) return [];
    return outSec
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => /^-\s*H2:\s*/i.test(l))
      .map((l) => l.replace(/^-\s*H2:\s*/i, '').trim())
      .filter(Boolean)
      .slice(0, 12);
  })();

  const lines = [];
  lines.push("---");
  lines.push(`title: "${mdEscapeInline(title).replace(/"/g, '\\"')}"`);
  lines.push(
    `description: "${mdEscapeInline(description).replace(/"/g, '\\"')}"`,
  );
  lines.push(`pubDate: ${pubDate}T00:00:00.000Z`);
  lines.push(`topicId: "${topic.id}"`);
  lines.push('author: "GPT Breeze"');
  lines.push("tags:");
  for (const t of tags)
    lines.push(`  - "${mdEscapeInline(t).replace(/"/g, '\\"')}"`);
  lines.push("draft: false");
  lines.push("---");
  lines.push("");

  // Intro: hook + pain (research-driven)
  const kw1 = keywords[0];
  const kw2 = keywords[1];

  if (isYouTube && kw1) {
    lines.push(
      `If you watch YouTube to *learn* (podcasts, lectures, tutorials), a plain summary is fine. But a **${kw1}** is way more useful because it gives you a map: what matters, where it happens, and how to jump there fast.`,
    );
    lines.push("");
  } else {
    lines.push(mdEscapeInline(description));
    lines.push("");
  }

  // Research-driven section: ground the article in real user pain.
  if (painPoints.length > 0) {
    lines.push("## What people actually struggle with");
    lines.push("");
    for (const p of painPoints.slice(0, 8)) lines.push(`- ${p}`);
    lines.push("");
  }

  // If the research provides an outline, we follow it. This avoids the repetitive template sections.
  const h2s = outlineH2.length > 0 ? outlineH2 : (topic.sections || []);

  for (const h of h2s) {
    const hl = String(h).toLowerCase();
    lines.push(`## ${h}`);
    lines.push("");

    // YouTube-focused how-to patterns (matches the style approved in df4377c).
    if (isYouTube && (hl.includes('step-by-step') || hl.includes('workflow') || hl.includes('setup'))) {
      lines.push("Here’s a workflow that works for short videos *and* long podcasts:");
      lines.push("");
      lines.push("1) Open the YouTube video you’re working on.");
      lines.push("2) Run **Summarize video with timestamps** in GPT Breeze’s YouTube toolbar.");
      lines.push("   - Demo: https://youtu.be/pOXdFaqTszU");
      lines.push("3) Scan the sections first, then click timestamps to verify the few parts you’ll rely on.");
      lines.push("4) Ask a follow-up like: *Put this into a table with topic / timestamp / takeaway / action item.*");
      lines.push("5) Save the prompt as a shortcut if you’ll repeat it.");
      lines.push("");
      lines.push("Start here if you’re new: [/guide/getting-started/](/guide/getting-started/)");
      lines.push("");
      continue;
    }

    if (hl.includes('prompt') || hl.includes('templates')) {
      lines.push("Copy/paste templates you can save as one-click shortcuts:");
      lines.push("");
      lines.push("```text");
      lines.push("Summarize this video into 8–12 sections.");
      lines.push("Each section must include: timestamp, title, 2 bullets, and one why-it-matters line.");
      lines.push("Keep it skimmable.");
      lines.push("```");
      lines.push("");
      lines.push("```text");
      lines.push("Extract: 5 takeaways, 5 action items, 3 things to verify in the source. Include timestamps.");
      lines.push("```");
      lines.push("");
      continue;
    }

    if (isYouTube && (hl.includes('long') || hl.includes('chunk'))) {
      lines.push("Long videos fail when the summary becomes vague or too expensive. Use this hybrid workflow:");
      lines.push("");
      lines.push("1) Get the full transcript (with timestamps). Demo: https://youtu.be/CEXKlxe7IVE");
      lines.push("2) Summarize by sections (intro / main points / examples / objections / conclusion)." );
      lines.push("3) Merge into a final timestamped map." );
      lines.push("");
      lines.push("Related guide: [/blog/how-to-get-video-transcripts-with-gpt-breeze-extension/](/blog/how-to-get-video-transcripts-with-gpt-breeze-extension/)");
      lines.push("");
      continue;
    }

    if (hl.includes('mistake') || hl.includes('troubleshooting')) {
      lines.push("Common mistakes:");
      lines.push("");
      lines.push("- No timestamps → you can’t verify quickly. Ask for timestamps explicitly.");
      lines.push("- Wall of text → ask for a table.");
      lines.push("- Blind trust → click timestamps and verify the 2–4 key sections.");
      lines.push("");
      continue;
    }

    if (hl.includes('action')) {
      lines.push("A summary that doesn’t change what you do next is just entertainment. Turn it into an execution plan:");
      lines.push("");
      lines.push("```text");
      lines.push("Convert this into an execution plan:");
      lines.push("- 3 decisions to make");
      lines.push("- 5 action items (with time estimates)");
      lines.push("- 3 follow-up questions");
      lines.push("Include timestamps for each supporting point.");
      lines.push("```");
      lines.push("");
      continue;
    }

    if (hl.includes('faq')) {
      lines.push("Quick answers:");
      lines.push("");
      lines.push("- Timestamps matter because they let you verify and jump to the source.");
      lines.push("- For serious learning, use transcript + summary (hybrid)." );
      lines.push("- If you care about data boundaries, use [/privacy-first](/privacy-first)." );
      lines.push("");
      continue;
    }

    // Default: short, non-repetitive filler.
    lines.push("Keep this section practical: aim for a skimmable output, verify the parts you’ll rely on, and save the workflow as a shortcut once it works.");
    lines.push("");
  }

  // CTA
  lines.push("---");
  lines.push("");
  lines.push("Want to try the workflow in under 2 minutes?");
  lines.push("");
  lines.push("- Add GPT Breeze to Chrome: https://chromewebstore.google.com/detail/gpt-breeze-ai-shortcuts-y/plchckmceefljjjphgfcadhlfnlindog");

  // Internal links: prefer research-specified links if present.
  const preferred = internalLinks.length > 0 ? internalLinks : [
    '/youtube-summary',
    '/pricing',
    '/privacy-first',
    '/guide/getting-started/',
    '/ai-model-cost-calculator-and-price-comparation',
  ];

  lines.push("");
  lines.push("## Continue reading");
  lines.push("");
  for (const p of preferred.slice(0, 8)) {
    // Use absolute internal paths per runbook.
    lines.push(`- ${p}`);
  }
  lines.push("");

  // Sources (research citations)
  if (sourceLinks.length > 0) {
    lines.push("## Sources");
    lines.push("");
    lines.push("User discussion threads that shaped this post:");
    lines.push("");
    for (const u of sourceLinks) lines.push(`- ${u}`);
    lines.push("");
  }

  // Keywords (optional, but useful for editorial review)
  if (keywords.length === 10) {
    lines.push("<!-- Keywords (editorial): " + keywords.join('; ') + " -->");
    lines.push("");
  }

  return lines.join("\n");
}

function ensureDirs() {
  fs.mkdirSync(stateDir, { recursive: true });
  fs.mkdirSync(blogDir, { recursive: true });
  fs.mkdirSync(researchDir, { recursive: true });
}

function loadResearch(topicId) {
  const file = path.join(researchDir, `${topicId}.md`);
  if (!fs.existsSync(file)) return { ok: false, reason: `Missing research file: ${path.relative(root, file)}` };
  const content = fs.readFileSync(file, 'utf8');
  return { ok: true, content, file };
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

  if (!content.toLowerCase().includes('## user discussion research'))
    problems.push('Missing section: ## User discussion research');

  const redditLinks = content.match(/https:\/\/www\.reddit\.com\//g) || [];
  if (redditLinks.length < 2) problems.push('Need >=2 reddit links');

  const kwSec = section(content, /^##\s+Keywords \(10\)\s*$/m);
  if (!kwSec) problems.push('Missing section: ## Keywords (10)');
  else {
    const kws = kwSec
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => /^\d+\./.test(l));
    if (kws.length !== 10) problems.push(`Need exactly 10 keywords (found ${kws.length})`);
  }

  if (!content.toLowerCase().includes('## backlinks'))
    problems.push('Missing section: ## Backlinks');

  const internalLinks = content.match(/\n-\s+\/[a-z0-9\-\/]+/gi) || [];
  if (internalLinks.length < 3) problems.push('Need >=3 internal links (e.g. /pricing)');

  if (!content.toLowerCase().includes('## outline'))
    problems.push('Missing section: ## Outline');
  const h2s = content.match(/\n-\s+H2:/g) || [];
  if (h2s.length < 4) problems.push('Need >=4 H2 items in outline');

  return problems;
}

const args = parseArgs(process.argv);
ensureDirs();

if (!fs.existsSync(topicBankPath))
  throw new Error(`Missing topic bank: ${path.relative(root, topicBankPath)}`);
const bank = JSON.parse(fs.readFileSync(topicBankPath, "utf8"));
const topics = bank.topics || [];
if (topics.length === 0) throw new Error("Topic bank is empty");

const topic = pickTopicStrict(topics, args.topicId);

// Enforce research-driven publishing: no research => no publish.
const rg = loadResearchOrSkip(topic.id);
if (!rg.ok) {
  console.log(`[skip] ${rg.reason}`);
  console.log(`[skip] Refusing to publish topicId="${topic.id}" without complete research.`);
  process.exit(0);
}
const research = rg.research;

const now = new Date();
const pubDate = args.date ?? toISODate(now);

const baseSlug = slugify(topic.title);
const outPath = path.join(blogDir, `${baseSlug}.md`);
if (fs.existsSync(outPath)) {
  // Strict de-dup: never create new URLs for the same topic. If this exists, it must already be the canonical.
  throw new Error(
    `Refusing to publish duplicate slug in strict mode: ${path.relative(root, outPath)}. Update the existing post instead.`,
  );
}

const markdown = renderPost({ topic, pubDate, research });

if (args.dryRun) {
  console.log(`[dry-run] Would write: ${path.relative(root, outPath)}`);
  console.log(markdown.slice(0, 800));
  process.exit(0);
}

fs.writeFileSync(outPath, markdown, "utf8");

const ledgerEntry = {
  at: new Date().toISOString(),
  topicId: topic.id,
  title: topic.title,
  file: path.relative(root, outPath),
  pubDate,
};
fs.appendFileSync(ledgerPath, `${JSON.stringify(ledgerEntry)}\n`, "utf8");

// Best-effort: update the daily log so each run leaves a trace.
try {
  if (fs.existsSync(planPath)) {
    const plan = fs.readFileSync(planPath, "utf8");
    const logLinePrefix = `- ${pubDate}:`;
    const note = `published ${path.relative(root, outPath)} (topic: ${topic.id})`;

    if (plan.includes(logLinePrefix)) {
      // Append to existing day line if not already present.
      if (!plan.includes(note)) {
        const updated = plan.replace(
          logLinePrefix,
          `${logLinePrefix} ${note};`,
        );
        fs.writeFileSync(planPath, updated, "utf8");
      }
    } else if (plan.includes("## Daily log")) {
      const updated = plan.replace(
        "## Daily log\n",
        `## Daily log\n${logLinePrefix} ${note}.\n`,
      );
      fs.writeFileSync(planPath, updated, "utf8");
    }
  }
} catch {
  // ignore
}

console.log(`Published: ${path.relative(root, outPath)}`);
console.log(`Ledger: ${path.relative(root, ledgerPath)}`);
