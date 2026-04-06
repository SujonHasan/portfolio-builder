import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth } from "@/lib/auth-guard";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { sanitizeRichText } from "@/lib/sanitize";
import { resolvePublicSiteFromRequest } from "@/lib/site";
import { projectSchema } from "@/lib/validations";
import Project from "@/models/Project";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");
    const authPayload = await getAuthPayloadFromRequest(req);
    const publicSite = authPayload ? null : await resolvePublicSiteFromRequest(req);
    const siteId = authPayload?.siteId || publicSite?._id?.toString();

    if (!siteId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const filter: Record<string, unknown> = { siteId };
    if (status) {
      filter.status = status;
    } else if (!authPayload) {
      filter.status = "published";
    }
    if (featured === "true") filter.featured = true;

    const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, data: projects });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (request, auth) => {
    try {
      const body = await request.json();
      const validated = projectSchema.parse(body);
      validated.description = sanitizeRichText(validated.description);

      await connectDB();
      const project = await Project.create({ ...validated, siteId: auth.siteId });
      return NextResponse.json({ success: true, data: project }, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ success: false, error: "Validation failed", details: error }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: "Failed to create project" }, { status: 500 });
    }
  });
}
