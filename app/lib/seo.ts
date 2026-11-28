import { Head } from "@effect/ui";
import { HtmlHead } from "@effect/ui/html";
import { profile } from "../data/profile";
import sites from "../data/sites";

export const siteUrl = sites.siteUrl;

export type SeoOptions = {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  path?: string;
  noIndex?: boolean;
  keywords?: string;
  author?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  /** JSON-LD objects, printed as `<script type="application/ld+json">`. */
  jsonLd?: ReadonlyArray<object>;
};

export type PostSeoProps = {
  title: string;
  description: string;
  date: string;
  tags: ReadonlyArray<string>;
  slug: string;
};

export type ProjectSeoProps = {
  title: string;
  description: string;
  date: string;
  slug: string;
  stack?: ReadonlyArray<ReadonlyArray<string>>;
  image?: string;
};

/**
 * Static OG images, emitted by the `emit-static-assets` Vite plugin into
 * `assets/og/`: one card per post, one per project, and one fixed card per
 * top-level page.
 */
export const ogPageImageUrl = (
  page: "home" | "posts" | "projects" | "work" | "uses" | "neighbours" | "music",
) => `${siteUrl}/assets/og/${page}.png`;

export const ogPostImageUrl = (slug: string) => `${siteUrl}/assets/og/posts/${slug}.png`;

export const ogProjectImageUrl = (slug: string) => `${siteUrl}/assets/og/projects/${slug}.png`;

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text;

const toIso = (date: string) => new Date(date).toISOString();

const name = (n: string, content: string) => HtmlHead.meta({ name: n, content });
const prop = (property: string, content: string) => HtmlHead.meta({ property, content });

/**
 * A page's head entries: title (the root's template adds the site name),
 * description, Open Graph and Twitter cards, canonical link, JSON-LD.
 * Return it from a component's `head`.
 */
export function seoHead(options: SeoOptions) {
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
  const ogDesc = ogDescription ? truncate(ogDescription, 160) : "";

  return [
    Head.title(title),
    ...(description ? [name("description", truncate(description, 160))] : []),
    name("author", author),
    prop("og:title", ogTitle),
    prop("og:description", ogDesc),
    prop("og:type", ogType),
    prop("og:url", canonicalUrl),
    prop("og:locale", "en_US"),
    prop("og:site_name", sites.siteName),
    ...(ogImage
      ? [
          prop("og:image", ogImage),
          prop("og:image:width", "1200"),
          prop("og:image:height", "630"),
          name("twitter:image", ogImage),
          name("twitter:image:alt", ogTitle),
        ]
      : []),
    ...(keywords ? [name("keywords", keywords)] : []),
    ...(options.noIndex ? [name("robots", "noindex, nofollow")] : []),
    ...(ogType === "article"
      ? [
          prop("article:author", sites.author),
          ...(publishedTime ? [prop("article:published_time", publishedTime)] : []),
          ...(modifiedTime ? [prop("article:modified_time", modifiedTime)] : []),
          ...(keywords ? [prop("article:tag", keywords)] : []),
        ]
      : []),
    name("twitter:card", ogImage ? "summary_large_image" : "summary"),
    name("twitter:site", "@elianiva_"),
    name("twitter:creator", "@elianiva_"),
    name("twitter:title", ogTitle),
    name("twitter:description", ogDesc),
    HtmlHead.link({ rel: "canonical", href: canonicalUrl }),
    ...(options.jsonLd ?? []).map((value, i) => HtmlHead.jsonLd(value, { key: `ld-${i}` })),
  ];
}

export const breadcrumbJsonLd = (items: ReadonlyArray<{ name: string; item: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((entry, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: entry.name,
    item: entry.item,
  })),
});

