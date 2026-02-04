import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentRoot = path.join(root, "src", "content");

const collections = [
  { name: "blog", dir: path.join(contentRoot, "blog") },
  { name: "guide", dir: path.join(contentRoot, "guide") },
  { name: "videos", dir: path.join(contentRoot, "videos") },
];

function listMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(dir, file));
}

function parseFrontmatter(content) {
  if (!content.startsWith("---")) return { data: {}, body: content };
  const end = content.indexOf("\n---", 3);
  if (end === -1) return { data: {}, body: content };
  const fmRaw = content.slice(3, end).trim();
  const body = content.slice(end + 4);
  const data = {};
  const lines = fmRaw.split(/\r?\n/);
  let currentKey = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    if (/^\s*-\s+/.test(line) && currentKey) {
      const val = line.replace(/^\s*-\s+/, "").trim();
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(val.replace(/^"|"$/g, "").replace(/^'|'$/g, ""));
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
    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        const json = value.replace(/'/g, '"');
        data[key] = JSON.parse(json);
      } catch {
        data[key] = value;
      }
    } else {
      data[key] = value.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
    }
  }
  return { data, body };
}

function summarizeBlog(files) {
  const issues = {
    missingTitle: [],
    missingPubDate: [],
    missingDescription: [],
    weakDescription: [],
    missingTags: [],
    draft: [],
    lowWordCount: [],
    lowHeadings: [],
    placeholderText: [],
  };

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const { data, body } = parseFrontmatter(content);
    const rel = path.relative(root, file);

    if (!data.title) issues.missingTitle.push(rel);
    if (!data.pubDate) issues.missingPubDate.push(rel);
    if (!data.description) issues.missingDescription.push(rel);
    if (data.description && String(data.description).trim().length < 80)
      issues.weakDescription.push(rel);
    if (!data.tags || data.tags.length === 0) issues.missingTags.push(rel);
    if (data.draft === true || data.draft === "true") issues.draft.push(rel);

    // Quality heuristics: catches low-effort output early.
    const bodyOnly = String(body ?? "");
    const words = bodyOnly
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/<[^>]+>/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    const wordCount = words.length;
    const MIN_WORDS = 650;
    if (wordCount < MIN_WORDS)
      issues.lowWordCount.push(`${rel} (${wordCount} words)`);

    const h2Count = (bodyOnly.match(/^##\s+/gm) || []).length;
    const MIN_H2 = 4;
    if (h2Count < MIN_H2) issues.lowHeadings.push(`${rel} (${h2Count} h2)`);

    const placeholders = [
      "TODO",
      "TBD",
      "Keep this section practical",
      "[insert",
      "lorem ipsum",
    ];
    const found = placeholders.filter((p) =>
      bodyOnly.toLowerCase().includes(p.toLowerCase()),
    );
    if (found.length > 0)
      issues.placeholderText.push(`${rel} (found: ${found.join(", ")})`);
  }

  return issues;
}

const counts = collections.map((col) => ({
  name: col.name,
  files: listMarkdown(col.dir),
}));

const blog = counts.find((c) => c.name === "blog");
const blogIssues = blog ? summarizeBlog(blog.files) : null;

console.log("AUTONOMUS SEO Verify");
console.log("=====================");
for (const col of counts) {
  console.log(`${col.name}: ${col.files.length}`);
}

if (blogIssues) {
  console.log("\nBlog checks (SEO hygiene):");
  const order = [
    ["missingTitle", "Missing title"],
    ["missingPubDate", "Missing pubDate"],
    ["missingDescription", "Missing description"],
    ["weakDescription", "Weak description (<80 chars)"],
    ["missingTags", "Missing tags"],
    ["draft", "Draft content"],
    ["lowWordCount", "Low word count (<650)"],
    ["lowHeadings", "Too few H2 headings (<4)"],
    ["placeholderText", "Placeholder text"],
  ];
  for (const [key, label] of order) {
    const list = blogIssues[key];
    console.log(`- ${label}: ${list.length}`);
    if (list.length > 0) {
      for (const item of list) console.log(`  - ${item}`);
    }
  }
}

const total = counts.reduce((sum, col) => sum + col.files.length, 0);
console.log(`\nTotal markdown content: ${total}`);
