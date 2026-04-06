"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi, useApiMutate } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { IProject } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/image-upload";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { FormSkeleton } from "@/components/admin/loading-skeleton";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { data: project, isLoading: loading } = useApi<IProject>(`/api/projects/${params.id}`);
  const { apiRequest } = useApiMutate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    description: "",
    thumbnail: "",
    technologies: "",
    category: "web",
    liveUrl: "",
    githubUrl: "",
    featured: false,
    status: "published",
    order: 0,
  });

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title,
        shortDescription: project.shortDescription,
        description: project.description,
        thumbnail: project.thumbnail,
        technologies: project.technologies.join(", "),
        category: project.category,
        liveUrl: project.liveUrl,
        githubUrl: project.githubUrl,
        featured: project.featured,
        status: project.status,
        order: project.order,
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/projects/${params.id}`, "PUT", {
        ...form,
        technologies: form.technologies.split(",").map((t) => t.trim()).filter(Boolean),
      });
      toast({ title: "Success", description: "Project updated successfully" });
      router.push("/admin/projects");
    } catch {
      // handled
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <FormSkeleton />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/projects">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground">Update project details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Short Description</Label>
              <Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <RichTextEditor value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Media</CardTitle></CardHeader>
          <CardContent>
            <Label>Thumbnail</Label>
            <ImageUpload value={form.thumbnail} onChange={(v) => setForm({ ...form, thumbnail: v })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Technologies (comma-separated)</Label>
              <Input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="fullstack">Full Stack</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Live URL</Label>
                <Input value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>GitHub URL</Label>
                <Input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Order</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <Label>Featured Project</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Project
          </Button>
          <Link href="/admin/projects"><Button type="button" variant="outline">Cancel</Button></Link>
        </div>
      </form>
    </div>
  );
}
