import DefaultTheme from 'vitepress/theme'
import CategoryPage from './CategoryPage.vue'
import TestPage from './TestPage.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('CategoryPage', CategoryPage)
    app.component('TestPage', TestPage)
  }
}
