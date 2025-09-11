import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    // Code splitting optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'search-vendor': ['fuse.js'],
          // Separate page chunks
          'pages': [
            './src/pages/HomePage.tsx',
            './src/pages/CertificationsPage.tsx',
            './src/pages/RankingsPage.tsx',
            './src/pages/CompaniesPage.tsx',
            './src/pages/ComparePage.tsx'
          ],
          // Separate service chunks
          'services': ['./src/services/dataService.ts', './src/services/searchService.ts'],
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash].${ext}`
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        }
      }
    },
    // Minification and optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Enable gzip compression support
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: false,
    // Target modern browsers for better optimization
    target: 'es2020',
  },
  // Dev server optimizations
  server: {
    port: 3000,
    hmr: {
      overlay: false,
    },
  },
  // Dependencies to pre-bundle for faster dev startup
  optimizeDeps: {
    include: [
      'react',
      'react-dom', 
      'react-router-dom',
      'lucide-react',
      'fuse.js',
      'axios'
    ],
  },
})
