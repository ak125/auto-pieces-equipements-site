import { defineConfig } from 'vite';
import { publicFiles } from './scripts/site-config.mjs';

export default defineConfig({
  // Use the same public pages as the static build, excluding legacy dashboards.
  optimizeDeps: {
    entries: publicFiles.filter((file) => file.endsWith('.html'))
  },
  server: {
    port: 3000,
    open: true
  }
});
