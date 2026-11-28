import type { Html } from "@effect/ui/html";
import { css } from "../../styled-system/css";

/**
 * The copy button of a code block: hidden until the block is hovered or the
 * button is focused, a check mark for two seconds after a copy. It is plain
 * markup, so the prerendered page holds it and hydration has no component to
 * adopt for each block (a long post has dozens). One click listener on the
 * document, `listenForCopies`, does the copying.
 */
const COPY =
  "M216 32H88a8 8 0 0 0-8 8v16H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-16h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8m-56 176H48V64h112Zm48-48h-32V56a8 8 0 0 0-8-8H96V48h112z";
const CHECK =
  "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z";

export const CodeCopy = <M>(h: Html.H<M>) =>
  h.button
    .attrs({ type: "button", "aria-label": "Copy code", "data-copy-code": "" })
    .class(
      css({
        position: "absolute",
        top: "2",
        right: "2",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "7",
        height: "7",
        p: "1.5",
        bg: "white/80",
        border: "1px solid",
        borderColor: "pink.200",
        color: "pink.700",
        cursor: "pointer",
        opacity: "0",
        transition: "opacity 200ms",
        _hover: { bg: "white", color: "pink.900" },
        _focusVisible: { opacity: "1", outline: "1px solid", outlineColor: "ring" },
        _groupHover: { opacity: "1" },
      }),
    )
    .children(
      h.svg
        .attrs({ viewBox: "0 0 256 256", fill: "currentColor", width: "16", height: "16" })
        .children(h.path.attrs({ d: COPY })),
    );

/** Copies the `pre` next to a clicked copy button, and shows a check mark for two seconds. */
export const listenForCopies = () => {
  document.addEventListener("click", (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>("[data-copy-code]");
    const code = button?.parentElement?.querySelector("pre")?.textContent;
    if (!button || code == null) return;
    const path = button.querySelector("path")!;
    void navigator.clipboard.writeText(code).then(
      () => {
        button.setAttribute("aria-label", "Copied!");
        path.setAttribute("d", CHECK);
        setTimeout(() => {
          button.setAttribute("aria-label", "Copy code");
          path.setAttribute("d", COPY);
        }, 2000);
      },
      () => {},
    );
  });
};
