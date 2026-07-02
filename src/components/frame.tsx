import { Link } from "@tanstack/react-router";

export function Frame() {
  return (
    <>
      <div className="hidden md:block fixed top-0 left-0 right-0 h-2 bg-pink-200 z-50" />
      <div className="hidden md:block fixed top-0 bottom-0 right-0 w-2 bg-pink-200 z-50" />
      <div className="hidden md:block fixed bottom-0 left-0 right-0 h-2 bg-pink-200 z-50" />
      <div className="hidden md:block fixed top-0 left-0 bottom-0 w-2 bg-pink-200 z-50" />

      <div className="fixed top-0 left-0 w-40 h-4 bg-sky-200 z-50 border-2 border-pink-200 border-t-0 border-l-0" />
      <div className="fixed top-0 left-0 w-20 h-6 bg-yellow-300 z-50 group cursor-pointer flex items-center justify-center transition-transform  border-2 border-pink-200 border-t-0 border-l-0">
        <Link
          to="/notes"
          className="sr-only group-hover:not-sr-only text-xs text-yellow-700 focus:not-sr-only focus:absolute focus:top-6 focus:left-6 focus:bg-yellow-300 focus:px-2 focus:py-1 focus:z-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          aria-label="Notes"
        >
          notes
        </Link>
      </div>
    </>
  );
}
