import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "~/features/home/components/hero-section";
import { BlogSection } from "~/features/home/components/blog-section";
import { ProjectSection } from "~/features/projects/components/project-section";
import { WorkExperienceSection } from "~/features/home/components/work-experience-section";
import { OpenSourceSection } from "~/features/github/components/open-source-section";
import { workExperiences } from "~/data/work-experience";
import { GitHubActivitySection } from "~/features/github/components/github-activity-section";
import { homeSeo } from "~/lib/seo";
import { getPosts } from "~/features/posts/lib/posts";

export const Route = createFileRoute("/")({
  component: Home,
  loader: () => getPosts({ data: { limit: 6 } }),
  head: () => homeSeo(),
});

function Home() {
  const posts = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-container pt-20 border-x border-pink-200/50">
      <HeroSection />
      <div className="relative with-box-underline">
        <WorkExperienceSection workExperiences={workExperiences} />
      </div>
      <div className="relative with-box-underline grid md:grid-cols-2 gap-4 px-2 md:px-8 py-4 md:py-8">
        <OpenSourceSection />
        <ProjectSection
          title="Personal Projects"
          description="Mostly made them just for fun and to learn new things."
          seeMoreUrl="/projects"
        />
      </div>
      <div className="relative with-box-underline">
        <BlogSection initialPosts={posts} />
      </div>
      <div>
        <GitHubActivitySection />
      </div>
    </div>
  );
}
