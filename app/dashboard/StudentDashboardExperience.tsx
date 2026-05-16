"use client";

import { useAuth } from "@/lib/auth-context";
import { getMyProgress, getUserApplications, getLeaderboard, getMySessions, getCourses } from "@/lib/api";
import { useEffect, useState } from "react";
import type { StudentProgress, CourseApplication, Course, LeaderboardEntry } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { 
  Sparkle, Trophy, ChartLineUp, Clock, PlayCircle,
  ArrowRight, Books, Calendar, Lightning,
  UsersThree, Star, CaretRight, VideoCamera, Target,
  Code, PencilSimple, Lightbulb
} from "@phosphor-icons/react";

interface Session {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  hostName?: string;
  isUpcoming: boolean;
}

export function StudentDashboardExperience() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [apps, setApps] = useState<CourseApplication[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyProgress(),
      getUserApplications(),
      getLeaderboard(),
      getMySessions(),
      getCourses()
    ])
      .then(([p, a, l, s, c]) => { 
        setProgress(p); 
        setApps(a); 
        setLeaderboard(l || []);
        setSessions(s || []);
        setCourses(c.slice(0, 3)); 
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const userLevel = user?.level || Math.floor((progress?.xpTotal || 0) / 500) + 1;
  const nextLevelXp = userLevel * 500;
  const currentLevelXp = (userLevel - 1) * 500;
  const xpProgress = progress ? Math.min(100, Math.max(0, ((progress.xpTotal - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)) : 0;

  const upcomingSessions = sessions.filter(s => s.isUpcoming).slice(0, 3);
  const currentRank = leaderboard.findIndex(e => e.studentUserId === user?.id) + 1;

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="w-full px-6 py-6 lg:px-10 max-w-[1600px] mx-auto">
      
      {/* Hero Welcome */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand font-black text-[10px] uppercase tracking-[0.2em] mb-2">
             <Sparkle weight="fill" /> Student Portal
          </div>
          <h1 className="text-3xl lg:text-5xl font-display font-black tracking-tight text-zinc-900 leading-tight">
            Welcome back, {user?.displayName?.split(" ")[0] || "Explorer"}!
          </h1>
          <p className="text-zinc-500 font-medium mt-1">Ready to continue your learning journey?</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-[2rem] shadow-sm border border-black/5">
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Rank</span>
               <span className="text-xl font-black text-[#7c3aed]">#{currentRank || progress?.rankGlobal || "—"}</span>
            </div>
            <div className="w-px h-8 bg-black/5"></div>
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">XP</span>
               <span className="text-xl font-black text-zinc-900">{progress?.xpTotal?.toLocaleString() || 0}</span>
            </div>
            <div className="w-px h-8 bg-black/5"></div>
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Streak</span>
               <span className="text-xl font-black text-orange-500">{progress?.streakCurrent || 0}🔥</span>
            </div>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
         
        {/* Progress Card - Large */}
        <div className="lg:col-span-2 bg-ink rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
           <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-display font-black flex items-center gap-2">
                    Learning Progress
                  </h3>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold border border-white/10">Level {userLevel}</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Attendance</span>
                      <span className="text-2xl font-black text-white">{progress?.attendanceCount || 0}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Tasks</span>
                      <span className="text-2xl font-black text-brand">{progress?.submittedTasks || 0}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">This Week</span>
                      <span className="text-2xl font-black text-[#c2f0ff]">+{progress?.xpThisWeek || 0}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Quizzes</span>
                      <span className="text-2xl font-black text-purple-400">{progress?.completedQuizzes || 0}</span>
                   </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold">Level {userLevel + 1} Progress</span>
                    <span className="text-xs font-black text-brand">{xpProgress.toFixed(0)}%</span>
                 </div>
                 <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#7c3aed] to-brand rounded-full" style={{ width: `${xpProgress}%` }}></div>
                 </div>
              </div>
           </div>
           <div className="absolute top-[-10%] right-[-5%] w-40 h-40 bg-[#7c3aed] rounded-full blur-[80px] opacity-20"></div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-[2rem] p-6 border border-black/5 shadow-sm">
            <h3 className="text-base font-display font-black text-zinc-900 mb-4 flex items-center gap-2">
              <VideoCamera size={18} weight="fill" className="text-brand" /> Live Sessions
            </h3>
            <div className="space-y-3">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-canvas-soft rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                      <PlayCircle size={16} weight="fill" className="text-brand" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-zinc-900 truncate">{s.title}</div>
                      <div className="text-[10px] text-zinc-500">
                        {new Date(s.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {s.durationMinutes}m
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400">No upcoming sessions</p>
              )}
            </div>
            <Link href="/dashboard/sessions" className="block text-center text-xs font-bold text-brand mt-3 hover:underline">
              View All Sessions
            </Link>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/quiz" className="bg-[#e4d3ff] rounded-[1.5rem] p-4 flex flex-col items-center gap-2 border border-[#7c3aed]/10 hover:scale-[1.02] transition-transform">
              <PencilSimple size={24} weight="bold" className="text-[#7c3aed]" />
              <span className="text-xs font-black text-zinc-900">Quizzes</span>
            </Link>
            <Link href="/playground" className="bg-[#c2f0ff] rounded-[1.5rem] p-4 flex flex-col items-center gap-2 border border-[#0284c7]/10 hover:scale-[1.02] transition-transform">
              <Code size={24} weight="bold" className="text-[#0284c7]" />
              <span className="text-xs font-black text-zinc-900">Playground</span>
            </Link>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-[2rem] p-6 border border-black/5 shadow-sm">
          <h3 className="text-base font-display font-black text-zinc-900 mb-4 flex items-center gap-2">
            <Trophy size={18} weight="fill" className="text-yellow-500" /> Leaderboard
          </h3>
          <div className="space-y-2">
            {leaderboard.slice(0, 5).map((entry, i) => (
              <div key={i} className={`flex items-center gap-3 p-2 rounded-xl ${entry.studentUserId === user?.id ? 'bg-brand/10 ring-1 ring-brand' : ''}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-yellow-400 text-yellow-900' : i === 1 ? 'bg-zinc-300 text-zinc-700' : i === 2 ? 'bg-orange-300 text-orange-900' : 'bg-zinc-100 text-zinc-500'}`}>
                  {entry.rank}
                </span>
                <div className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden">
                  <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${entry.studentName}&backgroundColor=f0f0f0`} alt="" width={32} height={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-zinc-900 truncate">{entry.studentName}</div>
                </div>
                <span className="text-xs font-black text-zinc-500">{entry.xpTotal} XP</span>
              </div>
            ))}
          </div>
          <Link href="/leaderboard" className="block text-center text-xs font-bold text-brand mt-4 hover:underline">
            View Full Rankings
          </Link>
        </div>
      </div>

      {/* Current Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-display font-black text-zinc-900">My Courses</h3>
             <Link href="/my-courses" className="text-brand text-sm font-bold hover:underline flex items-center gap-1">
               View All <CaretRight size={14} weight="bold" />
             </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {apps.slice(0, 2).map((app, idx) => (
               <div key={app.id} className={`${idx === 0 ? 'bg-brand-hover' : 'bg-[#c2f0ff]'} rounded-[2rem] p-6 shadow-sm border border-black/5 flex flex-col justify-between h-[160px] group`}>
                  <div>
                    <span className="px-2 py-1 bg-white/60 rounded-lg text-[9px] font-black uppercase tracking-widest mb-3 inline-block">{app.status}</span>
                    <h4 className="text-lg font-bold text-zinc-900 leading-tight">{app.courseTitle}</h4>
                  </div>
                  <Link href={`/room/${app.courseId}`} className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-zinc-700 hover:text-black">
                    Enter Room <ArrowRight size={14} weight="bold" />
                  </Link>
               </div>
             ))}
             {apps.length === 0 && (
               <div className="col-span-2 bg-canvas-soft rounded-[2rem] p-8 text-center border border-black/5">
                  <p className="text-zinc-500 font-bold mb-4">No active courses yet.</p>
                  <Link href="/courses" className="inline-flex px-6 py-2 bg-brand text-brand-fg rounded-xl font-bold text-sm">Browse Catalog</Link>
               </div>
             )}
          </div>
        </div>

        {/* Recent Activity / Quick Links */}
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] p-6 border border-black/5 shadow-sm">
            <h3 className="text-base font-display font-black text-zinc-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/dashboard/progress" className="flex items-center gap-3 p-3 rounded-xl hover:bg-canvas-soft transition-colors">
                <Trophy size={18} weight="fill" className="text-brand" />
                <span className="text-sm font-bold text-zinc-700">My Progress</span>
              </Link>
              <Link href="/dashboard/certificates" className="flex items-center gap-3 p-3 rounded-xl hover:bg-canvas-soft transition-colors">
                <Star size={18} weight="fill" className="text-yellow-500" />
                <span className="text-sm font-bold text-zinc-700">Certificates</span>
              </Link>
              <Link href="/dashboard/materials" className="flex items-center gap-3 p-3 rounded-xl hover:bg-canvas-soft transition-colors">
                <Books size={18} weight="fill" className="text-[#0284c7]" />
                <span className="text-sm font-bold text-zinc-700">Materials</span>
              </Link>
              <Link href="/playground" className="flex items-center gap-3 p-3 rounded-xl hover:bg-canvas-soft transition-colors">
                <Code size={18} weight="fill" className="text-purple-500" />
                <span className="text-sm font-bold text-zinc-700">Code Playground</span>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#7c3aed] to-brand rounded-[2rem] p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={18} weight="fill" />
              <span className="text-xs font-black uppercase tracking-widest">Pro Tip</span>
            </div>
            <p className="text-sm font-medium leading-relaxed">
              Complete quizzes daily to earn bonus XP and climb the leaderboard!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}