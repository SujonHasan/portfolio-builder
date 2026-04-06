import { NextRequest, NextResponse } from "next/server";
import {
  generateResumePdf,
  getResumeData,
  normalizeResumeTemplate,
} from "@/lib/resume";
import { connectDB } from "@/lib/db";
import Analytics from "@/models/Analytics";
import { resolvePublicSiteFromRequest } from "@/lib/site";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const requestedTemplate = req.nextUrl.searchParams.get("template");
    const template = requestedTemplate
      ? normalizeResumeTemplate(requestedTemplate)
      : undefined;
    const preview = req.nextUrl.searchParams.get("preview") === "1";
    const site = await resolvePublicSiteFromRequest(req);
    if (!site) {
      return NextResponse.json(
        { success: false, error: "Site not found" },
        { status: 404 }
      );
    }

    const data = await getResumeData(site._id.toString(), template);
    const pdf = generateResumePdf(data, data.template);
    const filename = `${slugify(data.name || "resume")}-${data.template}.pdf`;

    if (!preview) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await Analytics.findOneAndUpdate(
        { siteId: site._id, page: "resume-downloads", date: today },
        {
          $inc: { views: 1 },
          $setOnInsert: { siteId: site._id, page: "resume-downloads", date: today },
        },
        { upsert: true }
      );
    }

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${preview ? "inline" : "attachment"}; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to generate resume PDF" },
      { status: 500 }
    );
  }
}
