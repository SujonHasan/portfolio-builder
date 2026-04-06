export const APP_NAME = "Portfolio Builder";
export const APP_INITIALS = "PB";
export const APP_DESCRIPTION =
  "Build your portfolio, resume, and personal brand from one dashboard.";
export const APP_TAGLINE = "Portfolio SaaS for job seekers and professionals";
export const PORTFOLIO_FALLBACK_NAME = "Your Name";
export const PORTFOLIO_FALLBACK_TITLE = "Your Portfolio";
export const PORTFOLIO_FALLBACK_TAGLINE = "Full Stack Developer";

export function getAppTitle(title?: string) {
  return title ? `${title} | ${APP_NAME}` : APP_NAME;
}
