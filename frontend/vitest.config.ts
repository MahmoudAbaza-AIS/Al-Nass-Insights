import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

const src = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@app": src("app"),
      "@modules": src("modules"),
      "@contracts": src("contracts"),
      "@infrastructure": src("infrastructure"),
      "@shared": src("shared"),
    },
  },
});
