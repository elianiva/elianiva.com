import type { JSX } from "react";
import { Link } from "@tanstack/react-router";
import CalendarIcon from "~icons/ph/calendar-blank";

type PostCardProps = {
  title: string;
  description: string;
  href: string;
  date: string;
  tags: string[];
} & JSX.IntrinsicElements["div"];

export function PostCard({ title, description, href, date, tags, ...props }: PostCardProps) {
  const slug = href.split("/").pop() || "";

  return (
    <div
      className="bg-white/60 text-left transition-all group hover:bg-white"
      role="article"
      aria-labelledby="post-title"
      style={{ viewTransitionName: `post-card-${slug}` }}
      {...props}
    >
      <Link
        to={href}
        className="flex p-4 h-full focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
        aria-labelledby="post-title"
      >
        <div className="flex-1">
          <h3
            id="post-title"
            className="font-display md:text-base font-bold capitalize text-pink-950 group-hover:text-pink-700 transition-property-color duration-100 ease-out"
          >
            {title}
          </h3>
          <p
            className="font-body leading-normal text-pink-950/70 text-sm"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
        <div className="flex-1 flex flex-col gap-1 justify-between align-end">
          <div className="text-xs flex gap-1 justify-end text-pink-950/70">
            <CalendarIcon className="w-4 h-4 block" />
            <span>
              {new Date(date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex gap-1 flex-wrap justify-end">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono text-pink-950/70 bg-pink-50/80 px-2 py-0.5"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}
