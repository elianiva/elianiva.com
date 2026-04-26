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
    <section className="py-10 grid grid-cols-[1fr_2fr] h-[20rem] overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-t from-pink-50 to-transparent z-10 bg-clip-content" />
      <h1 className="text-2xl text-pink-950 font-heading uppercase justify-self-start m-0 z-20">
        education
      </h1>
      <div className="z-20">
        {PAST_EDUCATIONS.map((education) => (
          <EducationCard key={education.institution} {...education} />
        ))}
      </div>
    </section>
  );
}
