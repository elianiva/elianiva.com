import { HeroReveal } from "~/components/animation/hero-reveal";
import siteData from "~/data/sites";
import EnvelopeIcon from "~icons/ph/envelope-duotone";
import GithubLogoIcon from "~icons/ph/github-logo-duotone";
import LinkedinLogoIcon from "~icons/ph/linkedin-logo-duotone";
import CvLogoIcon from "~icons/ph/read-cv-logo-duotone";
import XLogoIcon from "~icons/ph/x-logo-duotone";
import { Heading } from "../ui/heading";

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
    <HeroReveal>
      <header
        role="banner"
        className="relative flex flex-col-reverse md:flex-row gap-6 pb-8 px-2 md:px-8 with-box-underline"
      >
        <div className="flex-1">
          <Heading level={1} className="first-letter:text-pink-950" data-hero-reveal="name">
            Dicha Z
            <span className="text-pink-500" title="Yes, this is where the username comes from">
              elianiva
            </span>
            n Arkana
          </Heading>
          <p
            data-hero-reveal="desc"
            className="text-sm md:text-base leading-relaxed font-body text-pink-950/80 py-3 max-w-[60ch]"
          >
            Software Engineer doing frontend things. I like making interfaces that don&apos;t annoy
            people and enjoy removing AI slop. Currently trying to get better at the design side of
            things. Also I rebuilt this site like 5 times.
          </p>
          <div className="flex items-center flex-wrap gap-2 pt-2 justify-center md:justify-start">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  data-hero-reveal="social"
                  className="group focus:outline-none focus:ring-0"
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.label}
                  aria-label={`Visit ${social.label} profile`}
                >
                  <div className="group-hover:rounded-2xl transition-all py-2 px-3 text-pink-950 group-hover:text-pink-950 bg-white/70 flex items-center gap-2 group-focus:outline-none group-focus:ring group-focus:ring-pink-400 group-focus:ring-offset-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase">{social.label}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
        <div className="relative mb-4 md:mb-0 mx-auto">
          <a
            data-hero-reveal="avatar"
            href={siteData.github}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block w-40 h-40 group"
            aria-label="Visit GitHub profile"
          >
            <div className="absolute inset-0 blob-shape bg-pink-200/50 translate-x-2 translate-y-2 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3" />
            <div className="absolute inset-0 blob-shape bg-pink-300/30 translate-x-1 translate-y-1 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
            <div className="relative w-full h-full blob-shape overflow-hidden border-2 border-pink-300 transition-transform duration-300 group-hover:-translate-y-1">
              <img
                src="https://avatars.githubusercontent.com/u/51877647?v=4"
                alt="Profile photo of Dicha Zelianiva Arkana"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </a>
        </div>
      </header>
    </HeroReveal>
  );
}
