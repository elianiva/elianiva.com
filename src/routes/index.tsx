import { createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { HeroSection } from "~/components/section/hero-section";
import { BlogSection, getBlogPosts } from "~/components/section/blog-section";
import { ProjectSection, getProjects } from "~/components/section/project-section";
import { WorkExperienceSection } from "~/components/section/work-experience-section";
import { OpenSourceSection } from "~/components/section/open-source-section";
import { workExperiences } from "~/data/work-experience";
import { Heading } from "~/components/ui/heading";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [{ title: `Home | elianiva's home row` }],
  }),
  staleTime: Infinity,
  loader: async () => {
    const [blogPosts, personalProjects] = await Promise.all([
      getBlogPosts(),
      getProjects({
        data: {
          type: "personal",
          featured: true,
        },
      }),
    ]);
    return { blogPosts, personalProjects };
  },
});

const aboutContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const aboutItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  },
};

function AboutSection() {
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
          Software Engineer doing frontend things. I like making interfaces that don&apos;t annoy
          people and enjoy removing AI slop. Currently trying to get better at the design side of
          things. Also I rebuilt this site like 5 times.
        </p>
      </motion.div>
    </motion.section>
  );
}

function Home() {
  const { blogPosts, personalProjects } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-[1080px] pt-20 border-x border-pink-200/50">
      <HeroSection />
      <AboutSection />
      <section
        role="region"
        aria-labelledby="experience-heading"
        className="relative with-box-underline"
      >
        <WorkExperienceSection workExperiences={workExperiences} />
      </section>
      <section
        role="region"
        aria-labelledby="open-source-contributions-heading"
        className="relative with-box-underline"
      >
        <OpenSourceSection />
      </section>
      <section
        role="region"
        aria-labelledby="blog-heading"
        className="relative with-box-underline"
      >
        <BlogSection posts={blogPosts} />
      </section>
      <section role="region" aria-labelledby="personal-projects-heading">
        <ProjectSection
          title="Personal Projects"
          description="These are some of my personal projects that I made in the past. Some of them are still in use, some are not. Mostly made them just for fun and to learn new things!"
          projects={personalProjects}
          seeMoreUrl="/projects"
        />
      </section>
    </div>
  );
}
