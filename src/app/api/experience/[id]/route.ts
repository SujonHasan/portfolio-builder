import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth } from "@/lib/auth-guard";
import { sanitizeRichText } from "@/lib/sanitize";
import { experienceSchema } from "@/lib/validations";
import Experience from "@/models/Experience";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  return withAuth(req, async (_request, auth) => {
    try {
      const { id } = await context.params;
      await connectDB();
      const exp = await Experience.findOne({ _id: id, siteId: auth.siteId });
      if (!exp) return NextResponse.json({ success: false, error: "Experience not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: exp });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to fetch experience" }, { status: 500 });
    }
  });
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return withAuth(req, async (request, auth) => {
    try {
      const { id } = await context.params;
      const body = await request.json();
      const validated = experienceSchema.partial().parse(body);
      if (validated.description !== undefined) {
        validated.description = sanitizeRichText(validated.description);
      }
      await connectDB();
      const exp = await Experience.findOneAndUpdate({ _id: id, siteId: auth.siteId }, validated, { new: true });
      if (!exp) return NextResponse.json({ success: false, error: "Experience not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: exp });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ success: false, error: "Validation failed", details: error }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: "Failed to update experience" }, { status: 500 });
    }
  });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return withAuth(req, async (_request, auth) => {
    try {
      const { id } = await context.params;
      await connectDB();
      const exp = await Experience.findOneAndDelete({ _id: id, siteId: auth.siteId });
      if (!exp) return NextResponse.json({ success: false, error: "Experience not found" }, { status: 404 });
      return NextResponse.json({ success: true, message: "Experience deleted" });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to delete experience" }, { status: 500 });
    }
  });
}
