import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { buildEmailLookup, normalizeEmail } from "@/lib/email-verification";
import { loginSchema } from "@/lib/validations";
import { ensureUserSite } from "@/lib/site";
import User from "@/models/User";

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("token");
  return response;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);
    const normalizedEmail = normalizeEmail(email);

    await connectDB();

    const user = await User.findOne(buildEmailLookup(normalizedEmail));
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.status !== "active") {
      user.status = "active";
      await user.save();
    }

    const site = await ensureUserSite(user);
    const token = await signToken(user._id.toString(), site._id.toString());

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          primarySiteId: user.primarySiteId,
        },
        site,
        needsOnboarding: false,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
