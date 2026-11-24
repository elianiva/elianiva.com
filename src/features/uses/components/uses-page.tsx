import type { CSSProperties } from "react";
import { Box, Cell, PageHead, type Tone } from "~/components/box";
import { uses, usesUpdatedAt, type UsesItem, type UsesSection } from "~/data/uses";

const SECTION_TONES: Tone[] = ["yellow", "sky", "pink", "lilac"];

function ItemName({ item }: { item: UsesItem }) {
  if (!item.href) return <>{item.name}</>;
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-pink-300 decoration-2 underline-offset-[6px] hover:text-pink-600 hover:decoration-pink-500"
    >
      {item.name}
      <span aria-hidden="true" className="ml-0.5 align-super font-mono text-[10px] text-pink-400">
        ↗
      </span>
    </a>
  );
}

/** One thing I use: who it is on the left, why I use it on the right. */
function Item({ item }: { item: UsesItem }) {
  return (
    <Cell as="article" span="w3" className="gap-4 md:flex-row md:gap-8">
      <div className="md:w-56 md:shrink-0">
        <h3 className="font-display text-xl leading-tight font-extrabold tracking-wide text-pink-950 uppercase md:text-2xl">
          <ItemName item={item} />
        </h3>
        <p className="mt-2 font-mono text-[11px] text-pink-500">{item.spec}</p>
        <p className="mt-2 text-sm leading-relaxed text-pink-950/65">{item.note}</p>
      </div>
      {(item.why || item.swapFor) && (
        <div className="border-t border-dashed border-pink-200 pt-3 md:border-t-0 md:border-l md:pt-0 md:pl-8">
          {item.why && (
            <p className="text-[15px] leading-relaxed text-pink-950/80 text-pretty">{item.why}</p>
          )}
          {item.swapFor && (
            <p className="mt-3 text-sm leading-relaxed text-pink-950/60">
              <span className="mr-2 inline-block -rotate-3 bg-pink-200 px-1.5 font-mono text-[10px] tracking-widest text-pink-800 uppercase">
                swap
              </span>
              {item.swapFor}
            </p>
          )}
        </div>
      )}
    </Cell>
  );
}

/**
 * A group's coloured spine runs down the left column beside its items, as
 * tall as all of them together. On phones it sits on top instead.
 */
function Section({ section, index }: { section: UsesSection; index: number }) {
  return (
    <>
      <Cell
        as="header"
        tone={SECTION_TONES[index % 4]}
        className="col-span-2 md:col-span-1 md:[grid-row:span_var(--rows)]"
        style={{ "--rows": section.items.length } as CSSProperties}
      >
        <div className="md:sticky md:top-6">
          <h2 className="font-display text-2xl font-extrabold tracking-wide text-pink-950 uppercase">
            <span className="text-pink-500">{section.title.slice(0, 1)}</span>
            {section.title.slice(1)}
          </h2>
          <p className="mt-1 font-mono text-[11px] leading-relaxed text-pink-950/60">
            {section.kicker}
          </p>
        </div>
      </Cell>
      {section.items.map((item) => (
        <Item key={item.name} item={item} />
      ))}
    </>
  );
}

export function UsesPage() {
  const total = uses.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <Box square={false}>
      <PageHead
        title="Uses"
        tone="white"
        kicker="These are the things that I use on a daily basis, and reasons why I use them."
        aside={
          <p className="mt-auto font-mono text-[11px] leading-relaxed text-pink-950/60">
            updated{" "}
            <span className="text-pink-600">
              {new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "UTC",
              }).format(new Date(usesUpdatedAt))}
            </span>
            <span className="block">
              {String(total).padStart(2, "0")} items across {uses.length} groups
            </span>
          </p>
        }
      />
      {uses.map((section, index) => (
        <Section key={section.slug} section={section} index={index} />
      ))}
    </Box>
  );
}
