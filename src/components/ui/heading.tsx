import { JSX } from "react";
import { cn } from "~/lib/utils";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type HeadingTag = `h${HeadingLevel}`;

type HeadingProps<TLevel extends HeadingLevel> = {
  children: React.ReactNode;
  className?: string;
  level: TLevel;
} & JSX.IntrinsicElements[`h${TLevel}`];

export function Heading<TLevel extends HeadingLevel>({
  children,
  className,
  level,
  ...props
}: HeadingProps<TLevel>) {
  const Tag = `h${level}` as HeadingTag;
  return (
    <Tag
      className={cn(
        "block relative pl-4 text-pink-950 font-extrabold font-display tracking-wide uppercase first-letter:text-pink-500 mb-2",
        {
          "text-2xl md:text-3xl": level === 1,
          "text-xl md:text-2xl": level === 2,
          "text-lg md:text-xl": level === 3,
          "text-base md:text-lg": level === 4,
          "text-sm md:text-base": level === 5,
          "text-xs md:text-sm": level === 6,
        },
        className,
      )}
      {...props}
    >
      {children}
      <div
        className={cn(
          "absolute bg-pink-200/50 left-0 right-0 -bottom-1 h-px",
          "before:absolute before:content-[''] before:bg-pink-200 before:left-0 before:bottom-0 before:w-[5ch] before:h-0.5 after:z-10",
          "after:absolute after:content-[''] after:bg-pink-300 after:left-0 after:bottom-0 after:w-[2ch] after:h-0.5 after:z-20",
          {
            "-bottom-1": level === 1,
            "bottom-0": level != 3,
          },
        )}
      />
      <div
        className={cn(
          "absolute flex flex-col justify-center left-0 bottom-0 top-0 w-2.5",
          "before:content-[''] before:bg-pink-200/50 before:size-2.5",
          "after:content-[''] after:bg-pink-200 after:size-2.5",
        )}
      />
    </Tag>
  );
}
