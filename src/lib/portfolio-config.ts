import {
  PortfolioSectionKey,
  PortfolioThemePreset,
  ThemeBackgroundStyle,
  ThemeRadiusScale,
} from "@/types";

export const PORTFOLIO_SECTIONS: Array<{
  id: PortfolioSectionKey;
  label: string;
  description: string;
  anchor?: string;
  navLabel?: string;
  defaultEnabled: boolean;
}> = [
  {
    id: "hero",
    label: "Hero",
    description: "Top intro section with headline, social links, and resume button.",
    defaultEnabled: true,
  },
  {
    id: "about",
    label: "About",
    description: "Personal introduction, bio, and stats.",
    anchor: "about",
    navLabel: "About",
    defaultEnabled: true,
  },
  {
    id: "skills",
    label: "Skills",
    description: "Core technologies and stack overview.",
    anchor: "skills",
    navLabel: "Skills",
    defaultEnabled: true,
  },
  {
    id: "projects",
    label: "Projects",
    description: "Featured published portfolio work.",
    anchor: "projects",
    navLabel: "Projects",
    defaultEnabled: true,
  },
  {
    id: "experience",
    label: "Experience",
    description: "Work history and responsibilities.",
    anchor: "experience",
    navLabel: "Experience",
    defaultEnabled: true,
  },
  {
    id: "education",
    label: "Education",
    description: "Academic background and training.",
    anchor: "education",
    navLabel: "Education",
    defaultEnabled: true,
  },
  {
    id: "certifications",
    label: "Certifications",
    description: "Certificates, achievements, and credentials.",
    anchor: "certifications",
    navLabel: "Certifications",
    defaultEnabled: true,
  },
  {
    id: "contact",
    label: "Contact",
    description: "Contact info and message form.",
    anchor: "contact",
    navLabel: "Contact",
    defaultEnabled: true,
  },
];

export const PORTFOLIO_THEME_PRESETS: Array<{
  id: PortfolioThemePreset;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  backgroundStyle: ThemeBackgroundStyle;
  radiusScale: ThemeRadiusScale;
}> = [
  {
    id: "default",
    name: "Default Blue",
    description: "Clean professional look with the existing blue identity.",
    primaryColor: "#2563eb",
    accentColor: "#dbeafe",
    backgroundColor: "#ffffff",
    surfaceColor: "#f8fafc",
    textColor: "#0f172a",
    mutedColor: "#64748b",
    backgroundStyle: "none",
    radiusScale: "rounded",
  },
  {
    id: "minimal",
    name: "Minimal Slate",
    description: "Neutral and calm with low-saturation surfaces.",
    primaryColor: "#475569",
    accentColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    surfaceColor: "#ffffff",
    textColor: "#0f172a",
    mutedColor: "#64748b",
    backgroundStyle: "grid",
    radiusScale: "sharp",
  },
  {
    id: "modern",
    name: "Modern Emerald",
    description: "Fresh high-contrast accent with a more energetic feel.",
    primaryColor: "#0f766e",
    accentColor: "#ccfbf1",
    backgroundColor: "#f0fdfa",
    surfaceColor: "#ffffff",
    textColor: "#0f172a",
    mutedColor: "#4b5563",
    backgroundStyle: "glow",
    radiusScale: "soft",
  },
  {
    id: "warm",
    name: "Warm Amber",
    description: "Friendly personal-brand look with warmer highlights.",
    primaryColor: "#ea580c",
    accentColor: "#ffedd5",
    backgroundColor: "#fff7ed",
    surfaceColor: "#ffffff",
    textColor: "#431407",
    mutedColor: "#9a3412",
    backgroundStyle: "dots",
    radiusScale: "soft",
  },
];

export const DEFAULT_PORTFOLIO_SECTION_ORDER = PORTFOLIO_SECTIONS.map((section) => section.id);
export const DEFAULT_ENABLED_PORTFOLIO_SECTIONS = PORTFOLIO_SECTIONS.filter(
  (section) => section.defaultEnabled
).map((section) => section.id);
