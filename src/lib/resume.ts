import { connectDB } from "@/lib/db";
import { getLatestAboutLean } from "@/lib/about";
import { PORTFOLIO_FALLBACK_NAME, PORTFOLIO_FALLBACK_TAGLINE } from "@/lib/brand";
import { formatDate } from "@/lib/utils";
import { sanitizeUrl, stripHtml } from "@/lib/sanitize";
import { ResumeTemplateKey } from "@/types";
import Contact from "@/models/Contact";
import Skill from "@/models/Skill";
import Experience from "@/models/Experience";
import Education from "@/models/Education";
import Certification from "@/models/Certification";
import Project from "@/models/Project";

export function normalizeResumeTemplate(value?: string | null): ResumeTemplateKey {
  if (value === "compact" || value === "timeline") {
    return value;
  }

  return "classic";
}

type ResumeEntry = {
  title: string;
  subtitle?: string;
  meta?: string;
  body?: string[];
};

export type ResumeData = {
  template: ResumeTemplateKey;
  name: string;
  tagline: string;
  summary: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  linkedin: string;
  github: string;
  skills: string[];
  projects: ResumeEntry[];
  experiences: ResumeEntry[];
  education: ResumeEntry[];
  certifications: ResumeEntry[];
};

function joinParts(parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" • ");
}

function cleanText(value?: string | null) {
  return stripHtml(value).replace(/\s+/g, " ").trim();
}

export async function getResumeData(siteId: string, templateOverride?: string | null): Promise<ResumeData> {
  await connectDB();

  const [about, contact, skills, projects, experiences, education, certifications] =
    await Promise.all([
      getLatestAboutLean(siteId),
      Contact.findOne({ siteId }).lean(),
      Skill.find({ siteId }).sort({ proficiency: -1, order: 1 }).lean(),
      Project.find({ siteId, status: "published" }).sort({ featured: -1, order: 1, createdAt: -1 }).limit(4).lean(),
      Experience.find({ siteId }).sort({ current: -1, startDate: -1, order: 1 }).lean(),
      Education.find({ siteId }).sort({ current: -1, endDate: -1, startDate: -1, order: 1 }).lean(),
      Certification.find({ siteId }).sort({ issueDate: -1, order: 1 }).lean(),
    ]);

  const template = normalizeResumeTemplate(templateOverride || about?.resumeTemplate);

  return {
    template,
    name: about?.name || PORTFOLIO_FALLBACK_NAME,
    tagline: about?.tagline || PORTFOLIO_FALLBACK_TAGLINE,
    summary:
      cleanText(about?.bio || about?.heroDescription) ||
      "Full Stack Developer focused on building reliable web products.",
    email: contact?.email || "",
    phone: contact?.phone || "",
    address: contact?.address || "",
    website: sanitizeUrl(about?.socialLinks?.website || about?.resumeUrl) || "",
    linkedin: sanitizeUrl(about?.socialLinks?.linkedin) || "",
    github: sanitizeUrl(about?.socialLinks?.github) || "",
    skills: skills.map((skill) => skill.name).slice(0, 14),
    projects: projects.map((project) => ({
      title: project.title,
      subtitle: project.category ? project.category.toUpperCase() : undefined,
      meta: project.technologies?.length
        ? project.technologies.slice(0, 5).join(", ")
        : undefined,
      body: [cleanText(project.shortDescription || project.description)].filter(Boolean),
    })),
    experiences: experiences.map((experience) => ({
      title: experience.position,
      subtitle: experience.company,
      meta: joinParts([
        joinParts([
          formatDate(experience.startDate),
          experience.current
            ? "Present"
            : experience.endDate
            ? formatDate(experience.endDate)
            : undefined,
        ]),
        experience.location || undefined,
      ]),
      body: [
        cleanText(experience.description),
        experience.technologies?.length
          ? `Technologies: ${experience.technologies.join(", ")}`
          : "",
      ].filter(Boolean),
    })),
    education: education.map((item) => ({
      title: item.institution,
      subtitle: joinParts([item.degree, item.field]),
      meta: joinParts([
        joinParts([
          formatDate(item.startDate),
          item.current ? "Present" : item.endDate ? formatDate(item.endDate) : undefined,
        ]),
        item.grade || undefined,
      ]),
      body: cleanText(item.description) ? [cleanText(item.description)] : [],
    })),
    certifications: certifications.map((item) => ({
      title: item.title,
      subtitle: item.issuer,
      meta: joinParts([
        `Issued ${formatDate(item.issueDate)}`,
        item.credentialId ? `ID: ${item.credentialId}` : undefined,
      ]),
      body: item.credentialUrl ? [item.credentialUrl] : [],
    })),
  };
}

