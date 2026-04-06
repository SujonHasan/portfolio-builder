import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { buildEmailLookup, normalizeEmail } from "@/lib/email-verification";
import { registerSchema } from "@/lib/validations";
import { createSiteForUser } from "@/lib/site";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);
    const normalizedEmail = normalizeEmail(email);

    await connectDB();

    const existingUser = await User.findOne(buildEmailLookup(normalizedEmail));
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists with this email" },
        { status: 400 }
      );
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: "editor",
      status: "active",
    });
    const site = await createSiteForUser(user);
    const token = await signToken(user._id.toString(), site._id.toString());

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
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
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
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
