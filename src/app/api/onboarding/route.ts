import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { connectDB } from "@/lib/db";
import { onboardingSchema } from "@/lib/validations";
import { ensureUniqueUsername } from "@/lib/site";
import { saveAboutSingleton } from "@/lib/about";
import { saveThemeSettingsSingleton } from "@/lib/theme-settings";
import Site from "@/models/Site";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  return withAuth(req, async (request, auth) => {
    try {
      const body = await request.json();
      const validated = onboardingSchema.parse(body);
      await connectDB();

      const username = await ensureUniqueUsername(validated.username, auth.siteId);

      const site = await Site.findByIdAndUpdate(
        auth.siteId,
        {
          username,
          subdomain: username,
          title: validated.siteTitle,
          onboardingCompleted: true,
        },
        { new: true, runValidators: true }
      );

      await User.findByIdAndUpdate(auth.userId, {
        name: validated.name,
        status: "active",
      });

      await saveAboutSingleton(auth.siteId, {
        name: validated.name,
        tagline: validated.tagline,
      });

      await saveThemeSettingsSingleton({
        siteId: auth.siteId,
        themePreset: validated.themePreset,
      });

      return NextResponse.json({ success: true, data: site });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json(
          { success: false, error: "Validation failed", details: error },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Failed to complete onboarding" },
        { status: 500 }
      );
    }
  });
}
