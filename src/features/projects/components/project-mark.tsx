import { cn } from "~/lib/utils";

const PROJECT_ICONS: Record<string, string> = {
  meiro: "/assets/project-icons/meiro.webp",
  nook: "/assets/project-icons/nook.svg",
  quorum: "/assets/project-icons/quorum.webp",
  mizook: "/assets/project-icons/mizook.webp",
};

/**
 * The project's app icon on a tilted tile, or its first letter when it has
 * none. 44px unless `className` sizes it.
 */
export function ProjectMark({
  slug,
  title,
  className,
}: {
  slug: string;
  title: string;
  className?: string;
}) {
  const icon = PROJECT_ICONS[slug];
  return icon ? (
    <img
      src={icon}
      alt=""
      width={44}
      height={44}
      className={cn(
        "size-11 -rotate-6 border border-pink-200 bg-white object-contain p-1 shadow-[0_3px_0_rgba(190,24,93,0.13)] transition-transform duration-300 ease-out",
        className,
      )}
    />
  ) : (
    <span
      className={cn(
        "grid size-11 -rotate-6 place-items-center border border-pink-200 bg-white font-display text-xl font-extrabold text-pink-500 shadow-[0_3px_0_rgba(190,24,93,0.13)] transition-transform duration-300 ease-out",
        className,
      )}
    >
      {title[0]}
    </span>
  );
}
