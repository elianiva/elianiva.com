import { createFileRoute } from "@tanstack/react-router";
import { loadNotes, buildGraph } from "~/features/notes/lib/notes";
import { NotesPage } from "~/features/notes/components/notes-page";
import { seo, defaultOgImageUrl } from "~/lib/seo";
import { NotesIndexSkeleton } from "~/components/ui/page-skeleton";

export const Route = createFileRoute("/notes/")({
  component: NotesPage,
  pendingComponent: NotesIndexSkeleton,
  loader: async () => {
    const [notes, graph] = await Promise.all([loadNotes(), buildGraph()]);
    return { notes, graph };
  },
  head: () => seo({ title: "Notes", description: "Digital garden and collection of thoughts", ogImage: defaultOgImageUrl("Notes", "Digital garden and collection of thoughts") }),
});
