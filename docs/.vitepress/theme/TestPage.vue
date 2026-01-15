<template>
  <div style="padding: 20px; background: #e6f7ff; border: 2px solid #1890ff;">
    <h1>✅ Custom Layout LOADED!</h1>
    <p>Category: {{ category }}</p>
    <p v-if="postCount > 0" class="post-count">
          共 {{ postCount }} 篇文章
        </p>
    <p>sortedPosts: {{ sortedPosts }}</p>

    <ul v-if="postCount > 0" class="post-list">
        <li v-for="post in sortedPosts" :key="post.link" class="post-item">
          <a :href="post.link" class="post-title">{{ post.title }}</a>
        </li>
      </ul>
  </div>
</template>

<script setup>
import { useData } from 'vitepress'
import meta from '../../metadata.json'

// ====== 数据获取 ======
const { frontmatter } = useData()
const category = frontmatter.value.category

// 安全防护：如果 category 不存在，显示错误信息（开发时有用）
if (!category) {
  console.error('[CategoryPage] Missing "category" in frontmatter of index.md')
}

// ====== 文章过滤与排序 ======
const postsInCategory = meta.articles?.filter(
  (post) => post.category === category
) || []

const sortedPosts = [...postsInCategory].sort(
  (a, b) => new Date(b.date) - new Date(a.date)
)

const postCount = sortedPosts.length
</script>