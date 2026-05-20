import { useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
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
      <Button onClick={handleBack} variant="ghost">
        <ArrowLeftIcon className="size-4" />
        <span className="font-body uppercase font-medium tracking-wider text-xs">Back</span>
      </Button>
      <Link to="/">
        <Button variant="ghost">
          <HouseIcon className="size-4" />
          <span className="font-body uppercase font-medium tracking-wider text-xs">Home</span>
        </Button>
      </Link>
    </div>
  );
}
