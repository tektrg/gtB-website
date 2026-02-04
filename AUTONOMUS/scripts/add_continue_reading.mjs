#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const blogDir = path.join(root, 'src', 'content', 'blog');

const MIN_LINKS = Number(process.env.MIN_LINKS ?? 2);
const NUM_SUGGEST = Number(process.env.NUM_SUGGEST ?? 3);

function listMarkdown(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(dir, f));
}

function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n/);
  const fm = m ? m[1] : '';
  const get = (key) => {
    const r = new RegExp(`^${key}:\\s*(.+)$`, 'm');
    const mm = fm.match(r);
    return mm ? mm[1].trim().replace(/^"|"$/g, '') : null;
  };
  return { fm, title: get('title'), pubDate: get('pubDate') };
}

function stripFrontmatter(md) {
  return md.replace(/^---[\s\S]*?---\n/, '');
}

function getSlugFromPath(fp) {
  return path.basename(fp, '.md');
}

function countInternalLinks(md) {
  const body = stripFrontmatter(md);
  const links = body.match(/\]\((\/[^\)\s]+)\)/g) || [];
  const filtered = links.filter((l) => !l.startsWith('!'));
  return filtered.length;
}

function upsertContinueReading(md, links) {
  // remove existing block if present
  md = md.replace(/\n## Continue reading\n[\s\S]*?(?=\n#|\n## (?!Continue reading)|\n\Z)/, '\n');
  const block =
    `\n\n## Continue reading\n` +
    links.map((l) => `- [${l.text}](${l.url})`).join('\n') +
    `\n`;
  return md.trimEnd() + block + '\n';
}

const files = listMarkdown(blogDir);

// Build post index sorted by pubDate desc
const posts = files
  .map((fp) => {
    const md = fs.readFileSync(fp, 'utf8');
    const { title, pubDate } = parseFrontmatter(md);
    return { fp, slug: getSlugFromPath(fp), title: title ?? getSlugFromPath(fp), pubDate: pubDate ?? '' };
  })
  .sort((a, b) => (b.pubDate || '').localeCompare(a.pubDate || ''));

const bySlug = new Map(posts.map((p) => [p.slug, p]));

let changed = 0;
for (const p of posts) {
  const fp = p.fp;
  const md = fs.readFileSync(fp, 'utf8');
  const internalCount = countInternalLinks(md);
  if (internalCount >= MIN_LINKS) continue;

  // suggest newest posts excluding self
  const suggestions = posts
    .filter((x) => x.slug !== p.slug)
    .slice(0, NUM_SUGGEST)
    .map((x) => ({ url: `/blog/${x.slug}/`, text: x.title }));

  const next = upsertContinueReading(md, suggestions);
  if (next !== md) {
    fs.writeFileSync(fp, next, 'utf8');
    changed++;
    console.log(`UPDATED: ${path.relative(root, fp)} (internalLinks=${internalCount} -> add continue reading)`);
  }
}

console.log(`Done. Changed ${changed} file(s).`);
