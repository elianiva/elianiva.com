import { Heading } from "~/components/ui/heading";
import { openSource, prUrl } from "~/data/open-source";

/** `fix(ui)!: x` becomes `{ kind: "fix!", text: "x" }`. */
function parseTitle(title: string) {
  const match = title.match(/^(\w+)(?:\([^)]*\))?(!)?:\s*(.*)$/);
  if (!match) return { kind: "change", text: title };
  return { kind: `${match[1]}${match[2] ?? ""}`, text: match[3] };
}

export function OpenSourcePicks() {
  return (
    <section aria-labelledby="open-source-heading" className="min-w-0">
      <Heading level={2} id="open-source-heading">
        Open Source Contributions
      </Heading>
      {openSource.map((entry) => (
        <div key={entry.repo} className="px-3 py-2 border-t border-pink-200/50 first:border-t-0">
          <div className="font-mono text-sm text-pink-700">{entry.repo}</div>
          <ul className="mt-0.5 grid">
            {entry.prs.map((pr) => {
              const { kind, text } = parseTitle(pr.title);
              return (
                <li key={pr.number}>
                  <a
                    href={prUrl(entry.repo, pr.number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block py-0.5 text-sm font-body text-pink-950/70 leading-snug hover:text-pink-950"
                  >
                    <span className="font-mono text-xs text-pink-500 group-hover:underline">
                      #{pr.number}
                    </span>{" "}
                    <span className="font-mono text-xs text-pink-400">{kind}</span> {text}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
