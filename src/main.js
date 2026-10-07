import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './routes'
import { hit } from './composables/analytics'
import './style.css'

export const createApp = ViteSSG(
  App,
  {
    routes,
    scrollBehavior(to, from, saved) {
      if (saved) return saved
      if (to.hash) return new Promise((resolve) => setTimeout(() => resolve({ el: to.hash, top: 72, behavior: 'smooth' }), from.path === to.path ? 0 : 450))
      return { top: 0 }
    },
  },
  ({ app, router, isClient }) => {
    if (isClient) router.afterEach((to, from) => { if (from.matched.length) hit(to.fullPath) })
  },
)
