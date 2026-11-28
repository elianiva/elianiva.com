/**
 * Every technology the site and the CV can name, in one place.
 *
 * The site prints the slug as `#slug`. The CV prints the label. Keeping both in
 * one record means a slug can never be typed in one place and left unnamed in
 * the other.
 */
const technologyLabels = {
  "aspnet-core": "ASP.NET Core",
  "chakra-ui": "Chakra UI",
  docker: "Docker",
  dotnet: ".NET",
  go: "Go",
  grpc: "gRPC",
  influxdb: "InfluxDB",
  laravel: "Laravel",
  minio: "MinIO",
  mysql: "MySQL",
  nextjs: "Next.js",
  nodejs: "Node.js",
  php: "PHP",
  python: "Python",
  react: "React",
  "react-hook-form": "React Hook Form",
  "react-native": "React Native",
  "react-query": "React Query",
  "react-router": "React Router",
  "redux-toolkit": "Redux Toolkit",
  scss: "SCSS",
  signalr: "SignalR",
  skia: "Skia",
  svelte: "Svelte",
  tailwind: "Tailwind",
  trpc: "tRPC",
  typescript: "TypeScript",
  voyager: "Voyager",
  "vscode-extension-api": "VSCode Extension API",
} as const;

export type Technology = keyof typeof technologyLabels;

export function technologyLabel(slug: Technology): string {
  return technologyLabels[slug];
}
