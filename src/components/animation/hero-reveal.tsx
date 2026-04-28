import { useRef, useEffect } from "react";
import { animate } from "animejs";

interface HeroRevealProps {
  children: React.ReactNode;
}

export function HeroReveal({ children }: HeroRevealProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const name = wrapper.querySelector('[data-hero-reveal="name"]');
    const desc = wrapper.querySelector('[data-hero-reveal="desc"]');
    const socials = wrapper.querySelectorAll<HTMLElement>('[data-hero-reveal="social"]');
    const avatar = wrapper.querySelector('[data-hero-reveal="avatar"]');

    requestAnimationFrame(() => {
      for (const el of [name, desc, avatar, ...socials]) {
        if (!el) continue;
        (el as HTMLElement).style.opacity = "0";
        (el as HTMLElement).style.transform = "translateY(16px)";
      }

      requestAnimationFrame(() => {
        const targets = [name, avatar].filter(Boolean) as HTMLElement[];
        if (targets.length) {
          animate(targets, {
            opacity: [0, 1],
            translateY: [16, 0],
            duration: 600,
            ease: "outExpo",
          });
        }

        if (desc) {
          animate(desc, {
            opacity: [0, 1],
            translateY: [16, 0],
            duration: 600,
            ease: "outExpo",
            delay: 120,
          });
        }

        if (socials.length) {
          animate(socials, {
            opacity: [0, 1],
            translateY: [16, 0],
            duration: 400,
            ease: "outExpo",
            delay: (_, i) => 240 + i * 60,
          });
        }
      });
    });
  }, []);

  return (
    <div ref={wrapperRef} className="contents">
      {children}
    </div>
  );
}
