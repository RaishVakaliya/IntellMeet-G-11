<<<<<<< HEAD
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
=======
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import path from "path";
>>>>>>> updated frontend and backend files

// https://vite.dev/config/
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
<<<<<<< HEAD
  optimizeDeps: {
    exclude: ['sonner']
  },
  plugins: [react()],
  server: {
    port: 5173,
    fs: {
      allow: ['..']
=======
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
>>>>>>> updated frontend and backend files
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
