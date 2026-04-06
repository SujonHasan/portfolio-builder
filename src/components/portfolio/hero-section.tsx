"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { IAbout } from "@/types";
import { GithubIcon, LinkedinIcon, FacebookIcon } from "@/components/shared/icons";
import { PORTFOLIO_FALLBACK_NAME } from "@/lib/brand";
import { sanitizeUrl } from "@/lib/sanitize";

interface HeroSectionProps {
  about: IAbout | null;
  siteUsername?: string;
}

const socialIcons: Record<string, React.ElementType> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  facebook: FacebookIcon,
};

export function HeroSection({ about, siteUsername }: HeroSectionProps) {
  const name = about?.name || PORTFOLIO_FALLBACK_NAME;
  const tagline = about?.tagline || "";
  const heroDescription = about?.heroDescription || "";
  const socialLinks = about?.socialLinks;
  const generatedResumeUrl = siteUsername
    ? `/api/resume/download?site=${encodeURIComponent(siteUsername)}`
    : "/api/resume/download";

  const nameChars = name.split("");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const charVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
  };

  const socialEntries = socialLinks
    ? Object.entries(socialLinks).filter(
        ([key, value]) => value && sanitizeUrl(value) && socialIcons[key]
      )
    : [];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/20 dark:via-transparent dark:to-transparent" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Name with typing animation */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {nameChars.map((char, index) => (
            <motion.span
              key={index}
              variants={charVariants}
              className="inline-block"
              style={{ whiteSpace: char === " " ? "pre" : undefined }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Tagline */}
        {tagline && (
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {tagline}
          </motion.p>
        )}

        {/* Hero description */}
        {heroDescription && (
          <motion.p
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {heroDescription}
          </motion.p>
        )}

        {/* Social links */}
        {socialEntries.length > 0 && (
          <motion.div
            className="flex items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            {socialEntries.map(([key, url]) => {
              const Icon = socialIcons[key];
              const safeUrl = sanitizeUrl(url);
              if (!safeUrl) return null;
              return (
                <motion.a
                  key={key}
                  href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full border border-border bg-background/80 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              );
            })}
          </motion.div>
        )}

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <Link
            href="#projects"
            className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            View Projects
          </Link>
          <a
            href={generatedResumeUrl}
            className="px-8 py-3 rounded-lg border border-border font-medium hover:bg-accent transition-colors"
          >
            Download Resume
          </a>
        </motion.div>
      </div>

      {/* Scroll down indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  );
}
