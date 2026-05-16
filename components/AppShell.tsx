"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { SiteNav } from "@/components/SiteNav";
import { SidebarNav } from "@/components/SidebarNav";
import { TopNavbar } from "@/components/TopNavbar";
import { CartDrawer } from "@/components/CartDrawer";

const DASHBOARD_PREFIXES = [
  "/dashboard",
  "/admin",
  "/engineer",
  "/cta",
  "/parent",
  "/my-courses",
  "/applications",
  "/cart",
  "/profile",
  "/notifications",
  "/referrals",
  "/payment",
  "/onboarding",
  "/courses",
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    setPageLoading(true);
    const timeout = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [pathname]);

  if (authLoading) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-canvas-soft">
        <div className="w-10 h-10 border-4 border-ink/15 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  const isAuthPage = pathname === "/auth";
  const isLanding = pathname === "/";
  const isRoom = pathname?.startsWith("/room/");
  const isPublicPage = ["/about", "/team", "/schools", "/pricing", "/faq", "/forgot-password", "/enroll"].some(p => pathname === p || pathname?.startsWith(p + "/"));

  const isDashboardArea = DASHBOARD_PREFIXES.some(prefix => pathname === prefix || pathname?.startsWith(prefix + "/"));
  const showSidebar = user && isDashboardArea && !isRoom;

  return (
    <div className="flex min-h-[100dvh] w-full bg-canvas-soft text-ink font-body selection:bg-brand/25 selection:text-brand-fg">
      {pageLoading && (
        <div className="fixed top-0 left-0 w-full h-[3px] z-[9999] bg-ink/[0.06] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand to-transparent w-full animate-[loading-slide_1.2s_ease-in-out_infinite]" />
        </div>
      )}

      {showSidebar ? (
        <div className="flex w-full min-h-[100dvh]">
          <SidebarNav />
          <main className="flex-1 flex flex-col min-w-0">
            <TopNavbar />
            <div className="w-full max-w-[1400px] mx-auto pb-24">
              {children}
            </div>
          </main>
        </div>
      ) : (
        <div className="w-full min-h-[100dvh] relative">
          {!isAuthPage && <SiteNav />}
          {children}
        </div>
      )}
      <CartDrawer />
    </div>
  );
}
