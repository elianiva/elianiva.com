import { useRef, useEffect, useState } from "react";
import { animate } from "animejs";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
}

export function ScrollReveal({ children, delay = 0 }: ScrollRevealProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const els = wrapper.querySelectorAll<HTMLElement>("[data-anime]");
    if (!els.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !revealed) {
          setRevealed(true);

          animate(els, {
            opacity: [0, 1],
            translateY: [24, 0],
            duration: 600,
            ease: "outExpo",
            delay: (_, i) => delay + 100 + i * 80,
          });

          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [delay, revealed]);

  return <div ref={wrapperRef}>{children}</div>;
}
