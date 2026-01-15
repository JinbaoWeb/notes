import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const DOCS_DIR = path.resolve("docs");
const OUTPUT = path.resolve("docs/.vitepress/metadata.json");

// 获取 git 最后提交时间
function getGitTime(filePath) {
  try {
    const output = execSync(
      `git log -1 --format=%ct -- "${filePath}"`,
      { encoding: "utf8" }
    ).trim();
    return output ? new Date(parseInt(output) * 1000).toISOString() : null;
  } catch {
    return null;
  }
}
/**
 * 提取 Markdown 标题
 */
function extractTitleFromMarkdown(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * 将文件名转为可读标题（如 hello-world.md → Hello World）
 */
function humanizeFilename(filename) {
  return filename
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
// 递归扫描 docs 下的 md 文件
function scanDocs(dir) {
  const result = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      result.push(...scanDocs(fullPath));
    } else if (file.endsWith(".md")) {
      const relPath = path.relative(DOCS_DIR, fullPath);
      const category = path.dirname(relPath) === "." ? "root" : path.dirname(relPath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const title = extractTitleFromMarkdown(content) || humanizeFilename(path.basename(file, '.md'));
      const slug = "/" + relPath.replace(/\\/g, "/");
      const link = slug + '.html';
      const date = getGitTime(fullPath)
      result.push({ title, slug, link, category, date });
    }
  }
  return result;
}

const articles = scanDocs(DOCS_DIR);
console.log(`✅ 共 ${articles.length} 篇文章`);
console.log(`✅ articles = ${JSON.stringify(articles, null, 2)}`);

// 最近 5 篇
  const recentPosts = [...articles]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const metadata = {
    articles,
    recentPosts
  };

console.log(`✅ metadata = ${JSON.stringify(metadata, null, 2)}`);

fs.writeFileSync(OUTPUT, JSON.stringify(metadata, null, 2));
