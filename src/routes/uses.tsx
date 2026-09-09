import { createFileRoute } from "@tanstack/react-router";
import * as DateTime from "effect/DateTime";
import { uses, usesUpdatedAt } from "~/data/uses";
import { Heading } from "~/components/ui/heading";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "~/components/ui/table";
import { seo, defaultOgImageUrl } from "~/lib/seo";

function sectionIndex(index: number) {
  return `${String(index + 1).padStart(2, "0")} //`;
}

function UsesRoute() {
  return (
    <div className="mx-auto max-w-container pt-10 border-x border-pink-200/50 min-h-screen">
      <div className="py-4 md:py-8 px-2 md:px-8">
        <section className="relative">
          <Heading level={1}>Uses</Heading>
          <p className="text-sm md:text-base font-body text-pink-950/70 pt-2">
            Stuff I actually use on a daily basis.
          </p>
          <p className="font-mono text-sm text-foreground/60 pt-1 pb-4">
            last updated{" "}
            <b className="text-pink-500 font-normal">
              {DateTime.format(DateTime.makeUnsafe(usesUpdatedAt), {
                locale: "en-GB",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </b>
          </p>
        </section>

        {uses.map((section, index) => (
          <section key={section.slug} className="py-4 md:py-8">
            <Heading level={2} right={sectionIndex(index)}>
              {section.title}
            </Heading>
            <p className="text-sm md:text-base font-body text-pink-950/70 pt-2 pb-4">
              {section.kicker}
            </p>
            <Table className="font-mono text-sm">
              <TableHeader>
                <TableRow>
                  {["item", "spec", "note"].map((label) => (
                    <TableHead
                      key={label}
                      className="text-[10px] text-pink-950/40 uppercase tracking-widest font-normal"
                    >
                      {label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.items.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="text-pink-500">
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 decoration-pink-300/50 hover:text-pink-600"
                        >
                          {item.name}
                        </a>
                      ) : (
                        item.name
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-pink-950/60">{item.spec}</TableCell>
                    <TableCell className="whitespace-normal text-pink-950/70">
                      {item.note}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/uses")({
  component: UsesRoute,
  head: () =>
    seo({
      title: "Uses",
      description: "Hardware, software, and camera gear I actually use.",
      ogImage: defaultOgImageUrl("Uses", "Stuff I actually use"),
      path: "/uses",
    }),
});
