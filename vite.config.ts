import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { blogSeed } from './scripts/blog'
import { seoPages } from './scripts/seo'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    blogSeed(),
    seoPages(),
  ],
})
