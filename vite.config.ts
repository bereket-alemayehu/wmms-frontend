import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: Number(process.env.PORT) || 3000, // Use Render's PORT environment variable
    host: true,                             // Allow network access
  },
  preview: {
    port: Number(process.env.PORT) || 4173, // Use the same PORT for preview
    host: true,                             // Allow network access
    allowedHosts: ['wmms-frontend.onrender.com'], // Allow your Render host
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
