"use client";

import { useEffect, useState } from "react";
import { getCourses, getCourseRounds, getLeaderboard } from "@/lib/api";
import { LandingExperience } from "@/components/LandingExperience";
import type { Course, CourseRound, LeaderboardEntry } from "@/lib/types";

export default function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [rounds, setRounds] = useState<CourseRound[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCourses(), getCourseRounds(), getLeaderboard()])
      .then(([courseData, roundData, leaderboardData]) => {
        setCourses(courseData);
        setRounds(roundData);
        setLeaderboard(leaderboardData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="page-loader">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <LandingExperience
      courses={courses}
      rounds={rounds}
      leaderboard={leaderboard}
    />
  );
}
