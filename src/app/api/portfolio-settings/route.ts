import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { connectDB } from "@/lib/db";
import { portfolioSettingsSchema } from "@/lib/validations";
import {
  getPortfolioSettingsBySiteId,
  savePortfolioSettingsSingleton,
} from "@/lib/portfolio-settings";

export async function GET(req: NextRequest) {
  return withAuth(req, async (_request, auth) => {
    try {
      await connectDB();
      const settings = await getPortfolioSettingsBySiteId(auth.siteId);
      return NextResponse.json({ success: true, data: settings });
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to fetch portfolio settings" },
        { status: 500 }
      );
    }
  });
}

export async function PUT(req: NextRequest) {
  return withAuth(req, async (request, auth) => {
    try {
      const body = await request.json();
      const validated = portfolioSettingsSchema.parse(body);
      await connectDB();
      const settings = await savePortfolioSettingsSingleton({
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
        { success: false, error: "Failed to update portfolio settings" },
        { status: 500 }
      );
    }
  });
}
