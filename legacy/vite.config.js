import { defineConfig } from 'vite';

export default defineConfig({
  base: '/auto-pieces-equipements-site/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index-vite.html',
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  define: {
    // Injecter les variables d'environnement dans le build
    'import.meta.env.VITE_GOOGLE_PLACE_ID': JSON.stringify(process.env.GOOGLE_PLACE_ID || 'ChIJVVXZlqAT5kcRICTpgHlqx9A'),
    'import.meta.env.VITE_GOOGLE_API_KEY': JSON.stringify(process.env.GOOGLE_MAPS_API_KEY || '')
  }
});
