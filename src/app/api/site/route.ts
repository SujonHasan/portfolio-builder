import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { connectDB } from "@/lib/db";
import { siteSchema } from "@/lib/validations";
import { ensureUniqueUsername } from "@/lib/site";
import Site from "@/models/Site";

export async function GET(req: NextRequest) {
  return withAuth(req, async (_request, auth) => {
    return NextResponse.json({ success: true, data: auth.site });
  });
}

export async function PUT(req: NextRequest) {
  return withAuth(req, async (request, auth) => {
    try {
      const body = await request.json();
      const validated = siteSchema.parse(body);
      await connectDB();

      const username = await ensureUniqueUsername(validated.username, auth.siteId);
      const site = await Site.findByIdAndUpdate(
        auth.siteId,
        {
          username,
          subdomain: username,
          title: validated.title,
        },
        { new: true, runValidators: true }
      );

      return NextResponse.json({ success: true, data: site });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json(
          { success: false, error: "Validation failed", details: error },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Failed to update site settings" },
        { status: 500 }
      );
    }
  });
}
