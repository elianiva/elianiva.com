/**
 * Opinions worth stating on the home page, each with the post that argues it.
 *
 * The claims are condensed from the posts themselves, so the row and the post
 * cannot drift apart in meaning. `post` is a slug under `src/content/posts`;
 * the row links to it and dates the claim from it. A claim whose post is
 * missing or unpublished still renders, without the link.
 */
export interface Take {
  claim: string;
  post: string;
}

export const takes: Take[] = [
  {
    claim: "Every coding agent ships as a TUI, and I think that's the wrong call.",
    post: "tui-is-the-wrong-abstraction-for-coding-agents",
  },
  {
    claim: "Jujutsu is a Git frontend I grew to like using.",
    post: "what-i-like-about-jj",
  },
  {
    claim: "I'm leaving Neovim in favour of Helix, because Helix is simpler.",
    post: "neovim-into-helix",
  },
];
