"use client";

import { useAuth } from "@/lib/auth-context";
import { getMyProgress, getUserApplications, getLeaderboard, getMySessions, getCourses } from "@/lib/api";
import { useEffect, useState, useMemo } from "react";
import type { StudentProgress, CourseApplication, Course, LeaderboardEntry } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { EmptyState } from "@/components/ui/EmptyState";
import { 
  Sparkle, Trophy, ChartLineUp, Clock, PlayCircle,
  ArrowRight, ArrowLeft, Books, Calendar, Lightning,
  UsersThree, Star, CaretRight, VideoCamera, Target,
  Code, PencilSimple, Lightbulb, ChartBar, Fire,
  Heart, DotsThree, HandWaving, Plus, UserPlus,
  MonitorPlay
} from "@phosphor-icons/react";
import { 
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface Session {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  hostName?: string;
  zoomJoinUrl?: string;
  isUpcoming: boolean;
  courseId?: string | null;
  courseTitle?: string | null;
  courseSlug?: string | null;
  roundId?: string | null;
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
        setCourses(c); 
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
  const enrolledCourseIds = useMemo(() => {
    return new Set(
      apps
        .filter(a => {
          const s = (a.status || "").toLowerCase();
          return s === "accepted" || s === "approved" || s === "paid";
        })
        .map(a => a.courseId)
    );
  }, [apps]);
  const enrolledCourses = useMemo(() => {
    return courses.filter(c => enrolledCourseIds.has(c.id));
  }, [courses, enrolledCourseIds]);

  const progressData = useMemo(() => [
    { day: 'Mon', xp: Math.floor((progress?.xpTotal || 1000) * 0.1) },
    { day: 'Tue', xp: Math.floor((progress?.xpTotal || 1000) * 0.25) },
    { day: 'Wed', xp: Math.floor((progress?.xpTotal || 1000) * 0.3) },
    { day: 'Thu', xp: Math.floor((progress?.xpTotal || 1000) * 0.5) },
    { day: 'Fri', xp: Math.floor((progress?.xpTotal || 1000) * 0.7) },
    { day: 'Sat', xp: Math.floor((progress?.xpTotal || 1000) * 0.9) },
    { day: 'Sun', xp: progress?.xpTotal || 1000 },
  ], [progress]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="w-full h-full bg-[#f8f9fa] p-4 lg:p-8 flex flex-col lg:flex-row gap-6 mx-auto overflow-y-auto">
      
      {/* Left Column - Main Content */}
      <div className="flex-1 flex flex-col gap-6 max-w-full lg:max-w-[70%]">
        
        {/* Hero Banner */}
        <div className="w-full bg-gradient-to-r from-[#cc0000] to-[#ff1a1a] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-brand/10">
          <div className="relative z-10 max-w-lg">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-white/80">
              EL SEWEDY GENZ ACADEMY
            </div>
            <h1 className="text-3xl lg:text-4xl font-display font-black leading-tight mb-6">
              Sharpen Your Skills with Professional Online Courses
            </h1>
            <Link href="/courses" className="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-black transition-colors">
              Join Now <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center"><ArrowRight size={12} weight="bold" /></span>
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
            <Sparkle size={120} weight="fill" className="absolute top-[-20px] right-[10%] text-white/10 rotate-12" />
            <Sparkle size={60} weight="fill" className="absolute bottom-[20px] right-[30%] text-white/10 -rotate-12" />
            <div className="absolute top-1/2 right-[5%] -translate-y-1/2 text-white/20">
              <svg width="200" height="200" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M50 0 L50 100 M0 50 L100 50" />
                <path d="M15 15 L85 85 M15 85 L85 15" strokeOpacity="0.3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Next Live Session Pulse Widget */}
        {upcomingSessions.length > 0 && (
          <div className="w-full bg-white border border-[#ff1a1a]/10 hover:border-[#ff1a1a]/20 shadow-md rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff1a1a]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#ff1a1a]/10 transition-colors" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-[#ffe6e6] rounded-2xl flex items-center justify-center text-[#ff1a1a] flex-shrink-0 animate-[pulse_2s_infinite]">
                <VideoCamera size={28} weight="fill" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ff1a1a] animate-[ping_1.5s_infinite]" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#ff1a1a]">Next Live Session</span>
                </div>
                <h3 className="text-lg font-black text-zinc-900 leading-snug group-hover:text-[#ff1a1a] transition-colors">{upcomingSessions[0].courseTitle ? `${upcomingSessions[0].courseTitle}: ` : ""}{upcomingSessions[0].title}</h3>
                <p className="text-xs text-zinc-500 font-bold flex items-center gap-2 mt-1">
                  <Calendar size={14} /> {new Date(upcomingSessions[0].scheduledAt).toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })} at {new Date(upcomingSessions[0].scheduledAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })} • Instructor: {upcomingSessions[0].hostName || "Academy Mentor"}
                  {upcomingSessions[0].courseTitle && <><span className="w-1 h-1 rounded-full bg-zinc-300" /> <span className="text-[#ff1a1a]">{upcomingSessions[0].courseTitle}</span></>}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 relative z-10 md:self-center">
              {upcomingSessions[0].zoomJoinUrl ? (
                <a 
                  href={upcomingSessions[0].zoomJoinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-6 py-3 bg-[#ff1a1a] text-white font-bold rounded-xl text-xs hover:bg-[#cc0000] active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-[#ff1a1a]/20"
                >
                  <VideoCamera size={16} weight="fill" /> Join Live Zoom
                </a>
              ) : upcomingSessions[0].courseSlug ? (
                <Link
                  href={`/room/${upcomingSessions[0].courseSlug}`}
                  className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl text-xs hover:bg-black active:scale-[0.98] transition-all flex items-center gap-2 shadow-md"
                >
                  <MonitorPlay size={16} weight="fill" /> Go to Course Room
                </Link>
              ) : (
                <button 
                  disabled
                  className="px-6 py-3 bg-zinc-100 text-zinc-400 font-bold rounded-xl text-xs flex items-center gap-2"
                >
                  <VideoCamera size={16} weight="fill" /> Link Pending
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-black/5">
            <div className="w-12 h-12 rounded-xl bg-[#ffe6e6] text-[#ff1a1a] flex items-center justify-center">
              <Lightning size={24} weight="fill" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">{userLevel} Level Achieved</div>
              <div className="text-lg font-black text-zinc-900">{progress?.xpTotal?.toLocaleString() || 0} XP</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-black/5">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Trophy size={24} weight="fill" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Global Ranking</div>
              <div className="text-lg font-black text-zinc-900">Top {currentRank || 10}</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-black/5">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
              <Fire size={24} weight="fill" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Current Streak</div>
              <div className="text-lg font-black text-zinc-900">{progress?.streakCurrent || 0} Days</div>
            </div>
          </div>
        </div>

        {/* Continue Watching / Active Courses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-black text-zinc-900">Continue Learning</h3>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full bg-white border border-black/5 flex items-center justify-center text-zinc-400 hover:text-zinc-900 shadow-sm"><ArrowLeft size={14} weight="bold" /></button>
              <button className="w-8 h-8 rounded-full bg-[#ff1a1a] flex items-center justify-center text-white shadow-sm shadow-[#ff1a1a]/30"><ArrowRight size={14} weight="bold" /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {enrolledCourses.map((course, idx) => (
              <Link 
                key={course.id || idx} 
                href={`/room/${course.id}`}
                className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-black/5 flex flex-col group hover:shadow-xl hover:shadow-[#ff1a1a]/5 hover:border-[#ff1a1a]/20 transition-all duration-500 cursor-pointer active:scale-[0.98]"
              >
                <div className="w-full aspect-video rounded-[2rem] bg-zinc-950 mb-4 relative overflow-hidden group-hover:shadow-lg group-hover:shadow-[#ff1a1a]/5 transition-all duration-500 border border-black/5">
                  {course.coverImageUrl || course.imageUrl ? (
                    <img 
                      src={course.coverImageUrl || course.imageUrl} 
                      alt={course.title} 
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1c0000] to-[#3a0000] flex flex-col items-center justify-center p-6 text-center rounded-[2rem] overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,26,26,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,26,26,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                      <div className="w-12 h-12 rounded-2xl bg-[#ffe6e6]/10 flex items-center justify-center text-[#ff1a1a] mb-3 relative z-10 shadow-[0_0_20px_rgba(255,26,26,0.15)] group-hover:scale-110 transition-transform duration-500">
                        <Sparkle size={24} weight="fill" className="drop-shadow-[0_0_8px_#ff1a1a]" />
                      </div>
                      <div className="text-[8px] font-black uppercase tracking-[0.25em] text-[#ff1a1a] relative z-10 mb-1">
                        EL SEWEDY GENZ TRACK
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                     <div className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <PlayCircle size={16} weight="fill" className="text-[#ff1a1a]" /> Resume Learning
                     </div>
                  </div>
                </div>
                <div className="px-2 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-[9px] font-black uppercase tracking-widest text-[#ff1a1a] bg-[#ffe6e6] px-2.5 py-1 rounded-lg">
                      {(course as any).categoryName || "Architecture"}
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      Module 4
                    </div>
                  </div>
                  <h4 className="text-base font-black text-zinc-900 leading-[1.3] mb-4 flex-1 group-hover:text-[#ff1a1a] transition-colors">
                    {course.title}
                  </h4>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-200 overflow-hidden border border-black/5 shadow-sm">
                        <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${(course as any).instructorName || idx}&backgroundColor=f0f0f0`} width={24} height={24} alt="mentor" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500">{(course as any).instructorName || "Academy Mentor"}</span>
                    </div>
                    <div className="text-[10px] font-black text-[#ff1a1a]">85% Done</div>
                  </div>
                </div>
              </Link>
            ))}
            {enrolledCourses.length === 0 && (
              <div className="col-span-3 text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-black/5">
                <p className="text-sm font-bold text-zinc-400">Your learning path starts here. Browse the catalog to begin!</p>
              </div>
            )}
          </div>
        </div>

        {/* Your Lesson */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-black text-zinc-900">Your Sessions</h3>
            <Link href="/dashboard/sessions" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-brand underline underline-offset-4">See all</Link>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-black/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50/50">
              <div className="col-span-1">Instructor</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Topic</div>
              <div className="col-span-1 text-right">Action</div>
            </div>
            
            <div className="divide-y divide-black/5">
               {upcomingSessions.map((session, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-zinc-50 transition-colors">
                  <div className="col-span-1 flex items-center gap-3">
                    <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${session.hostName || i}&backgroundColor=f0f0f0`} width={32} height={32} className="rounded-full bg-zinc-200" alt="mentor" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">{session.hostName || "Instructor"}</div>
                      <div className="text-[10px] text-zinc-500">{new Date(session.scheduledAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="col-span-1">
                    {session.zoomJoinUrl ? (
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-green-700 bg-green-100 px-2.5 py-1 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Live
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#007acc] bg-[#c2f0ff] px-2 py-1 rounded-md">Upcoming</span>
                    )}
                  </div>
                  <div className="col-span-1 text-xs font-bold text-zinc-700 truncate">
                    {session.title}
                  </div>
                  <div className="col-span-1 flex justify-end items-center gap-2">
                    {session.zoomJoinUrl ? (
                      <a 
                        href={session.zoomJoinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-[10px] font-bold hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <VideoCamera size={12} weight="fill" /> Join
                      </a>
                    ) : (
                      <span className="text-[9px] text-zinc-400 font-bold bg-zinc-50 px-2 py-1 rounded-md border border-black/5">Link Pending</span>
                    )}
                    <Link href="/dashboard/sessions" className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors">
                      <ArrowRight size={14} weight="bold" />
                    </Link>
                  </div>
                </div>
              ))}
              {upcomingSessions.length === 0 && (
                <EmptyState icon={<Calendar size={32} />} title="No Upcoming Sessions" description="Check back later for your next live session." mini />
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Right Column - Statistic & Profile */}
      <div className="w-full lg:w-[30%] flex flex-col gap-6">
        
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-lg font-display font-black text-zinc-900">Statistic</h3>
            <button className="text-zinc-400 hover:text-zinc-900"><DotsThree size={24} weight="bold" /></button>
          </div>

          {/* Profile Circle */}
          <div className="flex flex-col items-center relative z-10 mb-6">
            <div className="relative w-24 h-24 mb-4">
              {/* Fake Progress Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="#f4f4f5" strokeWidth="6" />
                <circle cx="50" cy="50" r="46" fill="none" stroke="#ff1a1a" strokeWidth="6" strokeDasharray="289" strokeDashoffset={289 - (289 * xpProgress) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-2 rounded-full overflow-hidden border-2 border-white bg-zinc-100">
                <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.displayName || 'User'}&backgroundColor=f0f0f0`} alt="Profile" fill className="object-cover" />
              </div>
              <div className="absolute top-0 right-0 bg-[#ff1a1a] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                {xpProgress.toFixed(0)}%
              </div>
            </div>
            
            <h4 className="text-base font-black text-zinc-900 text-center flex items-center gap-1 justify-center">
              Good Morning {user?.displayName?.split(" ")[0] || "Student"} <HandWaving size={18} className="text-yellow-500" weight="fill" />
            </h4>
            <p className="text-[10px] font-bold text-zinc-400 text-center mt-1 w-3/4">
              Continue your learning to achieve your target!
            </p>
          </div>

          {/* Bar Chart */}
          <div className="h-32 w-full mt-2 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#a1a1aa', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#a1a1aa', fontWeight: 'bold' }} />
                <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="xp" fill="#ffe6e6" radius={[4, 4, 4, 4]}>
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === progressData.length - 1 ? '#ff1a1a' : '#ffe6e6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mentors / Leaderboard list */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-display font-black text-zinc-900">Top Students</h3>
            <button className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center text-zinc-400 hover:text-zinc-900"><Plus size={12} weight="bold" /></button>
          </div>
          
          <div className="space-y-4 flex-1">
            {leaderboard.slice(0, 3).map((entry, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="relative">
                  <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${entry.studentName}&backgroundColor=f0f0f0`} width={36} height={36} className="rounded-full bg-zinc-200" alt="mentor" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-zinc-900 truncate">{entry.studentName}</div>
                  <div className="text-[10px] text-zinc-400 font-medium">Rank #{entry.rank}</div>
                </div>
                <button className="px-3 py-1.5 rounded-full border border-black/10 text-[10px] font-bold text-zinc-700 hover:bg-zinc-50 hover:border-black/20 transition-colors flex items-center gap-1">
                  <UserPlus size={12} weight="bold" /> Follow
                </button>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <EmptyState icon={<Trophy size={32} />} title="No Rankings Yet" description="Complete courses and earn XP to appear on the leaderboard." mini />
            )}
          </div>
          
          <Link href="/leaderboard" className="mt-4 w-full py-2.5 bg-[#ffe6e6] text-[#ff1a1a] rounded-xl text-xs font-black uppercase tracking-widest text-center hover:bg-[#ffcccc] transition-colors">
            See All
          </Link>
        </div>

      </div>
    </div>
  );
}