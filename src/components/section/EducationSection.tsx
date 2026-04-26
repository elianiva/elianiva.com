import { EducationCard } from "#/components/card/EducationCard";
import type { Education } from "#/types/education";

const PAST_EDUCATIONS: Education[] = [
  {
    institution: "State Polytechnic of Malang",
    time: [new Date(2022, 7), new Date(2026, 6)],
    degree: "Bachelor of Applied Science in Information Technology",
    fieldOfStudy: "Informatics Engineering",
    gpa: 3.94,
  },
];

export function EducationSection() {
  return (
    <section className="py-10 grid grid-cols-[1fr_2fr]">
      <h1 className="text-2xl text-slate-800 font-heading uppercase justify-self-start m-0">
        education
      </h1>
      <div>
        {PAST_EDUCATIONS.map((education) => (
          <EducationCard key={education.institution} {...education} />
        ))}
      </div>
    </section>
  );
}
