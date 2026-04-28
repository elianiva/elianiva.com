import { useRef, useState, useCallback, useEffect } from "react";
import { animate, type JSAnimation } from "animejs";
import type { GitHubPullRequest } from "~/types/github-pr";
import ArrowUpRightIcon from "~icons/ph/arrow-up-right-duotone";
import CaretDownIcon from "~icons/ph/caret-down";
import GitPullRequestIcon from "~icons/ph/git-pull-request-duotone";
import StarIcon from "~icons/ph/star-fill";

interface PRDropdownProps {
  repository: {
    name: string;
    full_name: string;
    url: string;
    stargazerCount: number;
  };
  prs: GitHubPullRequest[];
  defaultOpen?: boolean;
}

function abbreviateNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${Math.round(num / 1_000)}k`;
  return num.toString();
}

export function PRDropdown({ repository, prs, defaultOpen = false }: PRDropdownProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const detailsRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<JSAnimation | null>(null);
  const hasInitialized = useRef(false);

  const totalChanges = prs.reduce((sum, pr) => sum + pr.additions + pr.deletions, 0);

  const toggleOpen = useCallback(() => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const detailsEl = detailsRef.current;
    if (!detailsEl) return;

    if (prefersReduced) {
      detailsEl.style.height = nextOpen ? "auto" : "0px";
      detailsEl.style.opacity = nextOpen ? "1" : "0";
      return;
    }

    if (animationRef.current) {
      animationRef.current.cancel();
    }

    if (nextOpen) {
      const targetHeight = detailsEl.scrollHeight;
      detailsEl.style.height = "0px";
      detailsEl.style.opacity = "0";

      animationRef.current = animate(detailsEl, {
        height: ["0px", `${targetHeight}px`],
        opacity: [0, 1],
        duration: 350,
        ease: "easeOutCubic",
      });

      animationRef.current.then(() => {
        if (detailsRef.current) detailsRef.current.style.height = "auto";
      });
    } else {
      const currentHeight = detailsEl.scrollHeight;
      detailsEl.style.height = `${currentHeight}px`;

      animationRef.current = animate(detailsEl, {
        height: [`${currentHeight}px`, "0px"],
        opacity: [1, 0],
        duration: 250,
        ease: "easeOutCubic",
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const detailsEl = detailsRef.current;
    if (!detailsEl || hasInitialized.current) return;
    hasInitialized.current = true;

    detailsEl.style.height = defaultOpen ? "auto" : "0px";
    detailsEl.style.opacity = defaultOpen ? "1" : "0";
  }, [defaultOpen]);

  return (
    <div
      className="bg-blur-xl bg-white/60 hover:bg-white focus:bg-white focus:outline-none"
      data-open={isOpen}
    >
      <button
        type="button"
        className="list-none w-full px-4 py-3 cursor-pointer focus:outline-none text-left"
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <div className="flex flex-row sm:items-center justify-between focus:outline-none">
          <div className="flex items-center gap-2">
            <div
              className={`text-pink-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            >
              <CaretDownIcon className="inline-block size-3" />
            </div>

            <h3 className="text-left font-mono text-sm text-pink-800">
              <a
                className="text-pink-800 inline-flex items-center hover:text-pink-500 transition-colors"
                href={`https://github.com/${repository.full_name}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="hidden sm:inline">{repository.full_name}</span>
                <span className="inline sm:hidden">{repository.full_name.split("/").at(-1)}</span>
                <ArrowUpRightIcon className="inline-block size-3" />
              </a>
            </h3>
          </div>

          <div className="flex-col items-end">
            <div className="flex items-center justify-end gap-2">
              <div className="flex items-center justify-end gap-1 font-mono text-xs text-pink-950/70">
                <GitPullRequestIcon className="size-4 text-teal-500" />
                <span className="font-bold">{prs.length}</span>
              </div>
              <div className="flex items-center justify-end gap-1 font-mono text-xs text-pink-950/70">
                <StarIcon className="size-3 text-yellow-400" />
                <span className="font-bold">{abbreviateNumber(repository.stargazerCount)}</span>
              </div>
            </div>
            <p className="font-mono text-xs text-pink-950/50 mt-1 text-right">
              ±{totalChanges.toLocaleString()} changes
            </p>
          </div>
        </div>
      </button>

      <div ref={detailsRef} className="overflow-hidden">
        <div className="border-t border-pink-200/50">
          <div id={`pr-details-${repository.name}`} className="p-3">
            <div className="space-y-2">
              {prs.map((pr) => (
                <div key={pr.id} className="not-last:border-b border-pink-200/50 not-last:pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <a
                        href={pr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-sm font-medium text-pink-950 hover:text-pink-700 transition-colors line-clamp-2"
                      >
                        {pr.title}
                      </a>
                      <p className="font-mono text-xs text-pink-950/50 mt-1">
                        #{pr.number} • merged{" "}
                        {pr.merged_at ? new Date(pr.merged_at).toLocaleDateString("en-GB") : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs font-mono text-pink-950/70">
                      <div className="flex items-center gap-1">
                        <span className="text-green-600">+{pr.additions}</span>
                        <span className="text-red-600">-{pr.deletions}</span>
                      </div>
                      <div className="text-pink-950/50">
                        {pr.changed_files} file
                        {pr.changed_files !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
