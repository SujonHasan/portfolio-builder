import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth } from "@/lib/auth-guard";
import { skillSchema } from "@/lib/validations";
import Skill from "@/models/Skill";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  return withAuth(req, async (_request, auth) => {
    try {
      const { id } = await context.params;
      await connectDB();
      const skill = await Skill.findOne({ _id: id, siteId: auth.siteId });
      if (!skill) return NextResponse.json({ success: false, error: "Skill not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: skill });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to fetch skill" }, { status: 500 });
    }
  });
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return withAuth(req, async (request, auth) => {
    try {
      const { id } = await context.params;
      const body = await request.json();
      const validated = skillSchema.partial().parse(body);
      await connectDB();
      const skill = await Skill.findOneAndUpdate({ _id: id, siteId: auth.siteId }, validated, { new: true });
      if (!skill) return NextResponse.json({ success: false, error: "Skill not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: skill });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ success: false, error: "Validation failed", details: error }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: "Failed to update skill" }, { status: 500 });
    }
  });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return withAuth(req, async (_request, auth) => {
    try {
      const { id } = await context.params;
      await connectDB();
      const skill = await Skill.findOneAndDelete({ _id: id, siteId: auth.siteId });
      if (!skill) return NextResponse.json({ success: false, error: "Skill not found" }, { status: 404 });
      return NextResponse.json({ success: true, message: "Skill deleted" });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to delete skill" }, { status: 500 });
    }
  });
}
