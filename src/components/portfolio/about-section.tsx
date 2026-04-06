"use client";

import Image from "next/image";
import { IAbout } from "@/types";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { sanitizeRichText } from "@/lib/sanitize";
import {
  MotionWrapper,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion-wrapper";

interface AboutSectionProps {
  about: IAbout | null;
}

export function AboutSection({ about }: AboutSectionProps) {
  return (
    <section id="about" className="py-20">
      <div className="container max-w-6xl mx-auto px-4">
        <SectionHeading title="About Me" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Profile image */}
          <MotionWrapper direction="left">
            <div className="flex justify-center">
              {about?.profileImage ? (
                <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src={about.profileImage}
                    alt={about.name || "Profile"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 288px, 320px"
                  />
                </div>
              ) : (
                <div className="w-72 h-72 md:w-80 md:h-80 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center">
                  <span className="text-6xl font-bold text-primary/40">
                    {about?.name?.charAt(0) || "S"}
                  </span>
                </div>
              )}
            </div>
          </MotionWrapper>

          {/* Right: Bio */}
          <MotionWrapper direction="right">
            {about?.bio ? (
              <div
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(about.bio) }}
              />
            ) : (
              <p className="text-muted-foreground text-lg">
                Bio information is not available yet.
              </p>
            )}
          </MotionWrapper>
        </div>

        {/* Stats row */}
        {about?.stats && about.stats.length > 0 && (
          <MotionWrapper className="mt-16">
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {about.stats.map((stat, index) => (
                <StaggerItem key={index}>
                  <div className="text-center p-6 rounded-xl bg-card border border-border shadow-sm">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </MotionWrapper>
        )}
      </div>
    </section>
  );
}
