import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { CSSProperties, MouseEvent } from "react";
import siteData from "~/data/sites";
import { currentRoles, pastRoles, yearRange } from "~/data/work-experience";
import type { Work } from "~/types/work-experience";
import { getPosts } from "~/features/posts/lib/posts";
import { BasedRow } from "./based-row";

const LABEL = "font-mono text-[11px] uppercase tracking-[0.18em] text-pink-950/65 md:pt-0.5";
const VALUE = "font-body text-[17px] leading-[1.95] text-pink-950/80";
const ROW = "grid gap-1 py-5 md:grid-cols-[9rem_1fr] md:gap-x-8";
const INLINE_LINK =
  "font-medium text-pink-800 underline decoration-pink-300 decoration-dotted underline-offset-4 transition-colors hover:text-pink-600 hover:decoration-solid";
/** App-tile pills: a text pill with the logo as a tilted icon tile hanging off its left edge. */
const TILE_PILL =
  "group/pill relative inline-flex h-7 items-center whitespace-nowrap rounded-[9px] border border-pink-200 bg-gradient-to-b from-white to-pink-50 pl-9 pr-2.5 align-middle text-[14px] font-semibold leading-none text-pink-950";
const TILE =
  "absolute -left-px top-1/2 size-9 -translate-y-1/2 -rotate-6 rounded-[10px] border border-pink-200 bg-white object-contain p-1 shadow-[0_3px_0_rgba(190,24,93,0.13)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/pill:-translate-y-[58%] group-hover/pill:rotate-[4deg] group-hover/pill:scale-110 motion-reduce:transition-none";
/** The same tile, grown up to hang off the top-left corner of the open card. */
const TILE_OPEN =
  "absolute -left-3 -top-3 size-14 -rotate-6 rounded-[14px] border border-pink-200 bg-white object-contain p-1.5 shadow-[0_3px_0_rgba(190,24,93,0.13)]";
type ExpandedCompany = { company: Work["company"]; panelOffset: number };
type CompanyToggle = (company: Work["company"], event: MouseEvent<HTMLButtonElement>) => void;

const rolesByCompany = new Map(
  [...currentRoles(), ...pastRoles()].map((role) => [role.company, role]),
);

/**
 * Tilted a touch at rest, like a card on a table. Clicking straightens it, then
 * the full card pops up out of the badge with a springy overshoot, anchored on the
 * badge's bottom edge and growing upward. An invisible twin holds the badge's slot
 * in the text flow so nothing reflows.
 */
