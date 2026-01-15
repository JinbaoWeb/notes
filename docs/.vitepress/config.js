import fs from 'fs';
import path from 'path';
import mathjax3 from "markdown-it-mathjax3";

// 读取 metadata.json（确保它已由 generateMeta.js 生成）
const metaPath = path.resolve(__dirname, '../metadata.json');
let categories = [];
if (fs.existsSync(metaPath)) {
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  // 获取所有分类名（按字母排序或保持原序）
  categories = Object.keys(meta.categoryStats).sort();
} else {
  console.warn('⚠️ metadata.json not found. Nav will fallback to static list.');
}

// 固定导航项
const fixedNav = [
  { text: "首页", link: "/" },
  // 动态分类项将插入在这里
  { text: "关于", link: "/about" }
];

// 动态生成分类导航项
const categoryNav = categories.map(cat => ({
  text: cat,           // 显示中文分类名（假设目录名就是中文，如 "机器学习"）
  link: `/${cat}`      // 对应 /docs/机器学习/ → 访问 /机器学习
}));

// 合并导航栏：首页 + 分类 + 关于
const nav = [
  fixedNav[0],        // 首页
  ...categoryNav,     // 所有分类
  fixedNav[1]         // 关于
];

// 自定义元素（保持不变）
const customElements = [
  "math","maction","maligngroup","malignmark","menclose","merror","mfenced","mfrac","mi","mlongdiv","mmultiscripts",
  "mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mscarries","mscarry","msgroup","mstack",
  "msline","mspace","msqrt","msrow","mstyle","msub","msup","msubsup","mtable",
  "mtd","mtext","mtr","munder","munderover","semantics","annotation","annotation-xml","mjx-container","mjx-assistive-mml"
];

export default {
  title: "JinbaoWeb",
  description: "Learning by Doing",
  themeConfig: {
    siteTitle: '算法之巅',
    logo: '/favicon.ico',
    nav,
    footer: {
      copyright: 'Copyright © 2017-present Jinbao'
    }
  },
  markdown: {
    config: (md) => {
      md.use(mathjax3);
    },
    image: {
      lazyLoading: true
    }
  },
  // 可选：自动注册 MathML 元素（如果你用到）
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => customElements.includes(tag)
      }
    }
  }
}