"use client";

import { ICertification } from "@/types";
import { SectionHeading } from "./section-heading";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion-wrapper";
import { formatDate } from "@/lib/utils";
import { sanitizeUrl } from "@/lib/sanitize";
import { Award, ExternalLink } from "lucide-react";

interface CertificationsSectionProps {
  certifications: ICertification[];
}

export function CertificationsSection({
  certifications,
}: CertificationsSectionProps) {
  if (certifications.length === 0) return null;

  return (
    <section id="certifications" className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <SectionHeading title="Certifications" />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert) => (
            <StaggerItem key={cert._id}>
              <div className="rounded-lg border bg-card p-6 shadow-sm h-full flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold leading-tight">{cert.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {cert.issuer}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-auto pt-3">
                  Issued {formatDate(cert.issueDate)}
                </p>

                {sanitizeUrl(cert.credentialUrl) && (
                  <a
                    href={sanitizeUrl(cert.credentialUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary font-medium mt-3 hover:underline"
                  >
                    View Credential
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