type FontName = "F1" | "F2";

type TextOptions = {
  x: number;
  y: number;
  size?: number;
  font?: FontName;
  color?: [number, number, number];
};

class PdfPage {
  width = 595;
  height = 842;
  commands: string[] = [];

  add(command: string) {
    this.commands.push(command);
  }
}

function rgb(color: [number, number, number]) {
  return `${color[0].toFixed(3)} ${color[1].toFixed(3)} ${color[2].toFixed(3)}`;
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function estimateTextWidth(text: string, size: number, font: FontName) {
  const factor = font === "F2" ? 0.58 : 0.52;
  return text.length * size * factor;
}

function wrapText(text: string, maxWidth: number, size: number, font: FontName) {
  const lines: string[] = [];
  const paragraphs = text.split(/\n+/).map((part) => part.trim()).filter(Boolean);

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/);
    let current = "";

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (estimateTextWidth(candidate, size, font) <= maxWidth) {
        current = candidate;
      } else {
        if (current) {
          lines.push(current);
        }
        current = word;
      }
    }

    if (current) {
      lines.push(current);
    }
  }

  return lines.length > 0 ? lines : [""];
}

function drawText(page: PdfPage, text: string, options: TextOptions) {
  const size = options.size ?? 12;
  const font = options.font ?? "F1";
  const color = options.color ?? [0, 0, 0];

  page.add(
    `BT /${font} ${size} Tf ${rgb(color)} rg 1 0 0 1 ${options.x.toFixed(2)} ${options.y.toFixed(2)} Tm (${escapePdfText(
      text
    )}) Tj ET`
  );
}

function drawRect(
  page: PdfPage,
  x: number,
  y: number,
  width: number,
  height: number,
  color: [number, number, number]
) {
  page.add(`${rgb(color)} rg ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f`);
}

