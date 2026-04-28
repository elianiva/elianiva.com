import { Link } from "@tanstack/react-router";
import CalendarIcon from "~icons/ph/calendar-blank";

interface PostCardProps {
  title: string;
  description: string;
  href: string;
  date: string;
  tags: string[];
}

export function PostCard({ title, description, href, date, tags }: PostCardProps) {
  const slug = href.split("/").pop() || "";

  return (
    <div
      className="bg-white/60 text-left transition-all group hover:bg-white"
      role="article"
      aria-labelledby="post-title"
      style={{ viewTransitionName: `post-card-${slug}` }}
    >
      <Link
        to={href}
        className="grid grid-rows-[auto_2rem_auto_2rem] p-4 h-full focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
        aria-labelledby="post-title"
      >
        <h3
          id="post-title"
          className="font-display md:text-base font-bold capitalize text-pink-950 group-hover:text-pink-700 transition-property-color duration-100 ease-out"
        >
          {title}
        </h3>
        <div className="text-xs flex gap-1 items-center text-pink-950/70 border-b border-pink-200/50">
          <CalendarIcon className="w-4 h-4 block" />
          <span>
            {new Date(date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <p
          className="font-body leading-normal text-pink-950/70 pt-2 text-sm"
          dangerouslySetInnerHTML={{ __html: description }}
        />
        <div className="flex gap-1 self-end flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono text-pink-950/70 bg-pink-50/80 px-2 py-0.5"
            >
              #{tag}
            </span>
          ))}
        </div>
      </Link>
    </div>
  );
}
