"use client";

import { useState, useEffect } from "react";
import { useApi, useApiMutate } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSkeleton } from "@/components/admin/loading-skeleton";
import { Loader2 } from "lucide-react";

interface ContactData {
  email: string;
  phone: string;
  address: string;
  mapEmbedUrl: string;
  availability: string;
}

export default function ContactPage() {
  const { data: contact, isLoading: loading } = useApi<ContactData>("/api/contact");
  const { apiRequest } = useApiMutate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<ContactData>({
    email: "",
    phone: "",
    address: "",
    mapEmbedUrl: "",
    availability: "",
  });

  useEffect(() => {
    if (contact) {
      setForm({
        email: contact.email || "",
        phone: contact.phone || "",
        address: contact.address || "",
        mapEmbedUrl: contact.mapEmbedUrl || "",
        availability: contact.availability || "",
      });
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest("/api/contact", "PUT", form);
      toast({ title: "Success", description: "Contact info updated successfully" });
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
        <h1 className="text-3xl font-bold">Contact Info</h1>
        <p className="text-muted-foreground">Manage your contact information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Contact Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Your address"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Map Embed URL</Label>
              <Input
                value={form.mapEmbedUrl}
                onChange={(e) => setForm({ ...form, mapEmbedUrl: e.target.value })}
                placeholder="https://www.google.com/maps/embed?..."
              />
            </div>
            <div className="space-y-2">
              <Label>Availability</Label>
              <Input
                value={form.availability}
                onChange={(e) => setForm({ ...form, availability: e.target.value })}
                placeholder="e.g. Available for freelance work"
              />
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
