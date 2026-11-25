import type { CSSProperties, ReactNode } from "react";
import ArrowUpRightIcon from "~icons/ph/arrow-up-right";
import { cn } from "~/lib/utils";

/**
 * The site's one layout: a bento box. Every page is a `Box` of `Cell`s on a
 * 4-column grid (2 on phones, 6 from 1280px up, full width up to 1920px) with shared hairlines and no gaps. On
 * phones it runs edge to edge: the outer hairlines fall off the screen. In a
 * `square` box each row is as tall as a column is wide, so a 1×1 cell is a
 * square; rows still grow when their content needs more room.
 */

/**
 * The hairline between cells. On paper this pink sits at about the old
 * pink-200 weight; on tinted and dark cells its alpha lets the paper colour
 * come through, so it settles in instead of cutting across as a fixed pink.
 */
export const RULE = "border-pink-400/30";
export const LABEL = "font-mono text-[10px] uppercase tracking-[0.2em] text-pink-950/55";

/**
 * Stretches a link over its whole cell. Put it on the cell's label link; any
 * other link or button inside the cell needs `relative z-10` to stay clickable.
 */
export const STRETCHED =
  "after:absolute after:inset-0 after:z-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-4 focus-visible:after:outline-pink-500";

/**
 * The paper colours of the old ticket stamps, each printed with its own
 * pattern (see `.pat-*` in `~/styles.css`): dither, ruled lines, hatching,
 * graph paper, or a halftone that fades up the cell.
 */
export const TONES = {
  paper: "",
  white: "bg-white/70",
  graph: "pat-graph bg-white/60 [--pat-ink:rgb(251_207_232/0.35)]",
  dots: "pat-dither [--pat-ink:rgb(244_114_182/0.1)]",
  yellow: "pat-dither bg-yellow-50/40 [--pat-ink:rgb(250_204_21/0.14)]",
  sky: "pat-lines bg-sky-50/40 [--pat-ink:rgb(125_211_252/0.14)]",
  pink: "pat-fade bg-pink-50/40 [--pat-ink:rgb(236_72_153/0.08)]",
  lilac: "pat-diag bg-purple-50/40 [--pat-ink:rgb(192_132_252/0.1)]",
  ink: "pat-graph bg-pink-950 text-pink-50 [--pat-ink:rgb(255_255_255/0.04)]",
  hot: "pat-fade bg-pink-600 text-white [--pat-ink:rgb(255_255_255/0.16)]",
  /** hot's dotted fade, in a quiet plum. */
  dusk: "pat-fade bg-[#4a1630] text-pink-50 [--pat-ink:rgb(244_114_182/0.2)]",
  /** An empty compartment: diagonal pencil hatching instead of a blank hole. */
  hatch: "pat-diag [--pat-ink:rgb(251_207_232/0.4)]",
} as const;
export type Tone = keyof typeof TONES;

const SPANS = {
  "1": "",
  w2: "col-span-2",
  /** The rest of a row after one cell: 3 of 4 columns, 5 of 6. */
  w3: "col-span-2 md:col-span-3 xl:col-span-5",
  /** A whole row. */
  w4: "col-span-2 md:col-span-4 xl:col-span-6",
  s2: "col-span-2 row-span-2",
  t2: "row-span-2",
} as const;
export type Span = keyof typeof SPANS;

