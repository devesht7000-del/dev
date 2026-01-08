import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase-vendor';
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('lucide-react')) return 'icons-vendor';
            if (id.includes('date-fns')) return 'date-fns-vendor';
            return 'vendor';
          }
        }
      }
    }
  }
})
