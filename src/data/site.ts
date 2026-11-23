/*
 * Everything personal lives here. Values starting with "TODO" render as clearly
 * marked placeholders on the page (never as broken links) until you replace them.
 * `npm run check:content` lists whatever is still missing.
 */
export const SITE = {
  name: "K Anirudh",
  role: "AI engineer",
  tagline: "AI engineer building RAG products and the agents that keep them running.",
  description:
    "K Anirudh, AI engineer. Case studies: Citebase (cited answers from company documents), Nightwarden (the agent that monitors it in production), SlipCast (delivery forecasting).",
  github: "https://github.com/Vegess",
  linkedin: "https://www.linkedin.com/in/anirudh-k-908542227/",
  email: "kanirudh1503@gmail.com",
};

export const isTodo = (v: string) => v.startsWith("TODO");
