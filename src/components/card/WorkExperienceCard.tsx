import { useRef, useState, useCallback } from "react";
import { animate, type JSAnimation } from "animejs";

interface WorkExperienceCardProps {
  company: string;
  location: string;
  time: string;
  position: string;
  period: [Date, Date | null];
  details: string[];
  technologies: string[];
  defaultOpen?: boolean;
}

export function WorkExperienceCard({
  company,
  location,
  time,
  position,
  period,
  details,
  technologies,
  defaultOpen = false,
}: WorkExperienceCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const detailsRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<JSAnimation | null>(null);
  const initializedRef = useRef(false);

  const setInitialStyles = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || initializedRef.current) return;
      initializedRef.current = true;
      node.style.height = defaultOpen ? "auto" : "0px";
      node.style.opacity = defaultOpen ? "1" : "0";
      detailsRef.current = node;
    },
    [defaultOpen],
  );

  const toggleOpen = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    const detailsEl = detailsRef.current;
    if (!detailsEl) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      detailsEl.style.height = newIsOpen ? "auto" : "0px";
      detailsEl.style.opacity = newIsOpen ? "1" : "0";
      return;
    }

    if (animationRef.current) {
      animationRef.current.cancel();
    }

    if (newIsOpen) {
      const targetHeight = detailsEl.scrollHeight;
      detailsEl.style.height = "0px";
      detailsEl.style.opacity = "0";

      animationRef.current = animate(detailsEl, {
        height: ["0px", targetHeight + "px"],
        opacity: [0, 1],
        duration: 350,
        ease: "easeOutCubic",
      });

      animationRef.current.then(() => {
        if (detailsEl) {
          detailsEl.style.height = "auto";
        }
      });
    } else {
      const currentHeight = detailsEl.scrollHeight;
      detailsEl.style.height = currentHeight + "px";

      animationRef.current = animate(detailsEl, {
        height: [currentHeight + "px", "0px"],
        opacity: [1, 0],
        duration: 250,
        ease: "easeOutCubic",
      });
    }
  };

  return (
    <div className="work-experience-card group rounded-2xl transition-colors" data-open={isOpen}>
      <button
        type="button"
        className="list-none w-full cursor-pointer focus:ring-0 focus:outline-none p-2 text-left"
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        {/* Mobile Layout */}
        <div className="flex items-start justify-between gap-3 md:hidden">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold font-display text-pink-950 leading-tight">{company}</h3>
            <p className="text-sm font-mono text-pink-950/90 mb-1">{position}</p>
            <p className="text-xs font-mono text-pink-950/60">
              {period[0].toLocaleDateString("en-GB", { month: "short", year: "numeric" })}-
              {period[1] === null
                ? "Present"
                : period[1].toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
            </p>
            <div className="flex flex-wrap items-center gap-1 py-1">
              <span className="text-[10px] px-2 py-0.5 bg-pink-50 font-mono uppercase whitespace-nowrap text-pink-700">
                {location}
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-pink-50 font-mono uppercase whitespace-nowrap text-pink-700">
                {time}
              </span>
            </div>
          </div>
          <div
            className={
              "text-pink-600 transition-transform duration-200 shrink-0 mt-0.5 " +
              (isOpen ? "rotate-180" : "")
            }
          >
            <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-row items-start md:justify-between gap-4 -ml-8">
          <div className="flex items-start gap-3">
            <div
              className={
                "text-pink-600 transition-transform duration-200 shrink-0 " +
                (isOpen ? "rotate-180" : "")
              }
            >
              <svg className="inline-block size-4 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-row items-center gap-3">
                <h3 className="font-bold font-display text-pink-950 whitespace-nowrap">
                  {company}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 bg-pink-100/60 font-mono uppercase whitespace-nowrap">
                    {location}
                  </span>
                  <span className="text-xs px-3 py-1 bg-pink-100/60 font-mono uppercase whitespace-nowrap">
                    {time}
                  </span>
                </div>
              </div>
              <span className="text-sm font-mono text-pink-950 block">{position}</span>
            </div>
          </div>
          <div className="flex-1 border-t border-pink-200/50 mt-[0.5lh] mx-0"></div>
          <span className="text-pink-950/80 font-mono text-sm whitespace-nowrap shrink-0">
            {period[0].toLocaleDateString("en-GB", { month: "short", year: "numeric" })}-
            {period[1] === null
              ? "Present"
              : period[1].toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
          </span>
        </div>

        {/* Details */}
        <div ref={setInitialStyles} className="overflow-hidden">
          <ul className="list-disc list-outside pl-4 mt-2">
            {details.map((detail, i) => (
              <li
                key={i}
                className="text-sm md:text-base leading-relaxed font-body text-pink-950/80"
              >
                {detail}
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap items-center pt-2 gap-1">
            {technologies.map((technology) => (
              <li
                key={technology}
                className="font-mono uppercase text-pink-950 text-xs border border-dashed border-pink-400/60 py-1 px-3 stitch-border"
              >
                {technology}
              </li>
            ))}
          </ul>
        </div>
      </button>
    </div>
  );
}
