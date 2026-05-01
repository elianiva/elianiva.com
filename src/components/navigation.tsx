import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "~/lib/utils";

type NavItem = { label: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Posts", href: "/posts" },
  { label: "Projects", href: "/projects" },
  { label: "Notes", href: "/notes" },
];

export function NavigationStrip() {
  const { pathname } = useLocation();

  return (
    <header className="fixed top-2 left-2 right-2 z-40 flex justify-center">
      <nav className="mx-auto flex items-center h-10 bg-cream/60 backdrop-blur-md border border-pink-200/50 max-w-container w-full">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "h-full px-4 text-xs font-normal transition-colors border-r border-border flex items-center uppercase font-heading tracking-widest text-foreground/70 active:bg-border/30 [&:focus]:outline-none [&:focus-visible]:outline-none",
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
