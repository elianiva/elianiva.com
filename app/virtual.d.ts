/// <reference types="@effect/ui/html/MarkdownContent" />
/// <reference types="@effect/ui/html/HtmlServerViteDocument" />

declare module "virtual:content" {
  import type { DocumentEncoded } from "@effect/ui/html/Markdown";

  export type Post = {
    slug: string;
    title: string;
    /** `YYYY-MM-DD`. */
    date: string;
    description: string;
    tags: string[];
    hidden: boolean;
    wordCount: number;
  };

  export type Project = {
    slug: string;
    title: string;
    featured: boolean;
    /** `YYYY-MM-DD`. */
    date: string;
    description: string;
    source: string;
    demo?: string | null;
    type: "personal" | "open-source" | "assignment";
    stack: [string, string][];
    /** Present only when the project belongs on the CV. */
    cv?: { period: [string, string | null]; details: string[] };
    image?: string;
  };

  type Bodies = Record<string, () => Promise<{ default: DocumentEncoded }>>;

  export const allPosts: Post[];
  export const allProjects: Project[];
  /** One lazy chunk per body, keyed by slug. */
  export const postBodies: Bodies;
  export const projectBodies: Bodies;
}
