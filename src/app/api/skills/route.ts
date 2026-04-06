import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth } from "@/lib/auth-guard";
import { skillSchema } from "@/lib/validations";
import Skill from "@/models/Skill";

export async function GET(req: NextRequest) {
  return withAuth(req, async (_request, auth) => {
    try {
      await connectDB();
      const skills = await Skill.find({ siteId: auth.siteId }).sort({ order: 1, category: 1 });
      return NextResponse.json({ success: true, data: skills });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to fetch skills" }, { status: 500 });
    }
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (request, auth) => {
    try {
      const body = await request.json();
      const validated = skillSchema.parse(body);
      await connectDB();
      const skill = await Skill.create({ ...validated, siteId: auth.siteId });
      return NextResponse.json({ success: true, data: skill }, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ success: false, error: "Validation failed", details: error }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: "Failed to create skill" }, { status: 500 });
    }
  });
}
