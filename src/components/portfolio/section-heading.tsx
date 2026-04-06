"use client";

import { MotionWrapper } from "@/components/shared/motion-wrapper";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <MotionWrapper className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold mb-3">{title}</h2>
      {subtitle && (
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
      <div className="w-20 h-1 bg-primary mx-auto mt-4 rounded-full" />
    </MotionWrapper>
  );
}
