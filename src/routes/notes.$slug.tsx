import { createFileRoute, notFound } from "@tanstack/react-router";
import { loadNotes } from "#/lib/notes";
import { BackButton } from "#/components/BackButton";
import { Backlinks } from "#/components/notes/Backlinks";
import { SEO } from "#/components/SEO";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import wikiLinkPlugin from "@flowershow/remark-wiki-link";
import CalendarIcon from "~icons/ph/calendar-blank";
import TagIcon from "~icons/ph/tag";

export const Route = createFileRoute("/notes/$slug")({
  component: NoteDetailPage,
  loader: async ({ params }) => {
    const notes = await loadNotes();
    const note = notes.find((n) => n.slug === params.slug);
    if (!note) {
      throw notFound();
    }
    return { note, notes };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.note.title ?? "Note"} | elianiva's home row` },
    ],
  }),
});

function NoteDetailPage() {
  const { note, notes } = Route.useLoaderData();

  return (
    <>
      <SEO
        title={note.title}
        description={note.description}
        keywords={note.tags}
      />
      <div className="mx-auto max-w-[1080px] pt-20 border-x border-pink-200/50 min-h-screen">
        <div className="py-4 md:py-8 px-2 md:px-8">
          <BackButton />

          <article className="pt-6">
            <h1 className="text-2xl md:text-4xl font-bold font-display text-pink-950 tracking-wide pb-4">
              {note.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 pb-6 text-sm text-pink-950/70 border-b border-pink-200/50">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4" />
                <span className="font-body">
                  {new Date(note.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <TagIcon className="w-4 h-4" />
                <div className="flex gap-2">
                  {note.tags
                    .filter((t) => t !== "public")
                    .map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-mono text-pink-950/70 bg-pink-50/80 px-2 py-0.5"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            {/* Note content */}
            <div className="prose prose-pink max-w-none pt-6">
              <ReactMarkdown
                remarkPlugins={[
                  remarkGfm,
                  [wikiLinkPlugin, { aliasDivider: "|" }],
                ]}
                components={{
                  a: ({ href, children }) => {
                    if (href?.startsWith("/notes/")) {
                      return (
                        <a
                          href={href}
                          className="text-pink-600 hover:text-pink-800 underline decoration-pink-300"
                        >
                          {children}
                        </a>
                      );
                    }
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-800 underline decoration-pink-300"
                      >
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {note.content}
              </ReactMarkdown>
            </div>
          </article>

          <Backlinks notes={notes} currentSlug={note.slug} />
        </div>
      </div>
    </>
  );
}
