import { WorkExperienceCard } from "~/components/card/work-experience-card";
import type { WorkExperience } from "~/types/work-experience";
import { Heading } from "~/components/ui/heading";

interface WorkExperienceSectionProps {
  workExperiences: WorkExperience[];
}

export function WorkExperienceSection({ workExperiences }: WorkExperienceSectionProps) {
  return (
    <section aria-labelledby="experience-heading" className="py-4 md:py-8 px-2 md:px-8">
      <div>
        <Heading level={2} id="experience-heading">
          Work Experience
        </Heading>
      </div>
      <div className="relative flex flex-col gap-2">
        {workExperiences.map((experience, index) => (
          <div key={experience.company}>
            <WorkExperienceCard {...experience} defaultOpen={index === 0} />
          </div>
        ))}
      </div>
    </section>
  );
}
