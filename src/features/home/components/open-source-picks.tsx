import { Heading } from "~/components/ui/heading";
import { openSource, prUrl, type OpenSourceContribution } from "~/data/open-source";
import CaretDownIcon from "~icons/ph/caret-down";
import GitPullRequestIcon from "~icons/ph/git-pull-request-duotone";

/** `fix(ui)!: x` becomes `{ kind: "fix", breaking: true }`. */
function parseKind(title: string) {
  const match = title.match(/^(\w+)(?:\([^)]*\))?(!)?:/);
  return { kind: match?.[1] ?? "change", breaking: Boolean(match?.[2]) };
}

const KIND_STYLE: Record<string, string> = {
  feat: "bg-pink-100 text-pink-800 border-pink-200",
  fix: "bg-pink-50 text-pink-700 border-pink-100",
  refactor: "bg-white text-pink-900/60 border-pink-100",
};

function KindTag({ title }: { title: string }) {
  const { kind, breaking } = parseKind(title);
  return (
    <span
      className={`inline-flex w-fit items-center px-1.5 text-[10px] leading-5 font-mono uppercase tracking-wide border ${KIND_STYLE[kind] ?? KIND_STYLE.refactor}`}
    >
      {kind}
      {breaking ? "!" : ""}
    </span>
  );
}

/**
 * A native `<details>`, so every PR is in the prerendered HTML and the toggle
 * works without JavaScript.
 */
function Repo({ entry, open }: { entry: OpenSourceContribution; open: boolean }) {
  return (
    <details
      open={open}
      className="group bg-white/60 hover:bg-white open:bg-white transition-colors"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block font-mono text-sm text-pink-700">{entry.repo}</span>
          <span className="block text-xs font-body text-pink-950/60 group-open:whitespace-normal truncate">
            {entry.about}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-pink-600">
          <span className="inline-flex items-center gap-1 font-mono text-xs">
            <GitPullRequestIcon aria-hidden="true" className="size-4" />
            {entry.prs.length}
          </span>
          <CaretDownIcon
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-open:rotate-180"
          />
        </span>
      </summary>
      <ul className="px-4 pb-3 border-t border-pink-100/70">
        {entry.prs.map((pr) => (
          <li
            key={pr.number}
            className="grid grid-cols-[3rem_1fr] sm:grid-cols-[3.5rem_4.5rem_1fr] items-baseline gap-x-2 gap-y-1 py-1.5 border-t border-dashed border-pink-100 first:border-t-0 text-sm font-body text-pink-950/80"
          >
            <a
              href={prUrl(entry.repo, pr.number)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-pink-500 hover:underline"
            >
              #{pr.number}
            </a>
            <KindTag title={pr.title} />
            <span className="col-span-2 sm:col-span-1">{pr.note}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function OpenSourcePicks() {
  return (
    <section aria-labelledby="open-source-heading" className="min-w-0">
      <Heading level={2} id="open-source-heading">
        Open Source Contributions
      </Heading>
      <p className="text-xs md:text-base font-body text-pink-950/70 pt-2 pb-4">
        Merged pull requests in other people&rsquo;s projects.
      </p>
      <div className="space-y-1">
        {openSource.map((entry, index) => (
          <Repo key={entry.repo} entry={entry} open={index === 0} />
        ))}
      </div>
    </section>
  );
}
