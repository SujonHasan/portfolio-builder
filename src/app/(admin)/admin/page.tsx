"use client";

import Link from "next/link";
import { FolderKanban, Wrench, Briefcase, Eye, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";
import { DashboardSkeleton } from "@/components/admin/loading-skeleton";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IProject } from "@/types";

interface AnalyticsData {
  totalProjects: number;
  totalSkills: number;
  totalExperience: number;
  totalViews: number;
  todayViews: number;
  viewsOverTime: { date: string; views: number }[];
}

export default function DashboardPage() {
  const { site } = useAuth();
  const { data: analytics, isLoading: loadingAnalytics } = useApi<AnalyticsData>("/api/analytics");
  const { data: projects } = useApi<IProject[]>("/api/projects");
  const publicProfileUrl = site?.username ? `/${site.username}` : "";

  if (loadingAnalytics) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s an overview.</p>
        </div>
        {publicProfileUrl ? (
          <Button asChild>
            <Link href={publicProfileUrl} target="_blank" rel="noopener noreferrer">
              Visit Profile
            </Link>
          </Button>
        ) : null}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Projects"
          value={analytics?.totalProjects || 0}
          icon={FolderKanban}
        />
        <StatsCard
          title="Total Skills"
          value={analytics?.totalSkills || 0}
          icon={Wrench}
        />
        <StatsCard
          title="Experience"
          value={analytics?.totalExperience || 0}
          icon={Briefcase}
        />
        <StatsCard
          title="Total Views"
          value={analytics?.totalViews || 0}
          icon={Eye}
          description={`${analytics?.todayViews || 0} today`}
        />
      </div>

      {/* Views Chart */}
      {analytics?.viewsOverTime && analytics.viewsOverTime.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Views (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32">
              {analytics.viewsOverTime.map((item, i) => {
                const maxViews = Math.max(...analytics.viewsOverTime.map((v) => v.views));
                const height = maxViews > 0 ? (item.views / maxViews) * 100 : 0;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-primary/80 rounded-t hover:bg-primary transition-colors"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${item.date}: ${item.views} views`}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects && projects.length > 0 ? (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.technologies.slice(0, 3).join(", ")}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      project.status === "published"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No projects yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
