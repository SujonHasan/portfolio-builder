"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Wrench,
  Briefcase,
  GraduationCap,
  Award,
  UserCircle,
  Phone,
  Search,
  BarChart3,
  LogOut,
  X,
  SlidersHorizontal,
  Palette,
  Rocket,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { APP_INITIALS, APP_NAME } from "@/lib/brand";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/skills", label: "Skills", icon: Wrench },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/education", label: "Education", icon: GraduationCap },
  { href: "/admin/certifications", label: "Certifications", icon: Award },
  { href: "/admin/about", label: "About", icon: UserCircle },
  { href: "/admin/contact", label: "Contact", icon: Phone },
  { href: "/admin/customize", label: "Section Settings", icon: SlidersHorizontal },
  { href: "/admin/theme", label: "Theme Settings", icon: Palette },
  { href: "/admin/publish", label: "Publish Settings", icon: Rocket },
  { href: "/admin/seo", label: "SEO Settings", icon: Search },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-card border-r transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/admin" className="flex items-center gap-2" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">{APP_INITIALS}</span>
            </div>
            <span className="font-semibold text-lg">{APP_NAME}</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
