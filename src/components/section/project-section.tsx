import { createServerFn } from "@tanstack/react-start";
import { motion, useReducedMotion } from "motion/react";
import { allProjects } from "content-collections";
import { ProjectCard } from "~/components/card/project-card";
import { ViewAllButton } from "~/components/view-all-button";
import { Heading } from "../ui/heading";

export type ProjectType = "personal" | "open-source" | "assignment";

export const getProjects = createServerFn({ method: "GET" })
  .inputValidator((input: { type: ProjectType; featured?: boolean }) => input)
  .handler(async ({ data: { type, featured = false } }) => {
    const projects = allProjects
      .filter((p) => p.type === type)
      .sort((a, b) => (a.date > b.date ? -1 : 1))
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        date: p.date,
        stack: p.stack,
        featured: p.featured,
      }));

    return featured ? projects.filter((p) => p.featured) : projects;
  });

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
} as const;

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  },
} as const;

interface ProjectSectionProps {
  title: string;
  description: string;
  projects: Awaited<ReturnType<typeof getProjects>>;
  seeMoreUrl?: string | null;
}

export function ProjectSection({ title, description, projects, seeMoreUrl }: ProjectSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  const headingId =
    title
      .toLowerCase()
      .replace(/s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") + "-heading";

  return (
    <motion.section
      className="py-4 md:py-8 px-2 md:px-8"
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={container}
    >
      <motion.div variants={item}>
        <Heading level={2} id={headingId}>
          {title}
        </Heading>
      </motion.div>
      <motion.div variants={item}>
        <p className="text-xs md:text-base font-body text-pink-950/70 pt-2 pb-4">
          {description}
        </p>
      </motion.div>
      <div className="relative space-y-1 pb-4 card-tilt-odd items-stretch">
        {projects.map((project) => (
          <motion.div key={project.slug} variants={item} className="h-full">
            <ProjectCard
              slug={project.slug}
              title={project.title}
              description={project.description}
              href={`/projects/${project.slug}`}
              stack={project.stack || []}
            />
          </motion.div>
        ))}
      </div>
      {typeof seeMoreUrl === "string" && (
        <motion.div variants={item}>
          <ViewAllButton
            href={seeMoreUrl}
            label="View all projects"
            ariaLabel="View all projects"
          />
        </motion.div>
      )}
    </motion.section>
  );
}
