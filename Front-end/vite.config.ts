import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Exponer variables de entorno con prefijo VITE_ (estándar de Vite)
  envPrefix: ['VITE_'],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  css: {
    devSourcemap: true
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separar vendor chunks de forma más específica
          if (id.includes('node_modules')) {
            // React core debe estar separado
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'react-core';
            }
            // React Router debe estar en su propio chunk
            if (id.includes('react-router')) {
              return 'react-router';
            }
            // Recharts en su propio chunk
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            // Resto de vendors
            return 'vendor';
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});
