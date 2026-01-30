import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    minify: 'terser', // Use terser for better compression
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console methods
      },
      format: {
        comments: false, // Remove all comments
      },
    },
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
  server: {
    // Enable compression in dev server
    compress: true,
  },
})
