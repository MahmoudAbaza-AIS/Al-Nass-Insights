import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const src = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Local `npm run dev` proxies /api → Insights.Presentation (launchSettings :5080).
  // Docker UI uses nginx instead; this proxy is only for the Vite dev server.
  const proxyTarget = env.VITE_DEV_PROXY_TARGET?.trim() || "http://localhost:5080";

  return {
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
        "/api": { target: proxyTarget, changeOrigin: true },
        "/health": { target: proxyTarget, changeOrigin: true },
        "/openapi": { target: proxyTarget, changeOrigin: true },
        "/scalar": { target: proxyTarget, changeOrigin: true },
      },
    },
  };
});
