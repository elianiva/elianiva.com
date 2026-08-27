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

export interface ProjectSeoProps {
  title: string;
  description: string;
  date: string;
  slug: string;
  stack?: string[][];
  image?: string;
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
 * SEO for post detail pages — includes BlogPosting JSON-LD and BreadcrumbList.
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
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Home", item: siteUrl },
            { name: "Posts", item: `${siteUrl}/posts` },
            { name: props.title, item: `${siteUrl}/posts/${props.slug}` },
          ]),
        ),
      },
    ],
  };
}

/**
 * SEO for project detail pages — includes CreativeWork JSON-LD and BreadcrumbList.
 */
export function projectSeo(props: ProjectSeoProps) {
  return {
    ...seo({
      title: props.title,
      description: props.description,
      ogType: "website",
      ogImage: defaultOgImageUrl(props.title, props.description),
      canonical: `${siteUrl}/projects/${props.slug}`,
      publishedTime: new Date(props.date).toISOString(),
    }),
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(projectJsonLd(props)) },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Home", item: siteUrl },
            { name: "Projects", item: `${siteUrl}/projects` },
            { name: props.title, item: `${siteUrl}/projects/${props.slug}` },
          ]),
        ),
      },
    ],
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; item: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

/**
 * SEO for the home page — includes a @graph with Person + WebSite + ProfilePage.
 * Single @graph is intentional: it hard-links all entities via @id so search
 * engines reconcile them as one knowledge graph node (entity stacking).
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
        "software engineer · open source",
      ),
      path: "/",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [personJsonLd(), websiteJsonLd(), profilePageJsonLd()],
        }),
      },
    ],
  };
}

// ── Structured Data ──────────────────────────────────────────────

export function personJsonLd() {
  return {
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: "Dicha Zelianiva Arkana",
    alternateName: ["elianiva", "dichaa", "not.elianiva", "elianiva_"],
    givenName: "Dicha",
    familyName: "Arkana",
    additionalName: "Zelianiva",
    url: siteUrl,
    image: {
      "@type": "ImageObject",
      url: "https://avatars.githubusercontent.com/u/51877647?v=4",
      contentUrl: "https://avatars.githubusercontent.com/u/51877647?v=4",
      caption: "Dicha Zelianiva Arkana",
    },
    email: `mailto:${sites.email}`,
    jobTitle: "Software Engineer",
    description:
      "Software engineer focused on frontend and design engineering. Building interfaces that don't annoy people.",
    sameAs: [
      sites.github,
      sites.twitter,
      sites.linkedin,
      sites.bluesky,
      sites.instagram,
      sites.threads,
      sites.reddit,
      sites.devto,
      sites.lastfm,
      sites.npm,
    ].filter(Boolean),
    knowsAbout: [
      "Frontend Development",
      "Design Engineering",
      "React",
      "TypeScript",
      "Web Development",
      "Next.js",
      "TanStack Start",
      "Tailwind CSS",
      "Accessibility",
      "Open Source",
    ],
    knowsLanguage: ["en", "id"],
    nationality: { "@type": "Country", name: "Indonesia" },
    homeLocation: { "@type": "Place", name: "Indonesia" },
  };
}

function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: sites.siteName,
    description: sites.description,
    inLanguage: "en-US",
    publisher: { "@id": `${siteUrl}/#person` },
    author: { "@id": `${siteUrl}/#person` },
  };
}

function profilePageJsonLd() {
  return {
    "@type": "ProfilePage",
    "@id": `${siteUrl}/#webpage`,
    url: siteUrl,
    name: `${sites.siteName} — Dicha Zelianiva Arkana`,
    description:
      "Personal website, blog, and portfolio of Dicha Zelianiva Arkana (elianiva) — software engineer, design engineering, open source.",
    isPartOf: { "@id": `${siteUrl}/#website` },
    about: { "@id": `${siteUrl}/#person` },
    mainEntity: { "@id": `${siteUrl}/#person` },
    inLanguage: "en-US",
    dateModified: new Date().toISOString(),
  };
}

export function projectJsonLd(props: {
  title: string;
  description: string;
  date: string;
  slug: string;
  stack?: string[][];
  image?: string;
}) {
  const isoDate = new Date(props.date).toISOString();
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: props.title,
    headline: props.title,
    description: props.description,
    datePublished: isoDate,
    dateModified: isoDate,
    author: { "@id": `${siteUrl}/#person` },
    creator: { "@id": `${siteUrl}/#person` },
    url: `${siteUrl}/projects/${props.slug}`,
    isPartOf: { "@id": `${siteUrl}/#website` },
    keywords: props.stack?.map(([name]) => name).join(", "),
    ...(props.image ? { image: `${siteUrl}/assets/projects/${props.slug}/${props.image}` } : {}),
    inLanguage: "en-US",
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
    dateModified: new Date(props.date).toISOString(),
    author: { "@id": `${siteUrl}/#person` },
    publisher: { "@id": `${siteUrl}/#person` },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/posts/${props.slug}`,
    },
    url: `${siteUrl}/posts/${props.slug}`,
    isPartOf: { "@id": `${siteUrl}/#website` },
    keywords: props.tags.join(", "),
    inLanguage: "en-US",
  };
}
