import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { blogData } from './scripts/blog'
import { seoPages } from './scripts/seo'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    blogData(),
    seoPages(),
  ],
})
