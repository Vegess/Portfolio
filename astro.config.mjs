import { defineConfig } from "astro/config";

export default defineConfig({
  // TODO: set this to your real domain once the Vercel project exists (used for canonical URLs,
  // Open Graph image URLs and the sitemap).
  site: "https://todo-set-your-domain.vercel.app",
  output: "static",
  trailingSlash: "ignore",
  build: { format: "directory", inlineStylesheets: "always" },
});
