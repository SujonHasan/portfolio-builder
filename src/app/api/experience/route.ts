import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth } from "@/lib/auth-guard";
import { experienceSchema } from "@/lib/validations";
import { sanitizeRichText } from "@/lib/sanitize";
import Experience from "@/models/Experience";

export async function GET(req: NextRequest) {
  return withAuth(req, async (_request, auth) => {
    try {
      await connectDB();
      const experiences = await Experience.find({ siteId: auth.siteId }).sort({ order: 1, startDate: -1 });
      return NextResponse.json({ success: true, data: experiences });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to fetch experiences" }, { status: 500 });
    }
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (request, auth) => {
    try {
      const body = await request.json();
      const validated = experienceSchema.parse(body);
      validated.description = sanitizeRichText(validated.description);
      await connectDB();
      const experience = await Experience.create({ ...validated, siteId: auth.siteId });
      return NextResponse.json({ success: true, data: experience }, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ success: false, error: "Validation failed", details: error }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: "Failed to create experience" }, { status: 500 });
    }
  });
}
