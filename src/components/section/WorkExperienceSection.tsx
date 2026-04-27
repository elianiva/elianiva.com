import { WorkExperienceCard } from "~/components/card/WorkExperienceCard";
import type { WorkExperience } from "~/data/work-experience";

interface WorkExperienceSectionProps {
  workExperiences: WorkExperience[];
}

export function WorkExperienceSection({ workExperiences }: WorkExperienceSectionProps) {
  return (
    <section className="py-4 md:py-8 px-2 md:px-8">
      <h2
        id="experience-heading"
        data-anime
        className="work-experience-card text-2xl font-bold font-display text-pink-950 tracking-wide pb-4"
      >
        Work Experience
      </h2>
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
