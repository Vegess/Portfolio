/*
 * Generates public/og.png (1200×630) from the hand-written SVG below.
 * Rendering uses Playwright's Chromium if it is available on this machine; it is a
 * one-off tool, not a site dependency. Run: npm run og   (then commit public/og.png)
 */
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch {
  console.error("Playwright isn't installed here. Run: npx -y playwright@1 install chromium, then retry with NODE_PATH set to its location.");
  process.exit(1);
}

const steps = 60;
const line = (f) => Array.from({ length: steps + 1 }, (_, i) => `${i ? "L" : "M"}${80 + (i * 1040) / steps} ${f(i).toFixed(1)}`).join(" ");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g1" cx="85%" cy="0%" r="70%"><stop offset="0" stop-color="#6b93ff" stop-opacity=".22"/><stop offset="1" stop-color="#6b93ff" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="0%" cy="40%" r="60%"><stop offset="0" stop-color="#a78bfa" stop-opacity=".16"/><stop offset="1" stop-color="#a78bfa" stop-opacity="0"/></radialGradient>
    <linearGradient id="t" x1="0" x2="1"><stop offset="0" stop-color="#6b93ff"/><stop offset=".55" stop-color="#a78bfa"/><stop offset="1" stop-color="#2dd4bf"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0a0c10"/><rect width="1200" height="630" fill="url(#g1)"/><rect width="1200" height="630" fill="url(#g2)"/>
  <text x="80" y="120" fill="#929cae" font-family="ui-monospace, Menlo, monospace" font-size="26" letter-spacing="3">K ANIRUDH · AI ENGINEER</text>
  <text font-family="Inter, 'Segoe UI', system-ui, sans-serif" font-weight="750" font-size="68" letter-spacing="-2" fill="#eef1f6">
    <tspan x="80" y="228">Building <tspan fill="url(#t)">RAG products</tspan></tspan>
    <tspan x="80" y="308">and the agents that keep</tspan>
    <tspan x="80" y="388">them running.</tspan>
  </text>
  <path d="M80 560 H1120" stroke="#262d3a" stroke-width="2"/>
  <path d="${line((i) => 505 + Math.sin(i / 3.4) * 16)}" fill="none" stroke="#6b93ff" stroke-width="3" stroke-linejoin="round"/>
  <path d="${line((i) => 540 - Math.floor(i / 8) * 9)}" fill="none" stroke="#2dd4bf" stroke-width="3" stroke-linejoin="round"/>
  <path d="${line((i) => (i === 38 ? 450 : i === 39 ? 560 : i === 40 ? 500 : 520 + Math.sin(i / 2) * 3))}" fill="none" stroke="#a78bfa" stroke-width="3" stroke-linejoin="round"/>
  <text x="80" y="606" fill="#929cae" font-family="ui-monospace, Menlo, monospace" font-size="22">Citebase · Nightwarden · SlipCast</text>
</svg>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
writeFileSync(new URL("../public/og.png", import.meta.url), await page.screenshot({ type: "png" }));
await browser.close();
console.log("wrote public/og.png");
