import { useRef, useState, useCallback } from "react";
import * as anime from "animejs";
import type { GitHubPullRequest } from "#/types/github-pr";

interface PRDropdownProps {
  repository: {
    name: string;
    full_name: string;
    url: string;
    stargazerCount: number;
  };
  prs: GitHubPullRequest[];
  mergedCount: number;
  formatStarCount: (count: number) => string;
  formatChanges: (additions: number, deletions: number) => string;
}

export function PRDropdown({
  repository,
  prs,
  mergedCount,
  formatStarCount,
  formatChanges,
}: PRDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  const toggle = useCallback(() => {
    if (isAnimating.current) return;
    if (!contentRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isOpen) {
      setIsOpen(true);
      if (prefersReducedMotion) return;

      isAnimating.current = true;
      const content = contentRef.current;
      content.style.height = "0px";
      content.style.overflow = "hidden";

      anime.animate(content, {
        height: [0, content.scrollHeight],
        duration: 300,
        ease: "outQuad",
        onComplete: () => {
          content.style.height = "auto";
          content.style.overflow = "visible";
          isAnimating.current = false;
        },
      });
    } else {
      if (prefersReducedMotion) {
        setIsOpen(false);
        return;
      }

      isAnimating.current = true;
      const content = contentRef.current;
      content.style.overflow = "hidden";
      content.style.height = content.scrollHeight + "px";

      anime.animate(content, {
        height: 0,
        duration: 250,
        ease: "inQuad",
        onComplete: () => {
          setIsOpen(false);
          isAnimating.current = false;
        },
      });
    }
  }, [isOpen]);

  const totalAdditions = prs.reduce((sum, pr) => sum + pr.additions, 0);
  const totalDeletions = prs.reduce((sum, pr) => sum + pr.deletions, 0);

  return (
    <div className="border border-pink-200 rounded-lg overflow-hidden bg-white/50">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-3 md:p-4 text-left hover:bg-pink-50/50 transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 min-w-0">
          <svg
            className={`w-4 h-4 text-pink-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <div className="min-w-0">
            <a
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body font-medium text-pink-950 hover:text-pink-700 truncate block"
              onClick={(e) => e.stopPropagation()}
            >
              {repository.full_name}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <span className="text-xs font-body text-pink-950/60">
            ★ {formatStarCount(repository.stargazerCount)}
          </span>
          <span className="text-xs font-body bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full">
            {mergedCount} merged
          </span>
        </div>
      </button>

      {isOpen && (
        <div ref={contentRef} className="border-t border-pink-100">
          <div className="p-3 md:p-4 space-y-2">
            {prs.map((pr) => (
              <a
                key={pr.id}
                href={pr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-md hover:bg-pink-50/50 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-body text-pink-950 group-hover:text-pink-700 truncate block">
                    #{pr.number} {pr.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3 text-xs font-mono">
                  <span className="text-green-600">+{pr.additions}</span>
                  <span className="text-red-500">-{pr.deletions}</span>
                </div>
              </a>
            ))}
            <div className="pt-2 border-t border-pink-100 flex justify-end">
              <span className="text-xs font-body text-pink-950/50">
                {formatChanges(totalAdditions, totalDeletions)} changes across {prs.length} PRs
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
