import { Link } from "@tanstack/react-router";
import { Box, Cell, Postmark, STRETCHED } from "./box";

const COPY = {
  page: "This page drifted off somewhere. The URL you opened does not exist here anymore.",
  post: "This post shelf is empty. Maybe it drifted out of the archive.",
  project: "This project has not materialized. Maybe check the project list again.",
} as const;

/** The 404 compartment: a big number, a postmark, and the ways back. */
export function LostPage({
  section,
  home,
}: {
  section: keyof typeof COPY;
  home: "/" | "/posts" | "/projects";
}) {
  return (
    <Box>
      <Cell span="s2" tone="white" n={404} className="justify-between">
        <Postmark className="self-end">return to sender</Postmark>
        <p className="font-display text-[7rem] leading-none font-extrabold text-pink-950 md:text-[10rem]">
          <span className="text-pink-500">4</span>04
        </p>
      </Cell>
      <Cell span="w2" label="Lost in the blush" className="justify-end xl:col-span-4">
        <h1 className="font-display text-2xl font-bold text-pink-950 text-balance md:text-3xl">
          {COPY[section]}
        </h1>
      </Cell>
      <Cell
        linked
        tone="yellow"
        className="xl:col-span-2"
        label={
          <Link to="/" className={STRETCHED}>
            Home
          </Link>
        }
      >
        <p className="mt-auto text-sm text-pink-950/70">Start from the top</p>
      </Cell>
      <Cell
        linked
        tone="sky"
        className="xl:col-span-2"
        label={
          <Link to={home === "/" ? "/posts" : home} className={STRETCHED}>
            {home === "/projects" ? "All projects" : "All posts"}
          </Link>
        }
      >
        <p className="mt-auto text-sm text-pink-950/70">Browse the index instead</p>
      </Cell>
    </Box>
  );
}
