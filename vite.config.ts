import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Project Pages: https://<user>.github.io/<repo>/
// 生产构建使用子路径；本地 dev 仍用根路径 /
// https://vite.dev/guide/static-deploy.html#github-pages
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/job-tracker/' : '/',
}))
