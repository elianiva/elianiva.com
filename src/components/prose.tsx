import { Children, isValidElement, useEffect, useState, type ReactNode } from "react";
import { cn } from "~/lib/utils";
import { LABEL } from "./box";

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

function slugify(node: ReactNode): string {
  return textOf(Children.toArray(node))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const HEADING = {
  h2: "mt-14 first:mt-0 mb-4 text-2xl md:text-3xl uppercase tracking-wide font-extrabold first-letter:text-pink-500",
  h3: "mt-10 mb-3 text-xl font-bold",
  h4: "mt-8 mb-2 text-lg font-bold",
  h5: "mt-6 mb-2 text-base font-bold",
  h6: "mt-6 mb-2 text-sm font-bold uppercase tracking-wider",
} as const;

function heading(Tag: keyof typeof HEADING) {
  return function ProseHeading({ children }: { children?: ReactNode }) {
    const id = slugify(children);
    return (
      <Tag
        id={id}
        className={cn(
          "not-prose group/h scroll-mt-6 font-display leading-tight text-pink-950",
          HEADING[Tag],
        )}
      >
        <a href={`#${id}`} className="no-underline">
          {children}
          <span
            aria-hidden
            className="ml-2 font-mono text-sm text-pink-300 opacity-0 transition-opacity group-hover/h:opacity-100"
          >
            #
          </span>
        </a>
      </Tag>
    );
  };
}

/** MDX overrides: headings get ids and anchors so the contents list can point at them. */
export const proseComponents = {
  h2: heading("h2"),
  h3: heading("h3"),
  h4: heading("h4"),
  h5: heading("h5"),
  h6: heading("h6"),
};

type Entry = { id: string; text: string; depth: number };

/**
 * "On this page": read from the rendered article once it mounts, with the
 * section in view marked as you scroll.
 */
export function Contents({ articleId }: { articleId: string }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const article = document.getElementById(articleId);
    if (!article) return;
    const io = new IntersectionObserver(
      (records) => {
        const visible = records.find((r) => r.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    const read = () => {
      const headings = [...article.querySelectorAll<HTMLElement>("h2[id], h3[id]")];
      headings.forEach((h) => io.observe(h));
      setEntries(
        headings.map((h) => ({
          id: h.id,
          text: h.textContent?.replace(/#$/, "").trim() ?? "",
          depth: h.tagName === "H3" ? 3 : 2,
        })),
      );
    };
    // The MDX body loads as its own chunk, so read again when it lands.
    const mutation = new MutationObserver(read);
    mutation.observe(article, { childList: true, subtree: true });
    read();
    return () => {
      mutation.disconnect();
      io.disconnect();
    };
  }, [articleId]);

  if (entries.length === 0) return null;
  return (
    <nav aria-label="On this page" className="sticky top-6">
      <p className={cn(LABEL, "mb-3")}>On this page</p>
      <ol className="space-y-1.5 border-l border-pink-200">
        {entries.map((e) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              className={cn(
                "-ml-px block border-l-2 py-0.5 text-[13px] leading-snug transition-colors",
                e.depth === 3 ? "pl-6" : "pl-3",
                active === e.id
                  ? "border-pink-500 text-pink-700"
                  : "border-transparent text-pink-950/60 hover:text-pink-950",
              )}
            >
              {e.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
