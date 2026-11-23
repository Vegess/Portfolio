/*
 * All motion on the site, hand-written:
 *  - [data-reveal] elements fade and rise in once, the first time they scroll into view (IntersectionObserver)
 *  - [data-diagram] SVGs draw their edges in (stroke-dashoffset), then run a slow flow that pauses off-screen
 *  - [data-count] numbers count up with requestAnimationFrame when they become visible
 * With prefers-reduced-motion everything is in its final state at once and nothing loops; the CSS
 * media query does the same for CSS-only effects and turns off cross-page view transitions.
 */
const query = matchMedia("(prefers-reduced-motion: reduce)");
let reduced = query.matches;

function settleAll() {
  document.querySelectorAll<HTMLElement>("[data-reveal], [data-diagram]").forEach((el) => el.classList.add("in"));
  document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => show(el, Number(el.dataset.count)));
}

function show(el: HTMLElement, v: number) {
  const d = Number(el.dataset.decimals || 0);
  el.textContent = `${el.dataset.prefix || ""}${v.toFixed(d)}${el.dataset.suffix || ""}`;
}

function countUp(el: HTMLElement) {
  const to = Number(el.dataset.count);
  if (reduced) return show(el, to);
  const start = performance.now();
  const ms = 900;
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    show(el, to * (1 - (1 - t) ** 3));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

if (reduced || !("IntersectionObserver" in window)) {
  settleAll();
} else {
  const once = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        once.unobserve(el);
        if (el.hasAttribute("data-count")) countUp(el);
        else el.classList.add("in");
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  // Loops (diagram flow) run only while on screen.
  const loops = new IntersectionObserver((entries) => {
    for (const e of entries) e.target.classList.toggle("offscreen", !e.isIntersecting);
  });
  document.querySelectorAll<HTMLElement>("[data-reveal], [data-diagram]").forEach((el) => once.observe(el));
  document.querySelectorAll<HTMLElement>("[data-diagram]").forEach((el) => loops.observe(el));
  document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
    show(el, 0);
    once.observe(el);
  });
}

// Turning reduced motion on mid-visit settles everything immediately.
query.addEventListener("change", () => {
  reduced = query.matches;
  if (reduced) settleAll();
});
