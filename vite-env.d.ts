/// <reference types="vite/client" />

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

/** The site's latest commits, newest first, and its commit count. Set in vite.config.ts. */
declare const __SITE_HISTORY__: {
  total: number;
  commits: { hash: string; date: string; subject: string }[];
};
