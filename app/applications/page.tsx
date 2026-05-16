"use client";

import { useEffect, useState } from "react";
import { getCourses, getUserApplications } from "@/lib/api";
import { MyApplicationsExperience } from "@/components/MyApplicationsExperience";
import type { Course, CourseApplication } from "@/lib/types";

export default function ApplicationsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [applications, setApplications] = useState<CourseApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCourses(), getUserApplications()])
      .then(([c, a]) => { setCourses(c); setApplications(a); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  
  return <MyApplicationsExperience courses={courses} applications={applications} />;
}
