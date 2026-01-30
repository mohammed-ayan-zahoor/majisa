import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression()
  ],
  esbuild: {
    drop: ['console', 'debugger'], // Remove console/debugger in production
  },
  build: {
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild', // Use esbuild for speed (default)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Icons bundle
            if (id.includes('lucide-react')) return 'icons';

            // PDF generation bundle
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'pdf';

            // Animations bundle
            if (id.includes('framer-motion')) return 'animations';

            // React Query bundle
            if (id.includes('@tanstack/react-query')) return 'react-query';

            // Router bundle
            if (id.includes('react-router-dom')) return 'router';

            // Core React bundle
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';

            // Everything else
            return 'vendor';
          }
        },
      },
    },
  },

})
