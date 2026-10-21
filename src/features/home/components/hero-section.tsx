import siteData from "~/data/sites";
import { profile, utcOffsetLabel } from "~/data/profile";
import ArrowUpRightIcon from "~icons/ph/arrow-up-right-duotone";
import { Heading } from "~/components/ui/heading";
import { LocalClock } from "./local-clock";

/** GitHub, LinkedIn and the résumé first, so the filled call to action closes the strip. */
const links = [
  { label: "GitHub", href: siteData.github, external: true },
  { label: "LinkedIn", href: siteData.linkedin, external: true },
  { label: "Résumé", href: siteData.cv, external: true },
  { label: "Work with me", href: `mailto:${siteData.email}`, primary: true },
] as const;

/** The location, the UTC offset, and the live clock. */
function StatusLine() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.2em] text-pink-950/70 md:text-[11px]">
      <span className="inline-flex items-center gap-1.5 text-pink-700">
        <span
          className="size-1.5 animate-pulse bg-pink-400 motion-reduce:animate-none"
          aria-hidden="true"
        />
        {profile.location}
      </span>
      <span aria-hidden="true" className="text-pink-200">
        /
      </span>
      <span>{utcOffsetLabel(profile.timeZone)}</span>
      <span aria-hidden="true" className="text-pink-200">
        /
      </span>
      <LocalClock />
    </div>
  );
}

export function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="relative with-box-underline">
      <div className="px-2 pb-8 md:px-8">
        <Heading level={1} id="hero-heading" className="first-letter:text-pink-950">
          Dicha Z
          <span className="text-pink-500" title="Yes, this is where the username comes from">
            elianiva
          </span>
          n Arkana
        </Heading>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-pink-700">
            Frontend-leaning Product Engineer
          </p>
          <StatusLine />
        </div>
        <p className="mt-2 font-display text-xl leading-snug text-pink-950/85 text-pretty md:text-2xl">
          I care about making fast software that&rsquo;s{" "}
          <em className="text-pink-600">delightful</em> to use.
        </p>
      </div>
      <nav
        aria-label="Contact and profiles"
        className="grid grid-cols-2 divide-x divide-pink-200/50 border-t border-pink-200/50 md:grid-cols-[1fr_1fr_1fr_1.5fr]"
      >
        {links.map((link, index) => (
          <a
            key={link.label}
            href={link.href}
            {...("external" in link
              ? { target: "_blank", rel: "noopener noreferrer" }
              : { title: "Email me about work" })}
            className={`group flex items-center justify-between px-2 py-4 font-mono text-xs uppercase tracking-wide transition-colors md:px-8 ${
              index < 2 ? "border-b border-pink-200/50 md:border-b-0" : ""
            } ${
              "primary" in link
                ? "bg-pink-600 text-white hover:bg-pink-700"
                : "text-pink-950/80 hover:bg-pink-50 hover:text-pink-700"
            }`}
          >
            {link.label}
            <ArrowUpRightIcon className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </a>
        ))}
      </nav>
    </section>
  );
}
