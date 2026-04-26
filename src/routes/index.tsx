import { createFileRoute } from "@tanstack/react-router";
import { allPosts, allProjects } from "content-collections";
import { HeroSection } from "#/components/section/HeroSection";
import { ScrollReveal } from "#/components/animation/ScrollReveal";
import { BlogSection } from "#/components/section/BlogSection";
import { ProjectSection } from "#/components/section/ProjectSection";
import { WorkExperienceSection } from "#/components/section/WorkExperienceSection";
import { OpenSourceSection } from "#/components/section/OpenSourceSection";
import { workExperiences } from "#/data/work-experience";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    const personalProjects = allProjects
      .filter((p) => p.type === "personal" && p.featured)
      .sort((a, b) => (a.date > b.date ? -1 : 1));

    const posts = allPosts
      .filter((p) => !p.draft)
      .sort((a, b) => (a.date > b.date ? -1 : 1));

    return { posts, personalProjects };
  },
  head: () => ({
    meta: [{ title: "Home | elianiva's home row" }],
  }),
});

function Home() {
  const { posts, personalProjects } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-[1080px] pt-20 border-x border-pink-200/50">
      <HeroSection />
      <ScrollReveal>
        <section
          role="region"
          aria-labelledby="about-heading"
          className="py-4 md:py-8 px-2 md:px-8 relative with-box-underline"
        >
          <h2
            data-anime
            id="about-heading"
            className="text-xl md:text-2xl font-bold font-display text-pink-950 pb-4 tracking-wide"
          >
            About Me
          </h2>
          <p
            data-anime
            className="text-sm md:text-base leading-relaxed font-body text-pink-950/80"
          >
            4+ years doing frontend things, though I've wandered into backend,
            databases, and sometimes infra whenever something needed doing. I
            like to build interfaces that don't annoy people and very much enjoy
            removing lots of AI slop from a codebase. These days I'm trying to
            shift my focus on doing design engineering things. I enjoy tinkering
            with side projects, OSS, and lots of coffee in my free time. Feel
            free to say hi! ツ
          </p>
        </section>
      </ScrollReveal>
      <ScrollReveal delay={120}>
        <section
          role="region"
          aria-labelledby="experience-heading"
          className="relative with-box-underline"
        >
          <WorkExperienceSection workExperiences={workExperiences} />
        </section>
      </ScrollReveal>
      <ScrollReveal delay={240}>
        <section
          role="region"
          aria-labelledby="open-source-contributions-heading"
          className="relative with-box-underline"
        >
          <OpenSourceSection />
        </section>
      </ScrollReveal>
      <ScrollReveal delay={360}>
        <section
          role="region"
          aria-labelledby="blog-heading"
          className="relative with-box-underline"
        >
          <BlogSection posts={posts} />
        </section>
      </ScrollReveal>
      <ScrollReveal delay={480}>
        <section role="region" aria-labelledby="personal-projects-heading">
          <ProjectSection
            title="Personal Projects"
            description="These are some of my personal projects that I made in the past. Some of them are still in use, some are not. Mostly made them just for fun and to learn new things!"
            projects={personalProjects}
            seeMoreUrl="/projects"
          />
        </section>
      </ScrollReveal>
    </div>
  );
}
