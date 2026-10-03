/**
 * Who this is. The site, the SEO metadata, and the CV all read these facts
 * here, so a new username or a moved profile is a one-line change.
 */
export const profile = {
  name: "Dicha Zelianivan Arkana",
  handle: "elianiva",
  location: "Indonesia",
  /** Where the site's contact button points. */
  email: "contact@elianiva.com",
  /**
   * The address the CV prints. It is a personal inbox, so it stays out of the
   * site's markup where scrapers would pick it up.
   */
  cvEmail: "dicha.arkana03@gmail.com",
  urls: {
    personalSite: "https://elianiva.com",
    github: "https://github.com/elianiva",
    bluesky: "https://bsky.app/profile/elianiva.com",
    twitter: "https://x.com/elianiva_",
    linkedin: "https://www.linkedin.com/in/dichaa",
    instagram: "https://www.instagram.com/not.elianiva",
    threads: "https://www.threads.net/@not.elianiva",
    reddit: "https://www.reddit.com/user/elianiva",
    devto: "https://dev.to/elianiva",
    lastfm: "https://www.last.fm/user/elianiva",
    npm: "https://www.npmjs.com/~elianiva",
  },
} as const;

/** `https://www.linkedin.com/in/dichaa` becomes `linkedin.com/in/dichaa`. */
export function bareHost(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
}
