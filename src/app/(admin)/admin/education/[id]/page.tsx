"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi, useApiMutate } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { IEducation } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { FormSkeleton } from "@/components/admin/loading-skeleton";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditEducationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: edu, isLoading: loading } = useApi<IEducation>(`/api/education/${params.id}`);
  const { apiRequest } = useApiMutate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    institution: "", degree: "", field: "", description: "", startDate: "", endDate: "", current: false, grade: "", order: 0,
  });

  useEffect(() => {
    if (edu) setForm({
      institution: edu.institution, degree: edu.degree, field: edu.field, description: edu.description,
      startDate: edu.startDate ? new Date(edu.startDate).toISOString().split("T")[0] : "",
      endDate: edu.endDate ? new Date(edu.endDate).toISOString().split("T")[0] : "",
      current: edu.current, grade: edu.grade, order: edu.order,
    });
  }, [edu]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/education/${params.id}`, "PUT", {
        ...form, endDate: form.current ? null : form.endDate || null,
      });
      toast({ title: "Success", description: "Education updated" });
      router.push("/admin/education");
    } catch {} finally { setIsSubmitting(false); }
  };

  if (loading) return <FormSkeleton />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/education"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-3xl font-bold">Edit Education</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Education Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Institution *</Label><Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Degree *</Label><Input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Field of Study</Label><Input value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} /></div>
              <div className="space-y-2"><Label>Grade</Label><Input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Start Date *</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
              <div className="space-y-2"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} disabled={form.current} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.current} onCheckedChange={(v) => setForm({ ...form, current: v, endDate: v ? "" : form.endDate })} /><Label>Currently studying here</Label></div>
            <div className="space-y-2"><Label>Description</Label><RichTextEditor value={form.description} onChange={(v) => setForm({ ...form, description: v })} /></div>
            <div className="space-y-2"><Label>Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} /></div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update</Button>
              <Link href="/admin/education"><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
