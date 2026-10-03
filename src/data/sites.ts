import { profile } from "./profile";

export default {
  author: profile.handle,
  siteName: "elianiva's home row",
  siteUrl: import.meta.env?.DEV ? "http://localhost:3000" : profile.urls.personalSite,
  github: profile.urls.github,
  bluesky: profile.urls.bluesky,
  twitter: profile.urls.twitter,
  linkedin: profile.urls.linkedin,
  instagram: profile.urls.instagram,
  threads: profile.urls.threads,
  reddit: profile.urls.reddit,
  devto: profile.urls.devto,
  lastfm: profile.urls.lastfm,
  npm: profile.urls.npm,
  cv: "/assets/cv_dicha.pdf",
  email: profile.email,
  description: "elianiva's home row",
  keywords: ["personal", "website", "blog", "article", "portfolio", "elianiva"],
} as const;
