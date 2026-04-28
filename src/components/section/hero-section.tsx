import { motion, useReducedMotion } from "motion/react";
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

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  },
};

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.header
      role="banner"
      className="relative flex flex-col-reverse md:flex-row gap-6 pb-8 px-2 md:px-8 with-box-underline"
      initial={prefersReducedMotion ? false : "hidden"}
      animate="visible"
      variants={container}
    >
      <div className="flex-1">
        <motion.div variants={item}>
          <Heading level={1} className="first-letter:text-pink-950">
            Dicha Z
            <span className="text-pink-500" title="Yes, this is where the username comes from">
              elianiva
            </span>
            n Arkana
          </Heading>
        </motion.div>
        <motion.div variants={item}>
          <p className="text-sm md:text-base leading-relaxed font-body text-pink-950/80 py-3 max-w-[60ch]">
            Software Engineer doing frontend things. I like making interfaces that don&apos;t annoy
            people and enjoy removing AI slop. Currently trying to get better at the design side of
            things. Also I rebuilt this site like 5 times.
          </p>
        </motion.div>
        <motion.div
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.06,
                delayChildren: 0.12,
              },
            },
          }}
          className="flex items-center flex-wrap gap-2 pt-2 justify-center md:justify-start"
        >
          {socials.map((social) => {
            const Icon = social.icon;
            return (
              <motion.a
                key={social.label}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] },
                  },
                }}
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
              </motion.a>
            );
          })}
        </motion.div>
      </div>
      <motion.div variants={item} className="relative mb-4 md:mb-0 mx-auto">
        <a
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
      </motion.div>
    </motion.header>
  );
}
