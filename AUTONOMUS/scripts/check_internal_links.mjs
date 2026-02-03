#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const blogDir = path.join(root, 'src', 'content', 'blog');

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(fp));
    else if (ent.isFile() && fp.endsWith('.md')) out.push(fp);
  }
  return out;
}

// Count internal links of the form ](/...)
function countInternalLinks(md) {
  // strip frontmatter
  md = md.replace(/^---[\s\S]*?---\n/, '');
  const links = md.match(/\]\((\/[^\)\s]+)\)/g) || [];
  // ignore image links ![](...)
  const filtered = links.filter(l => !l.startsWith('!'));
  return filtered.length;
}

const files = walk(blogDir);
const minLinks = Number(process.env.MIN_INTERNAL_LINKS ?? 2);
let bad = 0;

for (const fp of files) {
  const md = fs.readFileSync(fp, 'utf8');
  const n = countInternalLinks(md);
  if (n < minLinks) {
    bad++;
    console.log(`LOW: ${path.relative(root, fp)} internalLinks=${n} (min=${minLinks})`);
  }
}

if (bad) {
  console.log(`\nFAIL: ${bad} posts below min internal links (${minLinks}).`);
  process.exit(2);
}

console.log(`OK: all posts have >= ${minLinks} internal links.`);
