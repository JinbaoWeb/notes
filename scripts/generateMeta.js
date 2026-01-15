// scripts/generateMeta.js
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from 'url';

// 兼容 ESM 的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const DOCS_DIR = path.resolve(__dirname, '../docs');
const IGNORE_DIRS = new Set(['.vitepress', 'public', 'assets', '.git']);
const IGNORE_FILENAMES = new Set(['index.md', 'README.md', 'metadata.json']);

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

/**
 * 递归遍历目录，返回所有符合条件的 .md 文件（POSIX 路径）
 */
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.has(file)) {
        results = results.concat(walk(fullPath));
      }
    } else if (
      file.endsWith('.md') &&
      !IGNORE_FILENAMES.has(file)
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

try {
  console.log(`🔍 Scanning docs directory: ${DOCS_DIR}`);
  const allFiles = walk(DOCS_DIR);
  console.log(`📄 Found ${allFiles.length} markdown files`);

  const articles = [];
  const categoryStats = {};

  for (const file of allFiles) {
    // 获取相对于 docs/ 的路径（统一使用 / 分隔符）
    const relative = path.relative(DOCS_DIR, file).replace(/\\/g, '/');
    const parts = relative.split('/');
    const category = parts.length > 1 ? parts[0] : 'Uncategorized';

    // 统计
    categoryStats[category] = (categoryStats[category] || 0) + 1;

    // 读取内容
    const content = fs.readFileSync(file, 'utf8');
    const title = extractTitleFromMarkdown(content) || humanizeFilename(path.basename(file, '.md'));

    // 构造链接（VitePress 生成 .html）
    const slug = '/' + relative.replace(/\.md$/, '');
    const link = slug + '.html';

    // 获取最后修改时间
    const mtime = fs.statSync(file).mtime;
    const date = mtime.toISOString().split('T')[0]; // YYYY-MM-DD

    articles.push({ title, slug, link, category, date });
  }

  // 最近 5 篇
  const recentPosts = [...articles]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const metadata = {
    articles,
    categoryStats,
    recentPosts
  };

  const outputPath = path.join(DOCS_DIR, 'metadata.json');
  fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2), 'utf8');

  console.log(`✅ Successfully generated metadata.json`);
  console.log(`   - Total articles: ${articles.length}`);
  console.log(`   - Categories: ${Object.keys(categoryStats).join(', ')}`);
} catch (err) {
  console.error('❌ Error generating metadata:', err.message);
  process.exit(1);
}
