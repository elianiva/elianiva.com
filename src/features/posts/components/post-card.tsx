import { useId, type JSX } from "react";
import * as DateTime from "effect/DateTime";
import CalendarIcon from "~icons/ph/calendar-blank";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";

type PostCardProps = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
} & JSX.IntrinsicElements["div"];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function PostCard({ slug, title, description, date, tags, ...props }: PostCardProps) {
  const titleId = useId();
  return (
    <Card
      className="bg-white/60 text-left transition-colors group hover:bg-white border-0 ring-0"
      role="article"
      aria-labelledby={titleId}
      style={{ viewTransitionName: `post-card-${slug || slugify(title)}` }}
      {...props}
    >
      <div className="flex flex-col md:flex-row p-4 h-full" aria-labelledby={titleId}>
        <div className="flex-1">
          <h3
            id={titleId}
            className="font-display md:text-base font-semibold capitalize text-pink-950 group-hover:text-pink-700 transition-colors duration-100 ease-out"
          >
            {title}
          </h3>
          <p className="font-body leading-normal text-pink-950/70 text-sm">{description}</p>
        </div>
        <div className="flex flex-col gap-1 justify-between align-end md:flex-1">
          <div className="text-xs flex gap-1 justify-end text-pink-950/70">
            <CalendarIcon className="size-4 block" />
            <span suppressHydrationWarning>
              {DateTime.format(DateTime.makeUnsafe(date), {
                locale: "en-GB",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex gap-1 flex-wrap justify-end">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
