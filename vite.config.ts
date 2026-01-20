import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    open: true,
    host: true,
  },
  preview: {
    port: Number(process.env.PORT) || 4173,
    host: true,
    allowedHosts: ["wmms-frontend.onrender.com", ".onrender.com"],
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
