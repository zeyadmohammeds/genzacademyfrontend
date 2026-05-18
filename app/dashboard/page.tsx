"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { StudentDashboardExperience } from "./StudentDashboardExperience";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth");
      return;
    }
    const role = user.role?.toLowerCase() || "";
    // Staff roles → Admin panel
    if (role === "academy_admin" || role === "admin" || role === "engineer" || role === "cta") {
      router.push("/admin");
      return;
    }
    // Students without completed onboarding → Onboarding
    if (!user.profileCompleted) {
      router.push("/onboarding");
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="page-loader"><div className="spinner" /></div>;

  const role = user.role?.toLowerCase() || "";
  if (role === "academy_admin" || role === "admin" || role === "engineer" || role === "cta") {
    return null; // redirect in progress
  }

  return <StudentDashboardExperience />;
}
