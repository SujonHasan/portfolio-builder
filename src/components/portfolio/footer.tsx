import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GithubIcon, LinkedinIcon, FacebookIcon, TwitterIcon } from "@/components/shared/icons";
import { APP_NAME, PORTFOLIO_FALLBACK_NAME } from "@/lib/brand";
import { sanitizeUrl } from "@/lib/sanitize";

interface FooterProps {
  ownerName?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
}

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  website: Globe,
};

const socialLabels: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  twitter: "Twitter",
  website: "Website",
};

export function Footer({ ownerName, socialLinks }: FooterProps) {
  const links = socialLinks
    ? Object.entries(socialLinks).filter(([, url]) => sanitizeUrl(url))
    : [];
  const year = new Date().getFullYear();
  const displayName = ownerName || PORTFOLIO_FALLBACK_NAME;

  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center gap-4 text-center">
        {/* Social Links */}
        {links.length > 0 && (
          <div className="flex items-center gap-2">
            {links.map(([key, url]) => {
              const Icon = socialIcons[key as keyof typeof socialIcons];
              const safeUrl = sanitizeUrl(url);
              if (!Icon || !safeUrl) return null;
              return (
                <Button key={key} variant="ghost" size="icon" asChild>
                  <a
                    href={safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={socialLabels[key] || key}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </Button>
              );
            })}
          </div>
        )}

        {/* Copyright */}
        <p className="text-sm text-muted-foreground">
          &copy; {year} {displayName}. Powered by {APP_NAME}.
        </p>

        {/* Built with */}
        <p className="text-xs text-muted-foreground">
          Built with Next.js &amp; Tailwind CSS
        </p>
      </div>
    </footer>
  );
}
