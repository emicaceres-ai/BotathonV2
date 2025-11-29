import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  // loadEnv carga automáticamente variables con prefijo VITE_ desde .env files
  // Para NEXT_PUBLIC_, necesitamos usar envPrefix
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    // Exponer variables de entorno con prefijo NEXT_PUBLIC_ para Vercel
    // Esto permite que import.meta.env.NEXT_PUBLIC_* esté disponible en el cliente
    envPrefix: ['NEXT_PUBLIC_', 'VITE_'],
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
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'chart-vendor': ['recharts']
          }
        }
      }
    },
    // No usar define para variables de entorno - Vite las expone automáticamente con envPrefix
    // Las variables NEXT_PUBLIC_* estarán disponibles en import.meta.env.NEXT_PUBLIC_*
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      }
    }
  };
});