function CompanyBadge({
  company,
  label = company,
  expandedCompany,
  onToggle,
}: {
  company: Work["company"];
  label?: string;
  expandedCompany: ExpandedCompany | null;
  onToggle: CompanyToggle;
}) {
  const role = rolesByCompany.get(company);
  const isExpanded = expandedCompany?.company === company;
  const id = useId();
  const [touched, setTouched] = useState(false);
  const years = role ? yearRange(role) : null;
  const inset = role?.website ? "pl-9" : "pl-2.5";
  const motion = touched && isExpanded ? "animate-card-pop" : "";

  return (
    <span className="relative mx-1 inline-block h-7 align-middle">
      <span
        aria-hidden="true"
        className={`invisible inline-flex h-7 items-center gap-1.5 whitespace-nowrap border ${inset} pr-2.5 text-[14px] font-semibold leading-none`}
      >
        <span>{label}</span>
        {years && <span className="font-mono text-[11px]">{years}</span>}
      </span>
      <span
        style={{ left: isExpanded ? (expandedCompany?.panelOffset ?? 0) : 0 }}
        data-company-card
        className={`group/pill absolute bottom-0 flex origin-bottom-left flex-col border text-left motion-reduce:animate-none ${motion} ${
          isExpanded
            ? "z-40 w-[min(26rem,calc(100vw-2rem))] rounded-[14px] border-pink-300 bg-gradient-to-b from-white to-pink-50 shadow-[0_6px_0_rgba(190,24,93,0.14)]"
            : "z-10 w-full rounded-[9px] border-pink-200 bg-gradient-to-b from-white to-pink-50 transition-colors hover:border-pink-300 motion-reduce:transition-none"
        }`}
      >
        <button
          id={`${id}-trigger`}
          type="button"
          aria-expanded={isExpanded}
          aria-controls={`${id}-details`}
          onClick={(event) => {
            setTouched(true);
            onToggle(company, event);
          }}
          className={`flex w-full cursor-pointer items-center text-[14px] leading-none text-pink-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-400 ${isExpanded ? "" : "whitespace-nowrap"}`}
        >
          {role?.website && (
            <img
              src={role.website.favicon}
              alt=""
              width={48}
              height={48}
              className={isExpanded ? `${TILE_OPEN} ${touched ? "animate-tile-pop" : ""}` : TILE}
              loading="lazy"
              decoding="async"
            />
          )}
          <span
            className={`flex flex-col gap-1 text-left ${isExpanded ? "min-h-14 justify-center py-3 pl-[3.75rem] pr-4" : `h-[26px] justify-center ${inset} pr-2.5`}`}
          >
            <span className="flex items-baseline gap-1.5">
              <span className={`font-semibold ${isExpanded ? "text-base" : ""}`}>{label}</span>
              {years && <span className="font-mono text-[11px] text-pink-950/65">{years}</span>}
            </span>
            {role && isExpanded && (
              <span className="font-mono text-[10px] text-pink-950/65">
                {role.position} · {role.country} · {role.time}
              </span>
            )}
          </span>
        </button>
        <div
          id={`${id}-details`}
          role="region"
          aria-labelledby={`${id}-trigger`}
          hidden={!isExpanded}
          tabIndex={0}
          className="max-h-[min(45vh,22rem)] overflow-y-auto rounded-b-[13px] border-t border-pink-200 p-4 text-[15px] leading-[1.75] text-pink-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-400"
        >
          {role ? (
            <ul className="list-disc space-y-2 pl-4 marker:text-pink-400">
              {role.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : (
            <p>Work details are not available.</p>
          )}
        </div>
      </span>
    </span>
  );
}

/** Each tool borrows the palette of its own site, so the fan reads as four distinct cards. */
const CAFE_TOOLS = [
  {
    name: "Cloudflare",
    favicon: "/assets/tool-favicons/cloudflare.png",
    angle: -56,
    pill: "border-orange-400 bg-gradient-to-br from-white via-orange-50 to-amber-200 text-orange-950",
    logo: "border-orange-300 bg-white",
  },
  {
    name: "Alchemy",
    favicon: "/assets/tool-favicons/alchemy.svg",
    angle: -24,
    pill: "border-[#b4c795] bg-[#eef4e1] text-[#3f5a2a]",
    logo: "border-[#b4c795] bg-[#f8fbf1]",
  },
  {
    name: "Foldkit",
    favicon: "/assets/tool-favicons/foldkit.svg",
    angle: 8,
    pill: "border-violet-300 bg-[#f8f7fb] text-violet-900",
    logo: "border-violet-200 bg-white",
  },
  {
    name: "Effect",
    favicon: "/assets/tool-favicons/effect.svg",
    angle: 40,
    pill: "border-[#f9ad00]/70 bg-[#17171a] text-[#fbf0df]",
    logo: "border-[#f9ad00]/40 bg-[#17171a]",
  },
] as const;

const OPEN_FAN =
  "group-data-[open=true]/cafe:duration-300 group-data-[open=true]/cafe:ease-[var(--ease-out-strong)] group-data-[open=true]/cafe:opacity-100 group-data-[open=true]/cafe:[transition-delay:var(--delay)] group-data-[open=true]/cafe:[transform:rotate(var(--angle))_translateX(34px)]";

const FAN_STAGGER_MS = 45;

/** Longest a full open/close can take (300ms + 3 staggers); a flip sooner than this interrupts it. */
const FAN_SETTLE_MS = 300 + (CAFE_TOOLS.length - 1) * FAN_STAGGER_MS;

/**
 * "CAFE" opens into a fan of cards pivoting on the badge, one per tool, each swinging
 * counter-clockwise out of the bottom slot in turn (and back, reversed, on close).
 * Hover previews the fan, a click pins it open, and a click outside or Escape closes
 * it. Flipping mid-animation drops the stagger so every card retargets from where it
 * is instead of waiting its turn. Below `md` the cards wrap under the badge instead
 * (see `[data-cafe-fan]` in `~/styles.css`), where a fan would run past the viewport.
 */
function CafeStack() {
  const ref = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<number>(undefined);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || pinned;

  const last = useRef({ open: false, at: 0, rush: false });
  if (last.current.open !== open) {
    const now = performance.now();
    last.current = { open, at: now, rush: now - last.current.at < FAN_SETTLE_MS };
  }
  const { rush } = last.current;

  useEffect(() => {
    if (!open) return;
    const closeAll = () => {
      setHovered(false);
      setPinned(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) closeAll();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAll();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  return (
    <div className="mt-4 min-h-16">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[15px] text-pink-950/75">My go-to app stack lately is</span>
        <div
          ref={ref}
          data-open={open}
          className="group/cafe relative z-20 inline-block"
          onPointerEnter={(event) => {
            if (event.pointerType !== "mouse") return;
            window.clearTimeout(leaveTimer.current);
            setHovered(true);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType !== "mouse") return;
            // Bridge the gap between the badge and the fan so crossing it doesn't flicker.
            leaveTimer.current = window.setTimeout(() => setHovered(false), 120);
          }}
        >
          <button
            type="button"
            aria-expanded={open}
            aria-label="CAFE app stack; expand to see Cloudflare, Alchemy, Foldkit, and Effect"
            onClick={() => setPinned((wasPinned) => !wasPinned)}
            className="relative inline-flex h-7 cursor-pointer items-center whitespace-nowrap rounded-[9px] border border-[#d9b48a] bg-gradient-to-b from-[#fffaf2] to-[#f3e1c7] pl-9 pr-3 align-middle text-[14px] font-semibold leading-none tracking-[0.14em] text-[#4a2c1a] transition-colors hover:border-[#c49a6c] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8a5a3b] motion-reduce:transition-none"
          >
            <span className="absolute -left-px top-1/2 flex size-9 -translate-y-1/2 -rotate-6 items-center justify-center rounded-[10px] border border-[#d9b48a] bg-[#fbeed8] shadow-[0_3px_0_rgba(138,90,59,0.2)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/cafe:-translate-y-[58%] group-hover/cafe:rotate-[4deg] group-hover/cafe:scale-110 group-data-[open=true]/cafe:-translate-y-[58%] group-data-[open=true]/cafe:rotate-[4deg] group-data-[open=true]/cafe:scale-110 motion-reduce:transition-none">
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="size-5 overflow-visible"
                fill="none"
                stroke="#4a2c1a"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9h11v4a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" fill="#d9b48a" />
                <path d="M14 10h1.5a2 2 0 0 1 0 4H14" />
                <path
                  d="M6 6q-1-1.5 0-3M9 6q-1-1.5 0-3M12 6q-1-1.5 0-3"
                  className="animate-steam motion-reduce:animate-none"
                />
              </svg>
            </span>
            CAFE
          </button>
          <span
            aria-hidden="true"
            data-cafe-fan
            className="pointer-events-none group-data-[open=true]/cafe:pointer-events-auto absolute left-[calc(100%-28px)] top-1/2 size-0"
          >
            {CAFE_TOOLS.map(({ name, favicon, angle, pill, logo }, index) => (
              <span
                key={name}
                data-cafe-fan-card
                style={
                  {
                    "--angle": `${angle}deg`,
                    "--delay": rush ? "0ms" : `${index * FAN_STAGGER_MS}ms`,
                    "--out-delay": rush
                      ? "0ms"
                      : `${(CAFE_TOOLS.length - 1 - index) * FAN_STAGGER_MS}ms`,
                    zIndex: index + 1,
                  } as CSSProperties
                }
                className={`absolute -top-3.5 left-0 flex h-7 w-max origin-left items-center whitespace-nowrap rounded-[9px] border pl-3 pr-9 text-[14px] font-semibold leading-none opacity-0 shadow-[2px_2px_0_rgba(190,24,93,0.12)] transition-[opacity,transform] duration-200 ease-in [transform:rotate(40deg)_translateX(34px)_scale(0.6)] [transition-delay:var(--out-delay)] motion-reduce:transition-none ${OPEN_FAN} ${pill}`}
              >
                <img
                  src={favicon}
                  alt=""
                  width={36}
                  height={36}
                  loading="lazy"
                  decoding="async"
                  className={`absolute -right-px top-1/2 size-9 -translate-y-1/2 rotate-6 rounded-[10px] border object-contain p-1 shadow-[0_3px_0_rgba(0,0,0,0.12)] ${logo}`}
                />
                <span>{name}</span>
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

/** A project mentioned in the prose: the same app-tile pill as the companies, linking to its repo. */
function ProjectBadge({ name, href, icon }: { name: string; href: string; icon: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${TILE_PILL} mx-1 no-underline transition-colors hover:border-pink-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-400 motion-reduce:transition-none`}
    >
      <img
        src={icon}
        alt=""
        width={36}
        height={36}
        className={TILE}
        loading="lazy"
        decoding="async"
      />
      {name}
    </a>
  );
}

/** The latest three posts, each shown by its title. */
function Takes() {
  return (
    <>
      <ul className="divide-y divide-pink-200/40">
        {getPosts({ limit: 3 }).map((post) => {
          return (
            <li
              key={post.slug}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2 first:pt-0 last:pb-0"
            >
              <Link
                to="/posts/$slug"
                params={{ slug: post.slug }}
                className="max-w-[52ch] text-pretty underline decoration-pink-300 decoration-dotted underline-offset-4 transition-colors hover:text-pink-600 hover:decoration-pink-500 hover:decoration-solid"
              >
                {post.title}
              </Link>
              <span className="font-mono text-xs text-pink-950/70">
                {new Intl.DateTimeFormat("en-GB", {
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(new Date(post.date))}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/**
 * The at-a-glance block: the same facts the CV leads with, in the shape a
 * profile page uses. Roles come from `work`, so joining or leaving a company
 * updates "Currently" and "Previously" together.
 */
export function ProfileFacts() {
  const [expandedCompany, setExpandedCompany] = useState<ExpandedCompany | null>(null);

  useEffect(() => {
    if (!expandedCompany) return;
    const close = (event: PointerEvent) => {
      if (!(event.target as Element).closest("[data-company-card]")) setExpandedCompany(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpandedCompany(null);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [expandedCompany]);

  function toggleCompany(company: Work["company"], event: MouseEvent<HTMLButtonElement>) {
    if (expandedCompany?.company === company) {
      setExpandedCompany(null);
      return;
    }

    const { left } = event.currentTarget.getBoundingClientRect();
    const panelWidth = Math.min(416, window.innerWidth - 32);
    const panelLeft = Math.min(Math.max(16, left), window.innerWidth - panelWidth - 16);
    setExpandedCompany({ company, panelOffset: panelLeft - left });

    // The card grows upward; once it has settled, bring it fully into view if it overshot.
    const card = event.currentTarget.parentElement;
    window.setTimeout(() => {
      const rect = card?.getBoundingClientRect();
      if (rect && (rect.top < 80 || rect.bottom > window.innerHeight)) {
        window.scrollBy({ top: rect.top - 88, behavior: "smooth" });
      }
    }, 700);
  }

  return (
    <section aria-labelledby="facts-heading" className="relative with-box-underline px-2 md:px-8">
      <h2 id="facts-heading" className="sr-only">
        At a glance
      </h2>
      <dl className="divide-y divide-pink-200/50">
        <div className={ROW}>
          <dt className={LABEL}>Currently</dt>
          <dd className={VALUE}>
            <div className="max-w-[70ch] space-y-4 text-pretty">
              <div>
                I work at{" "}
                <CompanyBadge
                  company="Aerotalon"
                  expandedCompany={expandedCompany}
                  onToggle={toggleCompany}
                />
                , a company focused on modernizing aviation operations software. I build end-to-end
                features, mostly on the frontend, including maintenance, repair, and operations
                tools that help flight-ops teams work more efficiently.
              </div>
              <p>
                Outside work, I build{" "}
                <ProjectBadge
                  name="Meiro"
                  href="https://github.com/elianiva/meiro"
                  icon="https://raw.githubusercontent.com/elianiva/meiro/master/resources/icon.png"
                />
                , a YouTube Music client, and{" "}
                <ProjectBadge
                  name="Nook"
                  href="https://github.com/elianiva/nook"
                  icon="https://raw.githubusercontent.com/elianiva/nook/master/apps/frontend/public/favicon.svg"
                />
                , my own Anki clone for learning Japanese.
              </p>
              <p>
                I care about making fast software that&rsquo;s delightful to use. With AI making
                software cheaper to build, I think it&rsquo;s even more important to make it with
                care. I like fixing the things that frustrate people.
              </p>
              <CafeStack />
            </div>
          </dd>
        </div>

        <div className={ROW}>
          <dt className={LABEL}>Previously</dt>
          <dd className={VALUE}>
            <div className="max-w-[70ch] space-y-4 text-pretty">
              <div>
                I worked as a product engineer at{" "}
                <CompanyBadge
                  company="IPB Training"
                  expandedCompany={expandedCompany}
                  onToggle={toggleCompany}
                />
                , where I rebuilt its legacy finance system to streamline the whole process.
              </div>
              <div>
                Before that, I took on{" "}
                <CompanyBadge
                  company="Various freelance work"
                  expandedCompany={expandedCompany}
                  onToggle={toggleCompany}
                />
                . At{" "}
                <CompanyBadge
                  company="PT. Healstation Indonesia"
                  label="PT Healstation"
                  expandedCompany={expandedCompany}
                  onToggle={toggleCompany}
                />
                , I built a CMS for camp-equipment rentals. I also built multiple banking websites
                and CMSs at{" "}
                <CompanyBadge
                  company="Cubix Branding Agency"
                  expandedCompany={expandedCompany}
                  onToggle={toggleCompany}
                />
                , and a custom internal tool for a client of{" "}
                <CompanyBadge
                  company="Enam Dua Teknologi"
                  expandedCompany={expandedCompany}
                  onToggle={toggleCompany}
                />{" "}
                that brought Jira-like project tracking and Google Drive-style file management
                together.
              </div>
              <p>
                For more detail, see the{" "}
                <a href="#experience-heading" className={INLINE_LINK}>
                  work experience section
                </a>{" "}
                or{" "}
                <a href={siteData.cv} className={INLINE_LINK}>
                  my CV
                </a>
                .
              </p>
            </div>
          </dd>
        </div>

        <div className={ROW}>
          <dt className={LABEL}>Based</dt>
          <dd className={VALUE}>
            <BasedRow />
          </dd>
        </div>

        <div className={ROW}>
          <dt className={LABEL}>Takes</dt>
          <dd className={VALUE}>
            <Takes />
          </dd>
        </div>
      </dl>
    </section>
  );
}
