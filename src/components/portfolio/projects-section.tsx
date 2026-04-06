"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/shared/icons";
import { IProject } from "@/types";
import { SectionHeading } from "@/components/portfolio/section-heading";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sanitizeUrl } from "@/lib/sanitize";

interface ProjectsSectionProps {
  projects: IProject[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section id="projects" className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <SectionHeading title="Featured Projects" />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects
            .sort((a, b) => a.order - b.order)
            .map((project) => (
              <StaggerItem key={project._id}>
                <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full flex flex-col">
                  <div className="relative aspect-video overflow-hidden">
                    {project.thumbnail ? (
                      <Image
                        src={project.thumbnail}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                    )}
                  </div>

                  <CardContent className="p-5 flex flex-col flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {project.shortDescription}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mt-auto">
                      {sanitizeUrl(project.liveUrl) && (
                        <Button variant="outline" size="icon" asChild>
                          <Link
                            href={sanitizeUrl(project.liveUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {sanitizeUrl(project.githubUrl) && (
                        <Button variant="outline" size="icon" asChild>
                          <Link
                            href={sanitizeUrl(project.githubUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <GithubIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
