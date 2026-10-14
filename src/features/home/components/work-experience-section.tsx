import type { WorkExperience } from "~/types/work-experience";
import { Heading } from "~/components/ui/heading";

interface WorkExperienceSectionProps {
  workExperiences: WorkExperience[];
}

const formatMonth = (date: Date) =>
  date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });

function formatDuration([start, end]: WorkExperience["period"]) {
  const to = end ?? new Date();
  const total = Math.max(
    (to.getFullYear() - start.getFullYear()) * 12 + to.getMonth() - start.getMonth(),
    1,
  );
  const years = Math.floor(total / 12);
  const months = total % 12;
  if (years === 0) return `${months}m`;
  return months === 0 ? `${years}y` : `${years}y ${months}m`;
}

export function WorkExperienceSection({ workExperiences }: WorkExperienceSectionProps) {
  return (
    <section aria-labelledby="experience-heading" className="py-4 md:py-8 px-2 md:px-8">
      <Heading level={2} id="experience-heading">
        Work Experience
      </Heading>
      <ol className="relative border-l border-pink-200 ml-1.5">
        {workExperiences.map((work, index) => (
          <li key={work.company} className="relative pl-6 pb-3 last:pb-0">
            <span
              aria-hidden
              className={`absolute -left-[5px] top-2 size-2.5 ${work.period[1] ? "bg-pink-200" : "bg-pink-500"}`}
            />
            <details open={index === 0} className="group">
              <summary className="list-none cursor-pointer focus-visible:outline-2 focus-visible:outline-pink-400 [&::-webkit-details-marker]:hidden">
                <div className="flex flex-col md:flex-row md:items-baseline md:gap-3">
                  <h3 className="flex-1 min-w-0 font-display font-semibold text-pink-950 group-hover:text-pink-700 transition-colors">
                    {work.company}
                    <span className="font-body font-normal text-sm text-pink-950/60">
                      {" "}
                      · {work.position}
                    </span>
                    <span
                      aria-hidden
                      className="ml-1.5 inline-block text-xs text-pink-400 transition-transform group-open:rotate-90"
                    >
                      ▸
                    </span>
                  </h3>
                  <span className="font-mono text-xs text-pink-950/50 md:shrink-0 md:text-right">
                    {formatMonth(work.period[0])} –{" "}
                    {work.period[1] ? formatMonth(work.period[1]) : "Present"}
                    <span className="text-pink-400"> · {formatDuration(work.period)}</span>
                  </span>
                </div>
                <div className="font-mono text-xs text-pink-950/40 uppercase">
                  {work.location} · {work.time}
                </div>
              </summary>
              <ul className="mt-1.5 grid gap-1">
                {work.details.map((detail) => (
                  <li
                    key={detail}
                    className="font-body text-sm text-pink-950/70 leading-relaxed pl-4 relative before:absolute before:left-0 before:top-[0.6em] before:size-1.5 before:bg-pink-300"
                  >
                    {detail}
                  </li>
                ))}
              </ul>
              <div className="font-mono text-xs text-pink-400 mt-2">
                {work.technologies.map((tech) => `#${tech}`).join(" ")}
              </div>
            </details>
          </li>
        ))}
      </ol>
    </section>
  );
}
