import { defineConfig } from 'vite';

export default defineConfig({
  // Scan the public entry point, not archived dashboards or temporary checkouts.
  optimizeDeps: {
    entries: ['index.html']
  },
  server: {
    port: 3000,
    open: true
  }
});
