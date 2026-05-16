"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { StudentDashboardExperience } from "./StudentDashboardExperience";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
    if (!loading && user && !user.profileCompleted) {
      router.push("/onboarding");
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="page-loader"><div className="spinner" /></div>;

  // Admin users still use the Admin dashboard at /admin, 
  // but if they hit /dashboard, we can show them the student view or redirect.
  // For now, let's keep it clean: Students see the new dashboard, Admins see the admin dashboard.
  if (user.role === "Admin") {
    router.push("/admin");
    return null;
  }

  return <StudentDashboardExperience />;
}
