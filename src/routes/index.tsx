import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "~/features/home/components/hero-section";
import { ProfileFacts } from "~/features/home/components/profile-facts";
import { BlogSection } from "~/features/home/components/blog-section";
import { ProjectSection } from "~/features/projects/components/project-section";
import { WorkExperienceSection } from "~/features/home/components/work-experience-section";
import { OpenSourcePicks } from "~/features/home/components/open-source-picks";
import { workExperiences } from "~/data/work-experience";
import { GitHubActivitySection } from "~/features/github/components/github-activity-section";
import { getGitHubContributions } from "~/features/github/lib/github-server";
import { homeSeo } from "~/lib/seo";

export const Route = createFileRoute("/")({
  component: Home,
  // Everything on this page is prerendered, so crawlers and agents that do not
  // run JavaScript read it. The contributions heatmap is fetched once here at
  // build time (`GH_TOKEN` is set for `alchemy deploy`) and baked into the HTML.
  // The deploy workflow also runs daily to keep it fresh.
  loader: () => getGitHubContributions(),
  staleTime: Infinity,
  head: () => homeSeo(),
});

function Home() {
  const contributions = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-container pt-20 border-x border-pink-200/50">
      <HeroSection />
      <ProfileFacts />
      <div className="relative with-box-underline grid md:grid-cols-2 gap-4 px-2 md:px-8 py-4 md:py-8">
        <OpenSourcePicks />
        <ProjectSection
          title="Personal Projects"
          description="Mostly made them just for fun and to learn new things."
          seeMoreUrl="/projects"
        />
      </div>
      <div className="relative with-box-underline">
        <WorkExperienceSection workExperiences={workExperiences} />
      </div>
      <div className="relative with-box-underline">
        <BlogSection />
      </div>
      <div>
        <GitHubActivitySection data={contributions} />
      </div>
    </div>
  );
}
