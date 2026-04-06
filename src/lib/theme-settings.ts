import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { PORTFOLIO_THEME_PRESETS } from "@/lib/portfolio-config";
import {
  IThemeSettings,
  PortfolioThemePreset,
  ThemeBackgroundStyle,
  ThemeRadiusScale,
} from "@/types";

type ThemeSettingsRecord = Record<string, unknown> & {
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  siteId?: mongoose.Types.ObjectId;
};

type ThemeSettingsShape = Pick<
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

const HEX_COLOR_REGEX = /^#([0-9a-f]{6})$/i;

async function getThemeSettingsCollection() {
  const connection = await connectDB();
  return connection.connection.db!.collection<ThemeSettingsRecord>("theme_settings");
}

function getThemePresetConfig(themePreset?: string | null) {
  return (
    PORTFOLIO_THEME_PRESETS.find((theme) => theme.id === themePreset) ||
    PORTFOLIO_THEME_PRESETS[0]
  );
}

function normalizeHexColor(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim();
  return HEX_COLOR_REGEX.test(normalized) ? normalized.toLowerCase() : fallback;
}

export function normalizeThemeSettings(input?: Partial<IThemeSettings> | null): ThemeSettingsShape {
  const preset = getThemePresetConfig(input?.themePreset);
  const backgroundStyle: ThemeBackgroundStyle =
    input?.backgroundStyle === "glow" ||
    input?.backgroundStyle === "grid" ||
    input?.backgroundStyle === "dots"
      ? input.backgroundStyle
      : "none";

  const radiusScale: ThemeRadiusScale =
    input?.radiusScale === "soft" ||
    input?.radiusScale === "sharp"
      ? input.radiusScale
      : "rounded";

  return {
    themePreset: preset.id as PortfolioThemePreset,
    primaryColor: normalizeHexColor(input?.primaryColor, preset.primaryColor),
    accentColor: normalizeHexColor(input?.accentColor, preset.accentColor),
    backgroundColor: normalizeHexColor(input?.backgroundColor, preset.backgroundColor),
    surfaceColor: normalizeHexColor(input?.surfaceColor, preset.surfaceColor),
    textColor: normalizeHexColor(input?.textColor, preset.textColor),
    mutedColor: normalizeHexColor(input?.mutedColor, preset.mutedColor),
    backgroundStyle,
    radiusScale,
    showThemeToggle: typeof input?.showThemeToggle === "boolean" ? input.showThemeToggle : true,
  };
}

export async function getThemeSettingsBySiteId(siteId: string) {
  const collection = await getThemeSettingsCollection();
  const existing = (await collection.findOne(
    { siteId: new mongoose.Types.ObjectId(siteId) },
    { sort: { updatedAt: -1, createdAt: -1 } }
  )) as IThemeSettings | null;

  if (!existing) {
    return {
      siteId,
      ...normalizeThemeSettings(),
    };
  }

  return {
    ...existing,
    ...normalizeThemeSettings(existing),
  };
}

export async function saveThemeSettingsSingleton(data: Partial<ThemeSettingsShape> & { siteId: string }) {
  const collection = await getThemeSettingsCollection();
  const now = new Date();
  const normalized = normalizeThemeSettings(data);
  const objectSiteId = new mongoose.Types.ObjectId(data.siteId);
  const existing = await collection.findOne(
    { siteId: objectSiteId },
    { sort: { updatedAt: -1, createdAt: -1 } }
  );

  if (existing?._id) {
    await collection.updateOne(
      { _id: existing._id },
      {
        $set: {
          ...normalized,
          siteId: objectSiteId,
          updatedAt: now,
        },
      }
    );

    const saved = (await collection.findOne({ _id: existing._id })) as IThemeSettings | null;
    return saved
      ? {
          ...saved,
          ...normalizeThemeSettings(saved),
        }
      : null;
  }

  const result = await collection.insertOne({
    ...normalized,
    siteId: objectSiteId,
    createdAt: now,
    updatedAt: now,
  });

  const saved = (await collection.findOne({ _id: result.insertedId })) as IThemeSettings | null;
  return saved
    ? {
        ...saved,
        ...normalizeThemeSettings(saved),
      }
    : null;
}

export async function getThemeSettingsLean(siteId?: string) {
  if (!siteId) {
    return normalizeThemeSettings();
  }

  return getThemeSettingsBySiteId(siteId);
}

function hexToHslString(hex: string) {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16) / 255;
  const g = Number.parseInt(value.slice(2, 4), 16) / 255;
  const b = Number.parseInt(value.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function getThemeCssVariables(input?: Partial<IThemeSettings> | null) {
  const theme = normalizeThemeSettings(input);

  return {
    "--background": hexToHslString(theme.backgroundColor),
    "--foreground": hexToHslString(theme.textColor),
    "--card": hexToHslString(theme.surfaceColor),
    "--card-foreground": hexToHslString(theme.textColor),
    "--popover": hexToHslString(theme.surfaceColor),
    "--popover-foreground": hexToHslString(theme.textColor),
    "--primary": hexToHslString(theme.primaryColor),
    "--primary-foreground": hexToHslString("#ffffff"),
    "--secondary": hexToHslString(theme.accentColor),
    "--secondary-foreground": hexToHslString(theme.textColor),
    "--muted": hexToHslString(theme.accentColor),
    "--muted-foreground": hexToHslString(theme.mutedColor),
    "--accent": hexToHslString(theme.accentColor),
    "--accent-foreground": hexToHslString(theme.textColor),
    "--border": hexToHslString(theme.accentColor),
    "--input": hexToHslString(theme.accentColor),
    "--ring": hexToHslString(theme.primaryColor),
    "--radius":
      theme.radiusScale === "soft" ? "1rem" : theme.radiusScale === "sharp" ? "0.2rem" : "0.65rem",
  } as Record<string, string>;
}
