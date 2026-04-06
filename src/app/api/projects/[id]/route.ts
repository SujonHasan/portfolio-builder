import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth } from "@/lib/auth-guard";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { sanitizeRichText } from "@/lib/sanitize";
import { resolvePublicSiteFromRequest } from "@/lib/site";
import { projectSchema } from "@/lib/validations";
import Project from "@/models/Project";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await connectDB();
    const authPayload = await getAuthPayloadFromRequest(req);
    const publicSite = authPayload ? null : await resolvePublicSiteFromRequest(req);
    const siteId = authPayload?.siteId || publicSite?._id?.toString();

    if (!siteId) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    const filter: Record<string, unknown> = { _id: id, siteId };

    if (!authPayload) {
      filter.status = "published";
    }

    const project = await Project.findOne(filter);
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    if (!authPayload) {
      project.views += 1;
      await project.save();
    }

    return NextResponse.json({ success: true, data: project });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return withAuth(req, async (request, auth) => {
    try {
      const { id } = await context.params;
      const body = await request.json();
      const validated = projectSchema.partial().parse(body);
      if (validated.description !== undefined) {
        validated.description = sanitizeRichText(validated.description);
      }

      await connectDB();
      const project = await Project.findOneAndUpdate(
        { _id: id, siteId: auth.siteId },
        validated,
        { new: true, runValidators: true }
      );
      if (!project) {
        return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: project });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ success: false, error: "Validation failed", details: error }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: "Failed to update project" }, { status: 500 });
    }
  });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return withAuth(req, async (_request, auth) => {
    try {
      const { id } = await context.params;
      await connectDB();
      const project = await Project.findOneAndDelete({ _id: id, siteId: auth.siteId });
      if (!project) {
        return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: "Project deleted" });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to delete project" }, { status: 500 });
    }
  });
}
