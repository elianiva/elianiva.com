import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "~/components/section/hero-section";
import { ScrollReveal } from "~/components/animation/scroll-reveal";
import { getBlogSection } from "~/components/section/blog-section";
import { getProjectSection } from "~/components/section/project-section";
import { WorkExperienceSection } from "~/components/section/work-experience-section";
import { OpenSourceSection } from "~/components/section/open-source-section";
import { workExperiences } from "~/data/work-experience";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [{ title: `Home | elianiva's home row` }],
  }),
  staleTime: Infinity,
  loader: async () => {
    const [Blog, PersonalProjects] = await Promise.all([
      getBlogSection(),
      getProjectSection({
        data: {
          title: "Personal Projects",
          description:
            "These are some of my personal projects that I made in the past. Some of them are still in use, some are not. Mostly made them just for fun and to learn new things!",
          type: "personal",
          featured: true,
          seeMoreUrl: "/projects",
        },
      }),
    ]);
    return { Blog, PersonalProjects };
  },
});

function Home() {
  const { Blog, PersonalProjects } = Route.useLoaderData();

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
          <p data-anime className="text-sm md:text-base leading-relaxed font-body text-pink-950/80">
            Software Engineer doing frontend things. I like making interfaces that don&apos;t annoy
            people and enjoy removing AI slop. Currently trying to get better at the design side of
            things. Also I rebuilt this site like 5 times.
          </p>
        </section>
      </ScrollReveal>
      <ScrollReveal delay={80}>
        <section
          role="region"
          aria-labelledby="experience-heading"
          className="relative with-box-underline"
        >
          <WorkExperienceSection workExperiences={workExperiences} />
        </section>
      </ScrollReveal>
      <ScrollReveal delay={160}>
        <section
          role="region"
          aria-labelledby="open-source-contributions-heading"
          className="relative with-box-underline"
        >
          <OpenSourceSection />
        </section>
      </ScrollReveal>
      <ScrollReveal delay={320}>
        <section
          role="region"
          aria-labelledby="blog-heading"
          className="relative with-box-underline"
        >
          {Blog}
        </section>
      </ScrollReveal>
      <ScrollReveal delay={400}>
        <section role="region" aria-labelledby="personal-projects-heading">
          {PersonalProjects}
        </section>
      </ScrollReveal>
    </div>
  );
}
