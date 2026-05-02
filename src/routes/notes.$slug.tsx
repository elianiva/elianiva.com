import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { loadNotes } from "~/features/notes/lib/notes";
import { NoteDetailPage } from "~/features/notes/components/note-detail-page";
import { NotFound } from "~/components/not-found";
import { seo } from "~/lib/seo";

const getNoteDetail = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const notes = await loadNotes();
    const note = notes.find((n) => n.slug === slug);
    if (!note) return null;
    return renderServerComponent(<NoteDetailPage note={note} notes={notes} />);
  });

export const Route = createFileRoute("/notes/$slug")({
  component: NoteDetailRoute,
  loader: async ({ params }) => {
    const result = await getNoteDetail({ data: params.slug });
    if (!result) {
      throw notFound();
    }
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    // We don't have title/description in the RSC output, so use a default
    return seo({
      title: "Note",
      description: "A note from the digital garden",
      ogType: "website",
    });
  },
});

function NoteDetailRoute() {
  const page = Route.useLoaderData();
  if (!page) {
    return (
      <NotFound
        path="notes"
        label="Digital Garden"
        title="This note faded out of the vault."
        description="The note you asked for is missing or private. Try another path back into the garden."
        backTo={{ to: "/notes", label: "Notes index" }}
      />
    );
  }
  return <>{page}</>;
}
