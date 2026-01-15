// scripts/generateCategory.js
import fs from 'fs';
import path from 'path';

const DOCS_DIR = './docs';
const META_PATH = path.join(DOCS_DIR, 'metadata.json');

// 检查 metadata.json 是否存在
if (!fs.existsSync(META_PATH)) {
  console.error('❌ metadata.json not found. Please run generateMeta.js first.');
  process.exit(1);
}

// 读取元数据
const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
const categories = Object.keys(meta.categoryStats || {}).filter(cat => cat && cat.trim());

if (categories.length === 0) {
  console.warn('⚠️ No valid categories found in metadata.json');
  process.exit(0);
}

let generatedCount = 0;

for (const cat of categories) {
  const safeCat = cat.trim();
  if (!safeCat) continue;

  const categoryDir = path.join(DOCS_DIR, safeCat);

  // 如果分类目录不存在，跳过（理论上不应发生）
  if (!fs.existsSync(categoryDir)) {
    console.warn(`⚠️ Skipping category "${safeCat}": directory not found.`);
    continue;
  }

  const indexPath = path.join(categoryDir, 'index.md');
  const AUTO_COMMENT = '<!-- Auto-generated category list page -->';

  let shouldWrite = true;

  // 如果 index.md 已存在，检查是否为自动生成
  // if (fs.existsSync(indexPath)) {
  //   const content = fs.readFileSync(indexPath, 'utf8');
  //   if (!content.includes(AUTO_COMMENT)) {
  //     console.warn(`⚠️ Skipped ${indexPath} (exists and not auto-generated).`);
  //     shouldWrite = false;
  //   }
  // }

  if (!shouldWrite) continue;

  // 生成简洁的 frontmatter-only index.md
  const content = `---
layout: CategoryPage
category: ${safeCat}
---
`;

  fs.writeFileSync(indexPath, content, 'utf8');
  console.log(`✅ Generated: ${indexPath}`);
  generatedCount++;
}

console.log(`\n✨ Successfully generated index.md for ${generatedCount} categories.`);