"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormSkeleton } from "@/components/admin/loading-skeleton";
import { useApi, useApiMutate } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import {
  DEFAULT_ENABLED_PORTFOLIO_SECTIONS,
  DEFAULT_PORTFOLIO_SECTION_ORDER,
  PORTFOLIO_SECTIONS,
} from "@/lib/portfolio-config";
import { IPortfolioSettings, PortfolioSectionKey } from "@/types";

type PortfolioSettingsForm = {
  enabledSections: PortfolioSectionKey[];
  sectionOrder: PortfolioSectionKey[];
};

function normalizeSettings(
  input?: Partial<IPortfolioSettings> | null
): PortfolioSettingsForm {
  const rawOrder = Array.isArray(input?.sectionOrder)
    ? input.sectionOrder.filter((section): section is PortfolioSectionKey =>
        DEFAULT_PORTFOLIO_SECTION_ORDER.includes(section as PortfolioSectionKey)
      )
    : DEFAULT_PORTFOLIO_SECTION_ORDER;

  const sectionOrder = Array.from(
    new Set([
      ...rawOrder,
      ...DEFAULT_PORTFOLIO_SECTION_ORDER.filter((section) => !rawOrder.includes(section)),
    ])
  ) as PortfolioSectionKey[];

  const enabledSections = Array.from(
    new Set(
      (Array.isArray(input?.enabledSections)
        ? input.enabledSections.filter((section): section is PortfolioSectionKey =>
            sectionOrder.includes(section as PortfolioSectionKey)
          )
        : DEFAULT_ENABLED_PORTFOLIO_SECTIONS) as PortfolioSectionKey[]
    )
  );

  return {
    enabledSections,
    sectionOrder,
  };
}

export default function PortfolioCustomizePage() {
  const { data, isLoading, mutate } = useApi<IPortfolioSettings>("/api/portfolio-settings");
  const { apiRequest } = useApiMutate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<PortfolioSettingsForm>(() => normalizeSettings());

  useEffect(() => {
    if (data) {
      setForm(normalizeSettings(data));
    }
  }, [data]);

  const moveSection = (sectionId: PortfolioSectionKey, direction: "up" | "down") => {
    setForm((current) => {
      const index = current.sectionOrder.indexOf(sectionId);
      if (index === -1) return current;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.sectionOrder.length) {
        return current;
      }

      const nextOrder = [...current.sectionOrder];
      [nextOrder[index], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[index]];

      return {
        ...current,
        sectionOrder: nextOrder,
      };
    });
  };

  const toggleSection = (sectionId: PortfolioSectionKey, checked: boolean) => {
    setForm((current) => {
      const enabled = checked
        ? Array.from(new Set([...current.enabledSections, sectionId]))
        : current.enabledSections.filter((item) => item !== sectionId);

      return {
        ...current,
        enabledSections: enabled,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiRequest("/api/portfolio-settings", "PUT", form);
      const saved = normalizeSettings(response.data as IPortfolioSettings);
      setForm(saved);
      mutate(saved as IPortfolioSettings, false);
      toast({
        title: "Success",
        description: "Portfolio settings updated successfully",
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
        <h1 className="text-3xl font-bold">Section Settings</h1>
        <p className="text-muted-foreground">
          Choose which portfolio sections are visible on the frontend and control their order.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Section Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.sectionOrder.map((sectionId, index) => {
              const section = PORTFOLIO_SECTIONS.find((item) => item.id === sectionId);
              if (!section) return null;

              const checked = form.enabledSections.includes(sectionId);

              return (
                <div
                  key={sectionId}
                  className="flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col gap-2 pt-0.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveSection(sectionId, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveSection(sectionId, "down")}
                        disabled={index === form.sectionOrder.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{section.label}</p>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {index + 1}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Label htmlFor={`section-${sectionId}`} className="text-sm">
                      {checked ? "Visible" : "Hidden"}
                    </Label>
                    <Switch
                      id={`section-${sectionId}`}
                      checked={checked}
                      onCheckedChange={(value) => toggleSection(sectionId, value)}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Section Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
