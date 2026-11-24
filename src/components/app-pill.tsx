import { cutouts } from "./box";
import { cn } from "~/lib/utils";

/** px; the icon stub's width, where the perforation and its punches sit. */
const STUB = 32;

/**
 * An app or company named in running text, as a small admission ticket: its
 * icon on a stub behind a dashed perforation, the name on the body, and a
 * notch punched in each end, like the tickets in the nav. Hovering lifts it
 * and tilts it a little, without moving the text around it.
 */
export function AppPill({
  name,
  href,
  icon,
  meta,
  className,
}: {
  name: string;
  href?: string;
  icon?: string;
  meta?: string;
  className?: string;
}) {
  const Tag = href ? "a" : "span";
  const holes: [number, string][] = [
    [4, "0 50%"],
    [4, "100% 50%"],
    ...(icon
      ? ([
          [3, `${STUB}px 0`],
          [3, `${STUB}px 100%`],
        ] as [number, string][])
      : []),
  ];
  return (
    <Tag
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "group/pill relative z-10 mx-0.5 inline-block align-middle no-underline drop-shadow-[0_2px_0_rgb(244_114_182/0.35)]",
        "transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
        href && "hover:-translate-y-0.5 hover:-rotate-2 active:scale-[0.97]",
        className,
      )}
    >
      <span
        className="flex h-8 items-stretch bg-white shadow-[inset_0_0_0_1px_rgb(251_207_232)] text-[14px] leading-none font-semibold whitespace-nowrap text-pink-950"
        style={cutouts(...holes)}
      >
        {icon && (
          <span
            className="grid shrink-0 place-items-center border-r border-dashed border-pink-300 bg-pink-50 transition-colors duration-200 group-hover/pill:bg-pink-100"
            style={{ width: STUB }}
          >
            <img
              src={icon}
              alt=""
              width={24}
              height={24}
              loading="lazy"
              decoding="async"
              className="size-6 object-contain"
            />
          </span>
        )}
        <span className="flex items-center gap-1.5 pr-3 pl-2.5">
          {name}
          {meta && (
            <span className="font-mono text-[11px] font-normal text-pink-950/55">{meta}</span>
          )}
        </span>
      </span>
    </Tag>
  );
}
