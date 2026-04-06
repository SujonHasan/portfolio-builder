"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi, useApiMutate } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { ICertification } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/image-upload";
import { FormSkeleton } from "@/components/admin/loading-skeleton";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditCertificationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: certification, isLoading: loading } = useApi<ICertification>(`/api/certifications/${params.id}`);
  const { apiRequest } = useApiMutate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", issuer: "", issueDate: "", expiryDate: "", credentialId: "", credentialUrl: "", image: "", order: 0 });

  useEffect(() => {
    if (certification) setForm({
      title: certification.title,
      issuer: certification.issuer,
      issueDate: certification.issueDate ? new Date(certification.issueDate).toISOString().split("T")[0] : "",
      expiryDate: certification.expiryDate ? new Date(certification.expiryDate).toISOString().split("T")[0] : "",
      credentialId: certification.credentialId || "",
      credentialUrl: certification.credentialUrl || "",
      image: certification.image || "",
      order: certification.order,
    });
  }, [certification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/certifications/${params.id}`, "PUT", {
        ...form,
        expiryDate: form.expiryDate || null,
      });
      toast({ title: "Success", description: "Certification updated" });
      router.push("/admin/certifications");
    } catch {} finally { setIsSubmitting(false); }
  };

  if (loading) return <FormSkeleton />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/certifications"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-3xl font-bold">Edit Certification</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Certification Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Issuer *</Label><Input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Issue Date *</Label><Input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></div>
            <div className="space-y-2"><Label>Credential ID</Label><Input value={form.credentialId} onChange={(e) => setForm({ ...form, credentialId: e.target.value })} /></div>
            <div className="space-y-2"><Label>Credential URL</Label><Input value={form.credentialUrl} onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })} placeholder="https://" /></div>
            <div className="space-y-2"><Label>Image</Label><ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} folder="certifications" /></div>
            <div className="space-y-2"><Label>Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} /></div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Certification</Button>
              <Link href="/admin/certifications"><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
