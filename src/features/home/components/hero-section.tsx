import siteData from "~/data/sites";
import { profile, utcOffsetLabel } from "~/data/profile";
import ArrowUpRightIcon from "~icons/ph/arrow-up-right-duotone";
import GithubLogoIcon from "~icons/ph/github-logo-duotone";
import LinkedinLogoIcon from "~icons/ph/linkedin-logo-duotone";
import CvLogoIcon from "~icons/ph/read-cv-logo-duotone";
import { Heading } from "~/components/ui/heading";
import { Button } from "~/components/ui/button";
import { LocalClock } from "./local-clock";

interface Social {
  icon: React.ComponentType<{ className?: string }>;
  link: string;
  label: string;
}

const socials: Social[] = [
  { icon: GithubLogoIcon, link: siteData.github, label: "Github" },
  { icon: LinkedinLogoIcon, link: siteData.linkedin, label: "LinkedIn" },
  { icon: CvLogoIcon, link: siteData.cv, label: "Résumé" },
];

/** The location, the UTC offset, and the live clock, sitting above the name. */
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
    <section
      aria-labelledby="hero-heading"
      className="relative flex flex-col-reverse md:flex-row gap-6 pb-8 px-2 md:px-8 with-box-underline"
    >
      <div className="flex-1">
        <StatusLine />
        <div>
          <Heading level={1} id="hero-heading" className="first-letter:text-pink-950">
            Dicha Z
            <span className="text-pink-500" title="Yes, this is where the username comes from">
              elianiva
            </span>
            n Arkana
          </Heading>
        </div>
        <p className="font-display text-lg leading-snug text-pink-950/85 max-w-[34ch] text-pretty md:text-2xl">
          Software engineer, lately leaning into design engineering.
        </p>
        <div>
          <p className="text-sm leading-relaxed font-body text-pink-950/70 py-3 max-w-[65ch] text-pretty md:text-base">
            I'm a software engineer with 4+ years mostly in web frontend, though I've dipped into
            backend, databases, and infra when needed. I like building interfaces that don't annoy
            people and cleaning up AI slop from codebases. Outside work, I tinker with side
            projects, contribute to OSS, and drink a lot of coffee.
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2 pt-2">
          <Button
            variant="default"
            size="lg"
            className="font-mono text-xs uppercase tracking-wide"
            nativeButton={false}
            render={
              <a
                href={`mailto:${siteData.email}`}
                title="Email me about work"
                aria-label="Work with me, by email"
              />
            }
          >
            Work with me
            <ArrowUpRightIcon data-icon="inline-end" />
          </Button>
          {socials.map((social) => {
            const Icon = social.icon;
            return (
              <Button
                key={social.label}
                variant="ghost"
                size="lg"
                nativeButton={false}
                render={
                  <a
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.label}
                    aria-label={`Visit ${social.label} profile`}
                  />
                }
              >
                <Icon className="size-4" />
                <span className="text-xs font-mono uppercase">{social.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
      <div className="relative mb-4 md:mb-0 mx-auto">
        <a
          href={siteData.github}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block size-30 md:size-40 group"
          aria-label="Visit GitHub profile"
        >
          <div className="relative w-full h-full border border-pink-200/50 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:ring-1 group-hover:ring-pink-200">
            <div className="absolute left-0 top-0 border border-pink-200/50 bg-white size-3 z-10 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute left-0 bottom-0 border border-pink-200/50 bg-white size-3 z-10 -translate-x-1/2 translate-y-1/2" />
            <div className="absolute right-0 top-0 border border-pink-200/50 bg-white size-3 z-10 translate-x-1/2 -translate-y-1/2" />
            <div className="absolute right-0 bottom-0 border border-pink-200/50 bg-white size-3 z-10 translate-x-1/2 translate-y-1/2" />
            <img
              src="/avatar.webp"
              alt="Profile photo of Dicha Zelianivan Arkana"
              className="w-full h-full object-cover"
              width={160}
              height={160}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </a>
      </div>
    </section>
  );
}
