import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth } from "@/lib/auth-guard";
import { aboutSchema } from "@/lib/validations";
import { sanitizeRichText } from "@/lib/sanitize";
import { getLatestAboutLean, saveAboutSingleton } from "@/lib/about";

export async function GET(req: NextRequest) {
  return withAuth(req, async (_request, auth) => {
    try {
      await connectDB();
      const about = await getLatestAboutLean(auth.siteId);
      return NextResponse.json({ success: true, data: about });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to fetch about" }, { status: 500 });
    }
  });
}

export async function PUT(req: NextRequest) {
  return withAuth(req, async (request, auth) => {
    try {
      const body = await request.json();
      const validated = aboutSchema.parse(body);
      validated.bio = sanitizeRichText(validated.bio);
      await connectDB();
      const about = await saveAboutSingleton(auth.siteId, validated);
      return NextResponse.json({ success: true, data: about });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ success: false, error: "Validation failed", details: error }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: "Failed to update about" }, { status: 500 });
    }
  });
}