function drawLine(
  page: PdfPage,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: [number, number, number],
  width = 1
) {
  page.add(`${width.toFixed(2)} w ${rgb(color)} RG ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
}

function drawWrappedParagraph(
  page: PdfPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  options?: {
    size?: number;
    font?: FontName;
    color?: [number, number, number];
    lineHeight?: number;
    bullet?: boolean;
  }
) {
  const size = options?.size ?? 10;
  const font = options?.font ?? "F1";
  const color = options?.color ?? [0.16, 0.18, 0.22];
  const lineHeight = options?.lineHeight ?? size + 3;
  const lines = wrapText(text, maxWidth, size, font);

  lines.forEach((line, index) => {
    drawText(page, options?.bullet && index === 0 ? `• ${line}` : line, {
      x: options?.bullet && index > 0 ? x + 10 : x,
      y,
      size,
      font,
      color,
    });
    y -= lineHeight;
  });

  return y;
}

function measureWrappedHeight(
  text: string,
  maxWidth: number,
  options?: {
    size?: number;
    font?: FontName;
    lineHeight?: number;
  }
) {
  const size = options?.size ?? 10;
  const font = options?.font ?? "F1";
  const lineHeight = options?.lineHeight ?? size + 3;
  const lines = wrapText(text, maxWidth, size, font);
  return lines.length * lineHeight;
}

function drawSectionHeader(
  page: PdfPage,
  title: string,
  x: number,
  y: number,
  width: number,
  color: [number, number, number],
  fill?: [number, number, number]
) {
  if (fill) {
    drawRect(page, x, y - 4, width, 18, fill);
  }

  drawText(page, title.toUpperCase(), {
    x: x + 8,
    y: y + 1,
    size: 9.5,
    font: "F2",
    color,
  });

  return y - 22;
}

function drawDividerCard(
  page: PdfPage,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: [number, number, number]
) {
  drawRect(page, x, y - height, width, height, fill);
}

function drawSectionRule(
  page: PdfPage,
  title: string,
  x: number,
  y: number,
  width: number,
  color: [number, number, number],
  lineColor: [number, number, number]
) {
  drawText(page, title.toUpperCase(), {
    x,
    y,
    size: 10,
    font: "F2",
    color,
  });
  const titleWidth = estimateTextWidth(title.toUpperCase(), 10, "F2");
  drawLine(page, x + titleWidth + 10, y + 3, x + width, y + 3, lineColor, 1);
  return y - 18;
}

function createDocument(pages: PdfPage[]) {
  const objects: string[] = [];
  const addObject = (value: string) => {
    objects.push(value);
    return objects.length;
  };

  const fontRegular = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBold = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  const pageRefs: number[] = [];
  const contentRefs: number[] = [];

  for (const page of pages) {
    const content = page.commands.join("\n");
    const contentRef = addObject(`<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`);
    contentRefs.push(contentRef);
    pageRefs.push(0);
  }

  const pagesRef = objects.length + pages.length + 1;

  pages.forEach((page, index) => {
    pageRefs[index] = addObject(
      `<< /Type /Page /Parent ${pagesRef} 0 R /MediaBox [0 0 ${page.width} ${page.height}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${contentRefs[index]} 0 R >>`
    );
  });

  const kids = pageRefs.map((ref) => `${ref} 0 R`).join(" ");
  const actualPagesRef = addObject(`<< /Type /Pages /Kids [${kids}] /Count ${pageRefs.length} >>`);
  const catalogRef = addObject(`<< /Type /Catalog /Pages ${actualPagesRef} 0 R >>`);

  let output = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(output, "utf8"));
    output += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(output, "utf8");
  output += `xref\n0 ${objects.length + 1}\n`;
  output += "0000000000 65535 f \n";

  for (let index = 1; index < offsets.length; index += 1) {
    output += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  output += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogRef} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(output, "utf8");
}

function renderClassicTemplate(data: ResumeData) {
  const pages: PdfPage[] = [];
  let page = new PdfPage();
  const margin = 42;
  const width = page.width - margin * 2;
  let y = 772;
  const navy: [number, number, number] = [0.1, 0.15, 0.27];
  const blue: [number, number, number] = [0.17, 0.33, 0.61];
  const text: [number, number, number] = [0.18, 0.2, 0.24];
  const muted: [number, number, number] = [0.42, 0.45, 0.52];

  const drawHeader = () => {
    drawRect(page, 0, 744, page.width, 98, navy);
    drawText(page, data.name, { x: margin, y: 800, size: 24, font: "F2", color: [1, 1, 1] });
    drawText(page, data.tagline, { x: margin, y: 777, size: 12.5, color: [0.86, 0.92, 1] });
    drawText(page, [data.email, data.phone, data.address, data.linkedin || data.github].filter(Boolean).join(" • "), {
      x: margin,
      y: 756,
      size: 9,
      color: [0.82, 0.88, 0.98],
    });
    y = 718;
  };

  const newPage = () => {
    pages.push(page);
    page = new PdfPage();
    drawHeader();
  };

  const ensureSpace = (height: number, reserve = 56) => {
    if (y - height < reserve) {
      newPage();
    }
  };

  const addSection = (title: string) => {
    ensureSpace(40);
    y = drawSectionHeader(page, title, margin, y, width, blue, [0.92, 0.95, 1]);
  };

  drawHeader();

  addSection("Professional Summary");
  y = drawWrappedParagraph(page, data.summary, margin + 6, y, width - 12, {
    size: 10.5,
    color: text,
    lineHeight: 14,
  }) - 10;

  addSection("Core Skills");
  y = drawWrappedParagraph(page, data.skills.join(" • "), margin + 6, y, width - 12, {
    size: 9.5,
    color: text,
    lineHeight: 12.5,
  }) - 10;

  addSection("Experience");
  data.experiences.forEach((entry) => {
    const bodyHeight = (entry.body || []).reduce((sum, item) => {
      return (
        sum +
        measureWrappedHeight(item, width - 28, {
          size: 9.5,
          lineHeight: 13,
        })
      );
    }, 0);
    const blockHeight = 28 + (entry.subtitle ? 13 : 0) + bodyHeight + 18;
    ensureSpace(blockHeight);
    drawDividerCard(page, margin + 4, y + 6, width - 8, blockHeight - 8, [0.985, 0.99, 1]);
    drawText(page, entry.title, { x: margin + 12, y, size: 11.5, font: "F2", color: navy });
    if (entry.meta) {
      drawText(page, entry.meta, {
        x: margin + width - 16 - estimateTextWidth(entry.meta, 8.5, "F1"),
        y: y + 1,
        size: 8.5,
        color: muted,
      });
    }
    y -= 14;
    if (entry.subtitle) {
      drawText(page, entry.subtitle, { x: margin + 12, y, size: 9.5, font: "F2", color: blue });
      y -= 13;
    }
    entry.body?.forEach((item) => {
      y = drawWrappedParagraph(page, item, margin + 18, y, width - 28, {
        size: 9.5,
        color: text,
        lineHeight: 13,
        bullet: true,
      });
    });
    y -= 10;
  });

  if (data.projects.length > 0) {
    addSection("Project Highlights");
    data.projects.forEach((entry) => {
      const bodyHeight = (entry.body || []).reduce((sum, item) => {
        return (
          sum +
          measureWrappedHeight(item, width - 24, {
            size: 9.2,
            lineHeight: 12.5,
          })
        );
      }, 0);
      const metaLine = joinParts([entry.subtitle, entry.meta]);
      const blockHeight = 26 + (metaLine ? 11 : 0) + bodyHeight + 14;
      ensureSpace(blockHeight);
      drawDividerCard(page, margin + 4, y + 6, width - 8, blockHeight - 8, [0.985, 0.99, 1]);
      drawText(page, entry.title, { x: margin + 12, y, size: 10.5, font: "F2", color: navy });
      y -= 12;
      if (metaLine) {
        drawText(page, metaLine, {
          x: margin + 12,
          y,
          size: 8.5,
          color: muted,
        });
        y -= 11;
      }
      entry.body?.forEach((item) => {
        y = drawWrappedParagraph(page, item, margin + 12, y, width - 24, {
          size: 9.2,
          color: text,
          lineHeight: 12.5,
        });
      });
      y -= 8;
    });
  }

  addSection("Education");
  data.education.forEach((entry) => {
    ensureSpace(36);
    drawText(page, entry.title, { x: margin + 8, y, size: 9.5, font: "F2", color: navy });
    y -= 11;
    y = drawWrappedParagraph(page, joinParts([entry.subtitle, entry.meta]), margin + 8, y, width - 16, {
      size: 8.3,
      color: muted,
      lineHeight: 10.8,
    }) - 6;
  });

  if (data.certifications.length > 0) {
    addSection("Certifications");
    data.certifications.slice(0, 5).forEach((entry) => {
      ensureSpace(30);
      drawText(page, entry.title, { x: margin + 8, y, size: 8.8, font: "F2", color: navy });
      y -= 10;
      y = drawWrappedParagraph(page, joinParts([entry.subtitle, entry.meta]), margin + 8, y, width - 16, {
        size: 7.9,
        color: muted,
        lineHeight: 10,
      }) - 5;
    });
  }

  pages.push(page);
  return pages;
}

function renderCompactTemplate(data: ResumeData) {
  const pages: PdfPage[] = [];
  let page = new PdfPage();
  const margin = 34;
  const width = page.width - margin * 2;
  let y = 774;
  const slate: [number, number, number] = [0.09, 0.11, 0.16];
  const cyan: [number, number, number] = [0.04, 0.67, 0.74];
  const soft: [number, number, number] = [0.93, 0.98, 0.98];
  const text: [number, number, number] = [0.16, 0.18, 0.22];
  const muted: [number, number, number] = [0.4, 0.44, 0.5];

  const newPage = () => {
    pages.push(page);
    page = new PdfPage();
    drawHeader();
  };

  const ensureSpace = (height: number, reserve = 52) => {
    if (y - height < reserve) {
      newPage();
    }
  };

  const drawHeader = () => {
    drawRect(page, margin, 738, width, 78, slate);
    drawRect(page, margin, 722, width, 10, cyan);
    drawText(page, data.name, { x: margin + 18, y: 790, size: 23, font: "F2", color: [1, 1, 1] });
    drawText(page, data.tagline, { x: margin + 18, y: 768, size: 11.5, color: [0.9, 0.97, 0.98] });
    drawText(page, [data.email, data.phone, data.github, data.linkedin].filter(Boolean).join(" • "), {
      x: margin + 18,
      y: 750,
      size: 8.5,
      color: [0.83, 0.94, 0.96],
    });
    const summaryHeight = measureWrappedHeight(data.summary, width - 32, {
      size: 10,
      lineHeight: 13.5,
    });
    const cardHeight = Math.max(52, summaryHeight + 20);
    drawDividerCard(page, margin, 700, width, cardHeight, soft);
    y = drawWrappedParagraph(page, data.summary, margin + 16, 682, width - 32, {
      size: 10,
      color: text,
      lineHeight: 13.5,
    }) - 8;
  };

  const addSection = (title: string) => {
    ensureSpace(40);
    y = drawSectionHeader(page, title, margin, y, width, slate, [0.9, 0.96, 0.97]);
  };

  drawHeader();

  addSection("Experience");
  data.experiences.forEach((entry) => {
    const metaLine = joinParts([entry.subtitle, entry.meta]);
    const bodyHeight = (entry.body || []).reduce((sum, item) => {
      return (
        sum +
        measureWrappedHeight(item, width - 28, {
          size: 8.9,
          lineHeight: 11.5,
        })
      );
    }, 0);
    const blockHeight = 24 + (metaLine ? 11 : 0) + bodyHeight + 16;
    ensureSpace(blockHeight);
    drawDividerCard(page, margin + 4, y + 6, width - 8, blockHeight - 8, [1, 1, 1]);
    drawText(page, entry.title, { x: margin + 12, y, size: 10.5, font: "F2", color: slate });
    y -= 12;
    if (metaLine) {
      drawText(page, metaLine, {
        x: margin + 12,
        y,
        size: 8.2,
        color: muted,
      });
      y -= 11;
    }
    entry.body?.forEach((item) => {
      y = drawWrappedParagraph(page, item, margin + 18, y, width - 28, {
        size: 8.9,
        color: text,
        lineHeight: 11.5,
        bullet: true,
      });
    });
    y -= 8;
  });

  addSection("Skills");
  let chipX = margin + 8;
  let chipY = y;
  data.skills.forEach((skill) => {
    const chipWidth = Math.min(estimateTextWidth(skill, 8.4, "F2") + 14, width - 16);
    if (chipX + chipWidth > margin + width - 8) {
      chipX = margin + 8;
      chipY -= 18;
    }
    if (chipY < 86) {
      newPage();
      addSection("Skills");
      chipX = margin + 8;
      chipY = y;
    }
    drawDividerCard(page, chipX, chipY + 4, chipWidth, 15, [1, 1, 1]);
    drawText(page, skill, {
      x: chipX + 6,
      y: chipY - 6,
      size: 8.4,
      font: "F2",
      color: cyan,
    });
    chipX += chipWidth + 6;
  });
  y = chipY - 24;

  if (data.projects.length > 0) {
    addSection("Projects");
    data.projects.forEach((entry) => {
      const metaLine = joinParts([entry.subtitle, entry.meta]);
      const bodyText = entry.body?.[0] || "";
      const bodyHeight = bodyText
        ? measureWrappedHeight(bodyText, width - 28, {
            size: 8.3,
            lineHeight: 10.5,
          })
        : 0;
      const blockHeight = 24 + (metaLine ? 10 : 0) + bodyHeight + 14;
      ensureSpace(blockHeight);
      drawDividerCard(page, margin + 8, y + 4, width - 16, blockHeight - 8, [1, 1, 1]);
      drawText(page, entry.title, { x: margin + 14, y: y - 8, size: 9.6, font: "F2", color: slate });
      if (metaLine) {
        drawText(page, metaLine, {
          x: margin + 14,
          y: y - 20,
          size: 7.8,
          color: muted,
        });
      }
      y = drawWrappedParagraph(page, bodyText, margin + 14, y - (metaLine ? 31 : 21), width - 28, {
        size: 8.3,
        color: text,
        lineHeight: 10.5,
      }) - 4;
    });
  }

  addSection("Education");
  data.education.forEach((entry) => {
    ensureSpace(34);
    drawText(page, entry.title, { x: margin + 8, y, size: 9.8, font: "F2", color: slate });
    y -= 11;
    y = drawWrappedParagraph(page, joinParts([entry.subtitle, entry.meta]), margin + 8, y, width - 16, {
      size: 8.1,
      color: muted,
      lineHeight: 10.5,
    }) - 6;
  });

  if (data.certifications.length > 0) {
    addSection("Certifications");
    data.certifications.slice(0, 5).forEach((entry) => {
      ensureSpace(26);
      y = drawWrappedParagraph(page, `${entry.title} — ${joinParts([entry.subtitle, entry.meta])}`, margin + 8, y, width - 16, {
        size: 8.3,
        color: text,
        lineHeight: 10.8,
      }) - 3;
    });
  }

  pages.push(page);
  return pages;
}

function renderTimelineTemplate(data: ResumeData) {
  const pages: PdfPage[] = [];
  let page = new PdfPage();
  let y = 774;
  const margin = 38;
  const timelineX = 158;
  const railWidth = 132;
  const navy: [number, number, number] = [0.1, 0.13, 0.2];
  const plum: [number, number, number] = [0.38, 0.22, 0.55];
  const soft: [number, number, number] = [0.97, 0.95, 1];
  const text: [number, number, number] = [0.18, 0.2, 0.24];
  const muted: [number, number, number] = [0.42, 0.45, 0.52];

  const newPage = () => {
    pages.push(page);
    page = new PdfPage();
    drawHeader();
  };

  const ensureSpace = (height: number) => {
    if (y - height < 60) {
      newPage();
    }
  };

  const drawHeader = () => {
    drawRect(page, 0, 0, railWidth, page.height, navy);
    drawRect(page, railWidth - 8, 0, 8, page.height, plum);
    drawText(page, data.name, { x: 24, y: 794, size: 22, font: "F2", color: [1, 1, 1] });
    drawWrappedParagraph(page, data.tagline, 24, 772, 84, {
      size: 10.5,
      font: "F2",
      color: [0.89, 0.88, 1],
      lineHeight: 13,
    });
    drawLine(page, 24, 730, 108, 730, [0.82, 0.76, 0.96], 1);
    let railY = 708;
    [data.email, data.phone, data.github, data.linkedin, data.website]
      .filter(Boolean)
      .forEach((item) => {
        railY = drawWrappedParagraph(page, item, 24, railY, 84, {
          size: 8.1,
          color: [0.9, 0.93, 0.98],
          lineHeight: 10.5,
        }) - 5;
      });
    y = 782;
  };

  drawHeader();

  ensureSpace(44);
  y = drawSectionRule(page, "Summary", timelineX, y, page.width - timelineX - margin, plum, [0.85, 0.8, 0.94]);
  const summaryWidth = page.width - timelineX - margin - 20;
  const summaryHeight = measureWrappedHeight(data.summary, summaryWidth, {
    size: 10,
    lineHeight: 13,
  });
  drawDividerCard(page, timelineX, y + 5, page.width - timelineX - margin, summaryHeight + 20, soft);
  y = drawWrappedParagraph(page, data.summary, timelineX + 10, y - 10, page.width - timelineX - margin - 20, {
    size: 10,
    color: text,
    lineHeight: 13,
  }) - 2;

  if (data.projects.length > 0) {
    ensureSpace(42);
    y -= 8;
    y = drawSectionRule(page, "Selected Projects", timelineX, y, page.width - timelineX - margin, plum, [0.85, 0.8, 0.94]);
    data.projects.slice(0, 3).forEach((entry) => {
      const metaLine = joinParts([entry.subtitle, entry.meta]);
      const bodyText = entry.body?.[0] || "";
      const metaHeight = metaLine
        ? measureWrappedHeight(metaLine, page.width - timelineX - margin - 20, {
            size: 8.2,
            lineHeight: 10.2,
          })
        : 0;
      const bodyHeight = bodyText
        ? measureWrappedHeight(bodyText, page.width - timelineX - margin - 20, {
            size: 8.8,
            lineHeight: 11,
          })
        : 0;
      const blockHeight = 24 + metaHeight + bodyHeight + 18;
      ensureSpace(blockHeight + 8);
      drawDividerCard(page, timelineX, y + 4, page.width - timelineX - margin, blockHeight - 6, [0.99, 0.98, 1]);
      drawText(page, entry.title, { x: timelineX + 10, y: y - 8, size: 10.2, font: "F2", color: navy });
      if (metaLine) {
        drawWrappedParagraph(page, metaLine, timelineX + 10, y - 20, page.width - timelineX - margin - 20, {
          size: 8.2,
          color: muted,
          lineHeight: 10.2,
        });
      }
      y = drawWrappedParagraph(page, bodyText, timelineX + 10, y - (metaLine ? 20 + metaHeight + 3 : 21), page.width - timelineX - margin - 20, {
        size: 8.8,
        color: text,
        lineHeight: 11,
      }) - 6;
    });
  }

  y -= 6;
  ensureSpace(42);
  y = drawSectionRule(page, "Career Timeline", timelineX, y, page.width - timelineX - margin, plum, [0.85, 0.8, 0.94]);

  data.experiences.forEach((entry) => {
    const metaHeight = entry.meta
      ? measureWrappedHeight(entry.meta, page.width - timelineX - margin - 44, {
          size: 8.3,
          lineHeight: 10.2,
        })
      : 0;
    const bodyHeight = (entry.body || []).reduce((sum, item) => {
      return (
        sum +
        measureWrappedHeight(item, page.width - timelineX - margin - 28, {
          size: 9.1,
          lineHeight: 11.8,
        })
      );
    }, 0);
    const blockHeight = 24 + metaHeight + 14 + (entry.subtitle ? 12 : 0) + bodyHeight + 18;
    ensureSpace(blockHeight);
    drawDividerCard(page, timelineX + 18, y + 8, page.width - timelineX - margin - 18, blockHeight - 10, [0.992, 0.989, 1]);
    drawLine(page, timelineX + 12, y + 8, timelineX + 12, y - blockHeight + 22, [0.84, 0.8, 0.93], 1.4);
    drawRect(page, timelineX + 8, y - 1, 8, 8, plum);
    if (entry.meta) {
      y = drawWrappedParagraph(page, entry.meta, timelineX + 28, y, page.width - timelineX - margin - 44, {
        size: 8.3,
        color: muted,
        lineHeight: 10.2,
      }) - 3;
    }
    drawText(page, entry.title, { x: timelineX + 28, y, size: 11, font: "F2", color: navy });
    y -= 13;
    if (entry.subtitle) {
      drawText(page, entry.subtitle, { x: timelineX + 28, y, size: 9.2, font: "F2", color: plum });
      y -= 12;
    }
    entry.body?.forEach((item) => {
      y = drawWrappedParagraph(page, item, timelineX + 28, y, page.width - timelineX - margin - 28, {
        size: 9.1,
        color: text,
        lineHeight: 11.8,
      });
    });
    y -= 12;
  });

  ensureSpace(42);
  y = drawSectionRule(page, "Education", timelineX, y, page.width - timelineX - margin, plum, [0.85, 0.8, 0.94]);
  data.education.forEach((entry) => {
    const blockHeight =
      12 +
      measureWrappedHeight(joinParts([entry.subtitle, entry.meta]), page.width - timelineX - margin, {
        size: 8.5,
        lineHeight: 10.8,
      }) +
      8;
    ensureSpace(blockHeight);
    drawText(page, entry.title, { x: timelineX, y, size: 10.2, font: "F2", color: navy });
    y -= 12;
    y = drawWrappedParagraph(page, joinParts([entry.subtitle, entry.meta]), timelineX, y, page.width - timelineX - margin, {
      size: 8.5,
      color: muted,
      lineHeight: 10.8,
    }) - 4;
  });

  y -= 6;
  ensureSpace(42);
  y = drawSectionRule(page, "Skills & Certifications", timelineX, y, page.width - timelineX - margin, plum, [0.85, 0.8, 0.94]);
  ensureSpace(
    measureWrappedHeight(data.skills.join(" • "), page.width - timelineX - margin, {
      size: 8.9,
      lineHeight: 11.5,
    }) + 24
  );
  y = drawWrappedParagraph(page, data.skills.join(" • "), timelineX, y, page.width - timelineX - margin, {
    size: 8.9,
    color: text,
    lineHeight: 11.5,
  }) - 6;
  data.certifications.slice(0, 4).forEach((entry) => {
    const certText = `${entry.title} — ${joinParts([entry.subtitle, entry.meta])}`;
    ensureSpace(
      measureWrappedHeight(certText, page.width - timelineX - margin, {
        size: 8.4,
        lineHeight: 10.8,
      }) + 8
    );
    y = drawWrappedParagraph(page, `${entry.title} — ${joinParts([entry.subtitle, entry.meta])}`, timelineX, y, page.width - timelineX - margin, {
      size: 8.4,
      color: muted,
      lineHeight: 10.8,
    }) - 3;
  });

  pages.push(page);
  return pages;
}

export function generateResumePdf(data: ResumeData, template: ResumeTemplateKey) {
  const pages =
    template === "compact"
      ? renderCompactTemplate(data)
      : template === "timeline"
      ? renderTimelineTemplate(data)
      : renderClassicTemplate(data);

  return createDocument(pages);
}
