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
  // TODO: your LinkedIn profile URL, e.g. "https://www.linkedin.com/in/your-handle/"
  linkedin: "TODO_LINKEDIN_URL",
  // TODO: your public contact email, e.g. "you@example.com"
  email: "TODO_EMAIL",
  // TODO: add your resume as public/resume.pdf (the link stays a placeholder until the file exists)
  resume: "/resume.pdf",
};

export const isTodo = (v: string) => v.startsWith("TODO");
