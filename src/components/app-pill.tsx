import { cn } from "~/lib/utils";

/**
 * A text pill with its logo as a tilted app tile hanging off the left edge.
 * Hovering pops the tile up with a little spring.
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
  return (
    <Tag
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "group/pill relative z-10 mx-0.5 inline-flex h-7 items-center gap-1.5 rounded-[9px] border border-pink-200 bg-gradient-to-b from-white to-pink-50 pr-2.5 align-middle text-[14px] leading-none font-semibold whitespace-nowrap text-pink-950 no-underline transition-colors hover:border-pink-300",
        icon ? "pl-9" : "pl-2.5",
        className,
      )}
    >
      {icon && (
        <img
          src={icon}
          alt=""
          width={36}
          height={36}
          loading="lazy"
          decoding="async"
          className="absolute top-1/2 -left-px size-9 -translate-y-1/2 -rotate-6 rounded-[10px] border border-pink-200 bg-white object-contain p-1 shadow-[0_3px_0_rgba(190,24,93,0.13)] transition-transform duration-300 ease-out group-hover/pill:-translate-y-[58%] group-hover/pill:scale-110 group-hover/pill:rotate-[4deg] "
        />
      )}
      {name}
      {meta && <span className="font-mono text-[11px] font-normal text-pink-950/55">{meta}</span>}
    </Tag>
  );
}
