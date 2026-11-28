/** Pattern sets for the `regex-<name>` code fences in posts. Each fence's text is highlighted by the first pattern that matches at each position. */
export const regexPresets: Record<string, { pattern: string; color: string }[]> = {
  "regex-reflog": [
    { pattern: "\\b[0-9a-f]{7}\\b", color: "#2d9db0" },
    { pattern: "HEAD@\\{\\d+\\}", color: "#8b5fbf" },
    { pattern: "\\(.*?\\)", color: "#e06c75" },
    { pattern: "rebase \\(finish\\)|rebase \\(pick\\)|rebase \\(start\\)", color: "#c94f6d" },
  ],
  "regex-log": [
    { pattern: "^[ @○│]+", color: "#907aa9" },
    { pattern: "\\b[0-9a-f]{12}\\b", color: "#2d9db0" },
    { pattern: "\\b[0-9a-f]{40}\\b", color: "#8b5fbf" },
    { pattern: "elianiva@melon", color: "#ea9d34" },
    { pattern: "\\d+ (hours?|minutes?|seconds?) ago", color: "#797593" },
    { pattern: "lasted \\d+ milliseconds", color: "#797593" },
    {
      pattern:
        "^(│  )(new empty commit|describe commit|snapshot working copy|rebase commit|point bookmark)",
      color: "#618774",
    },
    { pattern: "args: .*", color: "#b4637a" },
  ],
};
