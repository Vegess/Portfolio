/*
 * Project case studies. Every fact and number here is taken from the project's own README
 * on GitHub (linked as `repo`). Nothing is estimated or rounded up: where a README reports
 * run-to-run variance or synthetic data, the text says so next to the number.
 */

export type Metric = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
};

export type DNode = { id: string; label: string; sub?: string; x: number; y: number; w?: number; h?: number; tone?: "accent" | "muted" | "warn" };
export type DEdge = [from: string, to: string, opts?: { dashed?: boolean; label?: string }];
export type DiagramSpec = { w: number; h: number; nodes: DNode[]; edges: DEdge[]; title: string };

export type Section = { heading: string; items: string[] };
export type ResultTable = { caption: string; head: string[]; rows: string[][]; note?: string };

export type Project = {
  slug: string;
  name: string;
  accent: string; // CSS colour; one per project
  status: "Live" | "In progress";
  oneLiner: string;
  problem: string;
  built: string;
  metrics: Metric[];
  metricsNote?: string;
  stack: string[];
  live?: string;
  repo: string;
  cardDiagram: DiagramSpec;
  diagram: DiagramSpec;
  page: {
    problem: string[];
    decisions: Section;
    results: { intro: string; tables: ResultTable[] };
    limitations: string[];
    next: string[];
  };
};

// Card diagrams: four steps laid out as a 2×2 loop (→ ↓ ←), large enough to read on a phone.
const SNAKE = [[4, 4], [216, 4], [216, 96], [4, 96]];
const row4 = (labels: [string, string?][]): DNode[] =>
  labels.map(([label, sub], i) => ({ id: `n${i}`, label, sub, x: SNAKE[i][0], y: SNAKE[i][1], w: 180, h: 52 }));
const chain = (n: number): DEdge[] => Array.from({ length: n - 1 }, (_, i) => [`n${i}`, `n${i + 1}`]);

