import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { ensureUserSite } from "@/lib/site";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const payload = await getAuthPayloadFromRequest(req);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const site = await ensureUserSite(user);
    const safeUser = await User.findById(payload.userId).select("-password");

    return NextResponse.json({ success: true, data: { ...safeUser?.toObject(), site } });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
