/**
 * Handpicked merged pull requests in other people's projects. The site and
 * `llms.txt` both read this, so a new entry is one object here. Each `note`
 * says what the change did, taken from the PR description.
 */
export interface OpenSourcePR {
  number: number;
  title: string;
  note: string;
}

export interface OpenSourceContribution {
  repo: string;
  /** What the project is, so a reader who has never heard of it is not lost. */
  about: string;
  prs: OpenSourcePR[];
}

export const openSource: OpenSourceContribution[] = [
  {
    repo: "foldkit/foldkit",
    about: "A UI framework for TypeScript, which Nook and Lutra are built on.",
    prs: [
      {
        number: 1295,
        title: "feat(ui)!: add opt-in Toast swipe-to-dismiss",
        note: "Pointer-driven swipe to dismiss toasts, with gesture state kept per entry. Toasts that don't opt in keep native touch behaviour. A breaking change.",
      },
      {
        number: 1294,
        title: "feat(ui): add Meter and Progress primitives",
        note: "Headless, accessible Meter and Progress views, sharing range and labelling helpers with Slider.",
      },
      {
        number: 1293,
        title: "feat(ui): add orientation and edge-aligned geometry to Slider",
        note: "Vertical sliders, plus an opt-in mode that keeps the thumb inside the track.",
      },
    ],
  },
  {
    repo: "RooCodeInc/Roo-Code",
    about: "AI coding assistant for VS Code. 21 merged PRs, April to October 2025.",
    prs: [
      {
        number: 8509,
        title: "fix(context): truncate type definition to match max read line",
        note: "Truncates `list_code_definition_names` output to the number of lines the agent can actually read.",
      },
      {
        number: 8499,
        title: "fix(modes): custom modes under custom path not showing",
        note: "Custom modes vanished after setting a custom storage path, because the global storage path was hardcoded.",
      },
      {
        number: 7318,
        title: "fix(ui): make auto approve toggle trigger stay",
        note: "The auto approve menu's trigger now stays put instead of moving, so there is less mouse travel.",
      },
      {
        number: 4684,
        title: "refactor: more consistent history UI",
        note: "Picked up a stale PR and rebuilt the history UI: styles moved to Tailwind, one filter dropdown, tests updated.",
      },
      {
        number: 4306,
        title: "fix: ambiguous model id error",
        note: "Shows the model id error next to the input that is wrong, and resets invalid values when the provider changes.",
      },
      {
        number: 3343,
        title: "fix(prompts): revert to vscodetextarea to prevent race condition",
        note: "Prompt settings synced on every change, so a slow backend reset the input. They now sync on blur.",
      },
    ],
  },
  {
    repo: "zen-browser/desktop",
    about: "A Firefox-based browser.",
    prs: [
      {
        number: 968,
        title: "fix: right-side tabs was incorrectly positioned on compact mode",
        note: "The tabs-on-the-right setting had no effect in compact mode.",
      },
    ],
  },
];

export function prUrl(repo: string, number: number): string {
  return `https://github.com/${repo}/pull/${number}`;
}
