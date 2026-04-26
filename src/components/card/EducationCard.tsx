import type { Education } from "#/types/education";

interface EducationCardProps extends Education {}

export function EducationCard({
  institution,
  degree,
  fieldOfStudy,
  gpa,
  time: [start, finish],
}: EducationCardProps) {
  const startDate = new Date(start).toLocaleDateString("en-GB", {
    year: "numeric",
  });
  const finishDate = new Date(finish).toLocaleDateString("en-GB", {
    year: "numeric",
  });

  return (
    <div className="relative mb-8">
      <div className="flex justify-between items-center">
        <span className="text-xl font-bold font-heading text-slate-800">
          {institution}
        </span>
        <span className="text-lg font-medium font-heading text-slate-600">
          {startDate} - {finishDate}
        </span>
      </div>
      <span className="text-base text-slate-600 font-sans block">
        GPA: {gpa} (current)
      </span>
      <span className="text-base text-slate-600 font-sans capitalize">
        {degree} - {fieldOfStudy}
      </span>
    </div>
  );
}
