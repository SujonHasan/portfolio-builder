"use client";

import { motion } from "framer-motion";
import { ISkill } from "@/types";
import { SectionHeading } from "@/components/portfolio/section-heading";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion-wrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface SkillsSectionProps {
  skills: ISkill[];
}

const categories = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "database", label: "Database" },
  { value: "tools", label: "Tools" },
] as const;

export function SkillsSection({ skills }: SkillsSectionProps) {
  const grouped = skills.reduce(
    (acc, skill) => {
      const cat = skill.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    },
    {} as Record<string, ISkill[]>
  );

  return (
    <section id="skills" className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <SectionHeading title="Skills & Technologies" />

        <Tabs defaultValue="frontend" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-8">
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.value} value={cat.value}>
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(grouped[cat.value] || [])
                  .sort((a, b) => a.order - b.order)
                  .map((skill) => (
                    <StaggerItem key={skill._id}>
                      <Card>
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-base">
                              {skill.name}
                            </h3>
                            <span className="text-sm text-muted-foreground">
                              {skill.proficiency}%
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-primary"
                              initial={{ width: 0 }}
                              whileInView={{ width: `${skill.proficiency}%` }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.8,
                                ease: "easeOut",
                                delay: 0.2,
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </StaggerItem>
                  ))}
              </StaggerContainer>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
