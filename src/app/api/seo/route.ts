import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth } from "@/lib/auth-guard";
import { PORTFOLIO_FALLBACK_NAME, PORTFOLIO_FALLBACK_TAGLINE } from "@/lib/brand";
import { seoSchema } from "@/lib/validations";
import { getLatestAboutQuery } from "@/lib/about";
import Seo from "@/models/Seo";
import Project from "@/models/Project";
import Skill from "@/models/Skill";

async function generateSeoContent(siteId: string) {
  const about = await getLatestAboutQuery(siteId);
  const projectCount = await Project.countDocuments({ siteId, status: "published" });
  const skills = await Skill.find({ siteId }).sort({ proficiency: -1 }).limit(5);

  const name = about?.name || PORTFOLIO_FALLBACK_NAME;
  const tagline = about?.tagline || PORTFOLIO_FALLBACK_TAGLINE;
  const topSkills = skills.map((s: { name: string }) => s.name).join(", ");

  const metaTitle = `${name} | ${tagline} | Portfolio`;
  const metaDescription = `${name} is a ${tagline} with expertise in ${topSkills}. Explore ${projectCount}+ projects and professional experience. Available for freelance work.`;
  const keywords = [
    name,
    tagline,
    ...skills.map((s: { name: string }) => s.name),
    "portfolio",
    "web developer",
    "MERN stack",
  ];

  return { metaTitle, metaDescription, keywords };
}

export async function GET(req: NextRequest) {
  return withAuth(req, async (_request, auth) => {
    try {
      await connectDB();
      let seo = await Seo.findOne({ siteId: auth.siteId, page: "home" });

      if (!seo || seo.autoGenerate) {
        const generated = await generateSeoContent(auth.siteId);
        if (seo?.autoGenerate) {
          seo.metaTitle = generated.metaTitle;
          seo.metaDescription = generated.metaDescription;
          seo.keywords = generated.keywords;
          await seo.save();
        }
        if (!seo) {
          seo = await Seo.create({ siteId: auth.siteId, page: "home", ...generated, autoGenerate: true });
        }
      }

      return NextResponse.json({ success: true, data: seo });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to fetch SEO" }, { status: 500 });
    }
  });
}

export async function PUT(req: NextRequest) {
  return withAuth(req, async (request, auth) => {
    try {
      const body = await request.json();
      const validated = seoSchema.parse(body);

      await connectDB();

      // If autoGenerate is true, regenerate content
      if (validated.autoGenerate) {
        const generated = await generateSeoContent(auth.siteId);
        validated.metaTitle = generated.metaTitle;
        validated.metaDescription = generated.metaDescription;
        validated.keywords = generated.keywords;
      }

      const seo = await Seo.findOneAndUpdate({ siteId: auth.siteId, page: "home" }, { ...validated, siteId: auth.siteId }, {
        new: true,
        upsert: true,
      });

      return NextResponse.json({ success: true, data: seo });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ success: false, error: "Validation failed", details: error }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: "Failed to update SEO" }, { status: 500 });
    }
  });
}
