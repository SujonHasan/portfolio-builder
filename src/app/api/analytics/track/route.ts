import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Analytics from "@/models/Analytics";
import { resolvePublicSiteFromRequest } from "@/lib/site";

export async function POST(req: NextRequest) {
  try {
    const { page } = await req.json();
    if (!page) {
      return NextResponse.json({ success: false, error: "Page is required" }, { status: 400 });
    }

    await connectDB();
    const site = await resolvePublicSiteFromRequest(req);
    if (!site) {
      return NextResponse.json({ success: false, error: "Site not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Analytics.findOneAndUpdate(
      { siteId: site._id, page, date: today },
      { $inc: { views: 1 }, $setOnInsert: { siteId: site._id, page, date: today } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to track" }, { status: 500 });
  }
}
