import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { cn } from "~/lib/utils";
import { Box, Cell, cutouts } from "./box";

/** Each page and its three-letter route code, printed faintly on its ticket like a destination. */
const NAV_ITEMS = [
  { label: "Home", href: "/", code: "HOM" },
  { label: "Posts", href: "/posts", code: "PST" },
  { label: "Projects", href: "/projects", code: "PRJ" },
  { label: "Work", href: "/work", code: "WRK" },
  { label: "Music", href: "/music", code: "MSC" },
  { label: "Uses", href: "/uses", code: "USE" },
  { label: "Neighbours", href: "/neighbours", code: "NBR" },
] as const;

const TONES = ["bg-yellow-200", "bg-sky-200", "bg-pink-200", "bg-purple-200"];
const STUB = 26; // px; the perforation sits on this line

function isActiveFor(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function ticketMask(punched: boolean) {
  return cutouts(
    [5, "0 50%"],
    [5, "100% 50%"],
    [4, `${STUB}px 0`],
    [4, `${STUB}px 100%`],
    ...(punched ? ([[3.5, "calc(100% - 13px) 12px"]] as [number, string][]) : []),
  );
}

/** Irregular bars, so the strip reads as a barcode and not as stripes. */
const BARCODE =
  "repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 3px, currentColor 3px 5px, transparent 5px 6px, currentColor 6px 7px, transparent 7px 9px, currentColor 9px 9.5px, transparent 9.5px 11px)";

function Ticket({
  label,
  code,
  n,
  active,
}: {
  label: string;
  code: string;
  n: number;
  active: boolean;
}) {
  return (
    <span
      className={cn(
        "block drop-shadow-[0_2px_0_rgb(244_114_182/0.4)] transition-transform duration-200 ease-out group-active/t:scale-[0.97]",
        active
          ? "-translate-y-1 -rotate-6"
          : "group-hover/t:-translate-y-1.5 group-hover/t:rotate-2 group-focus-visible/t:-translate-y-1.5",
      )}
    >
      <span
        className={cn(
          "relative flex h-[3.25rem] w-full text-pink-950",
          active ? TONES[n % 4] : "bg-white",
        )}
        style={ticketMask(active)}
      >
        <span
          className="grid shrink-0 place-items-center border-r border-dashed border-pink-950/25 font-mono text-[8px] tracking-widest text-pink-950/50 [writing-mode:vertical-rl]"
          style={{ width: STUB }}
        >
          <span className="rotate-180">No.{String(n + 1).padStart(2, "0")}</span>
        </span>
        <span className="relative flex flex-1 flex-col justify-center gap-1 pr-4 pl-2.5">
          <span
            aria-hidden
            className="absolute right-3 bottom-1.5 hidden font-display text-xl leading-none font-extrabold tracking-wider opacity-10 @[65rem]:block"
          >
            {code}
          </span>
          <span
            className={cn(
              "font-heading text-[11px] leading-none tracking-[0.16em] uppercase",
              active ? "font-bold" : "text-pink-950/75",
            )}
          >
            {label}
          </span>
          <span
            aria-hidden
            className={cn("block h-2 w-full max-w-16", active ? "opacity-60" : "opacity-25")}
            style={{ backgroundImage: BARCODE }}
          />
        </span>
      </span>
    </span>
  );
}

/**
 * The top tray: one big ticket with my handle and a stub that tilts as if
 * about to tear, then a strip of perforated tickets, one per page. The current page's ticket is torn off, punched, and
 * postmarked. On phones the strip scrolls sideways and keeps it in view.
 */
export function NavigationStrip() {
  const { pathname } = useLocation();
  const strip = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = strip.current;
    const current = list?.querySelector<HTMLElement>("li:has([aria-current=page])");
    if (!list || !current || list.scrollWidth <= list.clientWidth) return;
    const left = current.offsetLeft - (list.clientWidth - current.offsetWidth) / 2;
    list.scrollTo({ left, behavior: "smooth" });
  }, [pathname]);

  return (
    <header className="md:pt-4">
      <Box square={false}>
        <Cell
          tone="yellow"
          className="col-span-2 justify-center px-2.5 py-2 md:col-span-1 md:px-3 md:py-2"
        >
          <Link
            to="/"
            aria-label="elianiva, home"
            className="group/stub flex h-full min-h-14 drop-shadow-[0_2px_0_rgb(244_114_182/0.4)] focus-visible:outline-none"
          >
            <span
              className="flex min-w-0 flex-1 flex-col justify-between bg-white py-2.5 pr-3 pl-4"
              style={cutouts([6, "0 50%"], [5, "100% 0"], [5, "100% 100%"])}
            >
              <span className="font-mono text-[8px] tracking-[0.3em] text-pink-500 uppercase">
                elianiva.com
              </span>
              <span className="font-display text-2xl leading-none font-extrabold tracking-wide text-pink-950 uppercase">
                <span className="text-pink-500">e</span>lianiva
              </span>
              <span
                aria-hidden
                className="block h-1.5 w-full max-w-40 opacity-25"
                style={{ backgroundImage: BARCODE }}
              />
            </span>
            <span
              className="relative grid w-11 shrink-0 origin-top-left place-items-center border-l-2 border-dashed border-pink-950/20 bg-yellow-200 transition-transform duration-200 ease-out group-hover/stub:rotate-[5deg] group-active/stub:rotate-[9deg] group-focus-visible/stub:rotate-[5deg]"
              style={cutouts([5, "0 0"], [5, "0 100%"], [6, "100% 50%"], [3.5, "50% 18%"])}
            >
              <span className="rotate-180 font-mono text-[8px] tracking-[0.25em] text-pink-950/60 [writing-mode:vertical-rl]">
                No.0001
              </span>
            </span>
          </Link>
        </Cell>
        <Cell as="nav" span="w3" className="justify-center p-0 md:p-0">
          {/* The strip is the query container for the route codes: they print
              once every ticket has room for one. Keeping the container here
              rather than on each ticket lets the tickets size to their labels
              and scroll on narrow screens instead of collapsing. */}
          <ul
            ref={strip}
            aria-label="Main"
            className="@container flex snap-x items-center gap-1 overflow-x-auto px-3 pt-3 pb-2 [scrollbar-width:none] md:px-3 [&::-webkit-scrollbar]:hidden"
          >
            {NAV_ITEMS.map((item, i) => {
              const active = isActiveFor(pathname, item.href);
              return (
                <li
                  key={item.href}
                  className={cn(
                    "relative shrink-0 snap-center md:min-w-max md:flex-1",
                    active && "z-10",
                  )}
                >
                  <Link
                    to={item.href}
                    aria-current={active ? "page" : undefined}
                    className="group/t block focus-visible:outline-none"
                  >
                    <Ticket label={item.label} code={item.code} n={i} active={active} />
                  </Link>
                  {active && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -top-3.5 -right-1.5 grid size-8 rotate-12 place-items-center rounded-full border-2 border-dashed border-pink-500/75 font-mono text-[7px] leading-none font-bold text-pink-500/85"
                    >
                      HERE
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </Cell>
      </Box>
    </header>
  );
}
