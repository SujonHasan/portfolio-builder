import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth } from "@/lib/auth-guard";
import { sanitizeRichText } from "@/lib/sanitize";
import { educationSchema } from "@/lib/validations";
import Education from "@/models/Education";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  return withAuth(req, async (_request, auth) => {
    try {
      const { id } = await context.params;
      await connectDB();
      const edu = await Education.findOne({ _id: id, siteId: auth.siteId });
      if (!edu) return NextResponse.json({ success: false, error: "Education not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: edu });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to fetch education" }, { status: 500 });
    }
  });
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return withAuth(req, async (request, auth) => {
    try {
      const { id } = await context.params;
      const body = await request.json();
      const validated = educationSchema.partial().parse(body);
      if (validated.description !== undefined) {
        validated.description = sanitizeRichText(validated.description);
      }
      await connectDB();
      const edu = await Education.findOneAndUpdate({ _id: id, siteId: auth.siteId }, validated, { new: true });
      if (!edu) return NextResponse.json({ success: false, error: "Education not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: edu });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ success: false, error: "Validation failed", details: error }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: "Failed to update education" }, { status: 500 });
    }
  });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return withAuth(req, async (_request, auth) => {
    try {
      const { id } = await context.params;
      await connectDB();
      const edu = await Education.findOneAndDelete({ _id: id, siteId: auth.siteId });
      if (!edu) return NextResponse.json({ success: false, error: "Education not found" }, { status: 404 });
      return NextResponse.json({ success: true, message: "Education deleted" });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to delete education" }, { status: 500 });
    }
  });
}
