#!/usr/bin/env node
/**
 * Ensure AUTONOMUS/content/topic-bank.json always has >=N UNUSED topicIds.
 *
 * Strict mode context:
 * - publish-daily-post.mjs only publishes topics from topic-bank.json
 * - one topicId => one canonical URL (no -2/-3 duplicates)
 * - if the bank has no unused topicIds, blog publishing must skip
 *
 * This tool appends new, strategy-aligned topic definitions when the unused buffer is low.
 * It is intentionally deterministic (no web calls) to keep diffs reviewable.
 *
 * Usage:
 *   node AUTONOMUS/tools/topic-bank-expand.mjs --buffer 30
 *   node AUTONOMUS/tools/topic-bank-expand.mjs --buffer 30 --dry-run
 */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const topicBankPath = path.join(root, 'AUTONOMUS/content/topic-bank.json');
const ledgerPath = path.join(root, 'AUTONOMUS/state/published.jsonl');
const blogDir = path.join(root, 'src/content/blog');

function parseArgs(argv) {
  const out = { buffer: 30, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') out.dryRun = true;
    else if (a === '--buffer') {
      const v = Number(argv[++i]);
      if (!Number.isFinite(v) || v <= 0) throw new Error(`Invalid --buffer: ${v}`);
      out.buffer = Math.floor(v);
    } else {
      throw new Error(`Unknown arg: ${a}`);
    }
  }
  return out;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readLines(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
}

function collectUsedTopicIds() {
  const used = new Set();

  // Published ledger.
  for (const line of readLines(ledgerPath)) {
    try {
      const j = JSON.parse(line);
      if (j && typeof j.topicId === 'string') used.add(j.topicId);
    } catch {
      // ignore malformed lines
    }
  }

  // Existing blog frontmatter topicIds (extra safety in case of manual edits).
  if (fs.existsSync(blogDir)) {
    const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.md'));
    for (const f of files) {
      const p = path.join(blogDir, f);
      const txt = fs.readFileSync(p, 'utf8');
      const m = txt.match(/^topicId:\s*"?([a-z0-9\-]+)"?\s*$/m);
      if (m) used.add(m[1]);
    }
  }

  return used;
}

/**
 * Deterministic topic candidates (strategy-aligned).
 *
 * Keep these focused on GPT Breeze user intent (workflows, comparisons, privacy/BYOK, shortcuts).
 * Avoid "SEO meta" topics aimed at other builders.
 */
function candidateTopics() {
  const topics = [];

  // Competitor comparisons (high-intent).
  const competitors = [
    { id: 'harpa-ai', name: 'HARPA AI', angle: 'automation + web scraping' },
    { id: 'sider', name: 'Sider', angle: 'sidebar assistant' },
    { id: 'monica-ai', name: 'Monica AI', angle: 'browser copilot' },
    { id: 'chatgpt-for-google', name: 'ChatGPT for Google', angle: 'search overlay' },
    { id: 'wiseone', name: 'Wiseone', angle: 'reading assistant' },
    { id: 'liner', name: 'LINER', angle: 'highlighting + summaries' },
    { id: 'glasp', name: 'Glasp', angle: 'highlights + knowledge base' },
  ];
  for (const c of competitors) {
    topics.push({
      id: `${c.id}-alternative`,
      title: `${c.name} Alternative: A Privacy-First BYOK Workflow for Summaries + Writing`,
      description: `A comparison guide for people using ${c.name} (${c.angle}) who want more control over models, costs, and privacy via BYOK.`,
      pillar: 'Competitor comparisons',
      intent: 'commercial',
      tags: [`${c.name} alternative`, 'BYOK', 'Chrome extension', 'privacy', 'summarizer'],
      sections: [
        'Why people look for alternatives',
        'The checklist: quality, speed, and reliability',
        'BYOK cost control vs subscription pricing',
        'Privacy: what data gets sent where',
        'A clean setup in GPT Breeze (step-by-step)',
        'FAQ',
      ],
    });
  }

  // YouTube summarizer workflows.
  const yt = [
    {
      id: 'summarize-youtube-lectures-into-study-notes',
      title: 'How to Summarize YouTube Lectures into Study Notes (Outline + Flashcards)',
      description: 'A repeatable workflow for turning long lectures into structured notes, key concepts, and flashcards you can review later.',
      tags: ['YouTube summarizer', 'study notes', 'flashcards', 'transcript'],
      sections: [
        'What to capture (concepts, examples, definitions)',
        'Step-by-step: lecture → notes → flashcards',
        'Prompt templates for study notes',
        'How to verify key claims quickly',
        'Turn notes into a spaced-repetition routine',
        'FAQ',
      ],
    },
    {
      id: 'summarize-youtube-podcasts-into-actionable-takeaways',
      title: 'Summarize YouTube Podcasts into Actionable Takeaways (with Timestamps)',
      description: 'A podcast workflow: extract decisions, principles, and action items with timestamps so you can revisit the exact moment later.',
      tags: ['YouTube', 'podcast', 'timestamps', 'action items'],
      sections: [
        'Why podcasts are hard to summarize',
        'The workflow: chapters + timestamps + takeaways',
        'Prompt templates you can save as shortcuts',
        'How to build a personal “idea library”',
        'Common mistakes (and fixes)',
        'FAQ',
      ],
    },
    {
      id: 'youtube-summary-for-product-research',
      title: 'Use YouTube Summaries for Product Research (Extract Features, Pricing, and Claims)',
      description: 'How to watch competitor demos faster: extract features, pricing claims, limitations, and questions to validate.',
      tags: ['product research', 'competitor research', 'YouTube summary', 'workflow'],
      sections: [
        'What to extract from product demos',
        'Step-by-step: demo → feature list → checklist',
        'Prompt templates for extracting claims',
        'How to validate claims (without rewatching)',
        'Turn it into a comparison table',
        'FAQ',
      ],
    },
  ];
  for (const t of yt) {
    topics.push({
      ...t,
      pillar: 'YouTube summarizer',
      intent: 'how-to',
      tags: t.tags,
    });
  }

  // Web/article summary workflows.
  topics.push(
    {
      id: 'summarize-research-papers-in-browser',
      title: 'How to Summarize Research Papers in Your Browser (Without Skimming for Hours)',
      description: 'A workflow for extracting the thesis, methods, results, and limitations — plus questions to ask before you cite anything.',
      pillar: 'Web/article summary',
      intent: 'how-to',
      tags: ['research paper', 'summary', 'workflow', 'Chrome'],
      sections: [
        'The 5 things you need from any paper',
        'Step-by-step: paper → structured summary',
        'Prompts for “limitations” and “what would change my mind”',
        'How to compare 3 papers quickly',
        'Turn summaries into notes you can reuse',
        'FAQ',
      ],
    },
    {
      id: 'summarize-github-repos-for-onboarding',
      title: 'Summarize GitHub Repos for Onboarding (README → Setup Steps → Gotchas)',
      description: 'A practical way to turn messy READMEs into a clean “run it locally” checklist and a list of likely pitfalls.',
      pillar: 'Web/article summary',
      intent: 'how-to',
      tags: ['GitHub', 'onboarding', 'README', 'developer productivity'],
      sections: [
        'What to extract (setup, env vars, commands)',
        'Step-by-step: README → checklist',
        'Prompts for troubleshooting and “unknown unknowns”',
        'How to keep your checklist up to date',
        'Shareable notes for teammates',
        'FAQ',
      ],
    },
  );

  // Shortcuts / prompt workflows.
  topics.push(
    {
      id: 'prompt-library-for-browser-ai',
      title: 'Prompt Library for Browser AI: How to Build a “Start Here” Menu (Not a Blank Box)',
      description: 'Why most users struggle with the first prompt — and how a searchable prompt library (cached + fast) changes onboarding and retention.',
      pillar: 'Chrome extension AI',
      intent: 'use-case',
      tags: ['prompt library', 'shortcuts', 'onboarding', 'workflow'],
      sections: [
        'The real UX problem: the blank prompt box',
        'What a good library includes (roles + sites + outcomes)',
        'Implementation: Notion as DB → extension cache',
        'Distribution: where to surface it in onboarding',
        'How to collect and iterate prompts safely',
        'FAQ',
      ],
    },
    {
      id: 'build-shortcuts-for-customer-support',
      title: 'Build One-Click Shortcuts for Customer Support (Triage → Repro → Next Step)',
      description: 'Turn repetitive support work into a consistent workflow: summarize the ticket, ask for missing info, and propose a repro checklist.',
      pillar: 'Chrome extension AI',
      intent: 'how-to',
      tags: ['customer support', 'shortcuts', 'workflow', 'product'],
      sections: [
        'What support teams repeat every day',
        'Step-by-step: ticket → summary → questions',
        'Prompt templates to save as shortcuts',
        'How to avoid hallucinated “facts” in support',
        'Internal links: turn support into docs',
        'FAQ',
      ],
    },
  );

  // BYOK / Privacy + trust.
  topics.push(
    {
      id: 'byok-cost-control-for-browser-ai',
      title: 'BYOK Cost Control for Browser AI: How to Stop Paying for “Unlimited” Plans',
      description: 'A practical guide to estimate token costs, set budgets, and choose models intentionally — especially for summarizing video and web pages.',
      pillar: 'BYOK / Privacy',
      intent: 'commercial',
      tags: ['BYOK', 'cost control', 'pricing', 'tokens'],
      sections: [
        'Subscriptions vs BYOK: what you’re really paying for',
        'How to estimate costs for your workflows',
        'Model selection: fast vs cheap vs quality',
        'Budget guardrails (habits, not just settings)',
        'A simple setup in GPT Breeze',
        'FAQ',
      ],
    },
    {
      id: 'api-key-hygiene-for-teams',
      title: 'API Key Hygiene for Teams Using BYOK (Browser Extensions + Shared Machines)',
      description: 'Rules and workflows for keeping keys safe: least privilege, rotation, and what to do when a key leaks.',
      pillar: 'BYOK / Privacy',
      intent: 'trust',
      tags: ['API keys', 'security', 'team', 'BYOK'],
      sections: [
        'Threat model: how keys leak in real life',
        'Key storage and rotation basics',
        'Shared machines and browser profiles',
        'Incident response: if a key leaks',
        'Policy template you can copy',
        'FAQ',
      ],
    },
  );

  // Meeting/video notes (use-case expansion).
  topics.push(
    {
      id: 'turn-webinars-into-sales-followups',
      title: 'Turn Webinars into Sales Follow-Ups (Objections, Quotes, and Next Steps)',
      description: 'A playbook for extracting objections, quotes, and follow-ups from long webinars so sales teams can act fast.',
      pillar: 'Meeting/video notes',
      intent: 'use-case',
      tags: ['webinar', 'sales', 'follow-ups', 'notes'],
      sections: [
        'What to extract from webinars (not just summaries)',
        'Step-by-step: webinar → follow-up pack',
        'Prompt templates for objections and quotes',
        'How to verify claims with timestamps',
        'Turn it into a reusable sales asset',
        'FAQ',
      ],
    },
    {
      id: 'turn-interviews-into-insights',
      title: 'Turn User Interviews into Insights (Themes, Quotes, and a Prioritized List)',
      description: 'A workflow for converting messy interview transcripts into themes, quotes, and a prioritized set of product actions.',
      pillar: 'Meeting/video notes',
      intent: 'use-case',
      tags: ['user interviews', 'product', 'research', 'themes'],
      sections: [
        'The 3 outputs you actually need from interviews',
        'Step-by-step: transcript → themes',
        'Prompt templates for quotes and evidence',
        'How to avoid confirmation bias',
        'Turn themes into a roadmap input',
        'FAQ',
      ],
    },
  );

  // Extra backlog to ensure we can always hit a healthy unused buffer.
  // Keep titles user-intent + GPT Breeze aligned (workflows, comparisons, shortcuts, BYOK/privacy).
  topics.push(
    {
      id: 'summarize-privacy-policy-in-plain-english',
      title: 'How to Summarize a Privacy Policy in Plain English (What to Look For)',
      description: 'A workflow to scan privacy policies fast: data collected, retention, sharing, and the few clauses that should make you pause.',
      pillar: 'Web/article summary',
      intent: 'trust',
      tags: ['privacy policy', 'summary', 'checklist', 'privacy-first'],
      sections: [
        'The 7 clauses that matter most',
        'Step-by-step: policy → plain-English summary',
        'Red flags (data sharing, retention, training)',
        'Questions to ask before you accept',
        'How to keep a personal “tool trust” checklist',
        'FAQ',
      ],
    },
    {
      id: 'summarize-terms-and-conditions-checklist',
      title: 'Summarize Terms & Conditions into a Checklist (Refunds, Liability, Termination)',
      description: 'Turn long T&C pages into a short checklist so you can spot the important parts without reading legal text line by line.',
      pillar: 'Web/article summary',
      intent: 'how-to',
      tags: ['terms and conditions', 'checklist', 'summary'],
      sections: [
        'What T&C usually hides in plain sight',
        'Step-by-step: T&C → checklist',
        'Common traps (termination, refunds, arbitration)',
        'What to do when you find a red flag',
        'Save as a reusable shortcut',
        'FAQ',
      ],
    },
    {
      id: 'summarize-competitor-pricing-pages',
      title: 'Summarize Competitor Pricing Pages (Plans, Limits, Hidden Costs)',
      description: 'A repeatable workflow to extract plan limits, fair-usage rules, and hidden costs from pricing pages and help you compare quickly.',
      pillar: 'Web/article summary',
      intent: 'commercial',
      tags: ['pricing page', 'competitor research', 'comparison', 'cost'],
      sections: [
        'What to extract (limits, caps, add-ons)',
        'Step-by-step: pricing page → comparison table',
        'Questions to ask before you buy',
        'BYOK vs subscription: how to compare fairly',
        'How to save this as a shortcut',
        'FAQ',
      ],
    },
    {
      id: 'turn-web-pages-into-sops',
      title: 'Turn Web Pages into SOPs (Step-by-Step Checklists You Can Reuse)',
      description: 'Convert messy documentation into a clean SOP: steps, prerequisites, warnings, and a final verification checklist.',
      pillar: 'Web/article summary',
      intent: 'use-case',
      tags: ['SOP', 'checklist', 'documentation', 'workflow'],
      sections: [
        'What makes an SOP actually usable',
        'Step-by-step: docs → SOP',
        'Prompts for prerequisites and “gotchas”',
        'How to add a verification step',
        'Shareable SOP templates',
        'FAQ',
      ],
    },

    {
      id: 'chat-with-any-web-page-workflow',
      title: 'Chat with Any Web Page: A Workflow for Faster Research (Without Copy/Paste)',
      description: 'A practical workflow: summarize first, then ask targeted questions and extract citations/quotes from the page.',
      pillar: 'Web/article summary',
      intent: 'how-to',
      tags: ['web page chat', 'research', 'workflow', 'Chrome extension'],
      sections: [
        'Why “just ask questions” fails',
        'Step-by-step: page → summary → Q&A',
        'Prompts for extracting quotes and citations',
        'How to avoid hallucinated claims',
        'Turn findings into notes you can reuse',
        'FAQ',
      ],
    },

    {
      id: 'save-and-reuse-prompts-across-sites',
      title: 'Save and Reuse Prompts Across Sites (YouTube, Notion, GitHub, Docs)',
      description: 'How to turn your best prompts into site-specific shortcuts so you can run the same workflow anywhere in seconds.',
      pillar: 'Chrome extension AI',
      intent: 'how-to',
      tags: ['shortcuts', 'prompts', 'workflow', 'productivity'],
      sections: [
        'Why reuse beats “prompting from scratch”',
        'Step-by-step: turn prompts into shortcuts',
        'Site-specific examples (YouTube, GitHub, Notion)',
        'How to name and organize shortcuts',
        'Sharing shortcuts with a team',
        'FAQ',
      ],
    },
    {
      id: 'site-specific-shortcuts-youtube-github-notion',
      title: 'Site-Specific Shortcuts: The Fastest Way to Make Browser AI Feel “Native”',
      description: 'A playbook to design shortcuts per site: what to summarize, what to extract, and what to ask next.',
      pillar: 'Chrome extension AI',
      intent: 'use-case',
      tags: ['shortcuts', 'onboarding', 'UX', 'workflow'],
      sections: [
        'The “context gap” problem in browser AI',
        'How to design a shortcut per site',
        'Examples: YouTube, GitHub, Notion, docs',
        'Naming conventions that scale',
        'How to iterate without breaking trust',
        'FAQ',
      ],
    },
    {
      id: 'prompt-hygiene-for-repeatable-shortcuts',
      title: 'Prompt Hygiene for Repeatable Shortcuts (How to Stop Getting Random Outputs)',
      description: 'A practical guide to writing shortcuts that behave: constraints, examples, and verification steps to reduce hallucinations.',
      pillar: 'Chrome extension AI',
      intent: 'trust',
      tags: ['prompt hygiene', 'shortcuts', 'reliability', 'workflow'],
      sections: [
        'Why prompts drift over time',
        'Constraints that increase reliability',
        'Add a verification step (always)',
        'When to use templates vs free-form',
        'A checklist for “safe shortcuts”',
        'FAQ',
      ],
    },

    {
      id: 'byok-setup-guide-for-beginners',
      title: 'BYOK Setup Guide for Beginners (Pick a Provider, Add a Key, Avoid Mistakes)',
      description: 'A beginner-friendly guide to BYOK: choose a provider, add your API key safely, and set up a model that won’t surprise you.',
      pillar: 'BYOK / Privacy',
      intent: 'how-to',
      tags: ['BYOK', 'setup', 'API key', 'privacy'],
      sections: [
        'What BYOK is (and what it isn’t)',
        'Pick a provider: tradeoffs that matter',
        'Step-by-step: add a key safely',
        'Common mistakes (and how to fix them)',
        'A simple “safe default” configuration',
        'FAQ',
      ],
    },
    {
      id: 'privacy-first-ai-chrome-extension-checklist',
      title: 'Privacy-First AI Chrome Extension Checklist (Before You Install Anything)',
      description: 'A checklist for evaluating AI extensions: permissions, data flows, retention, and whether BYOK actually protects you.',
      pillar: 'BYOK / Privacy',
      intent: 'trust',
      tags: ['privacy-first', 'Chrome extension', 'security', 'checklist'],
      sections: [
        'Permissions: what’s reasonable vs risky',
        'Data flow: what gets sent to models',
        'Retention and training policies',
        'BYOK: what it protects (and what it doesn’t)',
        'A simple evaluation scorecard',
        'FAQ',
      ],
    },

    {
      id: 'summarize-youtube-coding-tutorials',
      title: 'Summarize YouTube Coding Tutorials into a Build Plan (Steps + Gotchas)',
      description: 'Turn long coding videos into an actionable build plan: prerequisites, steps, pitfalls, and a verification checklist.',
      pillar: 'YouTube summarizer',
      intent: 'how-to',
      tags: ['coding tutorials', 'YouTube', 'workflow', 'checklist'],
      sections: [
        'What to extract from coding tutorials',
        'Step-by-step: tutorial → build plan',
        'Prompts for prerequisites and environment setup',
        'How to capture “gotchas” and edge cases',
        'Turn it into a reusable checklist',
        'FAQ',
      ],
    },
    {
      id: 'extract-quotes-from-youtube-with-timestamps',
      title: 'Extract Quotes from YouTube (with Timestamps) for Writing and Research',
      description: 'A workflow to pull the few quotable lines with timestamps so you can cite and revisit them instantly.',
      pillar: 'YouTube summarizer',
      intent: 'use-case',
      tags: ['quotes', 'timestamps', 'research', 'writing'],
      sections: [
        'What makes a quote usable',
        'Step-by-step: video → quotes list',
        'Prompts for claims + supporting context',
        'How to avoid misquoting',
        'Turn quotes into a writing outline',
        'FAQ',
      ],
    },
    {
      id: 'youtube-summaries-to-blog-post-drafts',
      title: 'Turn YouTube Summaries into Blog Post Drafts (Outline + Key Points + Sources)',
      description: 'A content workflow: extract the outline, key points, and citations from a video so you can draft faster without rewatching.',
      pillar: 'YouTube summarizer',
      intent: 'use-case',
      tags: ['blog drafting', 'outline', 'YouTube', 'writing'],
      sections: [
        'What to extract for a real draft',
        'Step-by-step: video → outline → draft',
        'Prompts for sourcing and citations',
        'How to add your point of view',
        'Quality checks before publishing',
        'FAQ',
      ],
    },

    {
      id: 'turn-meetings-into-jira-tickets',
      title: 'Turn Meetings into Jira Tickets (Action Items, Owners, and Acceptance Criteria)',
      description: 'A workflow to convert messy meeting notes into clean tickets: tasks, owners, deadlines, and acceptance criteria.',
      pillar: 'Meeting/video notes',
      intent: 'use-case',
      tags: ['Jira', 'tickets', 'action items', 'meeting notes'],
      sections: [
        'What tickets need to be actionable',
        'Step-by-step: meeting → tickets',
        'Prompts for acceptance criteria',
        'How to avoid vague tasks',
        'A template you can reuse',
        'FAQ',
      ],
    },
    {
      id: 'turn-sales-calls-into-followups',
      title: 'Turn Sales Calls into Follow-Ups (Summary, Objections, Next Steps, Email Draft)',
      description: 'A playbook to turn sales calls into follow-up packs: objections, quotes, next steps, and a draft email to send.',
      pillar: 'Meeting/video notes',
      intent: 'use-case',
      tags: ['sales calls', 'follow-up', 'objections', 'email'],
      sections: [
        'What to capture from sales calls',
        'Step-by-step: call → follow-up pack',
        'Prompts for objections and quotes',
        'Draft a follow-up email (with a CTA)',
        'How to verify details quickly',
        'FAQ',
      ],
    },
  );

  return topics;
}

function normalizeTopic(t) {
  // Minimal safety checks.
  if (!t.id || !t.title || !t.description) throw new Error(`Invalid topic: ${JSON.stringify(t).slice(0, 120)}`);
  return {
    id: String(t.id),
    title: String(t.title),
    description: String(t.description),
    pillar: String(t.pillar || 'Blog'),
    intent: String(t.intent || 'how-to'),
    tags: Array.isArray(t.tags) ? t.tags.map(String) : [],
    sections: Array.isArray(t.sections) ? t.sections.map(String) : [],
  };
}

function computeUnused(topics, usedIds) {
  const unused = [];
  for (const t of topics) {
    if (!usedIds.has(t.id)) unused.push(t.id);
  }
  return unused;
}

function appendTopicsPreservingFormat(rawText, newTopics) {
  // Insert before the final topics array close: "\n  ]\n}".
  const marker = '\n  ]\n}';
  const idx = rawText.lastIndexOf(marker);
  if (idx === -1) throw new Error('Could not find end-of-topics marker in topic-bank.json');

  const insertAt = idx; // insert right before marker

  // Create indented JSON blocks with 4-space indent inside the topics array.
  const blocks = newTopics.map((t) => {
    const json = JSON.stringify(t, null, 2);
    return json
      .split('\n')
      .map((l) => (l.length ? '    ' + l : l))
      .join('\n');
  });

  // Ensure we add a comma after the existing last topic.
  // We assume the file is valid JSON, so the last topic currently ends with "    }" before the marker.
  const insertion = `,\n\n${blocks.join(',\n\n')}\n`;

  return rawText.slice(0, insertAt) + insertion + rawText.slice(insertAt);
}

function main() {
  const args = parseArgs(process.argv);

  if (!fs.existsSync(topicBankPath)) throw new Error(`Missing topic bank: ${topicBankPath}`);
  const raw = fs.readFileSync(topicBankPath, 'utf8');
  const bank = JSON.parse(raw);
  const topics = Array.isArray(bank.topics) ? bank.topics : [];
  if (topics.length === 0) throw new Error('Topic bank is empty');

  const usedPublished = collectUsedTopicIds();

  // Unused topics = present in bank but not yet in published ledger (or existing blog files).
  const currentUnused = computeUnused(topics, usedPublished);

  const buffer = args.buffer;
  const need = Math.max(0, buffer - currentUnused.length);

  if (need === 0) {
    console.log(`[topic-bank-expand] OK: unused=${currentUnused.length} (>= buffer=${buffer}). No changes.`);
    return;
  }

  const candidates = candidateTopics().map(normalizeTopic);
  const add = [];

  // Ensure uniqueness vs: published topicIds + existing bank topicIds.
  const usedAll = new Set(usedPublished);
  for (const t of topics) if (t && typeof t.id === 'string') usedAll.add(t.id);
  for (const c of candidates) {
    if (add.length >= need) break;
    if (usedAll.has(c.id)) continue;
    usedAll.add(c.id);
    add.push(c);
  }

  if (add.length < need) {
    throw new Error(
      `[topic-bank-expand] Not enough candidates to reach buffer. need=${need}, added=${add.length}. Add more candidates in topic-bank-expand.mjs.`,
    );
  }

  console.log(`[topic-bank-expand] Need ${need} new topics to reach unused buffer=${buffer}. Adding ${add.length}…`);
  for (const t of add) console.log(`- + ${t.id} (${t.pillar} / ${t.intent})`);

  if (args.dryRun) {
    console.log('[topic-bank-expand] dry-run: not writing changes.');
    return;
  }

  const updatedRaw = appendTopicsPreservingFormat(raw, add);
  fs.writeFileSync(topicBankPath, updatedRaw, 'utf8');
  console.log(`[topic-bank-expand] Updated: ${path.relative(root, topicBankPath)}`);
}

main();
