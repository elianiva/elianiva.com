import { Subscription, UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Effect, Schema, Stream } from "effect";
import { css } from "../../styled-system/css";
import { quizzes, type Segment } from "../content/quizzes";

/**
 * The interactive quiz of `::Quiz{id="..."}`, ported from `src/components/quiz.tsx`.
 * Its data is in `app/content/quizzes.ts`; an id with no entry renders nothing.
 */
export const QuizMessage = UiSchema.TaggedEnum({
  Selected: { id: Schema.String },
  Submitted: {},
  Retried: {},
  StoppedShaking: {},
});

const button = {
  transition: "color 200ms, background-color 200ms, border-color 200ms, scale 200ms",
  _active: { scale: "0.97" },
  _focus: { outline: "none", boxShadow: "0 0 0 2px #fff, 0 0 0 4px var(--colors-pink-400)" },
} as const;

/** Quiz text: plain runs, inline code and line breaks. */
const Segments = <M>(h: Html.H<M>, segments: ReadonlyArray<Segment>) =>
  segments.map((segment) =>
    segment._tag === "text"
      ? segment.text
      : segment._tag === "code"
        ? h.code.class(css({ fontFamily: "mono", fontSize: "sm" })).children(segment.text)
        : h.br,
  );

export const Quiz = Html.component({
  name: "Quiz",
  props: Schema.Struct({ id: Schema.String }),
  model: Schema.Struct({
    selected: Schema.NullOr(Schema.String),
    showResult: Schema.Boolean,
    shaking: Schema.Boolean,
  }),
  message: QuizMessage,
}).make({
  init: () => ({ selected: null, showResult: false, shaking: false }),
  update: {
    Selected: ($, { id }) => ($.model.showResult ? $.model : $.evolve({ selected: id })),
    Submitted: ($) => {
      const quiz = quizzes[$.props.id];
      if (!quiz || $.model.selected === null) return $.model;
      const correct = quiz.options.find((o) => o.id === $.model.selected)?.isCorrect ?? false;
      return $.evolve({ showResult: true, shaking: !correct });
    },
    Retried: ($) => $.set({ selected: null, showResult: false, shaking: false }),
    StoppedShaking: ($) => $.evolve({ shaking: false }),
  },
  subscriptions: ({ model }) => [
    model.shaking &&
      Subscription.make("shake", "shaking", () =>
        Stream.fromEffect(Effect.as(Effect.sleep("500 millis"), QuizMessage.StoppedShaking())),
      ),
  ],
  view: (h, model) => {
    const quiz = quizzes[h.props.id];
    if (!quiz) return h.div;
    const { selected, showResult, shaking } = model;
    const isCorrect = selected
      ? (quiz.options.find((o) => o.id === selected)?.isCorrect ?? false)
      : false;
    const response = isCorrect ? quiz.correctResponse : quiz.errorResponse;

    return h.div
      .class(
        css({
          my: "8",
          border: "1px solid",
          borderColor: "pink.200/50",
          bg: "white/60",
          p: "6",
        }),
        shaking && "animate-shake",
      )
      .children(
        h.p
          .class(
            css({
              fontFamily: "display",
              fontWeight: "semibold",
              color: "pink.950",
              mb: "6 !important",
            }),
          )
          .children(Segments(h, quiz.question)),
        h.div.class(css({ display: "flex", flexDirection: "column", gap: "2", mb: "6" })).children(
          quiz.options.map((option) => {
            const isSelected = selected === option.id;
            const showCorrect = showResult && option.isCorrect;
            const showWrong = showResult && isSelected && !option.isCorrect;
            return h.button
              .key(option.id)
              .attrs({ type: "button" })
              .disabled(showResult)
              .class(
                css(button, {
                  width: "100%",
                  textAlign: "left",
                  p: "3",
                  border: "1px solid",
                  cursor: "pointer",
                  borderColor: "pink.200/50",
                  bg: "white/40",
                  _hover: { bg: "white/80" },
                }),
                showCorrect && css({ borderColor: "green.400", bg: "green.50/50" }),
                showWrong && css({ borderColor: "red.400", bg: "red.50/50" }),
                isSelected && !showResult && css({ borderColor: "pink.400", bg: "pink.50/50" }),
                showResult && !isSelected && !option.isCorrect && css({ opacity: "0.5" }),
              )
              .on("click", QuizMessage.Selected({ id: option.id }))
              .children(
                h.span
                  .class(css({ fontFamily: "mono", fz: "sm", color: "pink.950/60", mr: "3" }))
                  .children(`${option.id}.`),
                h.span.class(css({ fz: "sm", color: "pink.950/80" })).children(option.text),
              );
          }),
        ),
        showResult
          ? h.div
              .class(
                css({ borderLeftWidth: "1px", p: "4" }),
                isCorrect
                  ? css({ borderColor: "green.400", bg: "green.50/30" })
                  : css({ borderColor: "red.400", bg: "red.50/30" }),
              )
              .children(
                h.p
                  .class(
                    css({ fontFamily: "display", fontWeight: "semibold", mb: "1 !important" }),
                    css(isCorrect ? { color: "green.700" } : { color: "red.700" }),
                  )
                  .children(response.title),
                h.p
                  .class(css({ fz: "sm", color: "pink.950/70", mb: "0 !important" }))
                  .children(Segments(h, response.message)),
                !isCorrect &&
                  h.button
                    .attrs({ type: "button" })
                    .class(
                      css(button, {
                        mt: "3",
                        bg: "white/60",
                        border: "1px solid",
                        borderColor: "pink.200/50",
                        py: "1.5",
                        px: "4",
                        fz: "xs",
                        fontFamily: "mono",
                        color: "pink.950",
                        cursor: "pointer",
                        _hover: { bg: "white", borderColor: "pink.200" },
                      }),
                    )
                    .on("click", QuizMessage.Retried())
                    .children("Try again"),
              )
          : h.button
              .attrs({ type: "button" })
              .disabled(selected === null)
              .class(
                css(button, {
                  bg: "pink.50/80",
                  border: "1px solid",
                  borderColor: "pink.200/50",
                  py: "2",
                  px: "6",
                  fz: "sm",
                  fontFamily: "mono",
                  color: "pink.950",
                  cursor: "pointer",
                  _hover: { bg: "pink.50", borderColor: "pink.200" },
                  _disabled: { opacity: "0.4", cursor: "not-allowed" },
                }),
              )
              .on("click", QuizMessage.Submitted())
              .children("Check Answer"),
      );
  },
});
