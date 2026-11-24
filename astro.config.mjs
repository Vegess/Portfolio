import { defineConfig } from "astro/config";

export default defineConfig({
  // Used for canonical URLs, Open Graph image URLs and the sitemap.
  site: "https://portfolio-public-ten-zeta.vercel.app",
  output: "static",
  trailingSlash: "ignore",
  build: { format: "directory", inlineStylesheets: "always" },
});
