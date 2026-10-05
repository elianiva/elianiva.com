import type { Work, WorkExperience } from "~/types/work-experience";

/**
 * Every role, in the order both the site and the CV print them.
 *
 * The site prints all of them. The CV prints the ones a recruiter needs, so
 * each entry carries a `cv` flag. Nothing else decides what reaches the PDF.
 */
export const work: Work[] = [
  {
    cv: true,
    company: "Aerotalon",
    position: "Frontend Web Developer",
    time: "contract",
    remote: true,
    country: "Australia",
    period: ["2026-01", null],
    details: [
      "Maintain an aviation information system in React and TypeScript for ~200 operators",
      "Rebuilt permissions from 6 fixed roles to granular RBAC with 40+ permissions, cutting access support requests ~60%",
      "Migrated Webpack and React Router 5 to Vite and React Router 7, cutting build time from ~12 min to ~2 min",
      "Built an offline MRO work-order module with service workers and IndexedDB, so technicians sync inspections on reconnect",
    ],
    technologies: ["typescript", "react", "react-router", "tailwind"],
  },
  {
    cv: true,
    company: "IPB Training",
    legalName: "PT. Global Scholarship Services Indonesia",
    position: "Fullstack Web Developer",
    time: "full-time",
    remote: true,
    country: "Indonesia",
    city: "Bogor",
    period: ["2024-04", "2025-12"],
    details: [
      "Built CI/CD with GitHub Actions, Docker, and VPS, cutting deploy time from ~10 min to ~2 min with zero downtime",
      "Fixed enrollment-to-payment sync and automated 8 workflows, cutting manual reconciliation from ~6 hrs/week to under 30 min",
      "Rewrote the finance module from procedural PHP to a typed service layer, reconciling ~12K transactions a month",
      "Shipped a real-time quiz platform with Laravel Reverb and WebSockets for 2K+ students, cutting grading from 3 days to instant",
    ],
    technologies: ["typescript", "nodejs", "nextjs", "laravel", "mysql", "docker"],
  },
  {
    cv: true,
    company: "PT. Healstation Indonesia",
    position: "Fullstack Web Developer",
    time: "freelance",
    remote: false,
    country: "Indonesia",
    period: ["2023-01", "2023-04"],
    details: [
      "Built a CMS in Next.js and tRPC for a Korean rental platform, serving 20+ admins managing 500+ bookings per week",
      "Designed a MySQL schema for 10K+ listings, keeping search and filter p95 under 100 ms with composite indexes",
    ],
    technologies: ["typescript", "nextjs", "trpc", "mysql", "minio", "docker"],
  },
  {
    cv: false,
    company: "Cubix Branding Agency",
    position: "Fullstack Web Developer",
    time: "contract",
    remote: false,
    country: "Indonesia",
    period: ["2022-06", "2023-03"],
    details: [
      "Delivered 3 responsive marketing sites (artajasa.co.id, atmbersama.com, bersama.id) from Figma to production, each passing Lighthouse 90+ across mobile and desktop",
      "Adopted Next.js ISR to serve pre-rendered pages from CDN edge, cutting TTB to under 200ms for repeat visitors",
      "Bridged frontend with Laravel and Voyager CMS via REST APIs, letting marketing edit content without touching code or triggering redeploys",
      "Untangled legacy CSS into component-scoped Stitches and SCSS Modules, making style changes predictable and side-effect-free",
      "Triaged and resolved 40+ frontend and backend bugs in a 3-person team using GitHub issues and PR reviews",
    ],
    technologies: ["typescript", "nextjs", "scss", "php", "laravel", "voyager"],
  },
  {
    cv: false,
    company: "[Undisclosed]",
    position: "Fullstack Web Developer",
    time: "freelance",
    remote: false,
    country: "Indonesia",
    period: ["2021-12", "2022-09"],
    details: [
      "Built CodeWars-like programming test platform with i18n and full user activity capture (clicks, keystrokes, mouse paths) streamed via SignalR to ASP.NET Core for research analysis. Open-sourced as teknologi-umum/spectator",
      "Shipped React frontend (Redux Toolkit, ChakraUI) with over 80% test coverage via Vitest and React Testing Library, catching regressions before they hit staging",
      "Contributed Go-based analytics worker that queried InfluxDB time-series data and exported results to MinIO as CSV/JSON via gRPC, enabling researchers to download raw datasets on demand",
      "Assisted in building Pesto, a TypeScript-based remote code execution engine using gRPC for isolated sandbox runs with configurable time and memory limits. Open-sourced as teknologi-umum/pesto.",
      "Built a Python dummy data generator that produced thousands of synthetic user interactions for load testing, with unit tests to validate data shape.",
      "Dockerized all 6 services into a single Compose stack, slashing local setup from a multi-hour checklist to one command.",
    ],
    technologies: [
      "typescript",
      "react",
      "redux-toolkit",
      "chakra-ui",
      "signalr",
      "aspnet-core",
      "grpc",
      "go",
      "influxdb",
      "minio",
      "python",
      "docker",
    ],
  },
  {
    cv: false,
    company: "Enam Dua Teknologi",
    position: "Frontend Web Developer",
    time: "freelance",
    remote: false,
    country: "Indonesia",
    period: ["2022-06", "2022-08"],
    details: [
      "Built Jira-like task management system for J99 Corp. Holding, replacing email and WhatsApp-based task coordination across their corporate group",
      "Adopted Render-as-you-fetch with Suspense to unblock the initial render, cutting perceived load time by ~50% for dashboards with 100+ tasks",
      "Structured UI with Atomic Design (atoms, molecules, organisms), enabling 3 other devs to compose new screens from existing primitives instead of duplicating code",
      "Added real-time SSE notifications so assignees see updates instantly, eliminating the need to refresh or poll for task changes",
    ],
    technologies: ["typescript", "react", "react-hook-form", "react-query", "chakra-ui"],
  },
];

const engagements = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  freelance: "Freelance",
  contract: "Contract",
} as const;

/** "Bogor, Indonesia", or just the country where the role had no single city. */
export function place(entry: Work): string {
  return entry.city ? `${entry.city}, ${entry.country}` : entry.country;
}

/** "Full-time, Remote" — the words the CV puts next to the company. */
export function engagement(entry: Work): string {
  const label = engagements[entry.time];
  return entry.remote ? `${label}, Remote` : label;
}

/** "2026-01" to a local Date, so the month reads the same in every timezone. */
function parseMonthYear(value: string): Date {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

/** The site's view: every role, with a country badge and real dates. */
export const workExperiences: WorkExperience[] = work.map((entry) => ({
  company: entry.company,
  position: entry.position,
  location: entry.country.toLowerCase(),
  time: entry.time,
  period: [
    parseMonthYear(entry.period[0]),
    entry.period[1] === null ? null : parseMonthYear(entry.period[1]),
  ],
  details: entry.details,
  technologies: entry.technologies,
}));
