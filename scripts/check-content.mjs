/*
 * Lists every placeholder you still need to fill before sharing the site.
 * Exits 1 when any remain, so you can run it with --strict in CI once you're done.
 */
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const todos = [];
const site = read("src/data/site.ts");
if (/linkedin:\s*"TODO/.test(site)) todos.push("LinkedIn URL: src/data/site.ts → linkedin");
if (/email:\s*"TODO/.test(site)) todos.push("Email address: src/data/site.ts → email");
if (read("src/pages/index.astro").includes("TODO: replace this placeholder with your own About text")) todos.push("About text: src/pages/index.astro → #about");
if (read("astro.config.mjs").includes("todo-set-your-domain")) todos.push("Site URL (canonical, OG, sitemap): astro.config.mjs → site");

if (!todos.length) console.log("No placeholders left.");
else { console.log(`${todos.length} placeholder(s) left:`); todos.forEach((t) => console.log(`  - ${t}`)); }
if (process.argv.includes("--strict") && todos.length) process.exit(1);
