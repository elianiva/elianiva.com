import { WorkExperienceCard } from "~/components/card/work-experience-card";
import type { WorkExperience } from "~/types/work-experience";
import { Heading } from "~/components/ui/heading";
import { AnimatedSection } from "~/components/ui/animated-section";
import { AnimatedItem } from "~/components/ui/animated-item";

interface WorkExperienceSectionProps {
  workExperiences: WorkExperience[];
}

export function WorkExperienceSection({ workExperiences }: WorkExperienceSectionProps) {
  return (
    <AnimatedSection className="py-4 md:py-8 px-2 md:px-8">
      <AnimatedItem>
        <Heading level={2} id="experience-heading">
          Work Experience
        </Heading>
      </AnimatedItem>
      <div className="relative flex flex-col gap-2">
        {workExperiences.map((experience, index) => (
          <AnimatedItem key={experience.company}>
            <WorkExperienceCard {...experience} defaultOpen={index === 0} />
          </AnimatedItem>
        ))}
      </div>
    </AnimatedSection>
  );
}