import { Link, useLocation } from "@tanstack/react-router";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";

type NavItem = { label: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Posts", href: "/posts" },
  { label: "Projects", href: "/projects" },
  { label: "Uses", href: "/uses" },
];

function isActiveFor(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Hover / focus / tap disclosure. Mouse hover opens (with a short grace period on
 * leave, so crossing gaps between cards doesn't flicker), keyboard focus opens,
 * touch needs a tap, and tapping outside closes.
 */
function useDisclosure(closeDelay = 0) {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const touch = useRef(false);

  const openNow = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), closeDelay);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);
  useEffect(() => () => clearTimeout(timer.current), []);

  return {
    open,
    setOpen,
    navRef,
    isTouch: () => touch.current,
    navProps: {
      onPointerDown: (e: React.PointerEvent) => {
        touch.current = e.pointerType === "touch";
      },
      onPointerEnter: (e: React.PointerEvent) => {
        if (e.pointerType !== "touch") openNow();
      },
      onPointerLeave: (e: React.PointerEvent) => {
        if (e.pointerType !== "touch") closeSoon();
      },
      onFocus: (e: React.FocusEvent) => {
        if ((e.target as HTMLElement).matches(":focus-visible")) openNow();
      },
      onBlur: (e: React.FocusEvent<HTMLElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget)) closeSoon();
      },
    },
    close: () => {
      clearTimeout(timer.current);
      setOpen(false);
    },
  };
}

const STAMP_COLORS = ["bg-yellow-200", "bg-sky-200", "bg-pink-200", "bg-purple-200"];
const NOTCH =
  "radial-gradient(circle 6px at 0 50%, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 6px at 100% 50%, #0000 98%, #000) right / 51% 100% no-repeat";

/* ── Spring engine ────────────────────────────────────────────────────────────
 * Cards are driven by a small rAF spring solver that writes transforms straight
 * to the DOM (no React renders per frame). Springs keep velocity when their target
 * changes mid-flight, so reversing an animation never jumps or restarts. Only
 * transform/opacity are touched, so everything stays on the compositor-friendly
 * path. With prefers-reduced-motion the poses snap with no tilt.
 */
type Pose = {
  op: number; // card opacity
  mk: number; // postmark opacity (follows the active card)
  theta: number;
  rot: number;
  dx: number;
  dy: number;
  lift: number;
  scale: number;
  rx: number;
  ry: number;
};
type Target = { pose: Pose; z: number };
const POSE_KEYS: (keyof Pose)[] = [
  "op",
  "mk",
  "theta",
  "rot",
  "dx",
  "dy",
  "lift",
  "scale",
  "rx",
  "ry",
];
const BASE_POSE: Pose = {
  op: 1,
  mk: 1,
  theta: 0,
  rot: 0,
  dx: 0,
  dy: 0,
  lift: 0,
  scale: 1,
  rx: 0,
  ry: 0,
};
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const RADIUS = 480; // arc radius the fan sits on

