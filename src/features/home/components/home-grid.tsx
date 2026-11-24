import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import { AppPill } from "~/components/app-pill";
import { Box, Cell, LABEL, RULE, STRETCHED, Stamp, type StampTone } from "~/components/box";
import siteData from "~/data/sites";
import { currentRoles, pastRoles } from "~/data/work-experience";
import { openSource, prUrl } from "~/data/open-source";
import { uses } from "~/data/uses";
import { neighbours } from "~/data/neighbours";
import { getPosts } from "~/features/posts/lib/posts";
import { getProjectBySlug, getProjects } from "~/features/projects/lib/projects";
import { getRecentTracks } from "~/features/music/lib/music-server";
import type { ContributionsResponse } from "~/features/github/lib/github.service";
import { emptyContributions } from "~/features/github/components/github-activity-section";
import { cn } from "~/lib/utils";
import { LastPushTag, StatusTile, timeAgo } from "./based-row";
import { ProjectMark } from "~/features/projects/components/project-mark";

/**
 * Staggers a hover transition down a list: item `i` starts `step` ms after
 * the one before. Pair it with `HOVER_DELAY`, so only hover-in waits and
 * hover-out returns every item at once.
 */
const stagger = (i: number, step = 45) => ({ "--d": `${i * step}ms` }) as CSSProperties;
const HOVER_DELAY = "group-hover/cell:delay-(--d)";

const ROW =
  "flex items-baseline justify-between gap-3 border-b border-dashed py-1.5 last:border-b-0";

/** GitHub, LinkedIn and the résumé first, so the filled call to action closes the strip. */
const links = [
  { label: "GitHub", href: siteData.github, external: true },
  { label: "LinkedIn", href: siteData.linkedin, external: true },
  { label: "Résumé", href: siteData.cv, external: true },
  { label: "Work with me", href: `mailto:${siteData.email}`, primary: true },
] as const;

const monthYear = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function IntroCell() {
  return (
    <section
      aria-labelledby="hero-heading"
      className={cn(
        "col-span-2 row-span-2 flex min-w-0 flex-col border-r border-b bg-white/70 xl:col-[1/4] xl:row-[1/3]",
        RULE,
      )}
    >
      <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <p className={LABEL}>Frontend-leaning product engineer</p>
        </div>
        <h1
          id="hero-heading"
          className="font-display text-sm font-bold tracking-wide text-pink-950 uppercase"
        >
          Dicha Z
          <span className="text-pink-500" title="Yes, this is where the username comes from">
            elianiva
          </span>
          n Arkana
        </h1>
        <p className="font-display text-[8cqw] leading-[1.05] font-extrabold text-pink-950 text-pretty md:text-[4.1cqw] xl:text-[3.5cqw]">
          I care about making fast software that&rsquo;s{" "}
          <em className="relative not-italic text-pink-600">
            delightful
            <svg
              aria-hidden
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
              className="absolute -bottom-1.5 left-0 h-2.5 w-full text-pink-300"
            >
              <path
                d="M2 8 Q 50 1 100 6 T 198 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </em>{" "}
          to use.
        </p>
        <div className="mt-auto flex flex-col gap-3 text-[15px] leading-[2.1] text-pink-950/80 text-pretty xl:text-base xl:leading-[2.1]">
          <p>
            I work at{" "}
            <AppPill
              name="Aerotalon"
              href="https://aerotalon.com"
              icon="/assets/company-favicons/aerotalon.jpg"
            />{" "}
            on software that makes aviation operations easier: less paperwork, fewer handoffs, and
            records that keep up with the people doing the work.
          </p>
          <p>
            Outside work, I tinker with my own things.{" "}
            <AppPill
              name="Quorum"
              href="https://playquorum.dev"
              icon="/assets/project-icons/quorum.webp"
            />{" "}
            is a game about designing systems that survive real traffic.{" "}
            <AppPill
              name="Meiro"
              href="https://github.com/elianiva/meiro"
              icon="/assets/project-icons/meiro.webp"
            />{" "}
            is a desktop YouTube Music client that feels native, and{" "}
            <AppPill
              name="Mizook"
              href="https://github.com/elianiva/mizook"
              icon="/assets/project-icons/mizook.webp"
            />{" "}
            is my own assistant: chat, a bot, and an agent that runs on its own.
          </p>
        </div>
      </div>
      <nav
        aria-label="Contact and profiles"
        className={cn("grid grid-cols-2 border-t md:grid-cols-[1fr_1fr_1fr_1.5fr]", RULE)}
      >
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            {...("external" in link
              ? { target: "_blank", rel: "noopener noreferrer" }
              : { title: "Email me about work" })}
            className={cn(
              "group/link flex items-center justify-between gap-2 px-4 py-3 font-mono text-[11px] tracking-wide whitespace-nowrap uppercase transition-colors",
              "border-pink-200/80 [&:not(:last-child)]:border-r [&:nth-child(-n+2)]:border-b md:[&:nth-child(-n+2)]:border-b-0",
              "primary" in link
                ? "bg-pink-600 text-white hover:bg-pink-700"
                : "text-pink-950/80 hover:bg-pink-50 hover:text-pink-700",
            )}
          >
            {link.label}
            <span
              aria-hidden
              className="transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
            >
              ↗
            </span>
          </a>
        ))}
      </nav>
    </section>
  );
}

