import siteData from "~/data/sites";
import EnvelopeIcon from "~icons/ph/envelope-duotone";
import GithubLogoIcon from "~icons/ph/github-logo-duotone";
import LinkedinLogoIcon from "~icons/ph/linkedin-logo-duotone";
import CvLogoIcon from "~icons/ph/read-cv-logo-duotone";
import XLogoIcon from "~icons/ph/x-logo-duotone";
import { Heading } from "~/components/ui/heading";
import { Button } from "~/components/ui/button";

interface Social {
  icon: React.ComponentType<{ className?: string }>;
  link: string;
  label: string;
}

const socials: Social[] = [
  { icon: EnvelopeIcon, link: `mailto:${siteData.email}`, label: "Email" },
  { icon: GithubLogoIcon, link: siteData.github, label: "Github" },
  { icon: LinkedinLogoIcon, link: siteData.linkedin, label: "LinkedIn" },
  { icon: XLogoIcon, link: siteData.twitter, label: "Twitter" },
  { icon: CvLogoIcon, link: siteData.cv, label: "Résumé" },
];

export function HeroSection() {
  return (
    <section
      role="banner"
      className="relative flex flex-col-reverse md:flex-row gap-6 pb-8 px-2 md:px-8 with-box-underline"
    >
      <div className="flex-1">
        <div>
          <Heading level={1} className="first-letter:text-pink-950">
            Dicha Z
            <span className="text-pink-500" title="Yes, this is where the username comes from">
              elianiva
            </span>
            n Arkana
          </Heading>
        </div>
        <div>
          <p className="text-sm md:text-base leading-relaxed font-body text-pink-950 py-3 max-w-[90ch] text-pretty">
            I'm a software engineer with 4+ years mostly in web frontend, though I've dipped into
            backend, databases, and infra when needed. I like building interfaces that don't annoy
            people and cleaning up AI slop from codebases. Lately I've been leaning more into design
            engineering. Outside work, I tinker with side projects, contribute to OSS, and drink a
            lot of coffee.
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2 pt-2 justify-center md:justify-start">
          {socials.map((social) => {
            const Icon = social.icon;
            return (
              <Button
                key={social.label}
                variant="ghost"
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
                <Icon className="w-4 h-4" />
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
          className="relative block w-40 h-40 group"
          aria-label="Visit GitHub profile"
        >
          <div className="relative w-full h-full border border-pink-200/50 transition-transform duration-300 group-hover:-translate-y-1">
            <div className="absolute left-0 top-0 border border-pink-200/50 bg-white size-3 z-10 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute left-0 bottom-0 border border-pink-200/50 bg-white size-3 z-10 -translate-x-1/2 translate-y-1/2" />
            <div className="absolute right-0 top-0 border border-pink-200/50 bg-white size-3 z-10 translate-x-1/2 -translate-y-1/2" />
            <div className="absolute right-0 bottom-0 border border-pink-200/50 bg-white size-3 z-10 translate-x-1/2 translate-y-1/2" />
            <img
              src="https://avatars.githubusercontent.com/u/51877647?v=4"
              alt="Profile photo of Dicha Zelianiva Arkana"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </a>
      </div>
    </section>
  );
}