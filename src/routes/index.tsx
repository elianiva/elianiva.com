import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "~/components/section/hero-section";
import { BlogSection, getBlogPosts } from "~/components/section/blog-section";
import { ProjectSection, getProjects } from "~/components/section/project-section";
import { WorkExperienceSection } from "~/components/section/work-experience-section";
import { OpenSourceSection } from "~/components/section/open-source-section";
import { workExperiences } from "~/data/work-experience";
import { AboutSection } from "~/components/section/about-section";
import { GitHubActivitySection } from "~/components/section/github-activity-section";

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
      <section role="region" aria-labelledby="blog-heading" className="relative with-box-underline">
        <BlogSection posts={blogPosts} />
      </section>
      <section
        role="region"
        aria-labelledby="personal-projects-heading"
        className="relative with-box-underline"
      >
        <ProjectSection
          title="Personal Projects"
          description="These are some of my personal projects that I made in the past. Some of them are still in use, some are not. Mostly made them just for fun and to learn new things!"
          projects={personalProjects}
          seeMoreUrl="/projects"
        />
      </section>
      <section
        role="region"
        aria-labelledby="github-activity-heading"
        className="relative with-box-underline"
      >
        <GitHubActivitySection />
      </section>
    </div>
  );
}
