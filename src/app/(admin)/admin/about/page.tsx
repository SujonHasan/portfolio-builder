"use client";

import { useState, useEffect } from "react";
import { useApi, useApiMutate } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/image-upload";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { FormSkeleton } from "@/components/admin/loading-skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RESUME_TEMPLATES } from "@/lib/resume-templates";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { ResumeTemplateKey } from "@/types";

interface StatItem {
  label: string;
  value: string;
}

interface AboutData {
  name: string;
  tagline: string;
  bio: string;
  heroDescription: string;
  profileImage: string;
  resumeUrl: string;
  resumeTemplate: ResumeTemplateKey;
  stats: StatItem[];
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
    facebook: string;
    website: string;
  };
}

function normalizeResumeTemplateValue(value: unknown): ResumeTemplateKey {
  if (typeof value !== "string") {
    return "classic";
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "compact" || normalized === "timeline") {
    return normalized;
  }

  return "classic";
}

export default function AboutPage() {
  const { data: about, isLoading: loading, mutate } = useApi<AboutData>("/api/about");
  const { apiRequest } = useApiMutate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<AboutData>({
    name: "",
    tagline: "",
    bio: "",
    heroDescription: "",
    profileImage: "",
    resumeUrl: "",
    resumeTemplate: "classic",
    stats: [],
    socialLinks: {
      github: "",
      linkedin: "",
      twitter: "",
      facebook: "",
      website: "",
    },
  });

  const activeResumeTemplate =
    RESUME_TEMPLATES.find((template) => template.id === form.resumeTemplate) || RESUME_TEMPLATES[0];

  useEffect(() => {
    if (about) {
      setForm({
        name: about.name || "",
        tagline: about.tagline || "",
        bio: about.bio || "",
        heroDescription: about.heroDescription || "",
        profileImage: about.profileImage || "",
        resumeUrl: about.resumeUrl || "",
        resumeTemplate: normalizeResumeTemplateValue(about.resumeTemplate),
        stats: about.stats || [],
        socialLinks: {
          github: about.socialLinks?.github || "",
          linkedin: about.socialLinks?.linkedin || "",
          twitter: about.socialLinks?.twitter || "",
          facebook: about.socialLinks?.facebook || "",
          website: about.socialLinks?.website || "",
        },
      });
    }
  }, [about]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await apiRequest("/api/about", "PUT", form);
      const saved = response.data as AboutData;
      setForm({
        name: saved.name || "",
        tagline: saved.tagline || "",
        bio: saved.bio || "",
        heroDescription: saved.heroDescription || "",
        profileImage: saved.profileImage || "",
        resumeUrl: saved.resumeUrl || "",
        resumeTemplate: normalizeResumeTemplateValue(saved.resumeTemplate),
        stats: saved.stats || [],
        socialLinks: {
          github: saved.socialLinks?.github || "",
          linkedin: saved.socialLinks?.linkedin || "",
          twitter: saved.socialLinks?.twitter || "",
          facebook: saved.socialLinks?.facebook || "",
          website: saved.socialLinks?.website || "",
        },
      });
      mutate({ ...saved, resumeTemplate: normalizeResumeTemplateValue(saved.resumeTemplate) }, false);
      toast({ title: "Success", description: "About section updated successfully" });
    } catch {
      // handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const addStat = () => {
    setForm({ ...form, stats: [...form.stats, { label: "", value: "" }] });
  };

  const removeStat = (index: number) => {
    setForm({ ...form, stats: form.stats.filter((_, i) => i !== index) });
  };

  const updateStat = (index: number, field: keyof StatItem, value: string) => {
    const updated = [...form.stats];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, stats: updated });
  };

  if (loading) return <FormSkeleton />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">About Section</h1>
        <p className="text-muted-foreground">Manage your about page content</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Hero Description</Label>
              <Textarea
                value={form.heroDescription}
                onChange={(e) => setForm({ ...form, heroDescription: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <RichTextEditor value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Profile Image</CardTitle></CardHeader>
          <CardContent>
            <ImageUpload
              value={form.profileImage}
              onChange={(v) => setForm({ ...form, profileImage: v })}
              folder="profile"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Resume</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Active Resume Template</Label>
              <Select
                key={form.resumeTemplate}
                value={form.resumeTemplate}
                onValueChange={(value: string) =>
                  setForm({ ...form, resumeTemplate: normalizeResumeTemplateValue(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select resume template">
                    {activeResumeTemplate?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {RESUME_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                The selected template will auto-generate your resume from portfolio data and power the frontend download button.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {RESUME_TEMPLATES.map((template) => {
                const isSelected = form.resumeTemplate === template.id;

                return (
                  <div
                    key={template.id}
                    className={`rounded-lg border p-4 space-y-3 ${isSelected ? "border-primary ring-1 ring-primary/30" : ""}`}
                  >
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          setForm({ ...form, resumeTemplate: normalizeResumeTemplateValue(template.id) })
                        }
                      >
                        {isSelected ? "Selected" : "Use Template"}
                      </Button>
                      <Button type="button" variant="ghost" size="sm" asChild>
                        <a
                          href={`/api/resume/download?template=${template.id}&preview=1`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Preview PDF
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <Label>Legacy Resume URL</Label>
              <Input
                value={form.resumeUrl}
                onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
                placeholder="Optional fallback external resume link"
              />
              <p className="text-sm text-muted-foreground">
                Optional fallback only. The generated PDF template is used first.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Stats</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addStat}>
                <Plus className="h-4 w-4 mr-1" /> Add Stat
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.stats.length === 0 && (
              <p className="text-sm text-muted-foreground">No stats added yet. Click &quot;Add Stat&quot; to get started.</p>
            )}
            {form.stats.map((stat, index) => (
              <div key={index} className="flex items-end gap-3">
                <div className="flex-1 space-y-2">
                  <Label>Label</Label>
                  <Input
                    value={stat.label}
                    onChange={(e) => updateStat(index, "label", e.target.value)}
                    placeholder="e.g. Years of Experience"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Value</Label>
                  <Input
                    value={stat.value}
                    onChange={(e) => updateStat(index, "value", e.target.value)}
                    placeholder="e.g. 5+"
                  />
                </div>
                <Button type="button" variant="destructive" size="icon" onClick={() => removeStat(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Social Links</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GitHub</Label>
                <Input
                  value={form.socialLinks.github}
                  onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, github: e.target.value } })}
                  placeholder="https://github.com/username"
                />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input
                  value={form.socialLinks.linkedin}
                  onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, linkedin: e.target.value } })}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="space-y-2">
                <Label>Twitter</Label>
                <Input
                  value={form.socialLinks.twitter}
                  onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, twitter: e.target.value } })}
                  placeholder="https://twitter.com/username"
                />
              </div>
              <div className="space-y-2">
                <Label>Facebook</Label>
                <Input
                  value={form.socialLinks.facebook}
                  onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, facebook: e.target.value } })}
                  placeholder="https://facebook.com/username"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={form.socialLinks.website}
                  onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, website: e.target.value } })}
                  placeholder="https://yourwebsite.com"
                />
              </div>
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
