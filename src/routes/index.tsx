import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "~/components/section/hero-section";
import { BlogSection } from "~/components/section/blog-section";
import { ProjectSection } from "~/components/section/project-section";
import { getPosts as getBlogPosts } from "~/lib/posts";
import { getProjects } from "~/lib/projects";
import { WorkExperienceSection } from "~/components/section/work-experience-section";
import { OpenSourceSection } from "~/components/section/open-source-section";
import { workExperiences } from "~/data/work-experience";
import { GitHubActivitySection } from "~/components/section/github-activity-section";
import { homeSeo } from "~/lib/seo";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => homeSeo(),
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
    <div className="mx-auto max-w-container pt-20 border-x border-pink-200/50">
      <HeroSection />
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
        className="relative with-box-underline grid md:grid-cols-2 gap-2"
      >
        <ProjectSection
          title="Personal Projects"
          description="Mostly made them just for fun and to learn new things."
          projects={personalProjects}
          seeMoreUrl="/projects"
        />
        <OpenSourceSection />
      </section>
      <section role="region" aria-labelledby="blog-heading" className="relative with-box-underline">
        <BlogSection posts={blogPosts} />
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

