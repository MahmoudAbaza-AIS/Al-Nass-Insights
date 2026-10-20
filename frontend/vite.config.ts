import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const src = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@app": src("app"),
      "@modules": src("modules"),
      "@contracts": src("contracts"),
      "@infrastructure": src("infrastructure"),
      "@shared": src("shared"),
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:5080", changeOrigin: true },
      "/health": { target: "http://localhost:5080", changeOrigin: true },
      "/openapi": { target: "http://localhost:5080", changeOrigin: true },
      "/scalar": { target: "http://localhost:5080", changeOrigin: true },
    },
  },
});
