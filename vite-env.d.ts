/// <reference types="vite/client" />

declare module "cloudflare:workers" {
  import type { WebsiteEnv } from "./alchemy.run";
  export const env: WebsiteEnv;
}

declare module "*.glsl?raw" {
  const content: string;
  export default content;
}

declare module "*.wgsl?raw" {
  const content: string;
  export default content;
}

declare module "*.css?url" {
  const url: string;
  export default url;
}
