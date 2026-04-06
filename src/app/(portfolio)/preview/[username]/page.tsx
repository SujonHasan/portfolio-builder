import { Metadata } from "next";
import { notFound } from "next/navigation";
import Project from "@/models/Project";
import Skill from "@/models/Skill";
import Experience from "@/models/Experience";
import Education from "@/models/Education";
import Certification from "@/models/Certification";
import Contact from "@/models/Contact";
import Seo from "@/models/Seo";
import { getLatestAboutLean } from "@/lib/about";
import { HeroSection } from "@/components/portfolio/hero-section";
import { AboutSection } from "@/components/portfolio/about-section";
import { SkillsSection } from "@/components/portfolio/skills-section";
import { ProjectsSection } from "@/components/portfolio/projects-section";
import { ExperienceSection } from "@/components/portfolio/experience-section";
import { EducationSection } from "@/components/portfolio/education-section";
import { CertificationsSection } from "@/components/portfolio/certifications-section";
import { ContactSection } from "@/components/portfolio/contact-section";
import { AnalyticsTracker } from "@/components/portfolio/analytics-tracker";
import { getPortfolioSettingsBySiteId } from "@/lib/portfolio-settings";
import { getSiteByUsername } from "@/lib/site";
import { canAccessPortfolioSite } from "@/lib/site-access";
import {
  IAbout,
  ICertification,
  IContact,
  IEducation,
  IExperience,
  IPortfolioSettings,
  IProject,
  ISkill,
  PortfolioSectionKey,
} from "@/types";

export const dynamic = "force-dynamic";

type PreviewPageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: PreviewPageProps): Promise<Metadata> {
  const { username } = await params;
  const site = await getSiteByUsername(username);

  if (!site || !(await canAccessPortfolioSite(site))) {
    return {
      title: "Portfolio Not Found",
    };
  }

  const seo = await Seo.findOne({ siteId: site._id, page: "home" }).lean();
  const about = await getLatestAboutLean(site._id.toString());

  return {
    title: seo?.metaTitle || `${about?.name || site.title} | Portfolio`,
    description:
      seo?.metaDescription ||
      about?.heroDescription ||
      `${about?.name || site.title} portfolio`,
    keywords: (seo?.keywords as string[]) || [],
    openGraph: {
      title: seo?.metaTitle || `${about?.name || site.title} | Portfolio`,
      description:
        seo?.metaDescription ||
        about?.heroDescription ||
        `${about?.name || site.title} portfolio`,
      images: seo?.ogImage ? [{ url: seo.ogImage as string }] : [],
      type: "website",
    },
  };
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { username } = await params;
  const site = await getSiteByUsername(username);

  if (!site || !(await canAccessPortfolioSite(site))) {
    notFound();
  }

  let about: IAbout | null = null;
  let projects: IProject[] = [];
  let skills: ISkill[] = [];
  let experiences: IExperience[] = [];
  let education: IEducation[] = [];
  let certifications: ICertification[] = [];
  let contact: IContact | null = null;
  let settings: Pick<IPortfolioSettings, "enabledSections" | "sectionOrder"> =
    await getPortfolioSettingsBySiteId(site._id.toString());

  try {
    [about, projects, skills, experiences, education, certifications, contact] =
      await Promise.all([
        getLatestAboutLean(site._id.toString()),
        Project.find({ siteId: site._id, status: "published" }).sort({ order: 1, createdAt: -1 }).lean(),
        Skill.find({ siteId: site._id }).sort({ order: 1 }).lean(),
        Experience.find({ siteId: site._id }).sort({ order: 1, startDate: -1 }).lean(),
        Education.find({ siteId: site._id }).sort({ order: 1, startDate: -1 }).lean(),
        Certification.find({ siteId: site._id }).sort({ order: 1, issueDate: -1 }).lean(),
        Contact.findOne({ siteId: site._id }).lean(),
      ]);
  } catch {
    notFound();
  }

  const serialize = <T,>(data: T): T => JSON.parse(JSON.stringify(data));
  const serializedAbout = serialize(about);
  const serializedSkills = serialize(skills) || [];
  const serializedProjects = serialize(projects) || [];
  const serializedExperiences = serialize(experiences) || [];
  const serializedEducation = serialize(education) || [];
  const serializedCertifications = serialize(certifications) || [];
  const serializedContact = serialize(contact);

  const sectionMap: Record<PortfolioSectionKey, React.ReactNode> = {
    hero: <HeroSection about={serializedAbout} siteUsername={site.username} />,
    about: <AboutSection about={serializedAbout} />,
    skills: <SkillsSection skills={serializedSkills} />,
    projects: <ProjectsSection projects={serializedProjects} />,
    experience: <ExperienceSection experiences={serializedExperiences} />,
    education: <EducationSection education={serializedEducation} />,
    certifications: <CertificationsSection certifications={serializedCertifications} />,
    contact: <ContactSection contact={serializedContact} siteUsername={site.username} />,
  };

  const visibleSections = settings.sectionOrder.filter((sectionId) =>
    settings.enabledSections.includes(sectionId)
  );

  return (
    <>
      <AnalyticsTracker page="home" siteUsername={site.username} />
      {visibleSections.map((sectionId) => (
        <div key={sectionId}>{sectionMap[sectionId]}</div>
      ))}
    </>
  );
}
