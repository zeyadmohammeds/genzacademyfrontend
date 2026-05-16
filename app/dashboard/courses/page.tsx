"use client";

import { MyCoursesExperience } from "@/components/MyCoursesExperience";
import { useState, useEffect } from "react";
import { getMyEnrollments } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      getMyEnrollments().then(setEnrollments).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return <MyCoursesExperience enrollments={enrollments} />;
}
