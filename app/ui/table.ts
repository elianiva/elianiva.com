import type { Html } from "@effect/ui/html";
import { css } from "../../styled-system/css";

/** shadcn's table pieces: each returns a builder to add children to. */
export const Table = <M>(h: Html.H<M>) =>
  h.table
    .class(css({ width: "100%", captionSide: "bottom", fz: "xs" }))
    .forward((table) =>
      h.div.class(css({ position: "relative", width: "100%", overflowX: "auto" })).children(table),
    );

export const TableHeader = <M>(h: Html.H<M>) =>
  h.thead.class(css({ "& tr": { borderBottomWidth: "1px" } }));

export const TableBody = <M>(h: Html.H<M>) =>
  h.tbody.class(css({ "& tr:last-child": { borderWidth: "0" } }));

export const TableRow = <M>(h: Html.H<M>) =>
  h.tr.class(
    css({
      borderBottomWidth: "1px",
      transition: "colors 200ms",
      _hover: { bg: "color-mix(in oklab, var(--muted) 50%, transparent)" },
    }),
  );

export const TableHead = <M>(h: Html.H<M>) =>
  h.th.class(
    css({
      height: "10",
      px: "2",
      textAlign: "left",
      verticalAlign: "middle",
      fontWeight: "medium",
      whiteSpace: "nowrap",
      color: "foreground",
    }),
  );

export const TableCell = <M>(h: Html.H<M>) =>
  h.td.class(css({ p: "2", verticalAlign: "middle", whiteSpace: "nowrap" }));

export const TableCaption = <M>(h: Html.H<M>) =>
  h.caption.class(css({ mt: "4", fz: "xs", color: "muted-foreground" }));
