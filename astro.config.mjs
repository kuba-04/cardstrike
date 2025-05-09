// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  experimental: {
    session: true,
  },
  integrations: [react(), sitemap()],
  server: { port: 3001 },
  vite: {
    plugins: [tailwindcss()],
    define: {
      "process.env":process.env
    },
  },
  adapter: cloudflare({
    platformProxy: { enabled: false }
  }),
});