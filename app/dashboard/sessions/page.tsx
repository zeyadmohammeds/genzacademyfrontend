"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Calendar, Clock, VideoCamera, CheckCircle, 
  ArrowRight, User, GraduationCap, Funnel, Play 
} from "@phosphor-icons/react";
import { getMySessions } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import Image from "next/image";

const COURSE_IMAGES: Record<string, string> = {
  "scratch": "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80",
  "intro-cpp": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
  "advanced-cpp": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
  "robot-build": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
  "web-app-ai": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
};

const COURSE_ICONS: Record<string, string> = {
  "scratch": "🎮",
  "intro-cpp": "💻",
  "advanced-cpp": "⚡",
  "robot-build": "🤖",
  "web-app-ai": "🌐",
};

const COURSE_COLORS: Record<string, string> = {
  "scratch": "bg-blue-50 text-blue-600 border-blue-100",
  "intro-cpp": "bg-indigo-50 text-indigo-600 border-indigo-100",
  "advanced-cpp": "bg-purple-50 text-purple-600 border-purple-100",
  "robot-build": "bg-red-50 text-red-600 border-red-100",
  "web-app-ai": "bg-emerald-50 text-emerald-600 border-emerald-100",
};

export default function StudentSessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "upcoming" | "past">("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  useEffect(() => {
    if (user) {
      getMySessions().then(setSessions).finally(() => setLoading(false));
    }
  }, [user]);

  // Extract unique courses from sessions list
  const uniqueCourses = useMemo(() => {
    const coursesMap = new Map<string, { slug: string; title: string }>();
    sessions.forEach(s => {
      if (s.courseId && s.courseTitle) {
        coursesMap.set(s.courseId, { slug: s.courseSlug || "", title: s.courseTitle });
      }
    });
    return Array.from(coursesMap.entries()).map(([id, info]) => ({ id, ...info }));
  }, [sessions]);

  // Filter logic
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Upcoming/Past filter
      const matchesTab = 
        activeFilter === "all" || 
        (activeFilter === "upcoming" && session.isUpcoming) || 
        (activeFilter === "past" && !session.isUpcoming);
      
      // Course selection filter
      const matchesCourse = 
        selectedCourse === "all" || 
        session.courseId === selectedCourse;

      return matchesTab && matchesCourse;
    });
  }, [sessions, activeFilter, selectedCourse]);

  const upcomingCount = sessions.filter(s => s.isUpcoming).length;
  const pastCount = sessions.filter(s => !s.isUpcoming).length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateStr: string, duration: number) => {
    const start = new Date(dateStr);
    const end = new Date(start.getTime() + duration * 60000);
    return `${start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} EET`;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-black/10 border-t-zinc-900 animate-spin" />
    </div>
  );

  return (
    <div className="w-full px-6 lg:px-12 pt-8 pb-24 max-w-[1600px] mx-auto">
      {/* Premium Spacious Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff1a1a] mb-2 block">
            Academic Schedule
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-none mb-3">
            My Sessions
          </h1>
          <p className="text-zinc-500 font-semibold text-sm max-w-xl">
            View your registered tracks, join live interactive class cohorts, and access previous session logs & recordings.
          </p>
        </div>

        {/* Dynamic Metric Tags */}
        <div className="flex items-center gap-3">
          <div className="px-5 py-3 bg-white border border-black/5 rounded-2xl flex flex-col shadow-sm">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Upcoming</span>
            <span className="text-xl font-black text-zinc-950">{upcomingCount} Live</span>
          </div>
          <div className="px-5 py-3 bg-white border border-black/5 rounded-2xl flex flex-col shadow-sm">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Completed</span>
            <span className="text-xl font-black text-[#10b981]">{pastCount} Classes</span>
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-lg border border-black/5 max-w-xl mx-auto flex flex-col items-center">
          <div className="w-20 h-20 bg-zinc-50 border border-black/5 rounded-2xl flex items-center justify-center text-zinc-400 mb-6">
            <Calendar size={36} weight="duotone" />
          </div>
          <h3 className="font-display text-2xl font-black text-zinc-900 mb-2">No Live Cohorts Yet</h3>
          <p className="text-zinc-500 font-semibold text-sm leading-relaxed max-w-sm mb-8">
            Your live rounds, interactive tasks, and expert support sessions will populate here once enrollment is accepted and active.
          </p>
          <Link href="/dashboard/courses" className="px-8 py-4 bg-zinc-950 text-white hover:bg-zinc-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md transition-all">
            Browse Active Catalog
          </Link>
        </div>
      ) : (
        <>
          {/* Filters & Control Dock */}
          <div className="flex flex-col gap-4 mb-10">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-4">
              <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-2xl">
                {(["all", "upcoming", "past"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                      activeFilter === tab 
                        ? "bg-white text-zinc-950 shadow-sm" 
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Course Selector Dropdown */}
              {uniqueCourses.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                    <Funnel size={14} weight="bold" /> Filter Course:
                  </span>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="bg-white border border-black/10 rounded-xl px-4 py-2 text-xs font-bold text-zinc-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff1a1a]/20 cursor-pointer"
                  >
                    <option value="all">All Tracks ({uniqueCourses.length})</option>
                    {uniqueCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {COURSE_ICONS[c.slug] || "💻"} {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Session Content Listing */}
          {filteredSessions.length === 0 ? (
            <div className="bg-white border border-black/5 rounded-[2.5rem] p-12 text-center text-zinc-400 font-semibold text-sm">
              No sessions match your selected filter.
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {/* Upcoming section - rendered as high-fidelity cards */}
              {filteredSessions.some(s => s.isUpcoming) && (
                <div>
                  <h2 className="text-2xl font-display font-black text-zinc-950 mb-6 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff1a1a] animate-pulse"></span>
                    Upcoming Live Cohorts
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredSessions.filter(s => s.isUpcoming).map((session) => {
                      const slug = session.courseSlug || "";
                      const image = COURSE_IMAGES[slug] || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";
                      const icon = COURSE_ICONS[slug] || "💻";
                      const color = COURSE_COLORS[slug] || "bg-zinc-50 text-zinc-600 border-zinc-100";

                      return (
                        <div key={session.id} className="bg-white rounded-[2.5rem] border border-black/5 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group flex flex-col">
                          {/* Visual Background Illustration Header */}
                          <div className="h-44 relative overflow-hidden bg-zinc-900">
                            <Image 
                              src={image} 
                              alt={session.courseTitle || "Course"} 
                              fill 
                              className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
                            
                            {/* Tags on Image */}
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                {session.sessionType || "Live Class"}
                              </span>
                              {session.courseTitle && (
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${color}`}>
                                  {icon} {session.courseTitle}
                                </span>
                              )}
                            </div>

                            {/* Title overlay */}
                            <div className="absolute bottom-4 left-6 right-6">
                              <h3 className="text-xl font-display font-black text-white leading-tight group-hover:text-red-400 transition-colors">
                                {session.title}
                              </h3>
                            </div>
                          </div>

                          {/* Body Content */}
                          <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                            <div className="space-y-4">
                              {/* Schedule grid */}
                              <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-2xl border border-black/5">
                                <div>
                                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">DATE</span>
                                  <span className="text-xs font-black text-zinc-800 flex items-center gap-1.5">
                                    <Calendar size={14} className="text-[#ff1a1a]" /> {formatDate(session.scheduledAt)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">TIME</span>
                                  <span className="text-xs font-black text-zinc-800 flex items-center gap-1.5">
                                    <Clock size={14} className="text-[#ff1a1a]" /> {formatTime(session.scheduledAt, session.durationMinutes)}
                                  </span>
                                </div>
                              </div>

                              {/* Instructor Row */}
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center border border-black/5 text-zinc-600">
                                  <User size={16} weight="bold" />
                                </div>
                                <div>
                                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">INSTRUCTOR</span>
                                  <span className="text-xs font-bold text-zinc-800">{session.instructorName || "Academy Expert"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Room deep link action */}
                            <Link 
                              href={`/room/${session.roundId || session.id}`} 
                              className="w-full py-4 bg-zinc-950 text-white hover:bg-[#ff1a1a] rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                              <VideoCamera size={18} weight="fill" /> Join Cohort Room <ArrowRight size={14} weight="bold" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Past / Completed list */}
              {filteredSessions.some(s => !s.isUpcoming) && (
                <div>
                  <h2 className="text-2xl font-display font-black text-zinc-950 mb-6">
                    Previous Classes & Recordings
                  </h2>
                  <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-sm p-8">
                    <div className="divide-y divide-black/5">
                      {filteredSessions.filter(s => !s.isUpcoming).map((session) => {
                        const slug = session.courseSlug || "";
                        const icon = COURSE_ICONS[slug] || "💻";

                        return (
                          <div key={session.id} className="flex flex-col md:flex-row md:items-center justify-between py-6 first:pt-0 last:pb-0 gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                                <CheckCircle size={24} weight="fill" />
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                  <h4 className="font-bold text-zinc-900 text-base">{session.title}</h4>
                                  {session.courseTitle && (
                                    <span className="px-2.5 py-0.5 bg-zinc-50 border border-black/5 text-zinc-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                      {icon} {session.courseTitle}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-zinc-500 font-semibold flex items-center gap-2">
                                  <span>{formatDate(session.scheduledAt)}</span>
                                  <span>•</span>
                                  <span className="capitalize">{session.sessionType || "Class"} Completed</span>
                                </div>
                              </div>
                            </div>

                            {session.recordingUrl ? (
                              <a 
                                href={session.recordingUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="px-6 py-3 border border-black/10 hover:border-black/20 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-700 hover:bg-zinc-50 transition-colors flex items-center gap-2 w-fit"
                              >
                                <Play size={14} weight="bold" /> Watch Recording
                              </a>
                            ) : (
                              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                                Log Archived
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
