/** A run of quiz text: plain text, inline code, or a line break. */
export type Segment =
  | { readonly _tag: "text"; readonly text: string }
  | { readonly _tag: "code"; readonly text: string }
  | { readonly _tag: "break" };

export interface QuizOption {
  readonly id: string;
  readonly text: string;
  readonly isCorrect: boolean;
}

export interface QuizResponse {
  readonly title: string;
  readonly message: ReadonlyArray<Segment>;
}

export interface QuizData {
  readonly question: ReadonlyArray<Segment>;
  readonly options: ReadonlyArray<QuizOption>;
  readonly correctResponse: QuizResponse;
  readonly errorResponse: QuizResponse;
}

const text = (text: string): Segment => ({ _tag: "text", text });
const code = (text: string): Segment => ({ _tag: "code", text });
const br: Segment = { _tag: "break" };

/** Quizzes by id, referenced as `::Quiz{id="..."}` in posts. */
export const quizzes: Record<string, QuizData> = {
  "jj-reflog": {
    question: [
      text("Let's do a little quiz and see if you can recover from this :)"),
      br,
      text("Which "),
      code("HEAD"),
      text(" contains the safe state of your app before the broken rebase?"),
    ],
    options: [
      { id: "a", text: "HEAD@{0} - The most recent entry after rebase finished", isCorrect: false },
      { id: "b", text: "HEAD@{13} - Where the rebase started, checkout to main", isCorrect: false },
      {
        id: "c",
        text: "HEAD@{14} - The last commit before rebase operations began",
        isCorrect: true,
      },
      { id: "d", text: "HEAD@{7} - The middle of the rebase, seems balanced", isCorrect: false },
    ],
    correctResponse: {
      title: "Correct!",
      message: [
        text("The reflog shows "),
        code("HEAD@{14}"),
        text(" contains the last commit before the rebase started. The entry "),
        code("c1805f1"),
        text(" represents the safe state of your feature branch before things went sideways."),
      ],
    },
    errorResponse: {
      title: "Not quite!",
      message: [
        text(
          "While those entries look tempting, they contain the messy rebase operations. Look for the last entry before the rebase started, that's where your safe state lives.",
        ),
      ],
    },
  },
};
