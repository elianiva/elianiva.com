import { createFileRoute, notFound } from "@tanstack/react-router";
import { loadNotes } from "#/lib/notes";
import { BackButton } from "#/components/BackButton";
import { Backlinks } from "#/components/notes/Backlinks";
import { SEO } from "#/components/SEO";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import wikiLinkPlugin from "@flowershow/remark-wiki-link";

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

const categoryLabels: Record<string, string> = {
  article: "Article",
  vault: "Vault",
  person: "Person",
  music: "Music",
  articles: "Article",
  people: "Person",
};

function NoteDetailPage() {
  const { note, notes } = Route.useLoaderData();

  const displayTags = note.tags.filter((t) => t !== "public");

  const createdDate = new Date(note.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const modifiedDate = note.modifiedAt
    ? new Date(note.modifiedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const hasModifiedDate =
    note.modifiedAt && new Date(note.modifiedAt).getTime() !== new Date(note.date).getTime();

  return (
    <>
      <SEO title={note.title} />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <BackButton />

        <article className="pt-6" style={{ viewTransitionName: `note-card-${note.slug}` }}>
          {/* Breadcrumb */}
          <nav className="text-sm text-pink-950/50 mb-6">
            <a href="/notes" className="hover:text-pink-700 transition-colors">Notes</a>
            <span className="mx-2">/</span>
            <span>{categoryLabels[note.category] || note.category}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-pink-950 tracking-wide">
              {note.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-pink-950/60">
              <span className="px-2 py-1 rounded-full bg-pink-100/50 text-pink-900 text-xs font-medium">
                {categoryLabels[note.category] || note.category}
              </span>
              <span>Created {createdDate}</span>
              {hasModifiedDate && modifiedDate && (
                <span>· Modified {modifiedDate}</span>
              )}
            </div>

            {displayTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {displayTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-full bg-white/60 text-pink-950/70 border border-dashed border-pink-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <div className="prose prose-pink max-w-none">
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

          {/* Backlinks */}
          <Backlinks notes={notes} currentSlug={note.slug} />
        </article>
      </div>
    </>
  );
}
