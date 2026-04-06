import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth } from "@/lib/auth-guard";
import { contactSchema } from "@/lib/validations";
import Contact from "@/models/Contact";

export async function GET(req: NextRequest) {
  return withAuth(req, async (_request, auth) => {
    try {
      await connectDB();
      const contact = await Contact.findOne({ siteId: auth.siteId });
      return NextResponse.json({ success: true, data: contact });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to fetch contact" }, { status: 500 });
    }
  });
}

export async function PUT(req: NextRequest) {
  return withAuth(req, async (request, auth) => {
    try {
      const body = await request.json();
      const validated = contactSchema.parse(body);
      await connectDB();
      const contact = await Contact.findOneAndUpdate({ siteId: auth.siteId }, { ...validated, siteId: auth.siteId }, {
        new: true,
        upsert: true,
        runValidators: true,
      });
      return NextResponse.json({ success: true, data: contact });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ success: false, error: "Validation failed", details: error }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: "Failed to update contact" }, { status: 500 });
    }
  });
}
