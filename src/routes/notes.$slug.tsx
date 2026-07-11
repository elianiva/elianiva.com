import { createFileRoute, notFound } from "@tanstack/react-router";
import { loadNotes } from "~/features/notes/lib/notes";
import { NoteDetailPage } from "~/features/notes/components/note-detail-page";
import { seo, defaultOgImageUrl, siteUrl } from "~/lib/seo";
import { NoteDetailSkeleton } from "~/components/ui/page-skeleton";

export const Route = createFileRoute("/notes/$slug")({
  component: NoteDetailPage,
  pendingComponent: NoteDetailSkeleton,
  loader: async ({ params }) => {
    const notes = await loadNotes();
    const note = notes.find((n) => n.slug === params.slug);
    if (!note) {
      throw notFound();
    }
    return { note, notes };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return seo({
      title: loaderData.note.title,
      description: loaderData.note.description || loaderData.note.title,
      ogType: "website",
      ogImage: defaultOgImageUrl(loaderData.note.title, loaderData.note.description),
      canonical: `${siteUrl}/notes/${loaderData.note.slug}`,
    });
  },
});
