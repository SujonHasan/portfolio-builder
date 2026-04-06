"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi, useApiMutate } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { IExperience } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { FormSkeleton } from "@/components/admin/loading-skeleton";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const { data: exp, isLoading: loading } = useApi<IExperience>(`/api/experience/${params.id}`);
  const { apiRequest } = useApiMutate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    company: "", position: "", description: "", startDate: "", endDate: "", current: false, location: "", companyUrl: "", technologies: "", order: 0,
  });

  useEffect(() => {
    if (exp) setForm({
      company: exp.company, position: exp.position, description: exp.description,
      startDate: exp.startDate ? new Date(exp.startDate).toISOString().split("T")[0] : "",
      endDate: exp.endDate ? new Date(exp.endDate).toISOString().split("T")[0] : "",
      current: exp.current, location: exp.location, companyUrl: exp.companyUrl,
      technologies: exp.technologies.join(", "), order: exp.order,
    });
  }, [exp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/experience/${params.id}`, "PUT", {
        ...form, endDate: form.current ? null : form.endDate || null,
        technologies: form.technologies.split(",").map((t) => t.trim()).filter(Boolean),
      });
      toast({ title: "Success", description: "Experience updated" });
      router.push("/admin/experience");
    } catch {} finally { setIsSubmitting(false); }
  };

  if (loading) return <FormSkeleton />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/experience"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-3xl font-bold">Edit Experience</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Experience Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Position *</Label><Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Company *</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div className="space-y-2"><Label>Company URL</Label><Input value={form.companyUrl} onChange={(e) => setForm({ ...form, companyUrl: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Start Date *</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
              <div className="space-y-2"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} disabled={form.current} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.current} onCheckedChange={(v) => setForm({ ...form, current: v, endDate: v ? "" : form.endDate })} /><Label>Currently working here</Label></div>
            <div className="space-y-2"><Label>Description</Label><RichTextEditor value={form.description} onChange={(v) => setForm({ ...form, description: v })} /></div>
            <div className="space-y-2"><Label>Technologies</Label><Input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} /></div>
            <div className="space-y-2"><Label>Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} /></div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update</Button>
              <Link href="/admin/experience"><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
