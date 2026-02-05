#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mustExist = [
  'astro.config.mjs',
  'src/pages/index.astro',
  'src/pages/rss.xml.js',
  'src/content/blog',
];

let ok = true;
for (const p of mustExist) {
  const fp = path.join(root, p);
  if (!fs.existsSync(fp)) {
    console.error(`MISSING: ${p}`);
    ok = false;
  }
}

// check for sitemap integration
const astroCfg = fs.readFileSync(path.join(root, 'astro.config.mjs'), 'utf8');
if (!astroCfg.includes('@astrojs/sitemap') && !astroCfg.includes('sitemap(')) {
  console.error('WARN: sitemap integration not detected in astro.config.mjs');
}

// check public/robots.txt
if (!fs.existsSync(path.join(root, 'public', 'robots.txt'))) {
  console.error('WARN: public/robots.txt missing (recommended)');
}

console.log(ok ? 'OK: site basics present' : 'FAIL: missing required files');
process.exit(ok ? 0 : 1);