export function Box({
  children,
  square = true,
  className,
  label,
  dense = false,
  head,
}: {
  children: ReactNode;
  square?: boolean;
  /** Let later cells fill holes left earlier in the flow, for grids whose order is loose. */
  dense?: boolean;
  /**
   * The box opens with a PageHead and this many more rows (0 for none) that
   * size to their content instead of to square cells.
   */
  head?: number;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "@container mx-auto w-full max-w-[1920px] max-md:overflow-hidden md:px-4",
        className,
      )}
    >
      <div
        aria-label={label}
        // PageHead stacks into two rows on mobile and sits on one row from md up.
        style={
          head === undefined
            ? undefined
            : ({
                "--head-rows": `repeat(${2 + head}, auto)`,
                "--head-rows-md": `repeat(${1 + head}, auto)`,
              } as CSSProperties)
        }
        className={cn(
          "cells-enter grid grid-cols-2 bg-[#fff8f4]/80 max-md:w-[calc(100%+1px)] md:grid-cols-4 md:border-t md:border-l xl:grid-cols-6",
          RULE,
          dense && "grid-flow-row-dense",
          head !== undefined &&
            "[grid-template-rows:var(--head-rows)] md:[grid-template-rows:var(--head-rows-md)]",
          square &&
            "[grid-auto-rows:minmax(50cqw,auto)] md:[grid-auto-rows:minmax(25cqw,auto)] xl:[grid-auto-rows:minmax(calc(100cqw/6),auto)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function Cell({
  span = "1",
  tone = "paper",
  label,
  linked = false,
  as: Tag = "section",
  className,
  style,
  children,
}: {
  span?: Span;
  tone?: Tone;
  /** The mono caption; pass a link with `STRETCHED` and set `linked` to make the cell open it. */
  label?: ReactNode;
  linked?: boolean;
  as?: "section" | "article" | "div" | "header" | "aside" | "nav" | "li";
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const dark = tone === "ink" || tone === "hot" || tone === "dusk";
  return (
    <Tag
      style={style}
      className={cn(
        "group/cell relative flex min-w-0 flex-col gap-3 border-r border-b p-4 md:p-5",
        RULE,
        SPANS[span],
        TONES[tone],
        // Hovered, a linked cell's paper drifts and a perforation cuts in
        // round its edge, as if it were about to be torn off.
        linked &&
          "pat-live outline-2 outline-transparent outline-dashed transition-[outline-color,outline-offset,filter] duration-200 hover:-outline-offset-4",
        linked && !dark && "hover:outline-pink-300",
        linked && dark && "hover:brightness-110 hover:outline-white/45",
        className,
      )}
    >
      {(label || linked) && (
        <div className="flex items-start justify-between gap-3">
          {label ? (
            <h2 className={cn(LABEL, dark && "text-current opacity-75")}>{label}</h2>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-2">
            {linked && (
              <ArrowUpRightIcon
                aria-hidden
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  dark ? "text-current" : "text-pink-400 group-hover/cell:text-pink-600",
                )}
              />
            )}
          </span>
        </div>
      )}
      {children}
    </Tag>
  );
}

/**
 * Hatched cells that close the last row of a box, so a short row never leaves
 * a hole without hairlines. `used` counts the columns the cells before it take
 * in the run; each breakpoint (2, 4, and 6 columns) fills its own remainder.
 */
export function Fill({ used }: { used: number }) {
  const base = cn("border-r border-b", RULE, TONES.hatch);
  const left = (cols: number) => (cols - (used % cols)) % cols;
  const fills = [
    { n: left(2), show: "md:hidden" },
    { n: left(4), show: "hidden md:block xl:hidden" },
    { n: left(6), show: "hidden xl:block" },
  ];
  return (
    <>
      {fills.map(({ n, show }) =>
        n > 0 ? (
          <div
            key={show}
            aria-hidden
            className={cn(base, show)}
            style={{ gridColumn: `span ${n}` }}
          />
        ) : null,
      )}
    </>
  );
}

/**
 * A mask that cuts round holes out of an element: each `[radius, position]`
 * removes one circle, as on a punched or perforated ticket.
 */
export function cutouts(...holes: [number, string][]): CSSProperties {
  const layers = holes
    .map(([r, at]) => `radial-gradient(circle ${r}px at ${at}, #0000 97%, #000)`)
    .join(", ");
  return {
    maskImage: layers,
    WebkitMaskImage: layers,
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };
}

const NOTCH =
  "radial-gradient(circle 5px at 0 50%, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 5px at 100% 50%, #0000 98%, #000) right / 51% 100% no-repeat";
const STAMP_TONES = {
  yellow: "bg-yellow-200",
  sky: "bg-sky-200",
  pink: "bg-pink-200",
  lilac: "bg-purple-200",
  white: "bg-white",
} as const;
export type StampTone = keyof typeof STAMP_TONES;
export const STAMP_CYCLE: StampTone[] = ["yellow", "sky", "pink", "lilac"];

/** A notched paper ticket stamp, the site's signature shape. */
export function Stamp({
  tone = "yellow",
  className,
  children,
}: {
  tone?: StampTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cn("inline-block drop-shadow-[0_2px_0_rgb(244_114_182/0.35)]", className)}>
      <span
        className={cn(
          "flex flex-col items-center px-3.5 pt-1.5 pb-2 text-pink-950",
          STAMP_TONES[tone],
        )}
        style={{ mask: NOTCH, WebkitMask: NOTCH }}
      >
        {children}
      </span>
    </span>
  );
}

/** A dashed rubber-stamp circle, tilted, for dates and "here" marks. */
export function Postmark({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-16 shrink-0 rotate-12 place-items-center rounded-full border-2 border-dashed border-pink-500/70 text-center font-mono text-[9px] leading-tight font-bold uppercase text-pink-500/90",
        className,
      )}
    >
      <span>{children}</span>
    </span>
  );
}

/**
 * The first row of every page: the title compartment and a side compartment
 * for the page's numbers. The title's first letter is pink, as it always was.
 */
export function PageHead({
  title,
  kicker,
  tone = "yellow",
  aside,
}: {
  title: string;
  kicker?: ReactNode;
  tone?: Tone;
  aside: ReactNode;
}) {
  return (
    <>
      <Cell as="header" span="w3" className="justify-end gap-2 py-8 md:py-10">
        <h1 className="font-display text-5xl leading-none font-extrabold tracking-wide text-pink-950 uppercase md:text-7xl">
          <span className="text-pink-500">{title.slice(0, 1)}</span>
          {title.slice(1)}
        </h1>
        {kicker && (
          <p className="text-base leading-relaxed text-pink-950/75 text-pretty md:text-lg">
            {kicker}
          </p>
        )}
      </Cell>
      <Cell as="aside" tone={tone} className="col-span-2 justify-between md:col-span-1">
        {aside}
      </Cell>
    </>
  );
}
