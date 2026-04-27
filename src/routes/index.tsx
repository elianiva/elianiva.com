import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "#/components/section/HeroSection";
import { ScrollReveal } from "#/components/animation/ScrollReveal";
import { BlogSection } from "#/components/section/BlogSection";
import { WorkExperienceSection } from "#/components/section/WorkExperienceSection";
import { OpenSourceSection } from "#/components/section/OpenSourceSection";
import { PersonalProjectsSection } from "#/components/section/PersonalProjectsSection";
import { workExperiences } from "#/data/work-experience";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [{ title: `Home | elianiva's home row` }],
  }),
});

function Home() {
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
          <BlogSection />
        </section>
      </ScrollReveal>
      <ScrollReveal delay={480}>
        <section role="region" aria-labelledby="personal-projects-heading">
          <PersonalProjectsSection />
        </section>
      </ScrollReveal>
    </div>
  );
}
