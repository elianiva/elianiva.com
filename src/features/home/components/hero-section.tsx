import { motion } from "motion/react";
import siteData from "~/data/sites";
import EnvelopeIcon from "~icons/ph/envelope-duotone";
import GithubLogoIcon from "~icons/ph/github-logo-duotone";
import LinkedinLogoIcon from "~icons/ph/linkedin-logo-duotone";
import CvLogoIcon from "~icons/ph/read-cv-logo-duotone";
import XLogoIcon from "~icons/ph/x-logo-duotone";
import { Heading } from "~/components/ui/heading";
import { Button } from "~/components/ui/button";
import { AnimatedSection } from "~/components/ui/animated-section";
import { AnimatedItem } from "~/components/ui/animated-item";
import { easings, durations } from "~/lib/motion";

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

const socialButtonItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easings.out },
  },
} as const;

const socialContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.12,
    },
  },
} as const;

export function HeroSection() {
  return (
    <AnimatedSection
      animateOnMount
      role="banner"
      className="relative flex flex-col-reverse md:flex-row gap-6 pb-8 px-2 md:px-8 with-box-underline"
    >
      <div className="flex-1">
        <AnimatedItem>
          <Heading level={1} className="first-letter:text-pink-950">
            Dicha Z
            <span className="text-pink-500" title="Yes, this is where the username comes from">
              elianiva
            </span>
            n Arkana
          </Heading>
        </AnimatedItem>
        <AnimatedItem>
          <p className="text-sm md:text-base leading-relaxed font-body text-pink-950 py-3 max-w-[90ch] text-pretty">
            I'm a software engineer with 4+ years mostly in web frontend, though I've dipped into
            backend, databases, and infra when needed. I like building interfaces that don't annoy
            people and cleaning up AI slop from codebases. Lately I've been leaning more into design
            engineering. Outside work, I tinker with side projects, contribute to OSS, and drink a
            lot of coffee.
          </p>
        </AnimatedItem>
        <motion.div
          variants={socialContainer}
          className="flex items-center flex-wrap gap-2 pt-2 justify-center md:justify-start"
        >
          {socials.map((social) => {
            const Icon = social.icon;
            return (
              <Button
                key={social.label}
                variant="ghost"
                nativeButton={false}
                render={
                  <motion.a
                    variants={socialButtonItem}
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
        </motion.div>
      </div>
      <AnimatedItem className="relative mb-4 md:mb-0 mx-auto">
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
      </AnimatedItem>
    </AnimatedSection>
  );
}
