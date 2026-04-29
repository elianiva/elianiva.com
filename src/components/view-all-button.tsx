import { Link } from "@tanstack/react-router";

interface ViewAllButtonProps {
  href: string;
  label: string;
  ariaLabel: string;
}

export function ViewAllButton({ href, label, ariaLabel }: ViewAllButtonProps) {
  return (
    <Link
      to={href}
      className="group w-fit ml-auto flex items-center justify-center bg-white/60 py-2 px-4 text-pink-900 hover:bg-white transition-all focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
      aria-label={ariaLabel}
    >
      <span className="font-body uppercase font-medium tracking-wider text-xs">{label}</span>
    </Link>
  );
}
