import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const topicBankPath = path.join(root, 'AUTONOMUS', 'content', 'topic-bank.json');
const outDir = path.join(root, 'AUTONOMUS', 'research', 'blog');

function parseArgs(argv) {
  const args = { dryRun: false, force: false, topic: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--force') args.force = true;
    else if (a === '--topic') args.topic = argv[++i];
    else throw new Error(`Unknown arg: ${a}`);
  }
  if (!args.topic) throw new Error('Missing required arg: --topic <topicId>');
  return args;
}

function loadTopicBank() {
  if (!fs.existsSync(topicBankPath)) throw new Error(`Missing: ${path.relative(root, topicBankPath)}`);
  return JSON.parse(fs.readFileSync(topicBankPath, 'utf8'));
}

function renderTemplate(topic) {
  const title = topic.title ?? topic.id;
  const pillar = topic.pillar ?? '';
  const intent = topic.intent ?? '';

  return `# Research — ${topic.id}

## Target

- title: ${title}
- pillar: ${pillar}
- intent: ${intent}
- primary promise: 

## User discussion research

### Source links

- <https://www.reddit.com/r/...>
- <https://www.reddit.com/r/...>
- <https://x.com/...>

### Notes (quotes/snippets)

- 

### Pain points

- 

## Keywords (10)

1. 
2. 
3. 
4. 
5. 
6. 
7. 
8. 
9. 
10. 

## Backlinks

### Internal (required)

Money pages (pick at least 2):
- /pricing
- /youtube-summary
- /privacy-first
- /guide/getting-started/
- /ai-model-cost-calculator-and-price-comparation

Related supporting posts/pages:
- 

### External (optional)

- 

## Article angle

-

## Outline

- H2: 
- H2: 
- H2: 
- H2: 

## GPT Breeze tie-in (must be concrete)

Reference specific workflows from: `docs/agent-seo-article.md` (product video appendix).

CTA link:
- https://chromewebstore.google.com/detail/gpt-breeze-ai-shortcuts-y/plchckmceefljjjphgfcadhlfnlindog
`;
}

const args = parseArgs(process.argv);
const bank = loadTopicBank();
const topics = bank.topics ?? [];
const topic = topics.find((t) => t.id === args.topic);
if (!topic) throw new Error(`Unknown topic id: ${args.topic}`);

fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `${topic.id}.md`);

if (fs.existsSync(outPath) && !args.force) {
  console.log(`Exists: ${path.relative(root, outPath)} (use --force to overwrite)`);
  process.exit(0);
}

const content = renderTemplate(topic);

if (args.dryRun) {
  console.log(`[dry-run] Would write: ${path.relative(root, outPath)}`);
  console.log(content.slice(0, 1200));
  process.exit(0);
}

fs.writeFileSync(outPath, content, 'utf8');
console.log(`Wrote: ${path.relative(root, outPath)}`);
