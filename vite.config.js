import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // npm run dev открывает главную страницу
  server: { open: '/' },
  ssgOptions: {
    dirStyle: 'nested',
    formatting: 'none',
  },
})
