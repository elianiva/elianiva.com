// Generates `.content-collections/generated` (gitignored) before lint.
// `tsconfig.json` maps the bare `content-collections` specifier to that
// directory, so typechecking fails on fresh checkouts (CI) where no
// dev/build has run the @content-collections/vite plugin yet.
import { createBuilder } from "@content-collections/core";

const builder = await createBuilder("content-collections.config.ts");
await builder.build();
