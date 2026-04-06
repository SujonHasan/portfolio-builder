"use client";

import { useState, useEffect } from "react";
import { useApi, useApiMutate } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/image-upload";
import { FormSkeleton } from "@/components/admin/loading-skeleton";
import { Loader2, Info } from "lucide-react";

interface SeoData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage: string;
  autoGenerate: boolean;
}

export default function SeoPage() {
  const { data: seo, isLoading: loading } = useApi<SeoData>("/api/seo");
  const { apiRequest } = useApiMutate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    ogImage: "",
    autoGenerate: false,
  });

  useEffect(() => {
    if (seo) {
      setForm({
        metaTitle: seo.metaTitle || "",
        metaDescription: seo.metaDescription || "",
        keywords: Array.isArray(seo.keywords) ? seo.keywords.join(", ") : "",
        ogImage: seo.ogImage || "",
        autoGenerate: seo.autoGenerate || false,
      });
    }
  }, [seo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest("/api/seo", "PUT", {
        ...form,
        page: "home",
        keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean),
      });
      toast({ title: "Success", description: "SEO settings updated successfully" });
    } catch {
      // handled
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <FormSkeleton />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">SEO Settings</h1>
        <p className="text-muted-foreground">Manage search engine optimization settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Meta Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Meta Title</Label>
              <Input
                value={form.metaTitle}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                placeholder="Your portfolio title"
              />
            </div>
            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Textarea
                value={form.metaDescription}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                placeholder="A brief description of your portfolio"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Keywords (comma-separated)</Label>
              <Input
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                placeholder="developer, portfolio, web development"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Open Graph Image</CardTitle></CardHeader>
          <CardContent>
            <ImageUpload
              value={form.ogImage}
              onChange={(v) => setForm({ ...form, ogImage: v })}
              folder="seo"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Auto Generation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={form.autoGenerate}
                onCheckedChange={(v) => setForm({ ...form, autoGenerate: v })}
              />
              <Label>Auto-generate SEO content</Label>
            </div>
            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">
                When auto-generate is enabled, SEO content will be automatically generated from your portfolio data.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
