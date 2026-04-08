import { notFound } from "next/navigation";
import { Navbar } from "@/components/portfolio/navbar";
import { Footer } from "@/components/portfolio/footer";
import { PORTFOLIO_SECTIONS } from "@/lib/portfolio-config";
import { getThemeCssText, getThemeSettingsBySiteId } from "@/lib/theme-settings";
import { getPortfolioSettingsBySiteId } from "@/lib/portfolio-settings";
import { getAboutBySiteId } from "@/lib/about";
import { getSiteByUsername } from "@/lib/site";
import { canAccessPortfolioSite } from "@/lib/site-access";

export default async function PreviewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const site = await getSiteByUsername(username);

  if (!site || !(await canAccessPortfolioSite(site))) {
    notFound();
  }

  const [about, sectionSettings, themeSettings] = await Promise.all([
    getAboutBySiteId(site._id.toString()),
    getPortfolioSettingsBySiteId(site._id.toString()),
    getThemeSettingsBySiteId(site._id.toString()),
  ]);

  const navLinks = sectionSettings.sectionOrder
    .filter((sectionId) => sectionSettings.enabledSections.includes(sectionId))
    .map((sectionId) => PORTFOLIO_SECTIONS.find((section) => section.id === sectionId))
    .filter((section): section is NonNullable<typeof section> => Boolean(section?.anchor))
    .map((section) => ({
      label: section.navLabel || section.label,
      href: `#${section.anchor}`,
    }));
  const themeScopeId = `portfolio-${site._id.toString()}`;
  const themeCss = getThemeCssText(themeSettings);

  return (
    <div
      data-portfolio-theme-scope={themeScopeId}
      data-portfolio-theme={themeSettings.themePreset}
      data-portfolio-background={themeSettings.backgroundStyle}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
[data-portfolio-theme-scope="${themeScopeId}"] {
${themeCss.light}
}
.dark [data-portfolio-theme-scope="${themeScopeId}"] {
${themeCss.dark}
}
          `.trim(),
        }}
      />
      <Navbar
        links={navLinks}
        showThemeToggle={themeSettings.showThemeToggle}
        brandLabel={about?.name || site.title}
        brandHref={`/${site.username}`}
      />
      <main>{children}</main>
      <Footer
        ownerName={about?.name}
        socialLinks={about?.socialLinks as Record<string, string> | undefined}
      />
    </div>
  );
}
