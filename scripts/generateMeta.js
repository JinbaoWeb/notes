// scripts/generateMeta.js
import fs from 'fs';
import path from 'path';

const DOCS_DIR = './docs';
const IGNORE_DIRS = new Set(['.vitepress', 'public', 'category']);
const IGNORE_FILENAMES = new Set(['index.md', 'README.md', 'metadata.json']);

function extractTitleFromMarkdown(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function humanizeFilename(filename) {
  return filename
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      const dirName = path.basename(fullPath);
      if (!IGNORE_DIRS.has(dirName)) {
        results = results.concat(walk(fullPath));
      }
    } else if (
      file.endsWith('.md') &&
      !IGNORE_FILENAMES.has(file)
    ) {
      results.push(fullPath);
    }
  });
  return results;
}

const allFiles = walk(DOCS_DIR);
const articles = [];
const categoryStats = {};

for (const file of allFiles) {
  const relative = path.relative(DOCS_DIR, file);
  const parts = relative.split(path.sep);
  const category = parts.length > 1 ? parts[0] : 'Uncategorized';

  // 更新分类统计
  categoryStats[category] = (categoryStats[category] || 0) + 1;

  // 读取内容提取标题
  const content = fs.readFileSync(file, 'utf8');
  const title = extractTitleFromMarkdown(content) || humanizeFilename(path.basename(file, '.md'));

  // 构造 slug 和链接
  const slug = '/' + relative.replace(/\\/g, '/').replace(/\.md$/, '');
  const link = slug + '.html';

  // 获取最后修改时间作为日期
  const mtime = fs.statSync(file).mtime;
  const date = mtime.toISOString().split('T')[0]; // YYYY-MM-DD

  articles.push({ title, slug, link, category, date });
}

// 最近 5 篇文章（按日期倒序）
const recentPosts = [...articles]
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, 5);

const metadata = {
  articles,
  categoryStats,
  recentPosts
};

fs.writeFileSync(path.join(DOCS_DIR, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf8');
console.log(`✅ Generated metadata.json with ${articles.length} articles (excluded index.md / README.md).`);
