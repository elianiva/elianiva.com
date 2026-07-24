import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "~/lib/utils";

type NavItem = { label: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Posts", href: "/posts" },
  { label: "Projects", href: "/projects" },
  { label: "Photography", href: "/photography" },
  { label: "Neighbours", href: "/neighbours" },
  { label: "AI Usage", href: "/ai" },
  { label: "Music", href: "/music" },
];

export function NavigationStrip() {
  const { pathname } = useLocation();

  return (
    <header className="fixed md:top-2 inset-x-0 z-40 flex justify-center max-sm:bg-cream/70 max-sm:backdrop-blur-md">
      <nav className="mt-4 md:mt-0 mx-auto flex items-center h-10 md:bg-cream/70 md:backdrop-blur-md border-y md:border border-pink-200/50 max-w-container w-full">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "h-full px-4 text-xs font-normal transition-colors border-r border-border flex items-center uppercase font-heading tracking-widest text-foreground/70 active:bg-border/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2",
                isActive && "font-semibold bg-border/30 text-pink-600",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