/** Head entries for a post page, with BlogPosting and breadcrumb JSON-LD. */
export function postSeoHead(props: PostSeoProps) {
  return seoHead({
    title: props.title,
    description: props.description,
    ogType: "article",
    ogImage: ogPostImageUrl(props.slug),
    keywords: props.tags.join(", "),
    canonical: `${siteUrl}/posts/${props.slug}`,
    publishedTime: toIso(props.date),
    jsonLd: [
      blogPostJsonLd(props),
      breadcrumbJsonLd([
        { name: "Home", item: siteUrl },
        { name: "Posts", item: `${siteUrl}/posts` },
        { name: props.title, item: `${siteUrl}/posts/${props.slug}` },
      ]),
    ],
  });
}

/** Head entries for a project page, with CreativeWork and breadcrumb JSON-LD. */
export function projectSeoHead(props: ProjectSeoProps) {
  return seoHead({
    title: props.title,
    description: props.description,
    ogImage: ogProjectImageUrl(props.slug),
    canonical: `${siteUrl}/projects/${props.slug}`,
    publishedTime: toIso(props.date),
    jsonLd: [
      projectJsonLd(props),
      breadcrumbJsonLd([
        { name: "Home", item: siteUrl },
        { name: "Projects", item: `${siteUrl}/projects` },
        { name: props.title, item: `${siteUrl}/projects/${props.slug}` },
      ]),
    ],
  });
}

/**
 * Head entries for the home page: one `@graph` with Person, WebSite and
 * ProfilePage, hard-linked by `@id` so search engines read them as one entity.
 */
export function homeSeoHead() {
  return seoHead({
    title: "Home",
    description: sites.description,
    ogTitle: sites.siteName,
    ogImage: ogPageImageUrl("home"),
    path: "/",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@graph": [personJsonLd(), websiteJsonLd(), profilePageJsonLd()],
      },
    ],
  });
}

export function personJsonLd() {
  return {
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: profile.name,
    alternateName: [profile.handle, "dichaa", "elianiva_"],
    givenName: "Dicha",
    familyName: "Arkana",
    additionalName: "Zelianivan",
    url: siteUrl,
    image: {
      "@type": "ImageObject",
      url: `${siteUrl}/avatar.webp`,
      contentUrl: `${siteUrl}/avatar.webp`,
      caption: profile.name,
    },
    email: `mailto:${sites.email}`,
    jobTitle: "Product Engineer",
    description:
      "Software engineer focused on frontend and design engineering. Building interfaces that don't annoy people.",
    sameAs: [
      sites.github,
      sites.twitter,
      sites.linkedin,
      sites.bluesky,
      sites.devto,
      sites.npm,
    ].filter(Boolean),
    knowsAbout: [
      "Frontend Development",
      "Design Engineering",
      "TypeScript",
      "Effect",
      "Web Development",
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
    name: `${sites.siteName} — ${profile.name}`,
    description: `Personal website, blog, and portfolio of ${profile.name} (${profile.handle}) — software engineer, design engineering, open source.`,
    isPartOf: { "@id": `${siteUrl}/#website` },
    about: { "@id": `${siteUrl}/#person` },
    mainEntity: { "@id": `${siteUrl}/#person` },
    inLanguage: "en-US",
    dateModified: new Date().toISOString(),
  };
}

export function projectJsonLd(props: ProjectSeoProps) {
  const isoDate = toIso(props.date);
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
    keywords: props.stack?.map(([stackName]) => stackName).join(", "),
    ...(props.image ? { image: `${siteUrl}/assets/projects/${props.slug}/${props.image}` } : {}),
    inLanguage: "en-US",
  };
}

function blogPostJsonLd(props: PostSeoProps) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: props.title,
    description: props.description,
    datePublished: toIso(props.date),
    dateModified: toIso(props.date),
    author: { "@id": `${siteUrl}/#person` },
    publisher: { "@id": `${siteUrl}/#person` },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/posts/${props.slug}` },
    url: `${siteUrl}/posts/${props.slug}`,
    isPartOf: { "@id": `${siteUrl}/#website` },
    keywords: props.tags.join(", "),
    inLanguage: "en-US",
  };
}
