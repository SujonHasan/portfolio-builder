"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useApi, useApiMutate } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormSkeleton } from "@/components/admin/loading-skeleton";

interface SiteData {
  _id: string;
  username: string;
  subdomain: string;
  title: string;
  publishStatus: "draft" | "published";
}

export default function PublishSettingsPage() {
  const { data: site, isLoading } = useApi<SiteData>("/api/site");
  const { apiRequest } = useApiMutate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: "",
    title: "",
    publishStatus: false,
  });

  useEffect(() => {
    if (site) {
      setForm({
        username: site.username || "",
        title: site.title || "",
        publishStatus: site.publishStatus === "published",
      });
    }
  }, [site]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const siteResponse = await apiRequest("/api/site", "PUT", {
        username: form.username,
        title: form.title,
      });
      await apiRequest("/api/publish-settings", "PUT", {
        publishStatus: form.publishStatus ? "published" : "draft",
      });

      const savedSite = siteResponse.data as SiteData | undefined;
      const savedUsername = savedSite?.username || form.username;
      const savedTitle = savedSite?.title || form.title;

      setForm((current) => ({
        ...current,
        username: savedUsername,
        title: savedTitle,
      }));

      toast({
        title: "Saved",
        description:
          savedUsername === form.username
            ? "Publish settings updated successfully."
            : `Username was already taken. Your profile URL is now saved as ${savedUsername}.`,
      });
    } catch {
      // handled centrally
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <FormSkeleton />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Publish Settings</h1>
        <p className="text-muted-foreground">
          Manage your public subdomain, site title, and publish status.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Site Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Site Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Username / Subdomain</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Published</p>
                <p className="text-sm text-muted-foreground">
                  Turn this on when you want the subdomain portfolio to be public.
                </p>
              </div>
              <Switch
                checked={form.publishStatus}
                onCheckedChange={(checked) => setForm({ ...form, publishStatus: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Publish Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
