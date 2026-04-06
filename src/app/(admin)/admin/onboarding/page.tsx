"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useApiMutate } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { PORTFOLIO_THEME_PRESETS } from "@/lib/portfolio-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, site, isLoading, needsOnboarding } = useAuth();
  const { apiRequest } = useApiMutate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    username: "",
    siteTitle: "",
    themePreset: "default",
  });

  useEffect(() => {
    if (user || site) {
      setForm((current) => ({
        ...current,
        name: user?.name || current.name,
        username: site?.username || current.username,
        siteTitle: site?.title || `${user?.name || "My"} Portfolio`,
      }));
    }
  }, [site, user]);

  useEffect(() => {
    if (!isLoading && !needsOnboarding) {
      router.replace("/admin");
    }
  }, [isLoading, needsOnboarding, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await apiRequest("/api/onboarding", "POST", form);
      toast({ title: "Setup complete", description: "Your portfolio workspace is ready." });
      router.replace("/admin");
    } catch {
      // handled centrally
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Welcome to your portfolio workspace</CardTitle>
          <CardDescription>
            Set your public username, site title, and starter theme before publishing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  placeholder="Full Stack Developer"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
                  placeholder="sujon"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Site Title</Label>
                <Input
                  value={form.siteTitle}
                  onChange={(e) => setForm({ ...form, siteTitle: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Starter Theme</Label>
              <div className="grid gap-3 md:grid-cols-2">
                {PORTFOLIO_THEME_PRESETS.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setForm({ ...form, themePreset: theme.id })}
                    className={`rounded-lg border p-4 text-left ${
                      form.themePreset === theme.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border"
                    }`}
                  >
                    <p className="font-medium">{theme.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{theme.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Finish Setup
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
