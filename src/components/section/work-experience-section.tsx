import { motion, useReducedMotion } from "motion/react";
import { WorkExperienceCard } from "~/components/card/work-experience-card";
import type { WorkExperience } from "~/data/work-experience";
import { Heading } from "../ui/heading";

interface WorkExperienceSectionProps {
  workExperiences: WorkExperience[];
}

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  },
};

export function WorkExperienceSection({ workExperiences }: WorkExperienceSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      className="py-4 md:py-8 px-2 md:px-8"
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={container}
    >
      <motion.div variants={item}>
        <Heading level={2} id="experience-heading">
          Work Experience
        </Heading>
      </motion.div>
      <div className="relative flex flex-col gap-2">
        {workExperiences.map((experience, index) => (
          <motion.div key={experience.company} variants={item}>
            <WorkExperienceCard {...experience} defaultOpen={index === 0} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