function useCardEngine(
  count: number,
  getTargets: (now: number) => Target[],
  spring: { k: number; c: number },
  markIdx: number,
) {
  const cards = useRef<(HTMLElement | null)[]>([]);
  const faces = useRef<(HTMLElement | null)[]>([]);
  const mark = useRef<HTMLElement | null>(null);
  const sim = useRef<{ p: Pose; v: Pose }[]>([]);
  const raf = useRef(0);
  const wakeUntil = useRef(0);
  const last = useRef(0);
  const reduced = useRef(false);
  const getRef = useRef(getTargets);
  getRef.current = getTargets;
  const springRef = useRef(spring);
  springRef.current = spring;
  // read through a ref: tick/apply are created once, a captured markIdx would go stale
  const markIdxRef = useRef(markIdx);
  markIdxRef.current = markIdx;

  const apply = (i: number, p: Pose, z: number) => {
    const el = cards.current[i];
    const face = faces.current[i];
    if (!el || !face) return;
    const rad = (p.theta * Math.PI) / 180;
    const x = RADIUS * Math.sin(rad) + p.dx;
    const y = RADIUS * (1 - Math.cos(rad)) + p.dy - p.lift;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${p.theta + p.rot}deg) scale(${p.scale})`;
    el.style.zIndex = String(z);
    el.style.opacity = String(clamp01(p.op));
    if (i === markIdxRef.current && mark.current) {
      // the postmark rides the active card's transform but lives above every card
      mark.current.style.transform = el.style.transform;
      mark.current.style.opacity = String(clamp01(p.mk));
    }
    face.style.transform = reduced.current
      ? "none"
      : `perspective(520px) rotateX(${p.rx}deg) rotateY(${p.ry}deg)`;
  };

  const tick = useCallback((now: number) => {
    raf.current = 0;
    const dt = Math.min((now - last.current) / 1000, 1 / 30);
    last.current = now;
    const { k, c } = springRef.current;
    let moving = false;
    getRef.current(now).forEach((t, i) => {
      const s = (sim.current[i] ??= { p: { ...t.pose }, v: { ...BASE_POSE, scale: 0 } });
      for (const key of POSE_KEYS) {
        const target = reduced.current && (key === "rx" || key === "ry") ? 0 : t.pose[key];
        if (reduced.current) {
          s.p[key] = target;
          s.v[key] = 0;
          continue;
        }
        s.v[key] += (-k * (s.p[key] - target) - c * s.v[key]) * dt;
        s.p[key] += s.v[key] * dt;
        if (Math.abs(s.p[key] - target) > 0.02 || Math.abs(s.v[key]) > 0.02) moving = true;
      }
      apply(i, s.p, t.z);
    });
    if (moving || now < wakeUntil.current) raf.current = requestAnimationFrame(tick);
  }, []);

  /** Wake the loop; `ms` keeps it alive through delayed/staggered targets. */
  const kick = useCallback(
    (ms = 600) => {
      wakeUntil.current = performance.now() + ms;
      if (!raf.current) {
        last.current = performance.now();
        raf.current = requestAnimationFrame(tick);
      }
    },
    [tick],
  );

  useLayoutEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // place cards at their resting pose before first paint, no animation from nothing
    sim.current = [];
    getRef.current(performance.now()).forEach((t, i) => {
      sim.current[i] = { p: { ...t.pose }, v: { ...BASE_POSE, scale: 0 } };
      apply(i, t.pose, t.z);
    });
    return () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0; // a stale id would make kick() think a frame is still pending
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return { cards, faces, mark, kick };
}

/* ── Paper hand ───────────────────────────────────────────────────────────────
 * A neat deck of paper stamps. Hover tosses it open: every card lands with its
 * own offset, tilt and stacking order, re-rolled on each open so it never settles
 * the same way twice. Pointing at a card lifts it and the dock magnification
 * swells it while its neighbours part.
 */
const SPRING_TOSS = { k: 230, c: 16.5 }; // slightly underdamped, so cards overshoot like tossed paper
const MESS = 0.55; // how loose the toss is; 0 = ruler-straight
const CLOSED_DY = 27; // closed tab floats mid-way between the frame bar and the page content
const SPACING = 112; // px between card centers on wide screens; the open row is a straight line
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Small deterministic PRNG so a given (open, card) always lands the same way. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function PaperHand({ pathname }: { pathname: string }) {
  const { open, setOpen, navRef, navProps, close, isTouch } = useDisclosure(140);
  const activeIdx = Math.max(
    0,
    NAV_ITEMS.findIndex((i) => isActiveFor(pathname, i.href)),
  );
  const n = NAV_ITEMS.length;

  const openRef = useRef(false);
  const openedAt = useRef(0);
  const rolls = useRef(0); // bumped on every open → new scatter
  const pointer = useRef({ x: 0, inside: false }); // relative to deck center
  const hoverIdx = useRef(-1);
  const cardPtr = useRef({ u: 0, v: 0 }); // -1..1 inside the hovered card

  const getTargets = (now: number): Target[] => {
    // narrow screens: squeeze the row to fit, cards overlap a little instead of overflowing
    const spacing = Math.min(SPACING, (window.innerWidth - 56 - 80) / (n - 1));
    return NAV_ITEMS.map((_, i) => {
      const isOpen = openRef.current;
      // released a beat apart, so the toss ripples across the deck
      const released = isOpen && now - openedAt.current >= i * 40;
      // open: no arc, every card sits on one level line; the mess is only per-card jitter
      const theta = 0;
      const pose: Pose = { ...BASE_POSE, theta, dx: released ? (i - (n - 1) / 2) * spacing : 0 };
      if (!released) {
        // closed: only the current page's tab shows; the rest wait invisibly behind it
        pose.dy = CLOSED_DY;
        pose.op = i === activeIdx ? 1 : 0;
        pose.mk = 0;
        pose.scale = i === activeIdx ? 1 : 0.92;
      }
      // stacking order never changes while moving; a z-index swap mid-flight pops a card
      // through its neighbours. Only the card under the pointer is raised.
      let z = 10 - Math.abs(i - activeIdx);

      if (released) {
        const rand = rng(rolls.current * 977 + i * 131 + 7);
        pose.rot = (rand() - 0.5) * 2 * 24 * MESS; // lean
        pose.dx += (rand() - 0.5) * 2 * 13 * MESS; // slide along the row
        pose.dy = 24 + (rand() - 0.5) * 2 * 8 * MESS; // bob around a level line, clear of the frame bar
      }

      const cardX = RADIUS * Math.sin((theta * Math.PI) / 180) + pose.dx;
      if (released && hoverIdx.current === i) {
        pose.lift = 6;
        pose.scale = 1.06;
        pose.rot *= 0.3; // straighten up a little when picked
        pose.ry = cardPtr.current.u * 7;
        pose.rx = -cardPtr.current.v * 6;
        z = 20;
      }
      if (released && pointer.current.inside) {
        const w = Math.exp(-(((pointer.current.x - cardX) / 80) ** 2));
        pose.scale += 0.12 * w;
        pose.lift += 5 * w;
        pose.dx += (cardX - pointer.current.x) * 0.2 * w;
      }
      return { pose, z };
    });
  };

  const { cards, faces, mark, kick } = useCardEngine(n, getTargets, SPRING_TOSS, activeIdx);

  useEffect(() => {
    openRef.current = open;
    if (open) {
      openedAt.current = performance.now();
      rolls.current += 1;
    } else {
      hoverIdx.current = -1;
      pointer.current.inside = false;
    }
    kick(1100);
  }, [open, kick]);

  useEffect(() => {
    kick(300); // active page changed → re-seat the deck
  }, [activeIdx, kick]);

  return (
    <header className="fixed top-0 md:top-2 inset-x-0 z-40 flex justify-center pointer-events-none">
      <nav
        ref={navRef}
        {...navProps}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          pointer.current = { x: e.clientX - (r.left + r.width / 2), inside: true };
          kick(300);
        }}
        onPointerLeave={(e) => {
          navProps.onPointerLeave(e);
          pointer.current.inside = false;
          kick(600);
        }}
        className="pointer-events-auto relative h-[4.5rem] w-20"
      >
        {open && (
          <span aria-hidden className="absolute left-1/2 top-0 h-36 w-[32rem] -translate-x-1/2" />
        )}
        {NAV_ITEMS.map((item, i) => {
          const active = i === activeIdx;
          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={active ? "page" : undefined}
              ref={(el) => {
                cards.current[i] = el;
              }}
              onClick={(e) => {
                // touch: first tap tosses the deck open instead of navigating
                if (!open && isTouch()) {
                  e.preventDefault();
                  setOpen(true);
                  return;
                }
                close();
              }}
              onPointerEnter={() => {
                hoverIdx.current = i;
                kick(300);
              }}
              onPointerLeave={() => {
                if (hoverIdx.current === i) hoverIdx.current = -1;
                cardPtr.current = { u: 0, v: 0 };
                kick(500);
              }}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                cardPtr.current = {
                  u: clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1),
                  v: clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1),
                };
                kick(300);
              }}
              className="absolute left-1/2 top-0 -ml-10 w-20 opacity-0 will-change-transform focus-visible:outline-none"
            >
              <span
                ref={(el) => {
                  faces.current[i] = el;
                }}
                className="block"
              >
                <span className="block drop-shadow-[0_2px_0_rgb(244_114_182/0.4)]">
                  <span
                    className={cn(
                      "flex flex-col items-center px-3 pt-2 pb-2.5",
                      STAMP_COLORS[i % 4],
                    )}
                    style={{ mask: NOTCH, WebkitMask: NOTCH }}
                  >
                    <span className="font-mono text-[8px] tracking-widest text-foreground/40">
                      No.0{i + 1}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-widest font-heading",
                        active ? "font-semibold text-foreground" : "text-foreground/70",
                      )}
                    >
                      {item.label}
                    </span>
                  </span>
                </span>
              </span>
            </Link>
          );
        })}
        <span
          ref={mark}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 z-30 -ml-12 h-0 w-24 opacity-0 will-change-transform"
        >
          <span className="absolute -top-2 -right-2 grid size-7 rotate-12 place-items-center rounded-full border-2 border-dashed border-pink-500/70 font-mono text-[7px] font-bold text-pink-500/80">
            HERE
          </span>
        </span>
      </nav>
    </header>
  );
}

export function NavigationStrip() {
  const { pathname } = useLocation();
  return <PaperHand pathname={pathname} />;
}
