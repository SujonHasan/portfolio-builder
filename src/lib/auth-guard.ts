import { NextRequest, NextResponse } from "next/server";
import { getAuthPayloadFromRequest } from "./auth";
import { connectDB } from "./db";
import User, { IUserDocument } from "@/models/User";
import { ISiteDocument } from "@/models/Site";
import { ensureUserSite } from "./site";

export interface AuthContext {
  userId: string;
  siteId: string;
  user: IUserDocument;
  site: ISiteDocument;
}

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, auth: AuthContext) => Promise<NextResponse>
): Promise<NextResponse> {
  const payload = await getAuthPayloadFromRequest(req);
  if (!payload) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  await connectDB();
  const fullUser = await User.findById(payload.userId);
  const user = fullUser ? await User.findById(payload.userId).select("-password") : null;

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - User not found" },
      { status: 401 }
    );
  }

  if (!fullUser) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - User not found" },
      { status: 401 }
    );
  }

  const site = await ensureUserSite(fullUser);
  return handler(req, {
    userId: payload.userId,
    siteId: site._id.toString(),
    user,
    site,
  });
}
