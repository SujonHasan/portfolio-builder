"use client";

import { useState } from "react";
import { AuthProvider } from "@/providers/auth-provider";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { isLoading } = useAuth();
  const isStandaloneAuthPage =
    pathname === "/admin/login" || pathname === "/admin/register" || pathname === "/admin/onboarding";

  // Login page should not show sidebar/topbar
  if (isStandaloneAuthPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
