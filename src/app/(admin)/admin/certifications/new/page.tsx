"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApiMutate } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/image-upload";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCertificationPage() {
  const router = useRouter();
  const { apiRequest } = useApiMutate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", issuer: "", issueDate: "", expiryDate: "", credentialId: "", credentialUrl: "", image: "", order: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiRequest("/api/certifications", "POST", {
        ...form,
        expiryDate: form.expiryDate || null,
      });
      toast({ title: "Success", description: "Certification created successfully" });
      router.push("/admin/certifications");
    } catch {} finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/certifications"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="text-3xl font-bold">New Certification</h1></div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Certification Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Issuer *</Label>
              <Input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Issue Date *</Label>
              <Input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Credential ID</Label>
              <Input value={form.credentialId} onChange={(e) => setForm({ ...form, credentialId: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Credential URL</Label>
              <Input value={form.credentialUrl} onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })} placeholder="https://" />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} folder="certifications" />
            </div>
            <div className="space-y-2">
              <Label>Order</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Certification
              </Button>
              <Link href="/admin/certifications"><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
