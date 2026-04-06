import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth } from "@/lib/auth-guard";
import { certificationSchema } from "@/lib/validations";
import Certification from "@/models/Certification";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  return withAuth(req, async (_request, auth) => {
    try {
      const { id } = await context.params;
      await connectDB();
      const cert = await Certification.findOne({ _id: id, siteId: auth.siteId });
      if (!cert) return NextResponse.json({ success: false, error: "Certification not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: cert });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to fetch certification" }, { status: 500 });
    }
  });
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return withAuth(req, async (request, auth) => {
    try {
      const { id } = await context.params;
      const body = await request.json();
      const validated = certificationSchema.partial().parse(body);
      await connectDB();
      const cert = await Certification.findOneAndUpdate({ _id: id, siteId: auth.siteId }, validated, { new: true });
      if (!cert) return NextResponse.json({ success: false, error: "Certification not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: cert });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ success: false, error: "Validation failed", details: error }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: "Failed to update certification" }, { status: 500 });
    }
  });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return withAuth(req, async (_request, auth) => {
    try {
      const { id } = await context.params;
      await connectDB();
      const cert = await Certification.findOneAndDelete({ _id: id, siteId: auth.siteId });
      if (!cert) return NextResponse.json({ success: false, error: "Certification not found" }, { status: 404 });
      return NextResponse.json({ success: true, message: "Certification deleted" });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to delete certification" }, { status: 500 });
    }
  });
}
