import * as DateTime from "effect/DateTime";
import { uses, usesUpdatedAt, type UsesItem, type UsesSection } from "~/data/uses";

function ItemName({ item }: { item: UsesItem }) {
  const className =
    "text-pink-950 underline decoration-pink-300/60 underline-offset-[6px] hover:text-pink-600";

  if (!item.href) return <span className={className}>{item.name}</span>;

  return (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
      {item.name}
      <span aria-hidden="true" className="font-mono text-[10px] text-pink-400 align-super ml-0.5">
        ↗
      </span>
    </a>
  );
}

function Item({ item }: { item: UsesItem }) {
  return (
    <article className="relative border border-pink-200/60 bg-white/70 backdrop-blur-lg p-4 md:p-5">
      <div
        aria-hidden="true"
        className="absolute -left-1 -top-1 size-2 border border-pink-200/60 bg-white"
      />
      <div
        aria-hidden="true"
        className="absolute -right-1 -top-1 size-2 border border-pink-200/60 bg-white"
      />
      <div
        aria-hidden="true"
        className="absolute -left-1 -bottom-1 size-2 border border-pink-200/60 bg-white"
      />
      <div
        aria-hidden="true"
        className="absolute -right-1 -bottom-1 size-2 border border-pink-200/60 bg-white"
      />

      <div className="grid grid-cols-[2.5rem_1fr] md:grid-cols-[17rem_1fr] md:gap-x-5 gap-y-3">
        <div className="md:pr-4">
          <h3 className="font-display text-xl md:text-2xl font-extrabold tracking-wide uppercase leading-tight">
            <ItemName item={item} />
          </h3>
          <p className="font-mono text-[11px] text-pink-400 mt-2">{item.spec}</p>
          <p className="text-sm text-pink-950/65 mt-2 leading-relaxed">{item.note}</p>
        </div>

        <div className="col-start-2 md:col-start-auto border-t border-pink-200/60 pt-3 md:border-t-0 md:border-l md:pt-0 md:pl-5">
          {item.why && (
            <p className="text-sm md:text-base text-pink-950/80 leading-relaxed">{item.why}</p>
          )}
          {item.swapFor && (
            <p className="text-sm text-pink-950/55 leading-relaxed mt-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-pink-400 mr-2">
                swap
              </span>
              {item.swapFor}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function Section({ section }: { section: UsesSection }) {
  return (
    <section className="py-6">
      <div className="flex items-baseline gap-3 pb-2 border-b border-pink-300/60">
        <h2 className="font-display text-xl md:text-2xl font-extrabold uppercase tracking-wide text-pink-950">
          <span className="text-pink-500">{section.title.slice(0, 1)}</span>
          {section.title.slice(1)}
        </h2>
        <span className="font-mono text-[11px] text-pink-950/35 ml-auto shrink-0 tabular-nums">
          {String(section.items.length).padStart(2, "0")}
        </span>
      </div>
      <p className="font-mono text-xs text-pink-950/50 pt-2.5 pb-4">{section.kicker}</p>

      <div className="grid gap-3">
        {section.items.map((item) => (
          <Item key={item.name} item={item} />
        ))}
      </div>
    </section>
  );
}

export function UsesPage() {
  const total = uses.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <div className="mx-auto max-w-container pt-10 border-x border-pink-200/50 min-h-screen">
      <div className="py-4 md:py-8 px-2 md:px-8">
        <header className="pb-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h1 className="font-display text-4xl md:text-6xl font-extrabold uppercase tracking-wide leading-none">
              <span className="text-pink-500">U</span>
              ses
            </h1>
            <p className="font-mono text-xs text-pink-950/50 md:text-right leading-relaxed">
              updated{" "}
              <span className="text-pink-500">
                {DateTime.format(DateTime.makeUnsafe(usesUpdatedAt), {
                  locale: "en-GB",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="block">
                {String(total).padStart(2, "0")} items across {uses.length} groups
              </span>
            </p>
          </div>
          <p className="text-sm md:text-base text-pink-950/70 mt-3 max-w-[62ch] leading-relaxed">
            These are the things that I use on a daily basis, and reasons why I use them.
          </p>
        </header>

        {uses.map((section) => (
          <Section key={section.slug} section={section} />
        ))}
        <div className="h-8" />
      </div>
    </div>
  );
}