/** Tall beside the intro on wide screens, so the cover art gets room. */
const LISTENING = "xl:col-[6] xl:row-[1/3]";

function ListeningCell() {
  const music = useQuery({
    queryKey: ["home", "recent-plays"],
    queryFn: async () => (await getRecentTracks()).tracks.slice(0, 5),
    staleTime: 2 * 60_000,
    retry: false,
  });
  const [track, ...earlier] = music.data ?? [];
  const label = (
    <Link to="/music" className={STRETCHED}>
      {track?.nowPlaying ? "Listening now" : "Last played"}
    </Link>
  );

  if (!track?.art) {
    return (
      <Cell linked tone="pink" label={label} className={LISTENING}>
        <div className="grid flex-1 place-items-center">
          <span className="grid size-20 rotate-6 place-items-center rounded-full border-2 border-dashed border-pink-400/70 font-mono text-2xl text-pink-500 transition-transform duration-300 ease-out">
            ♪
          </span>
        </div>
        {track ? (
          <p className="min-w-0 text-sm leading-snug text-pink-950/70">
            <span className="block truncate font-medium text-pink-950">{track.track}</span>
            <span className="block truncate">{track.artist}</span>
          </p>
        ) : (
          !music.isPending && <p className="text-sm text-pink-950/65">last.fm did not answer.</p>
        )}
      </Cell>
    );
  }

  const now = new Date();
  return (
    <Cell
      linked
      tone="pink"
      label={label}
      className={cn(
        "overflow-hidden xl:gap-4 *:first:relative *:first:z-10 max-xl:[&_h2]:text-white/80",
        LISTENING,
      )}
    >
      {/* The cover keeps its own square: last.fm art is only 300px, so it never
          stretches. On wide screens it sits in a jewel case with the disc
          peeking out behind it, spinning while the track plays. */}
      <div className="absolute inset-0 xl:relative xl:inset-auto xl:mr-7">
        <span
          aria-hidden
          className={cn(
            "absolute top-[3%] left-[3%] hidden aspect-square w-[94%] rounded-full bg-[conic-gradient(from_20deg,#f5d0fe,#e0f2fe,#fef9c3,#fbcfe8,#ddd6fe,#e0f2fe,#f5d0fe)] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.5)] transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] [mask:radial-gradient(circle,#0000_9%,#000_9.5%,#000_17%,#0003_17.5%,#0003_19%,#000_19.5%)] xl:block xl:translate-x-6 group-hover/cell:xl:translate-x-9",
            track.nowPlaying && "motion-safe:animate-[spin_4s_linear_infinite]",
          )}
        />
        <img
          src={track.art}
          alt={track.album ? `${track.album} cover` : ""}
          className="relative size-full object-cover opacity-90 xl:aspect-square xl:h-auto xl:opacity-100 xl:shadow-[3px_3px_0_rgb(190_24_93/0.18)]"
        />
        {/* The case's hinge: a lighter strip down the left edge. */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 hidden w-2 border-r border-white/40 bg-white/20 xl:block"
        />
      </div>
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-pink-950/85 via-pink-950/10 to-pink-950/75 xl:hidden"
      />
      <div className="relative mt-auto min-w-0 text-sm leading-snug text-white xl:mt-0 xl:text-pink-950">
        <p className="truncate font-semibold xl:text-base">{track.track}</p>
        <p className="truncate opacity-80">{track.artist}</p>
        <p className="mt-1 hidden truncate font-mono text-[10px] tracking-wider uppercase opacity-60 xl:block">
          {track.album && <>{track.album} · </>}
          {track.nowPlaying ? "on now" : track.ts && timeAgo(track.ts, now)}
        </p>
      </div>
      {earlier.length > 0 && (
        <ol className="relative mt-auto hidden border-t border-dashed border-pink-300/70 text-pink-950 xl:block">
          {earlier.map((play, i) => (
            <li
              key={`${play.url}-${play.ts ?? i}`}
              className="flex items-baseline gap-2 border-b border-dashed border-pink-200/80 py-1.5 last:border-b-0"
            >
              <span className="min-w-0 flex-1 truncate text-[12px]">
                {play.track}
                <span className="opacity-55"> · {play.artist}</span>
              </span>
              {play.ts && (
                <span className="shrink-0 font-mono text-[10px] opacity-50">
                  {timeAgo(play.ts, now)}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </Cell>
  );
}

const HEAT = ["bg-pink-100/60", "bg-pink-200", "bg-pink-300", "bg-pink-400", "bg-pink-600"];
const LEVEL: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

/**
 * The past year as a barcode: one bar per week, rising from the card's bottom
 * edge. A bar's height is the week's total against the busiest week, stacked
 * day by day in each day's heat colour, so the busiest weeks reach the top.
 * Hovering the cell runs a scan across, left to right. Phones get the last
 * 26 weeks. Without data (`null`) every week is a flat stub and no count shows.
 */
function GitCell({ data }: { data: ContributionsResponse | null }) {
  const weeks = (data ?? emptyContributions()).weeks.slice(-53).map((week) => {
    const days = [...week.contributionDays].sort((x, y) => x.date.localeCompare(y.date));
    return { days, total: days.reduce((sum, day) => sum + day.contributionCount, 0) };
  });
  const busiest = Math.max(1, ...weeks.map((week) => week.total));
  return (
    <Cell
      linked
      span="w2"
      className="xl:col-[1/3] xl:row-[3]"
      label={
        <a href={siteData.github} target="_blank" rel="noopener noreferrer" className={STRETCHED}>
          Git activity
        </a>
      }
    >
      {data ? (
        <p className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-mono text-4xl font-bold text-pink-600 tabular-nums">
            {data.totalContributions.toLocaleString("en-US")}
          </span>
          <span className="text-sm text-pink-950/65">contributions in the past year</span>
        </p>
      ) : (
        <p className="text-sm text-pink-950/65">
          The contribution count did not load. It is on GitHub.
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <LastPushTag />
        {data && (
          <span className="ml-auto font-mono text-[11px] text-pink-950/50">
            longest streak {data.longestStreak}d
          </span>
        )}
      </div>
      {/* Takes the rest of the cell and runs to its sides and bottom. */}
      <div
        aria-hidden
        className="-mx-4 -mb-4 flex min-h-20 flex-1 items-end gap-[2px] border-t border-dashed border-pink-200/70 px-px md:-mx-5 md:-mb-5"
      >
        {weeks.map((week, w) => (
          <span
            key={week.days[0]?.date ?? w}
            title={
              week.days[0]
                ? `Week of ${week.days[0].date} · ${week.total} contributions`
                : undefined
            }
            style={{ height: `${(week.total / busiest) * 100}%`, ...stagger(w, 5) }}
            className={cn(
              HOVER_DELAY,
              "flex min-h-[3px] flex-1 flex-col-reverse bg-pink-100 opacity-75 transition-opacity duration-200 group-hover/cell:opacity-100 hover:!opacity-60",
              w < weeks.length - 26 && "hidden md:flex",
            )}
          >
            {week.days.map(
              (day) =>
                day.contributionCount > 0 && (
                  <span
                    key={day.date}
                    style={{ flexGrow: day.contributionCount }}
                    className={HEAT[LEVEL[day.contributionLevel] ?? 0]}
                  />
                ),
            )}
          </span>
        ))}
      </div>
    </Cell>
  );
}

function WritingCell() {
  return (
    <Cell
      linked
      span="w2"
      tone="yellow"
      className="xl:col-[4/6] xl:row-[2]"
      label={
        <Link to="/posts" className={STRETCHED}>
          Writing
        </Link>
      }
    >
      <ul className="flex flex-1 flex-col justify-end">
        {getPosts({ limit: 3 }).map((post, i) => (
          <li
            key={post.slug}
            style={stagger(i, 60)}
            className={cn(
              HOVER_DELAY,
              ROW,
              "flex-col gap-1 border-pink-300/70 py-2.5 transition-transform duration-300",
            )}
          >
            <span className="flex w-full items-baseline justify-between gap-3">
              <Link
                to="/posts/$slug"
                params={{ slug: post.slug }}
                className="relative z-10 min-w-0 font-display text-[17px] leading-snug font-semibold text-pink-950 hover:text-pink-600"
              >
                <span className="mr-2 font-mono text-[11px] font-normal text-pink-500 transition-colors group-hover/cell:text-pink-700">
                  0{i + 1}
                </span>
                {post.title}
              </Link>
              <span className="shrink-0 font-mono text-[11px] text-pink-950/55">
                {monthYear.format(new Date(post.date))}
              </span>
            </span>
            {post.description && (
              <span className="line-clamp-2 pl-6 text-sm leading-snug text-pink-950/60">
                {post.description}
              </span>
            )}
          </li>
        ))}
      </ul>
    </Cell>
  );
}

/** "2024-04" as a year with a fraction; a current role ends now. */
function asYear(month: string | null, now: Date): number {
  if (!month) return now.getUTCFullYear() + now.getUTCMonth() / 12;
  return Number(month.slice(0, 4)) + (Number(month.slice(5, 7)) - 1) / 12;
}

/**
 * Every role as a row of a Gantt chart: the company and the job on the left,
 * the stretch of years it took on the right, on one shared axis.
 */
function ExperienceCell() {
  const roles = [...currentRoles(), ...pastRoles()];
  const now = new Date();
  const from = Math.floor(Math.min(...roles.map((r) => asYear(r.period[0], now))));
  const to = Math.ceil(asYear(null, now));
  const at = (year: number) => ((year - from) / (to - from)) * 100;
  const ticks = Array.from({ length: to - from + 1 }, (_, k) => from + k);
  const axis = {
    backgroundImage: `repeating-linear-gradient(90deg, rgb(251 207 232 / 0.8) 0 1px, transparent 1px calc(100% / ${to - from}))`,
  };

  return (
    <Cell
      linked
      span="w2"
      className="xl:col-[2/4] xl:row-[4]"
      label={
        <Link to="/work" className={STRETCHED}>
          Experience
        </Link>
      }
    >
      <div className="flex flex-1 flex-col justify-between gap-2">
        <ol>
          {roles.map((role, i) => {
            const start = asYear(role.period[0], now);
            const end = asYear(role.period[1], now);
            return (
              <li
                key={role.company}
                className={cn(
                  "grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-center gap-4 border-b md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] border-dashed py-1.5 last:border-b-0",
                  RULE,
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-[15px] leading-snug text-pink-950">{role.company}</p>
                  <p className="truncate font-mono text-[10px] text-pink-950/50">
                    {role.position} · {role.time}
                  </p>
                </div>
                <div className="relative h-3" style={axis}>
                  <span
                    style={{
                      left: `${at(start)}%`,
                      width: `${Math.max(at(end) - at(start), 1.5) + (role.period[1] ? 0 : 2)}%`,
                      ...stagger(i, 40),
                    }}
                    className={cn(
                      "absolute inset-y-0 origin-left transition-[scale,background-color] duration-200 ease-out",
                      HOVER_DELAY,
                      role.period[1]
                        ? "bg-pink-300 group-hover/cell:bg-pink-400"
                        : "bg-pink-500 [clip-path:polygon(0_0,calc(100%-7px)_0,100%_50%,calc(100%-7px)_100%,0_100%)]",
                    )}
                  />
                </div>
              </li>
            );
          })}
        </ol>
        <div
          aria-hidden
          className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
        >
          <span className="font-mono text-[10px] text-pink-950/45">{roles.length} roles</span>
          <div className="flex justify-between font-mono text-[10px] text-pink-950/45">
            {ticks.map((year) => (
              <span key={year}>&rsquo;{String(year).slice(2)}</span>
            ))}
          </div>
        </div>
      </div>
    </Cell>
  );
}

/** The three projects the home page shows, in order. */
const FEATURED = ["quorum", "meiro", "mizook"];

const PROJECT_COLS = ["xl:col-[3]", "xl:col-[4]", "xl:col-[5]"];

function ProjectCells() {
  const featured = FEATURED.flatMap((slug) => getProjectBySlug(slug)?.project ?? []);
  const total = getProjects().length;

  return (
    <>
      {featured.map((project, i) => (
        <Cell
          key={project.slug}
          linked
          className={`xl:row-[3] ${PROJECT_COLS[i]}`}
          label={
            <Link to="/projects/$slug" params={{ slug: project.slug }} className={STRETCHED}>
              Project
            </Link>
          }
        >
          <ProjectMark slug={project.slug} title={project.title} />
          <div className="mt-auto min-w-0">
            <p className="w-fit bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat font-display text-lg font-bold text-pink-950 transition-[background-size,color] duration-300 group-hover/cell:bg-[length:100%_2px] group-hover/cell:text-pink-600">
              {project.title}
            </p>
            <p className="line-clamp-2 text-sm leading-snug text-pink-950/65">
              {project.description}
            </p>
          </div>
        </Cell>
      ))}
      <Cell
        linked
        tone="hot"
        className="xl:col-[6] xl:row-[3]"
        label={
          <Link to="/projects" className={STRETCHED}>
            All projects
          </Link>
        }
      >
        <p className="mt-auto origin-bottom-left font-display text-7xl leading-none font-extrabold tabular-nums transition-transform duration-250 ease-out">
          {total}
        </p>
        <p className="text-sm opacity-85">things I&apos;ve built, newest first</p>
      </Cell>
    </>
  );
}

const PR_TONES: StampTone[] = ["lilac", "pink", "sky", "yellow"];

/**
 * Merged PRs as a `git log --graph`: each repo branches off a dashed main
 * line, its PR numbers printed as stamps that open the pull request.
 */
function OpenSourceCell() {
  return (
    <Cell
      linked
      span="w2"
      tone="lilac"
      className="xl:col-[4/6] xl:row-[4]"
      label={
        <Link to="/work" hash="open-source" className={STRETCHED}>
          Open source
        </Link>
      }
    >
      <ol className="relative mt-1 ml-1.5 border-l-2 border-dashed border-purple-300">
        {openSource.map((entry) => {
          const [owner] = entry.repo.split("/");
          const shown = entry.prs.slice(0, 3);
          return (
            <li key={entry.repo} className="relative py-2 pl-7 first:pt-0 last:pb-0">
              <span aria-hidden className="absolute top-1/2 left-0 h-0.5 w-5 bg-purple-300" />
              <span
                aria-hidden
                className="absolute top-1/2 -left-[7px] size-3 -translate-y-1/2 rounded-full border-2 border-purple-400 bg-white transition-colors duration-300 group-hover/cell:bg-purple-400"
              />
              <div className="flex min-w-0 items-center gap-2.5">
                <img
                  src={`https://github.com/${owner}.png?size=48`}
                  alt=""
                  loading="lazy"
                  className="size-6 shrink-0 rounded-md bg-white ring-1 ring-purple-200"
                />
                <a
                  href={`https://github.com/${entry.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 min-w-0 truncate font-mono text-[13px] text-pink-800 hover:text-pink-600"
                >
                  {entry.repo}
                </a>
                <span className="ml-auto flex shrink-0 items-center gap-1">
                  {shown.map((pr, i) => (
                    <a
                      key={pr.number}
                      href={prUrl(entry.repo, pr.number)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={pr.title}
                      style={stagger(i, 70)}
                      className={cn(
                        HOVER_DELAY,
                        "relative z-10 transition-transform duration-300 hover:-translate-y-1.5!",
                        i % 2 ? "rotate-3" : "-rotate-2",
                        i > 0 && "max-sm:hidden",
                      )}
                    >
                      <Stamp tone={PR_TONES[i % 4]} className="drop-shadow-none">
                        <span className="font-mono text-[10px] leading-none">#{pr.number}</span>
                      </Stamp>
                    </a>
                  ))}
                  {entry.prs.length > shown.length && (
                    <span className="font-mono text-[10px] text-pink-950/55">
                      +{entry.prs.length - shown.length}
                    </span>
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </Cell>
  );
}

/** A spec sheet: each group of the uses page with the first thing in it. */
/** What I reach for in each slot, by name from the uses list. */
const LOADOUT = [
  { slot: "Machine", name: "MacBook Air", glyph: "⌘" },
  { slot: "Editor", name: "Zed", glyph: "¶" },
  { slot: "Keyboard", name: "Mao Wang GK65", glyph: "⌨" },
  { slot: "Language", name: "TypeScript", glyph: "λ" },
  { slot: "Agent", name: "AmpCode", glyph: "✦" },
  { slot: "Camera", name: "Fujifilm X-T20", glyph: "◉" },
] as const;

/**
 * The uses page as a till receipt: one line per slot with a dotted leader to
 * what sits in it, a count, and a barcode, filling the whole cell.
 */
function UsesCell() {
  const items = uses.flatMap((section) => section.items);
  return (
    <Cell
      linked
      tone="white"
      className="@container xl:col-[1] xl:row-[4]"
      label={
        <Link to="/uses" className={STRETCHED}>
          Uses
        </Link>
      }
    >
      <div className="-mx-4 flex flex-1 flex-col gap-2 border-t border-dashed border-pink-200 px-4 pt-2.5 font-mono text-[11px] text-pink-950 md:-mx-5 md:px-5">
        <ul className="flex flex-col gap-1.5">
          {LOADOUT.map((pick, i) => (
            <li key={pick.slot} style={stagger(i, 50)} className="flex items-baseline gap-1.5">
              <span className="w-3 shrink-0 text-center text-pink-400">{pick.glyph}</span>
              <span className="shrink-0 text-[9px] tracking-wider text-pink-950/55 uppercase">
                {pick.slot}
              </span>
              <span
                aria-hidden
                className="min-w-2 flex-1 translate-y-[-3px] border-b border-dotted border-pink-300"
              />
              <span className="min-w-0 truncate font-semibold">{pick.name}</span>
            </li>
          ))}
        </ul>
        <p className="mt-auto flex justify-between border-t border-dashed border-pink-200 pt-1.5 text-[10px] uppercase">
          <span>Total</span>
          <span>{items.length} things</span>
        </p>
        <span
          aria-hidden
          className="block h-5 w-full bg-[repeating-linear-gradient(90deg,rgb(80_7_36)_0_1px,transparent_1px_3px,rgb(80_7_36)_3px_5px,transparent_5px_6px,rgb(80_7_36)_6px_7px,transparent_7px_10px)] opacity-70"
        />
      </div>
    </Cell>
  );
}

/**
 * Neighbours as a postmark: their initials printed round a dashed ring, each
 * one opening their site. The ring turns a notch on hover.
 */
/** A small, stable number from a name, so every star keeps its place between builds. */
function seed(name: string): number {
  let h = 2166136261;
  for (const c of name) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

const STAR_TONES = ["fill-yellow-300", "fill-sky-300", "fill-pink-300", "fill-purple-300"];

/**
 * Neighbours as a sky: one star per site, scattered round me in the middle.
 * At rest they are just dots. Hover draws the lines out to each of them, and
 * a star shows its name and opens the site.
 */
function NeighboursCell() {
  const people = [...neighbours].sort((a, b) => a.name.localeCompare(b.name));
  const stars = people.map((person, i) => {
    const h = seed(person.name);
    const angle = i * 2.39996 + ((h % 100) / 100) * 0.7;
    const radius = 16 + (((h >>> 8) % 100) / 100) * 30;
    // Rounded: Node and browsers disagree on the last digits of sin/cos,
    // which breaks hydration of the prerendered SVG.
    return {
      ...person,
      x: Math.round((50 + Math.cos(angle) * radius) * 100) / 100,
      y: Math.round((50 + Math.sin(angle) * radius) * 100) / 100,
      size: 1.6 + ((h >>> 16) % 3) * 0.5,
    };
  });
  return (
    <Cell
      linked
      tone="sky"
      className="max-md:col-span-2 xl:col-[6] xl:row-[4]"
      label={
        <Link to="/neighbours" className={STRETCHED}>
          Neighbours
        </Link>
      }
    >
      {/* Absolute, so the sky fills the cell without setting the row's height. */}
      <div className="pointer-events-none relative z-10 min-h-28 flex-1">
        <svg
          viewBox="0 0 100 100"
          aria-label={`${people.length} sites`}
          className="absolute inset-0 size-full overflow-visible"
        >
          {stars.map((star, i) => (
            <line
              key={star.url}
              x1={50}
              y1={50}
              x2={star.x}
              y2={star.y}
              pathLength={1}
              strokeDasharray="1"
              style={stagger(i, 15)}
              className={cn(
                "stroke-sky-400/70 [stroke-dashoffset:1] [stroke-width:0.35] transition-[stroke-dashoffset] duration-300 ease-out group-hover/cell:[stroke-dashoffset:0]",
                HOVER_DELAY,
              )}
            />
          ))}
          <circle cx={50} cy={50} r={2.4} className="fill-pink-500" />
          <circle
            cx={50}
            cy={50}
            r={4.5}
            className="fill-none stroke-pink-400/60 [stroke-dasharray:1.2_1.2] [stroke-width:0.4]"
          />
          {stars.map((star, i) => (
            <a
              key={star.url}
              href={star.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={star.name}
              className="group/star pointer-events-auto focus-visible:outline-none"
            >
              <circle cx={star.x} cy={star.y} r={5} className="fill-transparent" />
              <circle
                cx={star.x}
                cy={star.y}
                r={star.size}
                className={cn(
                  "origin-center stroke-white [stroke-width:0.5] transition-transform duration-200 ease-out [transform-box:fill-box] group-hover/star:scale-[1.8] group-focus-visible/star:scale-[1.8]",
                  STAR_TONES[i % 4],
                )}
              />
              <text
                x={star.x}
                y={star.y - star.size - 2.5}
                textAnchor="middle"
                className="fill-sky-900 font-mono text-[4.5px] opacity-0 transition-opacity duration-150 group-hover/star:opacity-100 group-focus-visible/star:opacity-100"
              >
                {star.name}
              </text>
            </a>
          ))}
        </svg>
      </div>
    </Cell>
  );
}

/**
 * The home page: the whole site as one bento box. Each compartment
 * summarises a page and opens it.
 */
export function HomeGrid({ contributions }: { contributions: ContributionsResponse | null }) {
  return (
    <Box dense>
      <IntroCell />
      <StatusTile />
      <ListeningCell />
      <UsesCell />
      {/* On four columns, git, writing, and neighbours share one row at 3:3:1.
          On two and six columns the wrapper drops out and they sit in the grid. */}
      <div className="contents md:col-span-4 md:grid md:grid-cols-[3fr_3fr_1fr] md:*:col-span-1 xl:contents">
        <GitCell data={contributions} />
        <WritingCell />
        <NeighboursCell />
      </div>
      <ProjectCells />
      <ExperienceCell />
      <OpenSourceCell />
    </Box>
  );
}
