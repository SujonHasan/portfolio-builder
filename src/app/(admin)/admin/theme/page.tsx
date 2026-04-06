"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PORTFOLIO_FALLBACK_NAME, PORTFOLIO_FALLBACK_TAGLINE } from "@/lib/brand";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormSkeleton } from "@/components/admin/loading-skeleton";
import { useApi, useApiMutate } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { PORTFOLIO_THEME_PRESETS } from "@/lib/portfolio-config";
import { IThemeSettings, ThemeBackgroundStyle, ThemeRadiusScale } from "@/types";

type ThemeForm = Pick<
  IThemeSettings,
  | "themePreset"
  | "primaryColor"
  | "accentColor"
  | "backgroundColor"
  | "surfaceColor"
  | "textColor"
  | "mutedColor"
  | "backgroundStyle"
  | "radiusScale"
  | "showThemeToggle"
>;

const BACKGROUND_OPTIONS: Array<{ id: ThemeBackgroundStyle; label: string }> = [
  { id: "none", label: "Plain" },
  { id: "glow", label: "Glow" },
  { id: "grid", label: "Grid" },
  { id: "dots", label: "Dots" },
];

const RADIUS_OPTIONS: Array<{ id: ThemeRadiusScale; label: string }> = [
  { id: "sharp", label: "Sharp" },
  { id: "rounded", label: "Rounded" },
  { id: "soft", label: "Soft" },
];

function getPresetForm(themePreset?: string): ThemeForm {
  const preset =
    PORTFOLIO_THEME_PRESETS.find((theme) => theme.id === themePreset) || PORTFOLIO_THEME_PRESETS[0];

  return {
    themePreset: preset.id,
    primaryColor: preset.primaryColor,
    accentColor: preset.accentColor,
    backgroundColor: preset.backgroundColor,
    surfaceColor: preset.surfaceColor,
    textColor: preset.textColor,
    mutedColor: preset.mutedColor,
    backgroundStyle: preset.backgroundStyle,
    radiusScale: preset.radiusScale,
    showThemeToggle: true,
  };
}

function normalizeTheme(input?: Partial<IThemeSettings> | null): ThemeForm {
  const presetDefaults = getPresetForm(input?.themePreset);

  return {
    ...presetDefaults,
    ...input,
    themePreset: presetDefaults.themePreset,
    showThemeToggle:
      typeof input?.showThemeToggle === "boolean" ? input.showThemeToggle : presetDefaults.showThemeToggle,
  };
}

export default function ThemeSettingsPage() {
  const { data, isLoading, mutate } = useApi<IThemeSettings>("/api/theme-settings");
  const { apiRequest } = useApiMutate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<ThemeForm>(() => getPresetForm());

  useEffect(() => {
    if (data) {
      setForm(normalizeTheme(data));
    }
  }, [data]);

  const applyPreset = (themePreset: ThemeForm["themePreset"]) => {
    setForm((current) => ({
      ...getPresetForm(themePreset),
      showThemeToggle: current.showThemeToggle,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiRequest("/api/theme-settings", "PUT", form);
      const saved = normalizeTheme(response.data as IThemeSettings);
      setForm(saved);
      mutate(saved as IThemeSettings, false);
      toast({
        title: "Success",
        description: "Theme settings updated successfully",
      });
    } catch {
      // handled centrally
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <FormSkeleton />;
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Theme Settings</h1>
        <p className="text-muted-foreground">
          Manage your portfolio look separately with presets, colors, background style, radius, and toggle visibility.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme Presets</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {PORTFOLIO_THEME_PRESETS.map((theme) => {
              const selected = form.themePreset === theme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => applyPreset(theme.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{theme.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{theme.description}</p>
                    </div>
                    <div className="flex gap-2">
                      {[theme.primaryColor, theme.accentColor, theme.backgroundColor].map((color) => (
                        <span
                          key={`${theme.id}-${color}`}
                          className="h-4 w-4 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Custom Theme Controls</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset(form.themePreset)}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset To Preset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(
                [
                  ["primaryColor", "Primary Color"],
                  ["accentColor", "Accent Color"],
                  ["backgroundColor", "Background Color"],
                  ["surfaceColor", "Surface Color"],
                  ["textColor", "Text Color"],
                  ["mutedColor", "Muted Text Color"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={form[key]}
                      onChange={(e) =>
                        setForm((current) => ({ ...current, [key]: e.target.value }))
                      }
                      className="h-11 w-16 p-1"
                    />
                    <Input
                      value={form[key]}
                      onChange={(e) =>
                        setForm((current) => ({ ...current, [key]: e.target.value }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label>Background Style</Label>
                <div className="grid grid-cols-2 gap-3">
                  {BACKGROUND_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({ ...current, backgroundStyle: option.id }))
                      }
                      className={`rounded-lg border px-4 py-3 text-sm transition ${
                        form.backgroundStyle === option.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Corner Style</Label>
                <div className="grid grid-cols-3 gap-3">
                  {RADIUS_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({ ...current, radiusScale: option.id }))
                      }
                      className={`rounded-lg border px-4 py-3 text-sm transition ${
                        form.radiusScale === option.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <p className="font-medium">Show Theme Toggle</p>
                <p className="text-sm text-muted-foreground">
                  Control whether visitors can switch between light and dark mode.
                </p>
              </div>
              <Switch
                checked={form.showThemeToggle}
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, showThemeToggle: checked }))
                }
              />
            </div>

            <div
              className="rounded-2xl border p-6"
              style={{
                backgroundColor: form.backgroundColor,
                color: form.textColor,
                borderColor: form.accentColor,
                borderRadius:
                  form.radiusScale === "soft"
                    ? "1rem"
                    : form.radiusScale === "sharp"
                    ? "0.2rem"
                    : "0.65rem",
              }}
            >
              <div
                className="rounded-xl p-5"
                style={{
                  backgroundColor: form.surfaceColor,
                  borderRadius:
                    form.radiusScale === "soft"
                      ? "0.85rem"
                      : form.radiusScale === "sharp"
                      ? "0.15rem"
                      : "0.55rem",
                }}
              >
                <p className="text-sm" style={{ color: form.mutedColor }}>
                  Theme preview
                </p>
                <h3 className="mt-2 text-2xl font-bold">{PORTFOLIO_FALLBACK_NAME}</h3>
                <p className="mt-2 max-w-xl text-sm" style={{ color: form.mutedColor }}>
                  {PORTFOLIO_FALLBACK_TAGLINE} building modern interfaces, robust APIs, and
                  polished portfolio experiences.
                </p>
                <div className="mt-4 flex gap-3">
                  <span
                    className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium"
                    style={{ backgroundColor: form.primaryColor, color: "#ffffff" }}
                  >
                    Primary Action
                  </span>
                  <span
                    className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium"
                    style={{ backgroundColor: form.accentColor, color: form.textColor }}
                  >
                    Accent Surface
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Theme Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
