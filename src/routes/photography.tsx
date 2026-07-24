import { createFileRoute } from "@tanstack/react-router";
import { useState, type ImgHTMLAttributes } from "react";
import { photos, type PhotoEntry } from "~/data/photography";
import { Heading } from "~/components/ui/heading";
import { seo, defaultOgImageUrl } from "~/lib/seo";

const IMG_BASE = import.meta.env.VITE_IMG_BASE_URL ?? "";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return dateFmt.format(new Date(y, m - 1, d));
}

function groupByDate(entries: PhotoEntry[]): Map<string, PhotoEntry[]> {
  const groups = new Map<string, PhotoEntry[]>();
  for (const entry of entries.toSorted((a, b) => b.dateTaken.localeCompare(a.dateTaken))) {
    const existing = groups.get(entry.dateTaken);
    if (existing) existing.push(entry);
    else groups.set(entry.dateTaken, [entry]);
  }
  return groups;
}

function PhotoPlaceholder() {
  return (
    <div className="aspect-[3/2] w-full bg-pink-100/50 flex items-center justify-center border-b border-pink-200/50">
      <span className="font-mono text-[11px] uppercase text-pink-300 tracking-widest select-none">
        image
      </span>
    </div>
  );
}

function ImgWithFallback(props: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  if (failed) return <PhotoPlaceholder />;
  return <img {...props} onError={() => setFailed(true)} />;
}

function PhotoCard({ photo }: { photo: PhotoEntry }) {
  const imgUrl = IMG_BASE ? `${IMG_BASE}/${photo.image}` : `/${photo.image}`;

  return (
    <div className="break-inside-avoid mb-4 bg-white border border-pink-200/50 p-3 pb-8">
      {/* Image */}
      <div className="relative">
        <ImgWithFallback
          src={imgUrl}
          alt={photo.id}
          className="w-full h-auto block"
          loading="lazy"
        />
      </div>

      {/* Polaroid bottom — metadata area */}
      <div className="pt-2.5 space-y-1">
        {photo.camera && (
          <p className="font-mono text-[11px] text-pink-950/60 tracking-tight">{photo.camera}</p>
        )}
        {photo.lens && (
          <p className="font-mono text-[10px] text-pink-950/40">{photo.lens}</p>
        )}
        {photo.editedWith && (
          <p className="font-mono text-[10px] text-pink-950/40">
            Edited with {photo.editedWith}
          </p>
        )}
      </div>
    </div>
  );
}

function PhotographyPage() {
  const groups = groupByDate(photos);

  return (
    <div className="mx-auto max-w-container pt-10 border-x border-pink-200/50 min-h-screen">
      <div className="py-4 md:py-8 px-2 md:px-8">
        <section className="relative mb-8">
          <Heading level={1}>Photography</Heading>
          <p className="text-sm md:text-base font-body text-pink-950/70 pt-2 pb-4">
            A timeline of moments I&apos;ve captured.
          </p>
        </section>

        {groups.size === 0 && (
          <div className="py-16 text-center">
            <p className="font-mono text-sm text-pink-300 tracking-wider">
              No photos yet — the timeline is blank for now.
            </p>
          </div>
        )}

        {[...groups.entries()].map(([date, entries]) => (
          <section key={date} className="mb-10">
            <Heading level={2} className="mb-4">
              {formatDate(date)}
            </Heading>
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {entries.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/photography")({
  component: PhotographyPage,
  head: () =>
    seo({
      title: "Photography",
      description: "A timeline of moments I've captured",
      ogImage: defaultOgImageUrl("Photography", "A timeline of moments"),
      path: "/photography",
    }),
});
