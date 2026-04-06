"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi, useApiMutate } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { ISkill } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSkeleton } from "@/components/admin/loading-skeleton";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditSkillPage() {
  const params = useParams();
  const router = useRouter();
  const { data: skill, isLoading: loading } = useApi<ISkill>(`/api/skills/${params.id}`);
  const { apiRequest } = useApiMutate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<{ name: string; category: "frontend" | "backend" | "database" | "tools" | "other"; proficiency: number; icon: string; order: number }>({ name: "", category: "frontend", proficiency: 50, icon: "", order: 0 });

  useEffect(() => {
    if (skill) setForm({ name: skill.name, category: skill.category, proficiency: skill.proficiency, icon: skill.icon, order: skill.order });
  }, [skill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/skills/${params.id}`, "PUT", form);
      toast({ title: "Success", description: "Skill updated" });
      router.push("/admin/skills");
    } catch {} finally { setIsSubmitting(false); }
  };

  if (loading) return <FormSkeleton />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/skills"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-3xl font-bold">Edit Skill</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Skill Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v: "frontend" | "backend" | "database" | "tools" | "other") => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Proficiency ({form.proficiency}%)</Label>
              <input type="range" min={0} max={100} value={form.proficiency} onChange={(e) => setForm({ ...form, proficiency: parseInt(e.target.value) })} className="w-full" />
            </div>
            <div className="space-y-2"><Label>Icon</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
            <div className="space-y-2"><Label>Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} /></div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Skill</Button>
              <Link href="/admin/skills"><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
