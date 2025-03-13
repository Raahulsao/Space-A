import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Remove base path configuration to use root path
  base: '/',
  // Add server configuration for better development experience
  server: {
    host: true,
    port: 3000,
    open: true,
  },
  // Add preview configuration
  preview: {
    port: 3000,
    open: true,
  },
  // Improve build options for better browser compatibility
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
