import sites from "~/data/sites";

export interface SeoProps {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
  keywords?: string;
  author?: string;
}

export interface PostSeoProps {
  title: string;
  description: string;
  date: string;
  tags: string[];
}

export interface DefaultSeoProps {
  title: string;
  subtitle?: string;
}

const siteUrl = sites.siteUrl;

/**
 * Build the OG image URL for a post.
 */
export function postOgImageUrl(title: string, date: string, tags: string[], description: string) {
  const params = new URLSearchParams({
    type: "post",
    title,
    date,
    tags: tags.join(","),
    description,
  });
  return `${siteUrl}/api/og-image?${params.toString()}`;
}

/**
 * Build the OG image URL for the default (home) layout.
 */
export function defaultOgImageUrl(title: string, subtitle?: string) {
  const params = new URLSearchParams({ type: "default", title });
  if (subtitle) params.set("subtitle", subtitle);
  return `${siteUrl}/api/og-image?${params.toString()}`;
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

/**
 * Shorthand: base meta + open graph + twitter card for any page.
 */
export function seo(options: SeoProps) {
  const {
    title,
    description,
    ogTitle = title,
    ogDescription = description,
    ogType = "website",
    ogImage,
    keywords,
    author = sites.author,
  } = options;

  const meta: Record<string, string>[] = [{ title: `${title} | ${sites.siteName}` }];

  if (description) {
    meta.push({ name: "description", content: truncate(description, 160) });
  }

  meta.push(
    { name: "author", content: author },
    { property: "og:title", content: ogTitle },
    { property: "og:description", content: ogDescription ? truncate(ogDescription, 160) : "" },
    { property: "og:type", content: ogType },
    { property: "og:url", content: options.canonical ?? siteUrl },
  );

  if (ogImage) {
    meta.push(
      { property: "og:image", content: ogImage },
      { name: "twitter:image", content: ogImage },
      { name: "twitter:image:alt", content: ogTitle },
    );
  }

  if (keywords) {
    meta.push({ name: "keywords", content: keywords });
  }

  if (options.noIndex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }

  meta.push(
    { name: "twitter:card", content: ogImage ? "summary_large_image" : "summary" },
    { name: "twitter:site", content: sites.twitter },
    { name: "twitter:creator", content: sites.twitter },
    { name: "twitter:title", content: ogTitle },
    { name: "twitter:description", content: ogDescription ? truncate(ogDescription, 160) : "" },
  );

  return { meta };
}

/**
 * SEO for post detail pages.
 */
export function postSeo(props: PostSeoProps) {
  return seo({
    title: props.title,
    description: props.description,
    ogType: "article",
    ogImage: postOgImageUrl(props.title, props.date, props.tags, props.description),
    keywords: props.tags.join(", "),
  });
}

/**
 * SEO for the home page.
 */
export function homeSeo() {
  return seo({
    title: "Home",
    description:
      "Software engineer, building interfaces that don't annoy people. Writing about frontend, design engineering, and side projects.",
    ogTitle: sites.siteName,
    ogImage: defaultOgImageUrl(
      "Dicha Zelianiva Arkana",
      "software engineer · design engineering · open source",
    ),
  });
}

export type { SeoProps as SeoMeta };
