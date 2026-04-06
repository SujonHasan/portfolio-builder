import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { connectDB } from "@/lib/db";
import { themeSettingsSchema } from "@/lib/validations";
import { getThemeSettingsBySiteId, saveThemeSettingsSingleton } from "@/lib/theme-settings";

export async function GET(req: NextRequest) {
  return withAuth(req, async (_request, auth) => {
    try {
      await connectDB();
      const settings = await getThemeSettingsBySiteId(auth.siteId);
      return NextResponse.json({ success: true, data: settings });
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to fetch theme settings" },
        { status: 500 }
      );
    }
  });
}

export async function PUT(req: NextRequest) {
  return withAuth(req, async (request, auth) => {
    try {
      const body = await request.json();
      const validated = themeSettingsSchema.parse(body);
      await connectDB();
      const settings = await saveThemeSettingsSingleton({
        siteId: auth.siteId,
        ...validated,
      });
      return NextResponse.json({ success: true, data: settings });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json(
          { success: false, error: "Validation failed", details: error },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Failed to update theme settings" },
        { status: 500 }
      );
    }
  });
}
