import { Schema } from "effect";

/**
 * Components that posts and projects place in their Markdown. Effect UI's
 * Markdown has block-level islands only, written `::Name{attr="value"}` on its
 * own line (leaf) or `:::Name{attr="value"}` ... `:::` around Markdown
 * (container). The build checks every use against these structs, and
 * `app/components/prose.ts` renders them.
 */
export const Islands = {
  /** A dated note inside a post. Container: the note is its body. */
  Update: Schema.Struct({ date: Schema.String }),
  /** A glossary entry at the end of a post. Container: the definition is its body. `name` is the id inline links point at, as `[term](#term-name)`. */
  Term: Schema.Struct({ name: Schema.String }),
  /** A greentext block. Container: a bullet list, one `>` line per item. */
  Greentext: Schema.Struct({}),
  /** An interactive quiz. Leaf: `id` selects the quiz in `app/content/quizzes.ts`. */
  Quiz: Schema.Struct({ id: Schema.String }),
};
