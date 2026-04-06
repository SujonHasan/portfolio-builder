"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { PORTFOLIO_FALLBACK_TITLE } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface NavbarLink {
  label: string;
  href: string;
}

interface NavbarProps {
  links: NavbarLink[];
  showThemeToggle?: boolean;
}

export function Navbar({ links, showThemeToggle = true }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sectionIds = links.map((link) => link.href.replace("#", ""));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [links]);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b transition-shadow",
        scrolled && "shadow-md"
      )}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
        >
          {PORTFOLIO_FALLBACK_TITLE}
        </Link>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-primary",
                  activeSection === link.href.replace("#", "")
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {showThemeToggle ? <ThemeToggle /> : null}

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-4 mt-8">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-primary hover:bg-accent",
                      activeSection === link.href.replace("#", "")
                        ? "text-primary bg-accent"
                        : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
