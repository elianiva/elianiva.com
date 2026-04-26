import type { Technology } from "#/types/technology";

export interface WorkExperience {
  company: string;
  position: string;
  location: string;
  time: "full-time" | "part-time" | "freelance" | "contract";
  period: [Date, Date | null];
  details: string[];
  technologies: Technology[];
}

export const workExperiences: WorkExperience[] = [
  {
    company: "Aerotalon",
    position: "Frontend Web Developer",
    location: "australia",
    time: "full-time",
    period: [new Date(2026, 0), null],
    details: [
      "Developed and maintained an aviation information system using React and TypeScript",
      "Redesigned the role-based permission UI from palin roles to a more granular RBAC model",
      "Improved DX by fixing issues, migrating to modern stack. Cutting build time by ~80% resulting in faster deployments",
      "Developed an MRO module to help customers manage their MRO-related operations more efficiently",
      "Implemented an offline mode for the app using service workers and IndexedDB",
    ],
    technologies: ["typescript", "react", "react-router"],
  },
  {
    company: "IPB Training",
    position: "Fullstack Web Developer",
    location: "indonesia",
    time: "full-time",
    period: [new Date(2024, 3), new Date(2025, 11)],
    details: [
      "Built CI/CD pipeline (GitHub Actions, Docker, VPS) that cut deployment time from ~10min to ~2min, with zero-downtime rollouts",
      "Drove Lighthouse score from <70 to >95 through code splitting, image optimization, and server-side caching, directly improving SEO and conversion",
      "Stabilized back-office by fixing broken data sync between services and automating repetitive workflows, eliminating hours of manual reconciliation per week",
      "Maintained 99% uptime during peak traffic by profiling and rewriting slow MySQL queries and tuning Nginx/PHP-FPM",
      "Rewrote legacy finance module from procedural PHP to a typed service layer with automated reconciliation, eliminating rounding errors and audit discrepancies",
      "Shipped real-time quiz platform (Laravel Reverb, WebSockets) replacing paper-based pre/post-tests, cutting grading turnaround from days to instant",
    ],
    technologies: [
      "typescript",
      "nodejs",
      "nextjs",
      "laravel",
      "mysql",
      "docker",
    ],
  },
  {
    company: "PT Healstation Indonesia",
    position: "Fullstack Web Developer",
    location: "indonesia",
    time: "freelance",
    period: [new Date(2023, 0), new Date(2023, 3)],
    details: [
      "Built CMS from scratch (Next.js, tRPC) for a Korean rental platform spanning cars, camp cars, and camping sites",
      "Designed normalized MySQL schema that handled 10K+ listings with sub-100ms queries via composite indexes and query optimization",
      "Containerized all services with Docker Compose, turning multi-hour dev environment setup into a single command",
    ],
    technologies: ["typescript", "nextjs", "trpc", "mysql", "minio", "docker"],
  },
  {
    company: "Cubix Branding Agency",
    position: "Fullstack Web Developer",
    location: "indonesia",
    time: "contract",
    period: [new Date(2022, 5), new Date(2023, 2)],
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
    company: "[Undisclosed]",
    position: "Fullstack Web Developer",
    location: "indonesia",
    time: "freelance",
    period: [new Date(2021, 11), new Date(2022, 8)],
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
    company: "Enam Dua Teknologi",
    position: "Frontend Web Developer",
    location: "indonesia",
    time: "freelance",
    period: [new Date(2022, 5), new Date(2022, 7)],
    details: [
      "Built Jira-like task management system for J99 Corp. Holding, replacing email and WhatsApp-based task coordination across their corporate group",
      "Adopted Render-as-you-fetch with Suspense to unblock the initial render, cutting perceived load time by ~50% for dashboards with 100+ tasks",
      "Structured UI with Atomic Design (atoms, molecules, organisms), enabling 3 other devs to compose new screens from existing primitives instead of duplicating code",
      "Added real-time SSE notifications so assignees see updates instantly, eliminating the need to refresh or poll for task changes",
    ],
    technologies: [
      "typescript",
      "react",
      "react-hook-form",
      "react-query",
      "chakra-ui",
    ],
  },
];
