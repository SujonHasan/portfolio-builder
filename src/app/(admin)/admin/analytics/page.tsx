"use client";

import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/admin/stats-card";
import { DashboardSkeleton } from "@/components/admin/loading-skeleton";
import { Eye, TrendingUp, FolderOpen, Wrench } from "lucide-react";

interface ViewOverTime {
  date: string;
  views: number;
}

interface ViewPerPage {
  page: string;
  views: number;
}

interface AnalyticsData {
  totalViews: number;
  todayViews: number;
  totalProjects: number;
  totalSkills: number;
  viewsOverTime: ViewOverTime[];
  viewsPerPage: ViewPerPage[];
}

export default function AnalyticsPage() {
  const { data: analytics, isLoading: loading } = useApi<AnalyticsData>("/api/analytics");

  if (loading) return <DashboardSkeleton />;

  const maxViews = analytics?.viewsOverTime
    ? Math.max(...analytics.viewsOverTime.map((v) => v.views), 1)
    : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Overview of your portfolio performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Views"
          value={analytics?.totalViews ?? 0}
          icon={Eye}
          description="All time page views"
        />
        <StatsCard
          title="Today Views"
          value={analytics?.todayViews ?? 0}
          icon={TrendingUp}
          description="Views today"
        />
        <StatsCard
          title="Total Projects"
          value={analytics?.totalProjects ?? 0}
          icon={FolderOpen}
          description="Published projects"
        />
        <StatsCard
          title="Total Skills"
          value={analytics?.totalSkills ?? 0}
          icon={Wrench}
          description="Listed skills"
        />
      </div>

      <Card>
        <CardHeader><CardTitle>Views Over Time</CardTitle></CardHeader>
        <CardContent>
          {analytics?.viewsOverTime && analytics.viewsOverTime.length > 0 ? (
            <div className="flex items-end gap-1 h-64">
              {analytics.viewsOverTime.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{item.views}</span>
                  <div
                    className="w-full bg-primary rounded-t min-h-[4px]"
                    style={{ height: `${(item.views / maxViews) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground truncate w-full text-center">
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No data available yet</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Views Per Page</CardTitle></CardHeader>
        <CardContent>
          {analytics?.viewsPerPage && analytics.viewsPerPage.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Page</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.viewsPerPage.map((item, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3 px-4">{item.page}</td>
                      <td className="py-3 px-4 text-right font-medium">{item.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No data available yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
