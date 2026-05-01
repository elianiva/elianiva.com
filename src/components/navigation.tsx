import { Link } from "@tanstack/react-router";
import PhHouseDuotone from "~icons/ph/house-duotone";
import PhReadCvLogoDuotone from "~icons/ph/read-cv-logo-duotone";
import PhFolderOpenDuotone from "~icons/ph/folder-open-duotone";
import PhReceiptDuotone from "~icons/ph/receipt-duotone";

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "Home", href: "/", icon: PhHouseDuotone },
  { label: "Posts", href: "/posts", icon: PhReadCvLogoDuotone },
  { label: "Projects", href: "/projects", icon: PhFolderOpenDuotone },
  { label: "Notes", href: "/notes", icon: PhReceiptDuotone },
];

export function NavigationStrip() {
  return (
    <div className="absolute z-40 top-1/3 right-1/2 -translate-x-[calc(var(--container)/2)] w-30">
      {NAVIGATION_ITEMS.map((item) => (
        <div className="group not-last:pb-2 overflow-hidden translate-x-px">
          <Link
            key={item.label}
            to={item.href}
            className="group flex items-center border bg-cream border-border pr-3 cursor-pointer transition-transform ease-out translate-x-[calc(100%-2.25rem)] group-hover:translate-x-px aria-[current=page]:translate-x-px focus:outline-none focus-visible:outline-none"
          >
            <div className="flex items-center justify-center w-12 h-auto aspect-square">
              <item.icon className="size-5 text-foreground group-hover:text-pink-600 group-aria-[current=page]:text-pink-600" />
            </div>
            <div className="text-xs text-right w-full font-heading font-bold uppercase text-foreground/50 transition group-hover:text-pink-600 group-aria-[current=page]:text-pink-600">
              {item.label}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
