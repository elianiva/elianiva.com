import sites from "~/data/sites";

export const siteUrl = sites.siteUrl;

export interface SeoProps {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  canonical?: string;
  path?: string;
  noIndex?: boolean;
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export interface PostSeoProps {
  title: string;
  description: string;
  date: string;
  tags: string[];
  slug: string;
}

export function defaultOgImageUrl(title: string, subtitle?: string) {
  const params = new URLSearchParams({ type: "default", title });
  if (subtitle) params.set("subtitle", subtitle);
  return `${siteUrl}/api/og-image?${params.toString()}`;
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

/**
 * Build meta tags + canonical link for any page.
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
    publishedTime,
    modifiedTime,
  } = options;

  const canonicalUrl = options.canonical ?? (options.path ? `${siteUrl}${options.path}` : siteUrl);

  const meta: Record<string, string>[] = [{ title: `${title} | ${sites.siteName}` }];

  if (description) {
    meta.push({ name: "description", content: truncate(description, 160) });
  }

  meta.push(
    { name: "author", content: author },
    { property: "og:title", content: ogTitle },
    { property: "og:description", content: ogDescription ? truncate(ogDescription, 160) : "" },
    { property: "og:type", content: ogType },
    { property: "og:url", content: canonicalUrl },
    { property: "og:locale", content: "en_US" },
    { property: "og:site_name", content: sites.siteName },
  );

  if (ogImage) {
    meta.push(
      { property: "og:image", content: ogImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
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

  if (ogType === "article") {
    meta.push({ property: "article:author", content: sites.author });
    if (publishedTime) {
      meta.push({ property: "article:published_time", content: publishedTime });
    }
    if (modifiedTime) {
      meta.push({ property: "article:modified_time", content: modifiedTime });
    }
    if (keywords) {
      meta.push({ property: "article:tag", content: keywords });
    }
  }

  meta.push(
    { name: "twitter:card", content: ogImage ? "summary_large_image" : "summary" },
    { name: "twitter:site", content: "@elianiva_" },
    { name: "twitter:creator", content: "@elianiva_" },
    { name: "twitter:title", content: ogTitle },
    { name: "twitter:description", content: ogDescription ? truncate(ogDescription, 160) : "" },
  );

  const links = [{ rel: "canonical", href: canonicalUrl }];

  return { meta, links };
}

/**
 * SEO for post detail pages — includes BlogPosting JSON-LD.
 */
export function postSeo(props: PostSeoProps) {
  return {
    ...seo({
      title: props.title,
      description: props.description,
      ogType: "article",
      ogImage: `${siteUrl}/api/og-image?${new URLSearchParams({ type: "post", title: props.title, date: props.date, tags: props.tags.join(","), description: props.description }).toString()}`,
      keywords: props.tags.join(", "),
      canonical: `${siteUrl}/posts/${props.slug}`,
      publishedTime: new Date(props.date).toISOString(),
    }),
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(blogPostJsonLd(props)) },
    ],
  };
}

/**
 * SEO for the home page — includes Person + WebSite JSON-LD.
 */
export function homeSeo() {
  return {
    ...seo({
      title: "Home",
      description:
        "Software engineer, building interfaces that don't annoy people. Writing about frontend, design engineering, and side projects.",
      ogTitle: sites.siteName,
      ogImage: defaultOgImageUrl(
        "Dicha Zelianiva Arkana",
        "software engineer · design engineering · open source",
      ),
      path: "/",
    }),
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(personJsonLd()) },
      { type: "application/ld+json", children: JSON.stringify(websiteJsonLd()) },
    ],
  };
}

// ── Structured Data ──────────────────────────────────────────────

function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Dicha Zelianiva Arkana",
    url: siteUrl,
    jobTitle: "Software Engineer",
    sameAs: [sites.github, sites.twitter, sites.linkedin, sites.bluesky],
    knowsAbout: [
      "Frontend Development",
      "Design Engineering",
      "React",
      "TypeScript",
      "Web Development",
    ],
  };
}

function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: sites.siteName,
    url: siteUrl,
    description: sites.description,
    author: {
      "@type": "Person",
      name: "Dicha Zelianiva Arkana",
    },
  };
}

function blogPostJsonLd(props: {
  title: string;
  description: string;
  date: string;
  slug: string;
  tags: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: props.title,
    description: props.description,
    datePublished: new Date(props.date).toISOString(),
    author: {
      "@type": "Person",
      name: "Dicha Zelianiva Arkana",
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/posts/${props.slug}`,
    },
    keywords: props.tags.join(", "),
  };
}
