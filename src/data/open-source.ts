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
  {
    repo: "neovim/neovim",
    about: "The editor. Three merged PRs to its built-in LSP client, 2021.",
    prs: [
      {
        number: 14300,
        title: "feat(lsp): make hover/signature_help borders configurable",
        note: "Diagnostic, hover, and signature help floats take a `border` option.",
      },
      {
        number: 14482,
        title: "feat(lsp): hide triple - in hover window",
        note: "Hover windows drop the markdown `---` rules, which a terminal cannot draw as a thin line.",
      },
      {
        number: 16218,
        title: "fix(lsp): convert range to byteidx before highlighting",
        note: "`document_highlight()` converts LSP ranges to byte indexes, so highlights land on the right text in lines with multibyte characters.",
      },
    ],
  },
  {
    repo: "nvim-treesitter/nvim-treesitter",
    about: "Tree-sitter parsers and queries for Neovim. 20 merged PRs, 2020 to 2021.",
    prs: [
      {
        number: 920,
        title: "feat: add support for svelte",
        note: "Svelte parser support, with queries shared with HTML.",
      },
      {
        number: 1109,
        title: "feat: add scss parser",
        note: "SCSS parser support, with highlight queries.",
      },
      {
        number: 1958,
        title: "feat: add prisma support",
        note: "Prisma schema parser support.",
      },
    ],
  },
  {
    repo: "nvim-telescope/telescope.nvim",
    about: "A fuzzy finder for Neovim. 13 merged PRs, 2020 to 2021.",
    prs: [
      {
        number: 636,
        title: "feat: add `add_to_qflist`, `add_selected`, and `smart_add`",
        note: "Actions that add picker results to the quickfix list instead of replacing it.",
      },
      {
        number: 610,
        title: "feat: define scroll speed + smart_send to qflist",
        note: "A configurable preview scroll speed per layout, and `smart_send` to the quickfix list.",
      },
      {
        number: 560,
        title: "fix: proper multibytes chars alignment",
        note: "Results with multibyte characters line up, measured by display width instead of byte length.",
      },
    ],
  },
];

export function prUrl(repo: string, number: number): string {
  return `https://github.com/${repo}/pull/${number}`;
}