export const PROJECTS: Project[] = [
  {
    slug: "citebase",
    name: "Citebase",
    accent: "#6b93ff",
    status: "Live",
    oneLiner: "Answers from your company's documents, with sources.",
    problem:
      "Company policies, handbooks and contracts sit in files nobody can search, and a generic chatbot can't say where an answer came from.",
    built:
      "A multi-tenant RAG app: upload PDFs, Word, Markdown or text, ask questions, and every claim links to the exact passage it came from. Hybrid search, a research agent, a conflict checker and knowledge-gap insights.",
    metrics: [
      { value: 24, label: "scored eval questions, written before measuring" },
      { value: 4, prefix: "≤", label: "planned steps per research-agent answer, each shown live" },
      { value: 117, label: "automated tests in the suite" },
    ],
    stack: ["FastAPI", "PostgreSQL + pgvector", "fastembed (ONNX)", "Groq · Gemini · Anthropic", "React + Vite", "Docker · Render · Vercel"],
    live: "https://documind-beta-lac.vercel.app",
    repo: "https://github.com/Vegess/citebase",
    cardDiagram: {
      w: 400, h: 152, title: "Citebase: upload, index, hybrid search, cited answer",
      nodes: row4([["Upload", "PDF · Word · MD"], ["Index", "chunk + embed"], ["Hybrid search", "vector + keyword"], ["Answer", "cited [1] [2]"]]),
      edges: chain(4),
    },
    diagram: {
      w: 720, h: 300, title: "Citebase architecture: ingestion job and question path into one Postgres database, filtered by workspace",
      nodes: [
        { id: "up", label: "Upload", sub: "PDF · Word · MD · text", x: 10, y: 20, w: 140 },
        { id: "q", label: "Job queue", sub: "Postgres, SKIP LOCKED", x: 190, y: 20, w: 150 },
        { id: "emb", label: "Chunk + embed", sub: "fastembed, headings kept", x: 380, y: 20, w: 160 },
        { id: "db", label: "Postgres + pgvector", sub: "filtered by org_id", x: 560, y: 110, w: 150, tone: "accent" },
        { id: "ask", label: "Question", sub: "workspace + role checked", x: 10, y: 200, w: 140 },
        { id: "hy", label: "Hybrid search", sub: "vector + full-text · RRF", x: 190, y: 200, w: 150 },
        { id: "llm", label: "LLM", sub: "Groq · Gemini · Anthropic", x: 380, y: 200, w: 160 },
        { id: "ans", label: "Cited answer", sub: "only cited sources shown", x: 560, y: 235, w: 150, tone: "accent" },
      ],
      edges: [["up", "q"], ["q", "emb"], ["emb", "db"], ["ask", "hy"], ["hy", "db", { dashed: true }], ["hy", "llm"], ["llm", "ans"]],
    },
    page: {
      problem: [
        "Teams keep their rules in policies, handbooks and contracts. The answers exist, but finding the right clause in the right version is slow, and a general-purpose chatbot doesn't know a company's rules or say where an answer came from.",
        "Citebase answers from the workspace's own files. Sources are numbered, and only the sources an answer actually cites are shown. When the documents don't cover a question, the answer is classified as \"not in your documents\" and shows up as a knowledge gap for admins.",
      ],
      decisions: {
        heading: "Key decisions and trade-offs",
        items: [
          "Vectors live in pgvector inside the same Postgres database (exact cosine search, org-filtered in SQL). One database to run and back up, and tenant filtering happens where the data is, at the cost of exact rather than approximate search.",
          "Hybrid retrieval: every query runs vector search and Postgres full-text search, fused with reciprocal-rank fusion, so policy codes, amounts and IDs are found as reliably as concepts.",
          "Heading-aware chunks: passages keep the heading they sit under, and tiny neighbouring sections are merged, so retrieved text carries its context.",
          "Background work uses a Postgres-backed queue (SELECT … FOR UPDATE SKIP LOCKED) with retries and backoff instead of a separate broker. Ingestion moves through a strict lifecycle: queued → chunking → embedding → ready, or failed.",
          "The research agent plans up to 4 steps as JSON actions (search, read, finish), so it works on every provider. If the model fails or misbehaves, the agent stops and the answer falls back to a normal search instead of answering from nothing.",
          "Document text reaches the model wrapped in tags and treated as data, never as instructions.",
          "Verified answers are reused with no model call, but only while every cited document is current and visible to the person asking.",
        ],
      },
      results: {
        intro:
          "The evaluation set is a fictional company (Northwind Freight) with 24 scored questions written before measuring. CI runs the eval with a deterministic offline embedder as a gate, and the real-embedding numbers as an informational job summary.",
        tables: [
          {
            caption: "What is measured",
            head: ["Set", "Questions", "Checks"],
            rows: [
              ["Answerable", "18", "retrieval hit@6, MRR"],
              ["Not answerable from the documents", "3", "says \"I don't know\""],
              ["Whole-document tasks", "3", "routing"],
              ["Test suite", "117 tests", "pytest in CI on every push and PR"],
            ],
          },
        ],
      },
      limitations: [
        "Free-tier hosting has cold starts of about 50 seconds after 15 minutes of inactivity.",
        "Scanned PDFs with no extractable text are rejected: there is no OCR yet.",
        "Text beyond 200k characters (about 60 pages) is not indexed; those documents are flagged as truncated.",
        "Daily question limits apply per deployment, per workspace and per user, and answers depend on the chosen LLM provider being available.",
      ],
      next: [
        "OCR, so scanned PDFs can be indexed instead of rejected.",
        "Indexing long documents past the current 200k-character limit.",
      ],
    },
  },
  {
    slug: "nightwarden",
    name: "Nightwarden",
    accent: "#a78bfa",
    status: "Live",
    oneLiner: "The AI on-call agent that monitors Citebase in production.",
    problem:
      "Silent LLM failures: HTTP 200, 0% errors, wrong answers. Citebase once served fallback answers for two days at 100% uptime.",
    built:
      "An AI SRE agent that polls Citebase every 10 minutes, detects anomalies, investigates with four read-only tools and decides what a human should do: page, notify, watch or suppress. Every decision shows its evidence.",
    metrics: [
      { value: 19, suffix: "/20", label: "real emergencies paged on held-out cases (frozen rules: 4/20)" },
      { value: 75, suffix: "%", label: "of silent degradations caught (frozen rules: 0%)" },
      { value: 99, prefix: "−", suffix: "%", label: "database bytes read per poll after cost work" },
    ],
    metricsNote: "Best of two runs of the same agent on the same 48 held-out cases; the other run paged 15/20 and caught 33.3% of silent failures. Results vary by about 15 points between runs.",
    stack: ["FastAPI", "SQLAlchemy 2 + Alembic", "Postgres (Neon)", "Groq tool calling", "Gemini backup", "LangGraph", "vanilla JS", "Vercel"],
    live: "https://nightwarden-swart.vercel.app",
    repo: "https://github.com/Vegess/nightwarden",
    cardDiagram: {
      w: 400, h: 152, title: "Nightwarden: poll Citebase, detect, investigate, decide",
      nodes: row4([["Citebase", "/metrics · logs"], ["Detectors", "5-min window"], ["Agent", "4 read-only tools"], ["Decision", "page … suppress"]]),
      edges: chain(4),
    },
    diagram: {
      w: 720, h: 300, title: "Nightwarden architecture: poller, detectors, triage with a fallback chain, incidents and alerts",
      nodes: [
        { id: "cb", label: "Citebase", sub: "/metrics · logs", x: 10, y: 20, w: 150 },
        { id: "poll", label: "Poller", sub: "every 10 min", x: 200, y: 20, w: 130 },
        { id: "det", label: "Detectors", sub: "5-min window · cooldowns", x: 370, y: 20, w: 170 },
        { id: "groq", label: "Agent on Groq", sub: "tool calling → decide()", x: 10, y: 150, w: 150, tone: "accent" },
        { id: "gem", label: "Gemini backup", sub: "if Groq is down", x: 200, y: 150, w: 130 },
        { id: "rules", label: "Frozen rules", sub: "silent signals page", x: 370, y: 150, w: 170, tone: "warn" },
        { id: "inc", label: "Incident", sub: "merged · escalated", x: 580, y: 150, w: 130 },
        { id: "out", label: "Discord / Slack", sub: "email for pages", x: 580, y: 245, w: 130, tone: "accent" },
      ],
      edges: [["cb", "poll"], ["poll", "det"], ["det", "groq"], ["groq", "gem", { dashed: true }], ["gem", "rules", { dashed: true }], ["rules", "inc"], ["inc", "out"]],
    },
    page: {
      problem: [
        "Nightwarden exists because of a real outage. Citebase's LLM provider retired the model it used, the exception was swallowed, and the app served polite fallback answers for two days. Uptime was 100%, the error rate 0%, and every answer was useless.",
        "Ordinary monitoring can't see that kind of failure. Nightwarden watches the signals that can: fallback answers, empty retrieval, error and latency changes, deploys and restarts.",
      ],
      decisions: {
        heading: "Key decisions and trade-offs",
        items: [
          "Labels and a rules baseline were written and frozen before the agent existed, so neither could be tuned to make the agent look good.",
          "The agent investigates with four read-only tools (recent logs, metrics, deploy history, past incidents) and must end by calling decide. The prompt describes the costs of paging versus missing a failure; it contains no \"signal X means action Y\" rules.",
          "Fail loud: Groq → Gemini → frozen rules. If both models fail, the rules decide and silent-failure signals always page. Anything not decided by Groq is marked degraded.",
          "Two orchestrators for the same agent, a plain tool-calling loop and a LangGraph state machine, compared on the same held-out cases. LangGraph's lead was within run-to-run variance, so it is read as \"no worse\", not as a win.",
          "Free-tier idle restarts are recorded on the timeline, not triaged.",
          "Cost controls: one state row read per poll instead of past snapshots, stored readings keep only the keys something reads, and public reads are edge-cached.",
        ],
      },
      results: {
        intro:
          "60 labelled cases: 12 failure scenarios × 5 seeded variations, replayed from fixtures. The held-out set is variations 1–4: 48 cases never looked at before the run (model openai/gpt-oss-120b).",
        tables: [
          {
            caption: "Held-out: agent vs frozen rules (run of 11–12 Oct 2026)",
            head: ["Metric", "Frozen rules", "Agent"],
            rows: [
              ["Action accuracy", "41.7% (20/48)", "60.4% (29/48)"],
              ["Page recall", "20.0% (4/20)", "95.0% (19/20)"],
              ["Page precision", "100.0% (4/4)", "82.6% (19/23)"],
              ["Silent-degradation recall", "0.0%", "75.0%"],
              ["p95 decision time", "~0 s", "39.5 s (includes free-tier rate-limit waits)"],
            ],
          },
          {
            caption: "Run-to-run variance: the same loop agent, same 48 cases, same model",
            head: ["Run", "Accuracy", "Page recall", "Silent recall"],
            rows: [
              ["11–12 Oct 2026", "60.4%", "95.0%", "75.0%"],
              ["23 Oct 2026", "43.8%", "75.0%", "33.3%"],
            ],
            note: "Results vary by about 15 points between runs, and n = 4 per scenario is small.",
          },
          {
            caption: "Measured Neon egress, 24 h of 10-minute polls",
            head: ["", "Before", "After"],
            rows: [
              ["Bytes read per poll", "316,129 B", "3,043 B (−99%)"],
              ["Bytes read per Live page refresh", "156,927 B", "12,012 B (−92%)"],
            ],
          },
        ],
      },
      limitations: [
        "The labels were written by the person who built the agent; 60 cases is small; fixtures approximate Citebase's real logs but aren't real incidents.",
        "The agent over-escalates benign signals: on held-out cases it never chose suppress.",
        "Free tiers set the pace: 10-minute polls, Groq's daily token cap, Neon's 5 GB transfer.",
      ],
      next: ["Grouping alerts before triage, instead of one LLM call per event."],
    },
  },
  {
    slug: "slipcast",
    name: "SlipCast",
    accent: "#2dd4bf",
    status: "Live",
    oneLiner: "Says a ticket will be late while you're still writing it, and proves how often it's right.",
    problem:
      "Software teams miss delivery dates and can't say why until it's too late. Forecasts are rarely checked against what actually happened.",
    built:
      "Delivery analytics from a CSV export of Jira, GitHub Issues, Trello or Linear: per-ticket reference-class forecasts, a write-time risk check, a 10,000-run Monte Carlo forecast and a ledger that scores every forecast when the real outcome arrives.",
    metrics: [
      { value: 0.85, decimals: 2, label: "ROC-AUC of the slip-risk model (baseline 0.79)" },
      { value: 0.95, decimals: 2, label: "Monte Carlo P85 backtest hit rate (target 0.85)" },
      { value: 0.92, decimals: 2, label: "ticket-type accuracy (baseline 0.37)" },
    ],
    metricsNote: "On the synthetic demo project (430 tickets over six months), with time-based splits.",
    stack: ["Angular 19", "FastAPI", "scikit-learn", "pandas", "PostgreSQL (Neon)", "Groq (optional)", "Docker"],
    live: "https://slip-cast.vercel.app",
    repo: "https://github.com/Vegess/SlipCast",
    cardDiagram: {
      w: 400, h: 152, title: "SlipCast: CSV import, status history, models, scored forecasts",
      nodes: row4([["CSV import", "any tracker"], ["History", "every transition"], ["Models", "risk · Monte Carlo"], ["Ledger", "every forecast scored"]]),
      edges: chain(4),
    },
    diagram: {
      w: 720, h: 300, title: "SlipCast architecture: Angular app, FastAPI, per-project analysis cache feeding models, the forecast ledger and validated advice",
      nodes: [
        { id: "web", label: "Angular 19 SPA", sub: "signals · lazy routes", x: 10, y: 20, w: 150 },
        { id: "api", label: "FastAPI", sub: "auth + tenant checks", x: 200, y: 20, w: 140 },
        { id: "db", label: "PostgreSQL", sub: "tickets + status events", x: 380, y: 20, w: 150 },
        { id: "an", label: "Analysis cache", sub: "pandas, per project/day", x: 200, y: 130, w: 140, tone: "accent" },
        { id: "ml", label: "Models", sub: "risk · Monte Carlo", x: 380, y: 130, w: 150 },
        { id: "led", label: "Forecast ledger", sub: "record → resolve", x: 570, y: 130, w: 140, tone: "accent" },
        { id: "find", label: "Findings F1…Fn", sub: "computed, numbered", x: 200, y: 235, w: 140 },
        { id: "adv", label: "Advisor", sub: "validator · rule fallback", x: 380, y: 235, w: 150 },
        { id: "llm", label: "Groq (optional)", sub: "writes, never computes", x: 570, y: 235, w: 140, tone: "muted" },
      ],
      edges: [["web", "api"], ["api", "db"], ["api", "an"], ["an", "ml"], ["ml", "led"], ["an", "find"], ["find", "adv"], ["adv", "llm", { dashed: true }]],
    },
    page: {
      problem: [
        "Flow metrics and Monte Carlo forecasts work at the level of the whole project, after the fact. Ticket text is mostly ignored, and accuracy is rarely shown to the people relying on the forecast.",
        "SlipCast moves the question to the moment it is cheapest to fix: while someone is typing a ticket, it shows how long similar finished tickets really took (\"Tickets like this took 4–15 days (n=20). You planned 2.\"), the chance of missing the due date and why.",
      ],
      decisions: {
        heading: "Key decisions and trade-offs",
        items: [
          "Models measure, the LLM only writes. Every prediction comes from scikit-learn models or statistics that can be evaluated against a baseline. The LLM gets numbered findings, never raw data, and a validator rejects any suggestion that cites nothing or invents a number.",
          "It degrades gracefully: no API key, a bad response or a rate limit all fall back to rule-based advice, and the app is fully usable without an LLM. Not RAG, not agents: single, grounded calls keep cost, latency and failure modes small.",
          "Time-based evaluation everywhere: train on older tickets, test on newer ones. Random splits leak the future and flatter models.",
          "History is stored as events, not just current status, because cycle time, flow, forecasting and the ledger all need to know when work moved.",
          "404 instead of 403 across tenants, so the API never confirms that another workspace's data exists.",
          "Privacy mode strips ticket titles and theme names from anything sent to the LLM.",
        ],
      },
      results: {
        intro:
          "On the demo project (430 tickets over six months), using time-based splits. The demo data is synthetic, so these numbers show the methods work rather than promise the same accuracy everywhere; the forecast ledger exists to measure accuracy on each team's real tickets.",
        tables: [
          {
            caption: "Model evaluation against simple baselines",
            head: ["Model", "Metric", "SlipCast", "Baseline"],
            rows: [
              ["Ticket-type classifier", "Accuracy", "0.92", "0.37"],
              ["Ticket-type classifier", "Macro F1", "0.89", "0.13"],
              ["Slip-risk model", "ROC-AUC", "0.85", "0.79"],
              ["Reference-class forecast", "P50 error (days)", "2.7", "3.0"],
              ["Monte Carlo (backtest)", "P85 hit rate", "0.95", "0.85 target"],
              ["Forecast ledger (replayed)", "Hit rate within P85", "0.83", "0.85 target"],
            ],
          },
        ],
      },
      limitations: [
        "All published numbers come from synthetic demo data.",
        "In the Ship and Serve modules the reference-class ranges are a little narrow: P10–P90 coverage of 0.69 and 0.71 against a 0.80 target.",
        "The API runs on a free instance that sleeps when idle, so the first load can take up to a minute.",
      ],
      next: [
        "Measuring accuracy on real teams' tickets through the forecast ledger, rather than on the synthetic demo.",
        "Widening the Ship and Serve reference-class ranges to reach the 0.80 coverage target.",
      ],
    },
  },
  {
    slug: "debatesphere",
    name: "DebateSphere",
    accent: "#f5b454",
    status: "In progress",
    oneLiner: "Debate practice with AI feedback and fact-checked statements.",
    problem: "Practising debate is hard without someone to score your arguments and check your facts.",
    built:
      "A Flask web app in progress: trending debate topics, audio upload and recording, AI feedback and scoring, and highlighting of true and false statements.",
    metrics: [],
    stack: ["Flask", "Bootstrap 5", "Chart.js", "JavaScript audio recording"],
    repo: "https://github.com/Vegess/DebateSphere--Real-Time-AI-Powered-Fact-Checked-Debate-Platform",
    cardDiagram: {
      w: 400, h: 152, title: "DebateSphere: topic, audio, AI feedback, score",
      nodes: row4([["Topic", "trending list"], ["Audio", "upload or record"], ["AI feedback", "true / false"], ["Score", "feedback page"]]),
      edges: chain(4),
    },
    diagram: {
      w: 720, h: 170, title: "DebateSphere flow as planned: pick a topic, record or upload audio, get AI feedback, review the score",
      nodes: [
        { id: "t", label: "Topics", sub: "home page", x: 10, y: 50, w: 130 },
        { id: "a", label: "Audio", sub: "upload or record", x: 190, y: 50, w: 130 },
        { id: "f", label: "Flask app", sub: "app.py", x: 370, y: 50, w: 130, tone: "accent" },
        { id: "fb", label: "Feedback", sub: "score + true/false", x: 550, y: 50, w: 160 },
      ],
      edges: [["t", "a"], ["a", "f"], ["f", "fb"]],
    },
    page: {
      problem: [
        "Debate practice needs feedback: how strong an argument was, and whether its claims were true. DebateSphere is an attempt to give that feedback automatically.",
        "This project is in progress. The README describes the intended features; there are no published results yet.",
      ],
      decisions: {
        heading: "Planned scope",
        items: [
          "A home page listing trending debate topics.",
          "Audio upload and in-browser recording for a debate turn.",
          "AI-powered feedback and scoring, with true and false statements highlighted.",
          "A server-rendered Flask app with Bootstrap 5, and Chart.js for score visualisation.",
        ],
      },
      results: { intro: "No results yet. Numbers will appear here once there is an evaluation to report.", tables: [] },
      limitations: ["Early stage: no published evaluation and no live deployment yet."],
      next: ["An evaluation of the fact-checking before any claims about accuracy.", "Tests and CI, as in the other projects."],
    },
  },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
