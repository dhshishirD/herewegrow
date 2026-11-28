import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { blogSeed } from './scripts/blog'
import { careersSeed } from './scripts/careers'
import { seoPages } from './scripts/seo'

/**
 * The ONNX runtime package points at its own 14-27 MB .wasm files. Transformers.js loads them from the jsDelivr CDN instead
 * (see src/lib/cvPhotoWorker.ts), and Cloudflare static assets are limited to 25 MiB per file, so keep them out of dist.
 */
const dropOrtWasm = (): Plugin => ({
  name: 'hwg-drop-ort-wasm',
  generateBundle(_, bundle) {
    for (const key of Object.keys(bundle)) if (/ort-wasm[^/]*\.wasm$/.test(key)) delete bundle[key];
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    blogSeed(),
    careersSeed(),
    seoPages(),
    dropOrtWasm(),
  ],
  worker: { plugins: () => [dropOrtWasm()] },
})
