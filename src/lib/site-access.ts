import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

type SiteAccessTarget = {
  _id: {
    toString(): string;
  };
  publishStatus: "draft" | "published";
};

export async function canAccessPortfolioSite(site: SiteAccessTarget) {
  if (site.publishStatus === "published") {
    return true;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return false;
  }

  const payload = await verifyToken(token);
  return payload?.siteId === site._id.toString();
}
