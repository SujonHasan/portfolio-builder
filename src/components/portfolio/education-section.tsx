"use client";

import { IEducation } from "@/types";
import { SectionHeading } from "./section-heading";
import { MotionWrapper } from "@/components/shared/motion-wrapper";
import { formatDate } from "@/lib/utils";
import { sanitizeRichText } from "@/lib/sanitize";

interface EducationSectionProps {
  education: IEducation[];
}

export function EducationSection({ education }: EducationSectionProps) {
  return (
    <section id="education" className="py-20">
      <div className="max-w-4xl mx-auto px-4">
        <SectionHeading title="Education" />

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-12">
            {education.map((edu, index) => (
              <MotionWrapper
                key={edu._id}
                direction="up"
                delay={index * 0.1}
              >
                <div className="relative flex items-start md:justify-between md:flex-row">
                  {/* Timeline dot */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background z-10 mt-2" />

                  {/* Content card */}
                  <div
                    className={`ml-10 md:ml-0 md:w-[calc(50%-2rem)] rounded-lg border bg-card p-6 shadow-sm ${
                      index % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                    }`}
                  >
                    <h3 className="text-lg font-bold">{edu.institution}</h3>
                    <p className="text-primary font-medium">{edu.degree}</p>
                    <p className="text-sm text-muted-foreground">{edu.field}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(edu.startDate)} —{" "}
                      {edu.current
                        ? "Present"
                        : edu.endDate
                        ? formatDate(edu.endDate)
                        : ""}
                    </p>
                    {edu.grade && (
                      <p className="text-sm mt-2">
                        <span className="font-medium">Grade:</span> {edu.grade}
                      </p>
                    )}
                    {edu.description && (
                      <div
                        className="prose prose-sm dark:prose-invert mt-3 max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeRichText(edu.description) }}
                      />
                    )}
                  </div>
                </div>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
