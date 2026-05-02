import { createFileRoute } from "@tanstack/react-router";
import { loadNotes, buildGraph } from "~/features/notes/lib/notes";
import { NotesPage } from "~/features/notes/components/notes-page";
import { seo } from "~/lib/seo";

export const Route = createFileRoute("/notes/")({
  component: NotesPage,
  loader: async () => {
    const [notes, graph] = await Promise.all([loadNotes(), buildGraph()]);
    return { notes, graph };
  },
  head: () => seo({ title: "Notes", description: "Digital garden and collection of thoughts" }),
});
