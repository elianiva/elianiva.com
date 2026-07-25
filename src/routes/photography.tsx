import { createFileRoute } from "@tanstack/react-router";
import { useState, type ImgHTMLAttributes } from "react";
import { photos, type PhotoEntry } from "~/data/photography";
import { Heading } from "~/components/ui/heading";
import { seo, defaultOgImageUrl } from "~/lib/seo";
import { Dialog, DialogTrigger, DialogContent } from "~/components/ui/dialog";

const IMG_SRC = "/api/photography/image";

function PhotoPlaceholder({ aspectRatio }: { aspectRatio: string }) {
  return (
    <div
      style={{ aspectRatio }}
      className="w-full bg-pink-100/50 flex items-center justify-center border border-pink-200/50"
    >
      <span className="font-mono text-[11px] uppercase text-pink-300 tracking-widest select-none">
        image
      </span>
    </div>
  );
}

function ImgWithFallback({
  aspectRatio,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { aspectRatio: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <PhotoPlaceholder aspectRatio={aspectRatio} />;
  return (
    <div style={{ aspectRatio }} className="relative w-full overflow-hidden">
      <img
        {...props}
        className="absolute inset-0 w-full h-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function PhotoCard({ photo }: { photo: PhotoEntry }) {
  const relPath = photo.url.replace("photography/", "");
  const imgSrc = `${IMG_SRC}?path=${encodeURIComponent(relPath)}&type=smol`;
  const dlSrc = `${IMG_SRC}?path=${encodeURIComponent(relPath)}&type=original`;

  return (
    <Dialog>
      <div className="break-inside-avoid mb-2 bg-white border border-pink-200/50 p-3 min-w-56">
        {/* Image — clickable to open lightbox */}
        <DialogTrigger
          render={
            <button type="button" className="relative w-full block text-left cursor-zoom-in">
              <ImgWithFallback
                aspectRatio={photo.aspectRatio}
                src={imgSrc}
                alt={photo.id}
                loading="lazy"
              />
            </button>
          }
        />

        {/* Metadata */}
        <div className="pt-2 space-y-0.5">
          {photo.camera && (
            <p className="font-mono text-[11px] text-pink-950/60 tracking-tight">{photo.camera}</p>
          )}
          {photo.lensOrSensor && (
            <p className="font-mono text-[10px] text-pink-950/40">{photo.lensOrSensor}</p>
          )}
          {photo.editedWith && (
            <p className="font-mono text-[10px] text-pink-950/40">Edited with {photo.editedWith}</p>
          )}
        </div>
      </div>

      {/* Lightbox — same styling as card, bigger */}
      <DialogContent
        className="w-fit p-4 bg-white border border-pink-200/50"
        showCloseButton={false}
      >
        <div className="flex flex-col">
          <img
            src={imgSrc}
            alt={photo.id}
            className="w-full h-full max-h-[90vh] aspect-auto object-contain"
          />
          <div className="pt-2 space-y-0.5">
            {photo.camera && (
              <p className="font-mono text-sm text-pink-950/60 tracking-tight">{photo.camera}</p>
            )}
            {photo.lensOrSensor && (
              <p className="font-mono text-sm text-pink-950/40">{photo.lensOrSensor}</p>
            )}
            {photo.editedWith && (
              <p className="font-mono text-sm text-pink-950/40">Edited with {photo.editedWith}</p>
            )}
            <div className="pt-0.5">
              <a
                href={dlSrc}
                download
                className="font-mono text-sm text-pink-400 hover:text-pink-600 transition-colors underline underline-offset-2 decoration-pink-200/50"
              >
                Download original
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PhotographyPage() {
  const sorted = [...photos].sort((a, b) => b.dateTaken.localeCompare(a.dateTaken));

  return (
    <div className="mx-auto max-w-container pt-10 border-x border-pink-200/50 min-h-screen">
      <div className="py-4 md:py-8 px-2 md:px-8">
        <section className="relative mb-8">
          <Heading level={1}>Photography</Heading>
          <p className="text-sm md:text-base font-body text-pink-950/70 pt-2 pb-4">
            I like doing photography on the side, feel free to have a look! Click on any photo to
            enlarge it.
          </p>
        </section>

        {sorted.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-mono text-sm text-pink-300 tracking-wider">
              No photos yet — the timeline is blank for now.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center">
          {sorted.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
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
