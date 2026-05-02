import { Link } from "@tanstack/react-router";

interface NotFoundProps {
  path: string;
  label: string;
  title: string;
  description: string;
  backTo?: { to: string; label: string };
}

export function NotFound({ path, label, title, description, backTo }: NotFoundProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-container items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl border border-pink-200 bg-white/80 p-6 shadow-soft backdrop-blur-sm md:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-pink-400">
          404 / {path}
        </p>
        <h1 className="mt-3 text-3xl font-display text-pink-800 md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-pink-950/75 md:text-base">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="border border-pink-300 bg-pink-50 px-4 py-2 text-sm text-pink-900 transition hover:bg-pink-100"
          >
            Home
          </Link>
          {backTo && (
            <Link
              to={backTo.to}
              className="border border-pink-300 bg-pink-50 px-4 py-2 text-sm text-pink-900 transition hover:bg-pink-100"
            >
              {backTo.label}
            </Link>
          )}
        </div>
        {label && (
          <p className="mt-6 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-pink-300">
            {label}
          </p>
        )}
      </div>
    </div>
  );
}
