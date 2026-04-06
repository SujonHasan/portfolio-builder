"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuth } from "@/providers/auth-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b bg-card/80 backdrop-blur-sm">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {user?.name?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:block">
            {user?.name || "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
