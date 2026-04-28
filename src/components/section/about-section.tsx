import { motion, useReducedMotion } from "motion/react";
import { Heading } from "../ui/heading";

const aboutItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  },
} as const;

const aboutContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
} as const;

export function AboutSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      role="region"
      aria-labelledby="about-heading"
      className="py-4 md:py-8 px-2 md:px-8 relative with-box-underline"
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={aboutContainer}
    >
      <motion.div variants={aboutItem}>
        <Heading level={2} id="about-heading">
          About Me
        </Heading>
      </motion.div>
      <motion.div variants={aboutItem}>
        <p className="text-sm md:text-base leading-relaxed font-body text-pink-950/80">
          4+ years doing frontend things, though I've wandered into backend, databases, and
          sometimes infra whenever something needed doing. I like to build interfaces that don't
          annoy people and very much enjoy removing lots of AI slop from a codebase. These days I'm
          trying to shift my focus on doing design engineering things. I enjoy tinkering with side
          projects, OSS, and lots of coffee in my free time. Feel free to say hi! ツ
        </p>
      </motion.div>
    </motion.section>
  );
}
