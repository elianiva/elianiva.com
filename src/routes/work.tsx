import { createFileRoute } from "@tanstack/react-router";
import { AppPill } from "~/components/app-pill";
import { Box, Cell, Fill, PageHead, Postmark } from "~/components/box";
import siteData from "~/data/sites";
import { engagement, place, work, yearRange } from "~/data/work-experience";
import { openSource, prUrl } from "~/data/open-source";
import { cn } from "~/lib/utils";
import { seo, ogPageImageUrl } from "~/lib/seo";

const month = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });
const fmt = (value: string | null) => (value ? month.format(new Date(`${value}-01`)) : "Now");

/** `fix(ui)!: x` becomes `{ kind: "fix!", text: "x" }`. */
function parseTitle(title: string) {
  const match = title.match(/^(\w+)(?:\([^)]*\))?(!)?:\s*(.*)$/);
  if (!match) return { kind: "change", text: title };
  return { kind: `${match[1]}${match[2] ?? ""}`, text: match[3] };
}

function WorkRoute() {
  const first = work.at(-1)?.period[0].slice(0, 4);
  const prs = openSource.reduce((sum, entry) => sum + entry.prs.length, 0);

  return (
    <Box square={false}>
      <PageHead
        title="Work"
        n={1}
        tone="hot"
        kicker={
          <>
            I work at{" "}
            <AppPill
              name="Aerotalon"
              href="https://aerotalon.com"
              icon="/assets/company-favicons/aerotalon.jpg"
            />{" "}
            on aviation operations software. With AI making software cheaper to build, I think
            it&rsquo;s even more important to make it with care. I like fixing the things that
            frustrate people.
          </>
        }
        aside={
          <>
            <p className="mt-auto font-display text-5xl leading-none font-extrabold tabular-nums">
              {first}–
            </p>
            <p className="font-mono text-[11px] opacity-85">{work.length} roles so far</p>
            <a
              href={siteData.cv}
              className="relative z-10 border border-white/60 px-3 py-2 text-center font-mono text-[11px] tracking-wider uppercase transition-colors hover:bg-white hover:text-pink-700"
            >
              Download CV ↗
            </a>
          </>
        }
      />

      {work.map((role, i) => {
        const current = role.period[1] === null;
        return (
          <Cell
            key={role.company}
            as="article"
            span="w2"
            tone={current ? "white" : "paper"}
            n={i + 2}
            label={`${fmt(role.period[0])} – ${fmt(role.period[1])}`}
            className="gap-4"
          >
            {current && (
              <Postmark className="absolute top-3 right-14 size-11 text-[8px]">now</Postmark>
            )}
            <div className="flex items-center gap-4">
              {role.website ? (
                <img
                  src={role.website.favicon}
                  alt=""
                  width={52}
                  height={52}
                  className="size-13 -rotate-6 rounded-[14px] border border-pink-200 bg-white object-contain p-1.5 shadow-[0_3px_0_rgba(190,24,93,0.13)] transition-transform duration-300"
                />
              ) : (
                <span className="grid size-13 -rotate-6 place-items-center rounded-[14px] border border-pink-200 bg-white font-display text-xl font-extrabold text-pink-500 shadow-[0_3px_0_rgba(190,24,93,0.13)]">
                  {role.company[0]}
                </span>
              )}
              <div className="min-w-0">
                <h2 className="font-display text-xl leading-tight font-extrabold text-pink-950">
                  {role.website ? (
                    <a
                      href={role.website.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-pink-600"
                    >
                      {role.company}
                    </a>
                  ) : (
                    role.company
                  )}
                </h2>
                <p className="text-sm text-pink-950/65">
                  {role.position} · {engagement(role)} · {place(role)}
                </p>
              </div>
            </div>
            <ul className="grid gap-1.5">
              {role.details.map((detail) => (
                <li
                  key={detail}
                  className="relative pl-4 text-[14px] leading-relaxed text-pink-950/80 before:absolute before:top-[0.6em] before:left-0 before:size-1.5 before:bg-pink-300"
                >
                  {detail}
                </li>
              ))}
            </ul>
            <p className="mt-auto font-mono text-[11px] text-pink-500">
              {role.technologies.map((tech) => `#${tech}`).join(" ")}
              <span className="float-right text-pink-950/45">{yearRange(role)}</span>
            </p>
          </Cell>
        );
      })}
      <Fill used={work.length * 2} />

      <Cell
        as="header"
        span="w4"
        tone="lilac"
        className="flex-row flex-wrap items-end justify-between gap-3 py-6"
      >
        <h2
          id="open-source"
          className="scroll-mt-6 font-display text-3xl font-extrabold tracking-wide text-pink-950 uppercase md:text-4xl"
        >
          <span className="text-pink-500">O</span>pen source
        </h2>
        <p className="font-mono text-[11px] text-pink-950/60">
          {prs} handpicked pull requests in {openSource.length} projects
        </p>
      </Cell>
      {openSource.map((entry) => (
        <Cell key={entry.repo} span="w2" label={entry.about} className="gap-3">
          <a
            href={`https://github.com/${entry.repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-lg text-pink-700 hover:text-pink-950"
          >
            {entry.repo}
          </a>
          <ul className="grid">
            {entry.prs.map((pr) => {
              const { kind, text } = parseTitle(pr.title);
              return (
                <li
                  key={pr.number}
                  className={cn("border-t border-dashed border-pink-200 py-2 first:border-t-0")}
                >
                  <a
                    href={prUrl(entry.repo, pr.number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/pr block text-sm leading-snug text-pink-950 hover:text-pink-600"
                  >
                    <span className="font-mono text-[11px] text-pink-500">
                      #{pr.number} {kind}
                    </span>{" "}
                    {text}
                    <span className="mt-0.5 block text-[13px] text-pink-950/60">{pr.note}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </Cell>
      ))}
      <Fill used={openSource.length * 2} />
    </Box>
  );
}

export const Route = createFileRoute("/work")({
  component: WorkRoute,
  head: () =>
    seo({
      title: "Work",
      description: "Where I have worked, what I built there, and my open source contributions.",
      ogImage: ogPageImageUrl("work"),
      path: "/work",
    }),
});
