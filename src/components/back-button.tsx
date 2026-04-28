import { useCallback } from "react";
import { Link } from "@tanstack/react-router";
import HouseIcon from "~icons/ph/house";
import ArrowLeftIcon from "~icons/ph/arrow-left";

export function BackButton() {
  const handleBack = useCallback(() => {
    if (document.referrer && document.referrer.startsWith(window.location.origin)) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  }, []);

  return (
    <div className="flex gap-2 mb-4 items-center justify-center">
      <button
        onClick={handleBack}
        className="flex items-center gap-1 bg-white/60 py-2 px-4 text-pink-900 hover:bg-white transition-all focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
        aria-label="Go back"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span className="font-body uppercase font-medium tracking-wider text-xs">Back</span>
      </button>
      <Link
        to="/"
        className="flex items-center gap-1 bg-white/60 py-2 px-4 text-pink-900 hover:bg-white transition-all focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
        aria-label="Go to home"
      >
        <HouseIcon className="w-4 h-4" />
        <span className="font-body uppercase font-medium tracking-wider text-xs">Home</span>
      </Link>
    </div>
  );
}
