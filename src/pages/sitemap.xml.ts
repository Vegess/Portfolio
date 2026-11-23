import type { APIRoute } from "astro";
import { PROJECTS } from "../data/projects";

/* Hand-written sitemap: the home page and one page per project. */
export const GET: APIRoute = ({ site }) => {
  const urls = ["/", ...PROJECTS.map((p) => `/projects/${p.slug}/`)].map((p) => new URL(p, site).href);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
};
