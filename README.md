# Portfolio: K Anirudh

My personal site: case studies of [Citebase](https://github.com/Vegess/citebase), [Nightwarden](https://github.com/Vegess/nightwarden), [SlipCast](https://github.com/Vegess/SlipCast) and [DebateSphere](https://github.com/Vegess/DebateSphere--Real-Time-AI-Powered-Fact-Checked-Debate-Platform).

- **Astro, static output.** The only dependency is `astro`.
- **Vanilla CSS and hand-written inline SVG.** No UI, animation or chart libraries.
- **Motion, all hand-written:** CSS keyframes, SVG `stroke-dashoffset` draw-ins, IntersectionObserver reveals, `requestAnimationFrame` count-ups, cross-page View Transitions (`@view-transition`). With `prefers-reduced-motion`, everything renders in its final state and nothing loops.
- **Content:** `src/data/projects.ts`. Facts and numbers come from each project's README and code on GitHub, and from my current resume.

## Develop

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # static site in dist/
npm run check:content  # checks no placeholders are left
npm run og             # regenerates public/og.png (needs Playwright's Chromium on this machine)
```

## Deploy (Vercel)

Live at **https://portfolio-public.vercel.app**. Vercel builds every push to `main` (framework preset Astro, root directory left empty, no environment variables). If the domain changes, update `site` in `astro.config.mjs`.
