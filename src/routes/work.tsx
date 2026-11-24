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

const LEG = "font-mono text-[9px] tracking-[0.25em] text-pink-950/45 uppercase";
const CODE =
  "font-display text-2xl leading-none font-extrabold text-pink-950 uppercase tabular-nums";
/** Irregular bars, so the strip reads as a barcode and not as stripes. */
const BARCODE =
  "repeating-linear-gradient(90deg, rgb(80 7 36) 0 1px, transparent 1px 3px, rgb(80 7 36) 3px 5px, transparent 5px 6px, rgb(80 7 36) 6px 7px, transparent 7px 9px, rgb(80 7 36) 9px 9.5px, transparent 9.5px 11px)";

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
            <p className="mt-auto font-display text-4xl leading-none font-extrabold whitespace-nowrap tabular-nums xl:text-[2.1rem] 2xl:text-4xl">
              {first}–now
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

      {work.map((role) => {
        const current = role.period[1] === null;
        return (
          <Cell
            key={role.company}
            as="article"
            span="w2"
            tone={current ? "white" : "paper"}
            className="gap-4"
          >
            {current && (
              <Postmark className="absolute top-3 right-14 size-11 text-[8px]">now</Postmark>
            )}
            <div className="flex items-center gap-3.5">
              {role.website ? (
                <img
                  src={role.website.favicon}
                  alt=""
                  width={44}
                  height={44}
                  className="size-11 shrink-0 border border-pink-200 bg-white object-contain p-1"
                />
              ) : (
                <span className="grid size-11 shrink-0 place-items-center border border-pink-200 bg-white font-display text-lg font-extrabold text-pink-500">
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
                <p className="truncate text-sm text-pink-950/65">{role.position}</p>
              </div>
            </div>

            {/* From, to, and the details of the role. */}
            <div className="grid grid-cols-[auto_1fr_auto] items-end gap-3">
              <div>
                <p className={LEG}>From</p>
                <p className={CODE}>{fmt(role.period[0])}</p>
              </div>
              <div aria-hidden className="relative mb-3 border-t-2 border-dashed border-pink-300">
                <span className="absolute -top-[0.8em] left-1/2 -translate-x-1/2 bg-inherit px-1 text-sm text-pink-500">
                  ✈
                </span>
              </div>
              <div className="text-right">
                <p className={LEG}>To</p>
                <p className={cn(CODE, current && "text-pink-600")}>{fmt(role.period[1])}</p>
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-3 font-mono text-[11px] text-pink-950">
              {[
                ["Type", engagement(role)],
                ["Location", place(role)],
                ["Years", yearRange(role)],
              ].map(([term, value]) => (
                <div key={term} className="min-w-0">
                  <dt className={LEG}>{term}</dt>
                  <dd className="truncate">{value}</dd>
                </div>
              ))}
            </dl>

            {/* Perforation: a dashed tear line with a notch cut at each edge. */}
            <div aria-hidden className="relative -mx-4 md:-mx-5">
              <div className="border-t-2 border-dashed border-pink-200" />
              <span className="absolute top-1/2 -left-2 size-4 -translate-y-1/2 rounded-full border border-pink-200 bg-pink-50" />
              <span className="absolute top-1/2 -right-2 size-4 -translate-y-1/2 rounded-full border border-pink-200 bg-pink-50" />
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
            <div className="mt-auto flex items-end justify-between gap-4">
              <p className="font-mono text-[11px] text-pink-500">
                {role.technologies.map((tech) => `#${tech}`).join(" ")}
              </p>
              <span
                aria-hidden
                className="block h-6 w-24 shrink-0 opacity-30"
                style={{ backgroundImage: BARCODE }}
              />
            </div>
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
