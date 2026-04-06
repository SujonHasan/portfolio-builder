import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth } from "@/lib/auth-guard";
import Analytics from "@/models/Analytics";
import Project from "@/models/Project";
import Skill from "@/models/Skill";
import Experience from "@/models/Experience";

export async function GET(req: NextRequest) {
  return withAuth(req, async (_request, auth) => {
    try {
      await connectDB();

      const totalProjects = await Project.countDocuments({ siteId: auth.siteId });
      const totalSkills = await Skill.countDocuments({ siteId: auth.siteId });
      const totalExperience = await Experience.countDocuments({ siteId: auth.siteId });

      const totalViews = await Analytics.aggregate([
        { $match: { siteId: auth.site._id } },
        { $group: { _id: null, total: { $sum: "$views" } } },
      ]);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayViews = await Analytics.aggregate([
        { $match: { siteId: auth.site._id, date: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: "$views" } } },
      ]);

      // Last 30 days views
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const viewsOverTime = await Analytics.aggregate([
        { $match: { siteId: auth.site._id, date: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            views: { $sum: "$views" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Views per page
      const viewsPerPage = await Analytics.aggregate([
        { $match: { siteId: auth.site._id } },
        { $group: { _id: "$page", views: { $sum: "$views" } } },
        { $sort: { views: -1 } },
      ]);

      return NextResponse.json({
        success: true,
        data: {
          totalProjects,
          totalSkills,
          totalExperience,
          totalViews: totalViews[0]?.total || 0,
          todayViews: todayViews[0]?.total || 0,
          viewsOverTime: viewsOverTime.map((v: { _id: string; views: number }) => ({
            date: v._id,
            views: v.views,
          })),
          viewsPerPage: viewsPerPage.map((v: { _id: string; views: number }) => ({
            page: v._id,
            views: v.views,
          })),
        },
      });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 });
    }
  });
}
