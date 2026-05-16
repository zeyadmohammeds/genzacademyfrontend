"use client";

import { useEffect, useState } from "react";
import { getMyEnrollments } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { MyCoursesExperience } from "@/components/MyCoursesExperience";

export default function MyCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getMyEnrollments()
        .then(setEnrollments)
        .finally(() => setLoading(false));
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (loading || authLoading) return <div className="page-loader"><div className="spinner" /></div>;

  return <MyCoursesExperience enrollments={enrollments} />;
}
