import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { connectDB } from "@/lib/db";
import { publishSettingsSchema } from "@/lib/validations";
import Site from "@/models/Site";

export async function GET(req: NextRequest) {
  return withAuth(req, async (_request, auth) => {
    return NextResponse.json({
      success: true,
      data: {
        publishStatus: auth.site.publishStatus,
        username: auth.site.username,
        subdomain: auth.site.subdomain,
      },
    });
  });
}

export async function PUT(req: NextRequest) {
  return withAuth(req, async (request, auth) => {
    try {
      const body = await request.json();
      const validated = publishSettingsSchema.parse(body);
      await connectDB();

      const site = await Site.findByIdAndUpdate(
        auth.siteId,
        { publishStatus: validated.publishStatus },
        { new: true }
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
        { success: false, error: "Failed to update publish settings" },
        { status: 500 }
      );
    }
  });
}
