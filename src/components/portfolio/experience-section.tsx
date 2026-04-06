"use client";

import { IExperience } from "@/types";
import { SectionHeading } from "./section-heading";
import { MotionWrapper } from "@/components/shared/motion-wrapper";
import { formatDate } from "@/lib/utils";
import { sanitizeRichText } from "@/lib/sanitize";

interface ExperienceSectionProps {
  experiences: IExperience[];
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  return (
    <section id="experience" className="py-20">
      <div className="max-w-4xl mx-auto px-4">
        <SectionHeading title="Work Experience" />

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-12">
            {experiences.map((exp, index) => {
              const isLeft = index % 2 === 0;
              const direction = isLeft ? "left" : "right";

              return (
                <MotionWrapper
                  key={exp._id}
                  direction={direction}
                  delay={index * 0.1}
                >
                  <div
                    className={`relative flex items-start md:justify-between ${
                      isLeft ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background z-10 mt-2" />

                    {/* Content card */}
                    <div
                      className={`ml-10 md:ml-0 md:w-[calc(50%-2rem)] rounded-lg border bg-card p-6 shadow-sm ${
                        isLeft ? "md:mr-auto" : "md:ml-auto"
                      }`}
                    >
                      <h3 className="text-lg font-bold">{exp.position}</h3>
                      <p className="text-primary font-medium">{exp.company}</p>
                      <p className="text-sm text-muted-foreground">
                        {exp.location}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(exp.startDate)} —{" "}
                        {exp.current
                          ? "Present"
                          : exp.endDate
                          ? formatDate(exp.endDate)
                          : ""}
                      </p>

                      {exp.description && (
                        <div
                          className="prose prose-sm dark:prose-invert mt-3 max-w-none"
                          dangerouslySetInnerHTML={{ __html: sanitizeRichText(exp.description) }}
                        />
                      )}

                      {exp.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {exp.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </MotionWrapper>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
