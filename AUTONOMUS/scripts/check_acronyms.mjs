#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const blogDir = path.join(root, 'src', 'content', 'blog');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(fp));
    else if (entry.isFile() && fp.endsWith('.md')) out.push(fp);
  }
  return out;
}

const files = walk(blogDir);
let mixed = 0;

for (const fp of files) {
  const raw = fs.readFileSync(fp, 'utf8');
  // Ignore URL slugs inside markdown links when counting acronyms.
  const s = raw.replace(/\]\([^\)]+\)/g, ']()');

  const byom = (s.match(/\bBYOM\b/gi) || []).length;
  const byok = (s.match(/\bBYOK\b/gi) || []).length;

  // Allow a single “alias mention” of the secondary acronym.
  // Fail only when BOTH acronyms are used repeatedly.
  const repeatedlyMixed = byom > 1 && byok > 1;
  if (repeatedlyMixed) {
    mixed++;
    console.log(`MIXED: ${path.relative(root, fp)} (BYOM=${byom}, BYOK=${byok})`);
  }
}

if (mixed) {
  console.log(
    `\nFound ${mixed} files using BOTH BYOM and BYOK repeatedly. ` +
      `Recommendation: pick ONE primary term per page; mention the other once as an alias.`
  );
  process.exitCode = 2;
} else {
  console.log('OK: acronym usage consistent (only single alias mentions at most)');
}
