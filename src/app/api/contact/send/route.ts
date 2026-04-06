import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations";
import { connectDB } from "@/lib/db";
import Analytics from "@/models/Analytics";
import { resolvePublicSiteFromRequest } from "@/lib/site";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = contactFormSchema.parse(body);
    await connectDB();
    const site = await resolvePublicSiteFromRequest(req);

    // In production, send email via nodemailer or a service like SendGrid
    // For now, just log and return success
    console.log("Contact form submission:", { site: site?.username || "unknown", ...validated });

    if (site) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await Analytics.findOneAndUpdate(
        { siteId: site._id, page: "contact-leads", date: today },
        { $inc: { views: 1 }, $setOnInsert: { siteId: site._id, page: "contact-leads", date: today } },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully! I will get back to you soon.",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ success: false, error: "Validation failed", details: error }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
  }
}
