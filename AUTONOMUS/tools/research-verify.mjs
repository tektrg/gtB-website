import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const researchDir = path.join(root, 'AUTONOMUS', 'research', 'blog');

function parseArgs(argv) {
  const args = { topic: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--topic') args.topic = argv[++i];
    else throw new Error(`Unknown arg: ${a}`);
  }
  if (!args.topic) throw new Error('Missing required arg: --topic <topicId>');
  return args;
}

function section(content, headingRegex) {
  const m = content.match(headingRegex);
  if (!m) return null;
  const start = m.index ?? 0;
  const rest = content.slice(start + m[0].length);
  const next = rest.match(/^##\s+/m);
  return next ? rest.slice(0, next.index) : rest;
}

function validate(content) {
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

const args = parseArgs(process.argv);
const file = path.join(researchDir, `${args.topic}.md`);
if (!fs.existsSync(file)) {
  console.error(`Missing research file: ${path.relative(root, file)}`);
  process.exit(2);
}

const content = fs.readFileSync(file, 'utf8');
const problems = validate(content);

if (problems.length > 0) {
  console.error(`Research not ready for ${args.topic}:`);
  for (const p of problems) console.error(`- ${p}`);
  process.exit(2);
}

console.log(`Research OK: ${args.topic}`);
