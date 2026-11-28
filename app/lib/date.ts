/**
 * `en-GB` dates and counts without `Intl`. The first `Intl.DateTimeFormat` a
 * page creates loads the browser's locale data, about 12 ms on a laptop and
 * four times that on a phone, and hydration pays it before the page is
 * interactive. These formats are fixed, so a table does the same job; the
 * test checks every day of a few years against `Intl`.
 */
const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
const LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type DateParts = {
  /** Leave out for no day. */
  readonly day?: "numeric" | "2-digit";
  readonly month: "short" | "long";
  readonly year?: boolean;
};

/** Formats the UTC date of `value` like `Intl.DateTimeFormat("en-GB", { ...parts, timeZone: "UTC" })`. */
export const formatUtcDate = (value: Date | string | number, parts: DateParts): string => {
  // oxlint-disable-next-line efx-no-native-date
  const date = value instanceof Date ? value : new Date(value);
  const month = (parts.month === "long" ? LONG : SHORT)[date.getUTCMonth()]!;
  const day = date.getUTCDate();
  return [
    parts.day === undefined
      ? undefined
      : parts.day === "2-digit"
        ? String(day).padStart(2, "0")
        : day,
    month,
    parts.year ? date.getUTCFullYear() : undefined,
  ]
    .filter((part) => part !== undefined)
    .join(" ");
};

/** `1234567` becomes `1,234,567`, as `toLocaleString("en-GB")` does for a whole number. */
export const formatCount = (value: number): string =>
  String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
