import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  shortDescription: z.string().optional().default(""),
  thumbnail: z.string().optional().default(""),
  images: z.array(z.string()).optional().default([]),
  technologies: z.array(z.string()).optional().default([]),
  category: z.string().optional().default("web"),
  liveUrl: z.string().optional().default(""),
  githubUrl: z.string().optional().default(""),
  featured: z.boolean().optional().default(false),
  order: z.number().optional().default(0),
  status: z.enum(["published", "draft"]).optional().default("published"),
});

export const skillSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(["frontend", "backend", "database", "tools", "other"]).optional().default("other"),
  proficiency: z.number().min(0).max(100).optional().default(50),
  icon: z.string().optional().default(""),
  order: z.number().optional().default(0),
});

export const experienceSchema = z.object({
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  description: z.string().optional().default(""),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().nullable().optional().default(null),
  current: z.boolean().optional().default(false),
  location: z.string().optional().default(""),
  companyUrl: z.string().optional().default(""),
  technologies: z.array(z.string()).optional().default([]),
  order: z.number().optional().default(0),
});

export const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().optional().default(""),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().nullable().optional().default(null),
  current: z.boolean().optional().default(false),
  grade: z.string().optional().default(""),
  description: z.string().optional().default(""),
  order: z.number().optional().default(0),
});

export const certificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  issuer: z.string().min(1, "Issuer is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().nullable().optional().default(null),
  credentialId: z.string().optional().default(""),
  credentialUrl: z.string().optional().default(""),
  image: z.string().optional().default(""),
  order: z.number().optional().default(0),
});

export const aboutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tagline: z.string().optional().default(""),
  bio: z.string().min(1, "Bio is required"),
  profileImage: z.string().optional().default(""),
  resumeUrl: z.string().optional().default(""),
  resumeTemplate: z.enum(["classic", "compact", "timeline"]).optional().default("classic"),
  heroDescription: z.string().optional().default(""),
  stats: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      })
    )
    .optional()
    .default([]),
  socialLinks: z
    .object({
      github: z.string().optional().default(""),
      linkedin: z.string().optional().default(""),
      twitter: z.string().optional().default(""),
      facebook: z.string().optional().default(""),
      website: z.string().optional().default(""),
    })
    .optional()
    .default({ github: "", linkedin: "", twitter: "", facebook: "", website: "" }),
});

const portfolioSectionSchema = z.enum([
  "hero",
  "about",
  "skills",
  "projects",
  "experience",
  "education",
  "certifications",
  "contact",
]);

export const portfolioSettingsSchema = z.object({
  enabledSections: z.array(portfolioSectionSchema).optional().default([]),
  sectionOrder: z.array(portfolioSectionSchema).optional().default([]),
});

const hexColorSchema = z
  .string()
  .regex(/^#([0-9a-fA-F]{6})$/, "Use a valid hex color like #2563eb");

export const themeSettingsSchema = z.object({
  themePreset: z.enum(["default", "minimal", "modern", "warm"]).optional().default("default"),
  primaryColor: hexColorSchema.optional().default("#2563eb"),
  accentColor: hexColorSchema.optional().default("#dbeafe"),
  backgroundColor: hexColorSchema.optional().default("#ffffff"),
  surfaceColor: hexColorSchema.optional().default("#f8fafc"),
  textColor: hexColorSchema.optional().default("#0f172a"),
  mutedColor: hexColorSchema.optional().default("#64748b"),
  backgroundStyle: z.enum(["none", "glow", "grid", "dots"]).optional().default("none"),
  radiusScale: z.enum(["soft", "rounded", "sharp"]).optional().default("rounded"),
  showThemeToggle: z.boolean().optional().default(true),
});

export const siteSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
  title: z.string().min(1, "Site title is required"),
});

export const publishSettingsSchema = z.object({
  publishStatus: z.enum(["draft", "published"]).default("draft"),
});

export const onboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  tagline: z.string().optional().default(""),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
  siteTitle: z.string().min(1, "Site title is required"),
  themePreset: z.enum(["default", "minimal", "modern", "warm"]).default("default"),
});

export const contactSchema = z.object({
  email: z.string().email("Invalid email"),
  phone: z.string().optional().default(""),
  address: z.string().optional().default(""),
  mapEmbedUrl: z.string().optional().default(""),
  availability: z.string().optional().default("Available for freelance"),
});

export const seoSchema = z.object({
  page: z.string().optional().default("home"),
  metaTitle: z.string().optional().default(""),
  metaDescription: z.string().optional().default(""),
  keywords: z.array(z.string()).optional().default([]),
  ogImage: z.string().optional().default(""),
  autoGenerate: z.boolean().optional().default(false),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
export type AboutInput = z.infer<typeof aboutSchema>;
export type PortfolioSettingsInput = z.infer<typeof portfolioSettingsSchema>;
export type ThemeSettingsInput = z.infer<typeof themeSettingsSchema>;
export type SiteInput = z.infer<typeof siteSchema>;
export type PublishSettingsInput = z.infer<typeof publishSettingsSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type SeoInput = z.infer<typeof seoSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
