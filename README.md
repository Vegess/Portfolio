# Portfolio: K Anirudh

My personal site: case studies of [Citebase](https://github.com/Vegess/citebase), [Nightwarden](https://github.com/Vegess/nightwarden), [SlipCast](https://github.com/Vegess/SlipCast) and [DebateSphere](https://github.com/Vegess/DebateSphere--Real-Time-AI-Powered-Fact-Checked-Debate-Platform).

- **Astro, static output.** The only dependency is `astro`.
- **Vanilla CSS and hand-written inline SVG.** No UI, animation or chart libraries.
- **Motion, all hand-written:** CSS keyframes, SVG `stroke-dashoffset` draw-ins, IntersectionObserver reveals, `requestAnimationFrame` count-ups, cross-page View Transitions (`@view-transition`). With `prefers-reduced-motion`, everything renders in its final state and nothing loops.
- **Content:** `src/data/projects.ts`. Every fact and number comes from the project's own README.

## Develop

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # static site in dist/
npm run check:content  # lists the placeholders still to fill
npm run og             # regenerates public/og.png (needs Playwright's Chromium on this machine)
```

## Before sharing: fill these in

| What | Where |
|---|---|
| LinkedIn URL | `src/data/site.ts` → `linkedin` |
| Email | `src/data/site.ts` → `email` |
| Site URL | `astro.config.mjs` → `site` (canonical URLs, Open Graph image, sitemap) |

Until you fill them in, these show on the page as dashed **TODO** chips, never as broken links.

## Deploy (Vercel)

Import the repo in Vercel. It detects Astro: the build command is `npm run build` and the output directory is `dist`. Then set `site` in `astro.config.mjs` to the deployed URL and push.
