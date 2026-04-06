import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth } from "@/lib/auth-guard";
import { educationSchema } from "@/lib/validations";
import { sanitizeRichText } from "@/lib/sanitize";
import Education from "@/models/Education";

export async function GET(req: NextRequest) {
  return withAuth(req, async (_request, auth) => {
    try {
      await connectDB();
      const education = await Education.find({ siteId: auth.siteId }).sort({ order: 1, startDate: -1 });
      return NextResponse.json({ success: true, data: education });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to fetch education" }, { status: 500 });
    }
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (request, auth) => {
    try {
      const body = await request.json();
      const validated = educationSchema.parse(body);
      validated.description = sanitizeRichText(validated.description);
      await connectDB();
      const edu = await Education.create({ ...validated, siteId: auth.siteId });
      return NextResponse.json({ success: true, data: edu }, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ success: false, error: "Validation failed", details: error }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: "Failed to create education" }, { status: 500 });
    }
  });
}
