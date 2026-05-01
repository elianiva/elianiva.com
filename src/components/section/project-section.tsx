import { Suspense } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ProjectCard } from "~/components/card/project-card";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getProjects } from "~/lib/projects";
import { Heading } from "~/components/ui/heading";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { Link } from "@tanstack/react-router";

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
  seeMoreUrl?: string | null;
}

function ProjectCardList() {
  const { data: projects } = useSuspenseQuery({
    queryKey: ["personal-projects"],
    queryFn: () =>
      getProjects({
        data: {
          type: "personal" as const,
          featured: true,
        },
      }),
    staleTime: Infinity,
  });

  return (
    <>
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
    </>
  );
}

export function ProjectSection({ title, description, seeMoreUrl }: ProjectSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  const headingId =
    title
      .toLowerCase()
      .replace(/s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") + "-heading";

  return (
    <motion.section
      className="py-4 md:py-8 pl-2 md:pl-8"
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
        <p className="text-xs md:text-base font-body text-pink-950/70 pt-2 pb-4">{description}</p>
      </motion.div>
      <div className="relative space-y-1 pb-4 card-tilt-odd items-stretch">
        <Suspense
          fallback={
            <div className="space-y-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-18 w-full" />
              ))}
            </div>
          }
        >
          <ProjectCardList />
        </Suspense>
      </div>
      {typeof seeMoreUrl === "string" && (
        <motion.div variants={item} className="flex justify-end">
          <Button
            render={<Link to={seeMoreUrl} />}
            variant="link"
            className="text-sm p-0 font-normal"
          >
            View All Projects
          </Button>
        </motion.div>
      )}
    </motion.section>
  );
}
