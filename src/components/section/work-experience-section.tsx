import { WorkExperienceCard } from "~/components/card/work-experience-card";
import type { WorkExperience } from "~/data/work-experience";
import { Heading } from "../ui/heading";

interface WorkExperienceSectionProps {
  workExperiences: WorkExperience[];
}

export function WorkExperienceSection({ workExperiences }: WorkExperienceSectionProps) {
  return (
    <section className="py-4 md:py-8 px-2 md:px-8">
      <Heading level={2} data-anime id="experience-heading">
        Work Experience
      </Heading>
      <div className="relative flex flex-col gap-2">
        {workExperiences.map((experience, index) => (
          <div key={experience.company} data-anime>
            <WorkExperienceCard {...experience} defaultOpen={index === 0} />
          </div>
        ))}
      </div>
    </section>
  );
}
