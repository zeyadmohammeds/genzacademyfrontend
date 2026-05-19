"use client";

import { useState, useEffect, useRef, type ReactNode, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import type { CourseRoom, SessionWeek, LearningTask, QuizItem, QuizAttemptSummary } from "@/lib/types";
import { 
  Books, MonitorPlay, UsersThree, Trophy, 
  ArrowRight, ArrowLeft, PlayCircle, LockKey, CheckCircle,
  Video, FilePdf, DownloadSimple, Sparkle,
  Clock, Calendar, IdentificationBadge, CaretDown,
  Terminal, HardDrive, Cpu, X, Microphone,
  VideoCamera, ChatTeardropText, ShareNetwork,
  UserPlus, Gear, UploadSimple, Plus, PencilSimple,
  Code, PencilSimpleLine, Student, DotsThree, Star,
  Lightning, Target, ChartLineUp
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/lib/toast-context";
import { submitTask, uploadCourseMaterial, updateCourseStep, requestZoomSignature, getCourseRoomQuizzes, getRecommendedCourses } from "@/lib/api";

const COURSE_IMAGES: Record<string, string> = {
  "scratch": "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=1280&q=85",
  "intro-cpp": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1280&q=85",
  "advanced-cpp": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1280&q=85",
  "robot-build": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1280&q=85",
  "web-app-ai": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1280&q=85",
};

export function CourseRoomExperience({ room, isAdminView = false }: { room: CourseRoom, isAdminView?: boolean }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "sessions" | "curriculum" | "materials" | "next-zoom" | "quizzes" | "tasks" | "classmates">("overview");
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [zoomLoading, setZoomLoading] = useState(false);
  const [zoomSignature, setZoomSignature] = useState<{ signature: string; sdkKey: string } | null>(null);
  const zoomRootRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [courseQuizzes, setCourseQuizzes] = useState<QuizItem[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const getRoomData = useCallback(() => {
    return room;
  }, [room]);

  useEffect(() => {
    if (activeTab === 'quizzes') {
      setQuizLoading(true);
      getCourseRoomQuizzes(room.courseRoundId)
        .then(setCourseQuizzes)
        .catch(() => setCourseQuizzes(room.quizzes || []))
        .finally(() => setQuizLoading(false));
    }
  }, [activeTab, room.courseRoundId, room.quizzes, refreshKey]);

  useEffect(() => {
    getRecommendedCourses()
      .then(setRecommendedCourses)
      .catch(() => {});
  }, []);
  
  if (!user) return null;

  const userRoleLower = user.role?.toLowerCase() || "";
  const isHost = userRoleLower === "academy_admin" || userRoleLower === "engineer" || isAdminView;
  const isInstructor = isHost || userRoleLower === "cta";

  const currentWeek = room.weeks.find(w => w.status === "Live") || room.weeks.find(w => w.status === "Scheduled") || room.weeks[0];
  const progressPercentage = room.progress?.completionPercent ?? ((room.weeks.filter(w => w.status === "Completed").length / (room.weeks.length || 1)) * 100);
  const nextSession = room.weeks.find(w => w.status !== "Completed") || room.weeks[0];

  const handleNativeZoomJoin = () => {
    if (isHost && room.zoomStartUrl) {
      window.open(room.zoomStartUrl, '_blank');
      setIsLiveActive(false);
    } else if (room.zoomJoinUrl) {
      window.open(room.zoomJoinUrl, '_blank');
      setIsLiveActive(false);
    } else {
      toast("No Zoom meeting URL configured", "error");
    }
  };

  const handleJoinLive = () => {
    if (!room.zoomMeetingId) {
      toast("No live session configured for this course", "error");
      return;
    }
    // Launch advanced native Zoom intent instead of web SDK
    setIsLiveActive(true);
  };

  const handleCloseLive = () => {
    setIsLiveActive(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f9fa] font-body text-zinc-900 pb-20">
      
      {/* Zoom Native Launch Overlay */}
      <AnimatePresence>
        {isLiveActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-white/20">
              <div className="p-8 pb-6 border-b border-black/5 bg-zinc-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <Video size={24} weight="fill" className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Secure Connection</div>
                    <h3 className="font-display font-bold text-xl text-zinc-900">Launch Zoom App</h3>
                  </div>
                </div>
                <button onClick={handleCloseLive} className="w-10 h-10 rounded-full bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-400 border border-black/5 transition-colors">
                  <X size={20} weight="bold" />
                </button>
              </div>
              <div className="p-8">
                <p className="text-sm font-medium text-zinc-600 mb-8 leading-relaxed">
                  For the best experience, including screen sharing, breakout rooms, and HD video, we recommend joining using the native Zoom desktop or mobile application.
                </p>
                <div className="flex flex-col gap-3">
                  <button onClick={handleNativeZoomJoin} className="w-full py-4 bg-[#ff1a1a] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#e01616] transition-colors shadow-lg shadow-[#ff1a1a]/30 flex items-center justify-center gap-2">
                    <VideoCamera size={20} weight="fill" /> 
                    {isHost ? "Start as Instructor (Host)" : "Join Native App"}
                  </button>
                  <button onClick={handleCloseLive} className="w-full py-4 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 pt-6 flex flex-col gap-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors w-fit group">
           <ArrowLeft size={20} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
           <span className="font-bold text-sm">Back to Dashboard</span>
        </Link>
        
        <div className="flex flex-col xl:flex-row gap-8">
          
        {/* Left / Center - Course Content */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          
          {/* Hero Video Card */}
          <div className="w-full aspect-video bg-zinc-900 rounded-[2.5rem] relative overflow-hidden shadow-2xl group cursor-pointer">
            <Image 
              src={room.courseImageUrl || (room.courseSlug ? COURSE_IMAGES[room.courseSlug] : null) || `https://picsum.photos/seed/${room.courseId}/1280/720`} 
              alt={room.courseTitle} 
              fill 
              priority
              className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[#ff1a1a] group-hover:scale-110 transition-all duration-300">
                <PlayCircle size={48} weight="fill" className="text-white" />
              </div>
            </div>
            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between text-white">
              <div className="max-w-xl">
                 <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-[#ff1a1a]">Featured Session</div>
                 <h1 className="text-3xl lg:text-4xl font-display font-black leading-tight">{room.courseTitle}</h1>
              </div>
              <div className="hidden sm:flex items-center gap-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <div className="flex flex-col items-center">
                   <span className="text-[10px] font-bold text-zinc-400">DURATION</span>
                   <span className="text-xs font-black">{room.durationHours || "12.5 Hours"}</span>
                </div>
                <div className="w-px h-6 bg-white/20"></div>
                <div className="flex flex-col items-center">
                   <span className="text-[10px] font-bold text-zinc-400">DIFFICULTY</span>
                   <span className="text-xs font-black">{room.difficulty || "Advanced"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructor & Header Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-zinc-200 overflow-hidden border border-black/5 shadow-sm">
                   <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${room.instructorName || 'Mentor'}&backgroundColor=f0f0f0`} alt="Instructor" width={56} height={56} />
                </div>
                <div>
                   <h4 className="text-lg font-black text-zinc-900">{room.instructorName || "Academy Mentor"}</h4>
                   <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                      <span className="text-[#ff1a1a]">Verified Instructor</span>
                      <span className="flex items-center gap-1"><UsersThree weight="fill" size={14} /> 12K Students</span>
                   </div>
                </div>
                <button className="ml-4 px-6 py-2.5 rounded-full border border-[#ff1a1a]/20 text-[11px] font-black uppercase tracking-widest text-[#ff1a1a] hover:bg-[#ff1a1a] hover:text-white transition-all shadow-sm">
                   Follow
                </button>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-900 cursor-pointer transition-colors">
                   <ShareNetwork size={20} weight="bold" />
                   <span className="text-xs font-bold">128</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 hover:text-[#ff1a1a] cursor-pointer transition-colors">
                   <CheckCircle size={20} weight="bold" />
                   <span className="text-xs font-bold">Enrolled</span>
                </div>
                <button className="p-2.5 rounded-xl border border-black/5 hover:bg-zinc-100 transition-colors text-zinc-400">
                   <DotsThree size={24} weight="bold" />
                </button>
             </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 border-b border-black/5 px-2 overflow-x-auto scrollbar-none">
             {(['overview', 'curriculum', 'materials', 'next-zoom', 'quizzes', 'tasks', 'classmates'] as const).map(tab => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative shrink-0 ${
                   activeTab === tab ? 'text-[#ff1a1a]' : 'text-zinc-400 hover:text-zinc-600'
                 }`}
               >
                 {tab.replace('-', ' ')}
                 {activeTab === tab && (
                   <motion.div layoutId="room-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#ff1a1a] rounded-t-full" />
                 )}
               </button>
             ))}
          </div>

          {/* Tab Content Area */}
          <div className="px-4 min-h-[500px]">
             <AnimatePresence mode="wait">
               {activeTab === 'overview' && (
                 <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                     <div className="flex items-center gap-5 mb-8 flex-wrap">
                        <div className="flex -space-x-3">
                           {room.classmates && room.classmates.length > 0 ? (
                             room.classmates.slice(0, 5).map((mate, i) => (
                               <div key={mate.userId || i} className="w-10 h-10 rounded-full border-4 border-[#f8f9fa] bg-zinc-200 overflow-hidden relative shrink-0" title={mate.displayName}>
                                  <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${mate.displayName || 'Peer'}&backgroundColor=f0f0f0`} alt={mate.displayName} width={40} height={40} />
                               </div>
                             ))
                           ) : (
                             [1, 2, 3].map(i => (
                               <div key={i} className="w-10 h-10 rounded-full border-4 border-[#f8f9fa] bg-zinc-200 overflow-hidden relative shrink-0">
                                  <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=mock${i}&backgroundColor=f0f0f0`} alt="user" width={40} height={40} />
                               </div>
                             ))
                           )}
                           {room.classmates && room.classmates.length > 5 && (
                              <div className="w-10 h-10 rounded-full border-4 border-[#f8f9fa] bg-[#ff1a1a] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                +{room.classmates.length - 5}
                              </div>
                           )}
                        </div>
                        <div className="flex flex-col">
                           <p className="text-xs font-black text-zinc-900 uppercase tracking-widest leading-none mb-1">
                              {room.roundStudentCount || room.classmates?.length || 0} Classmates Enrolled in {room.roundName}
                           </p>
                           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                              {room.courseStudentCount || 0} Students total across all course rounds
                           </span>
                        </div>
                     </div>
                     <p className="text-lg text-zinc-700 font-medium leading-relaxed max-w-3xl">
                       {room.courseDescription || "Welcome to your specialized learning environment. This curriculum is designed to push your boundaries in architectural logic and professional development."}
                     </p>

                     {/* Real Stats Grid */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        {[
                           { icon: Lightning, label: "Total XP", value: room.progress?.xpTotal ?? 0, color: "text-yellow-500", bg: "bg-yellow-50" },
                           { icon: Target, label: "Tasks Done", value: `${room.progress?.submittedTasks ?? 0}/${room.tasks?.length ?? 0}`, color: "text-brand", bg: "bg-brand/5" },
                           { icon: ChartLineUp, label: "Quizzes Done", value: `${room.progress?.completedQuizzes ?? 0}/${room.quizzes?.length ?? 0}`, color: "text-blue-500", bg: "bg-blue-50" },
                           { icon: Calendar, label: "Attended", value: `${room.progress?.attendanceCount ?? 0} sessions`, color: "text-green-500", bg: "bg-green-50" },
                        ].map(({ icon: Icon, label, value, color, bg }) => (
                           <div key={label} className="p-5 bg-white rounded-[2rem] border border-black/5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center shrink-0`}>
                                 <Icon size={24} weight="fill" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
                                 <p className={`text-lg font-black ${color}`}>{value}</p>
                              </div>
                           </div>
                        ))}
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                        <div className="space-y-6">
                           <h5 className="text-sm font-black uppercase tracking-widest text-zinc-900">Course Journey</h5>
                           <div className="grid grid-cols-1 gap-3">
                              {room.weeks.slice(0, 4).map((week, i) => (
                                 <div key={week.sessionInstanceId || i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-black/5 hover:shadow-sm transition-shadow">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black ${
                                       week.status === 'Completed' ? 'bg-green-50 text-green-600' :
                                       week.status === 'Live' ? 'bg-brand/10 text-brand animate-pulse' :
                                       'bg-zinc-50 text-zinc-400'
                                    }`}>
                                       {week.status === 'Completed' ? <CheckCircle size={20} weight="fill" /> : week.status === 'Live' ? <PlayCircle size={20} weight="fill" /> : week.weekNumber}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-xs font-bold text-zinc-900 truncate">{week.weekTitle}</p>
                                       <p className="text-[9px] font-medium text-zinc-400">{week.durationMinutes}m • Module {i+1} {week.status === 'Completed' ? '✓' : week.status === 'Live' ? '● Live' : '🔒'}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                           {room.weeks.length > 4 && (
                              <button onClick={() => setActiveTab('curriculum')} className="text-[10px] font-bold text-brand hover:underline flex items-center gap-1">
                                 View all {room.weeks.length} modules <ArrowRight size={14} />
                              </button>
                           )}
                        </div>
                        <div className="p-8 bg-[#1a1a1a] rounded-[3rem] text-white relative overflow-hidden">
                           <div className="relative z-10">
                              <h5 className="text-sm font-black uppercase tracking-widest text-[#ff1a1a] mb-6">Course Benefits</h5>
                              <ul className="space-y-4">
                                 {['Lifetime Access to Materials', 'Direct Mentor Feedback', 'Industry Certification', 'Advanced Project Portfolio'].map((item, i) => (
                                   <li key={i} className="flex items-center gap-3 text-sm font-bold opacity-80">
                                      <CheckCircle size={18} weight="fill" className="text-[#ff1a1a]" /> {item}
                                   </li>
                                 ))}
                              </ul>
                              <button className="mt-10 w-full py-4 bg-white text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff1a1a] hover:text-white transition-all">
                                 Download Syllabus
                              </button>
                           </div>
                           <div className="absolute top-[-50px] right-[-50px] w-60 h-60 bg-[#ff1a1a] rounded-full blur-[100px] opacity-10"></div>
                        </div>
                     </div>
                 </motion.div>
               )}

               {(activeTab === 'sessions' || activeTab === 'curriculum') && (
                 <motion.div key="curriculum" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    {room.weeks.map((week, idx) => (
                      <div key={week.sessionInstanceId || idx} className="flex items-center gap-4 p-5 bg-white rounded-[2.5rem] border border-black/5 hover:border-[#ff1a1a]/30 transition-all group shadow-sm">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm border-2 ${
                            week.status === 'Live' ? 'bg-[#ff1a1a] border-[#ff1a1a] text-white animate-pulse' : 
                            week.status === 'Completed' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-zinc-50 border-zinc-100 text-zinc-400'
                         }`}>
                            {idx + 1}
                         </div>
                         <div className="flex-1">
                            <h4 className="text-base font-black text-zinc-900 group-hover:text-[#ff1a1a] transition-colors">{week.weekTitle}</h4>
                            <div className="flex items-center gap-4 mt-1">
                               <span className="text-[10px] font-black uppercase tracking-widest text-[#ff1a1a] flex items-center gap-1.5">
                                  <Video size={14} weight="fill" /> {week.sessionType}
                               </span>
                               <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                  <Clock size={14} weight="bold" /> {week.durationMinutes} Min
                               </span>
                            </div>
                         </div>
                         {week.status === 'Live' ? (
                           <button onClick={handleJoinLive} className="px-6 py-3 bg-[#ff1a1a] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#ff1a1a]/20 active:scale-95 transition-transform">Join Live</button>
                         ) : week.status === 'Completed' ? (
                           <button className="flex items-center gap-2 px-5 py-3 border border-black/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all">
                              <PlayCircle size={18} /> Watch Recording
                           </button>
                         ) : (
                           <div className="flex items-center gap-2 px-5 py-3 bg-zinc-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-300">
                              <LockKey size={18} /> Locked
                           </div>
                         )}
                      </div>
                    ))}
                 </motion.div>
               )}

               {activeTab === 'next-zoom' && (
                 <motion.div key="next-zoom" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8">
                    <div className="w-full bg-[#1a1a1a] rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
                       <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
                          <div className="w-20 h-20 bg-[#ff1a1a]/20 rounded-full flex items-center justify-center mb-8 border border-[#ff1a1a]/40 animate-bounce">
                             <VideoCamera size={40} weight="fill" className="text-[#ff1a1a]" />
                          </div>
                          <h3 className="text-3xl lg:text-5xl font-display font-black mb-4">The Next Live Sync is Approaching</h3>
                          <p className="text-zinc-400 font-medium text-lg mb-12">Synchronize with your peers and mentor for the Week 5 architectural logic breakdown. Have your questions ready!</p>
                          
                          <div className="grid grid-cols-4 gap-4 w-full mb-12">
                             {[
                                { val: '01', unit: 'Day' },
                                { val: '14', unit: 'Hours' },
                                { val: '22', unit: 'Mins' },
                                { val: '45', unit: 'Secs' }
                             ].map((t, i) => (
                               <div key={i} className="flex flex-col items-center p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                                  <span className="text-4xl font-display font-black text-white mb-1">{t.val}</span>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-[#ff1a1a]">{t.unit}</span>
                               </div>
                             ))}
                          </div>

                          <div className="flex items-center gap-6">
                             <button onClick={handleJoinLive} className="px-12 py-5 bg-[#ff1a1a] text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-white hover:text-zinc-900 transition-all shadow-2xl shadow-[#ff1a1a]/40 active:scale-95">
                                Join Waiting Room
                             </button>
                             <button className="px-8 py-5 border border-white/20 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                Add to Calendar
                             </button>
                          </div>
                       </div>
                       <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#ff1a1a] rounded-full blur-[150px] opacity-10"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="p-8 bg-white rounded-[2.5rem] border border-black/5 shadow-sm">
                          <h6 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Agenda</h6>
                          <p className="text-sm font-bold text-zinc-800 leading-relaxed">Breakdown of the new project requirements and Q&A session.</p>
                       </div>
                       <div className="p-8 bg-white rounded-[2.5rem] border border-black/5 shadow-sm">
                          <h6 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Prerequisites</h6>
                          <p className="text-sm font-bold text-zinc-800 leading-relaxed">Ensure you have completed the Module 4 task before joining.</p>
                       </div>
                       <div className="p-8 bg-white rounded-[2.5rem] border border-black/5 shadow-sm">
                          <h6 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Platform</h6>
                          <p className="text-sm font-bold text-[#ff1a1a] leading-relaxed">Integrated Zoom SDK with End-to-End Encryption.</p>
                       </div>
                    </div>
                 </motion.div>
               )}

               {activeTab === 'materials' && (
                 <motion.div key="materials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    {room.materials && room.materials.length > 0 ? room.materials.map(mat => (
                       <MaterialItem key={mat.id} material={mat} isAdmin={isInstructor} />
                    )) : (
                       <div className="p-12 text-center text-zinc-500 font-medium">No materials uploaded for this course yet.</div>
                    )}
                 </motion.div>
               )}

               {activeTab === 'quizzes' && (
                  <motion.div key="quizzes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quizLoading ? (
                      <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map(i => (
                          <div key={i} className="p-6 bg-white rounded-3xl border border-black/5 animate-pulse">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-200 mb-4" />
                            <div className="h-5 bg-zinc-200 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-zinc-100 rounded w-1/2 mb-4" />
                            <div className="h-10 bg-zinc-200 rounded-xl w-full" />
                          </div>
                        ))}
                      </div>
                    ) : courseQuizzes.length > 0 ? courseQuizzes.map((quiz, i) => (
                      <div key={quiz.id || i} className="p-6 bg-white rounded-3xl border border-black/5 shadow-sm flex flex-col gap-4 hover:shadow-lg transition-all hover:-translate-y-0.5">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                          <PencilSimpleLine size={24} weight="bold" />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-zinc-900">{quiz.title}</h4>
                          <p className="text-xs text-zinc-500 font-medium mt-1">{quiz.questionsCount || 0} Questions · {quiz.timeLimitMinutes || 15} Minutes · {quiz.xpReward} XP</p>
                          <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-100 text-zinc-500">{quiz.quizType}</span>
                        </div>
                        <Link href={`/quiz?quizId=${quiz.id}`} className="mt-auto py-3 bg-zinc-900 text-white text-center rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">Start Quiz</Link>
                      </div>
                    )) : room.quizzes && room.quizzes.length > 0 ? room.quizzes.map((quiz, i) => (
                      <div key={quiz.id || i} className="p-6 bg-white rounded-3xl border border-black/5 shadow-sm flex flex-col gap-4 hover:shadow-lg transition-all hover:-translate-y-0.5">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                          <PencilSimpleLine size={24} weight="bold" />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-zinc-900">{quiz.title}</h4>
                          <p className="text-xs text-zinc-500 font-medium mt-1">{quiz.questionsCount || 0} Questions · {quiz.timeLimitMinutes || 15} Minutes · {quiz.xpReward} XP</p>
                          <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-100 text-zinc-500">{quiz.quizType}</span>
                        </div>
                        <Link href={`/quiz?quizId=${quiz.id}`} className="mt-auto py-3 bg-zinc-900 text-white text-center rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">Start Quiz</Link>
                      </div>
                    )) : (
                      <div className="col-span-1 md:col-span-2 p-12 text-center text-zinc-500 font-medium">No quizzes available for this course yet.</div>
                    )}
                  </motion.div>
                )}

               {activeTab === 'tasks' && (
                 <motion.div key="tasks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {room.tasks && room.tasks.length > 0 ? room.tasks.map(task => (
                        <TaskCard key={task.id} task={task} isAdmin={isInstructor} userId={user.id} />
                    )) : (
                       <div className="col-span-1 md:col-span-2 p-12 text-center text-zinc-500 font-medium">No tasks assigned yet.</div>
                    )}
                 </motion.div>
               )}

               {activeTab === 'classmates' && (
                 <motion.div key="classmates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                       <div>
                          <h3 className="text-xl font-display font-black text-zinc-900 leading-none mb-1">Classroom Peers</h3>
                          <p className="text-xs text-zinc-500 font-medium">
                            Meet your fellow cohort classmates inside {room.roundName || 'this round'}.
                          </p>
                       </div>
                       <div className="bg-[#ffe6e6] px-4 py-2.5 rounded-2xl border border-[#ff1a1a]/10 text-[10px] font-black uppercase tracking-widest text-[#ff1a1a] flex items-center gap-2">
                          <UsersThree size={16} weight="fill" /> {room.roundStudentCount || room.classmates?.length || 0} Peers Enrolled
                       </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                       {room.classmates && room.classmates.length > 0 ? room.classmates.map((mate, idx) => (
                          <div key={mate.userId || idx} className="bg-white rounded-[2.5rem] p-6 border border-black/5 hover:border-black/10 hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-100 via-brand to-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                             <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-black/5 overflow-hidden flex items-center justify-center shrink-0">
                                   <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${mate.displayName || 'Peer'}&backgroundColor=f0f0f0`} alt={mate.displayName} width={56} height={56} />
                                </div>
                                <div className="min-w-0">
                                   <h4 className="text-sm font-black text-zinc-900 truncate leading-snug group-hover:text-[#ff1a1a] transition-colors">{mate.displayName}</h4>
                                   <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest font-mono truncate block">{mate.email || 'private classmate'}</span>
                                </div>
                             </div>
                             <div className="flex items-center justify-between pt-4 border-t border-black/5">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                   <Trophy size={14} weight="fill" className="text-yellow-500" /> Level {mate.level || 1}
                                </span>
                                <span className="text-xs font-black text-zinc-900 font-mono">
                                   {mate.totalXp || 0} <span className="text-zinc-400 text-[10px]">XP</span>
                                </span>
                             </div>
                          </div>
                       )) : (
                          <div className="col-span-full py-12 text-center text-zinc-500 font-medium">
                             No classmates enrolled in this round yet.
                          </div>
                       )}
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

        </div>

        {/* Right Sidebar - Progress & Recommendations */}
        <aside className="w-full xl:w-[380px] flex flex-col gap-8">
           
           {/* Course Progress Card */}
           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-display font-black text-zinc-900">Course Progress</h3>
                 <span className="text-sm font-black text-[#ff1a1a]">{progressPercentage.toFixed(0)}%</span>
              </div>
              
              <div className="w-full h-2 bg-zinc-100 rounded-full mb-10 overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${progressPercentage}%` }}
                   className="h-full bg-gradient-to-r from-[#cc0000] to-[#ff1a1a]"
                 />
              </div>

              {/* Module Timeline */}
              <div className="space-y-8 relative">
                 <div className="absolute top-0 bottom-0 left-[11px] w-px bg-zinc-100" />
                 {room.weeks.map((week, i) => (
                   <div key={i} className="flex gap-4 relative z-10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                        week.status === 'Completed' ? 'bg-[#ff1a1a] border-[#ff1a1a] text-white shadow-lg shadow-[#ff1a1a]/30' : 
                        week.status === 'Live' ? 'bg-white border-[#ff1a1a] text-[#ff1a1a]' : 'bg-white border-zinc-200'
                      }`}>
                        {week.status === 'Completed' ? <CheckCircle size={14} weight="bold" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                      </div>
                      <div className="flex-1">
                         <h5 className={`text-xs font-bold leading-tight ${week.status === 'Completed' ? 'text-zinc-400' : 'text-zinc-900'}`}>
                            {week.weekTitle}
                         </h5>
                         <span className="text-[10px] text-zinc-400 font-medium">{week.durationMinutes}m Video · Module {i+1}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Recommended Courses */}
           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
              <h3 className="text-lg font-display font-black text-zinc-900 mb-6">Recommended</h3>
              <div className="space-y-4">
                 {[1, 2].map(i => (
                   <div key={i} className="flex gap-3 group cursor-pointer">
                      <div className="w-24 h-16 rounded-xl bg-zinc-100 overflow-hidden shrink-0 relative">
                         <Image src={`https://picsum.photos/seed/rec${i}/200/150`} alt="rec" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <h5 className="text-[11px] font-bold text-zinc-900 leading-tight line-clamp-2">Build Dynamic UI for Websites with Advanced Patterns</h5>
                         <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] font-black text-[#ff1a1a]">$256</span>
                            <span className="text-[9px] font-bold text-zinc-400 flex items-center gap-0.5"><Star size={10} weight="fill" className="text-yellow-500" /> 4.9</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-6 py-3 border border-black/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
                 See All Courses
              </button>
           </div>

        </aside>

         </div>
      </div>
    </div>
  );
}

function ControlBtn({ icon, label }: { icon: ReactNode, label: string }) {
   return (
      <button className="flex flex-col items-center gap-2 group">
         <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-white/10 group-hover:text-white transition-all">
            {icon}
         </div>
         <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
      </button>
   );
}

function CurriculumCard({ week, idx, isExpanded, onToggle, isAdmin }: { week: SessionWeek, idx: number, isExpanded: boolean, onToggle: () => void, isAdmin: boolean }) {
  const isCompleted = week.status === "Completed";
  const isLive = week.status === "Live";
  const { toast } = useToast();
  
  return (
    <div className={`bg-white rounded-[2.5rem] border border-black/5 shadow-sm transition-all overflow-hidden ${isLive ? 'ring-2 ring-brand ring-offset-4 ring-offset-canvas-soft' : ''}`}>
       <div 
         onClick={onToggle}
         className="p-8 flex flex-col md:flex-row gap-8 cursor-pointer hover:bg-zinc-50/50 transition-colors"
       >
          <div className={`w-20 h-20 rounded-[2.2rem] flex flex-col items-center justify-center shrink-0 border-2 ${
            isLive ? "bg-brand text-brand-fg border-brand" : 
            isCompleted ? "bg-[#f3eeff] text-[#7c3aed] border-[#7c3aed]/10" : 
            "bg-zinc-50 text-zinc-400 border-zinc-100"
          }`}>
             <span className="text-[9px] font-black uppercase tracking-widest">Step</span>
             <span className="text-3xl font-black leading-none">{week.weekNumber}</span>
          </div>
          
          <div className="flex-1">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <h3 className="font-display text-3xl font-black text-zinc-900 tracking-tight">{week.weekTitle}</h3>
                <div className="flex items-center gap-2">
                   {isCompleted && <span className="bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-green-100 flex items-center gap-2"><CheckCircle size={16} weight="fill" /> Completed</span>}
                   {isLive && <span className="bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-brand/20 animate-pulse flex items-center gap-2"><Sparkle size={16} weight="fill" /> Live Now</span>}
                   <CaretDown size={20} className={`text-zinc-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
             </div>
             <div className="flex items-center gap-4">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${week.sessionType === 'Core' ? 'bg-zinc-100 text-zinc-500' : 'bg-[#c2f0ff] text-[#0284c7]'}`}>{week.sessionType === 'TechnicalSupport' ? 'CTA Lab' : week.sessionType}</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1"><Clock size={14} /> {week.durationMinutes} min</span>
             </div>
          </div>
       </div>

       <AnimatePresence>
         {isExpanded && (
           <motion.div 
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: "auto", opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             className="border-t border-black/5 bg-zinc-50/30"
           >
              <div className="p-10 flex flex-col md:flex-row gap-12">
                 <div className="flex-1 space-y-6">
                    <div>
                       <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Focus Areas</h4>
                       <div className="flex flex-wrap gap-2">
                          {['Architecture', 'Logic Flow', 'Deployment'].map(tag => (
                            <span key={tag} className="bg-white border border-black/5 text-zinc-700 px-4 py-2 rounded-xl text-xs font-bold">{tag}</span>
                          ))}
                       </div>
                    </div>
                    <p className="text-zinc-600 font-medium leading-relaxed max-w-xl">
                       This session covers the core intelligence structures of your project. We'll be mapping logic trees and setting up the hardware-accelerated build environment.
                    </p>
                 </div>
                 <div className="flex flex-col gap-3 min-w-[240px]">
                    <button className="w-full bg-ink text-canvas font-bold py-4 rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10">
                       <PlayCircle size={20} weight="fill" /> Watch Playback
                    </button>
                    <button className="w-full bg-white border border-black/10 text-zinc-900 font-bold py-4 rounded-2xl hover:bg-zinc-50 transition-all flex items-center justify-center gap-2">
                       <IdentificationBadge size={20} weight="bold" /> View Resources
                    </button>
                    {isAdmin && (
                       <button 
                         onClick={async (e) => {
                           e.stopPropagation();
                           try {
                             await updateCourseStep(week.sessionInstanceId, { status: "Completed" });
                             toast(`Step ${week.weekNumber} completed`, "success");
                           } catch {
                             toast("Update failed", "error");
                           }
                         }}
                         className="w-full bg-brand-neutral text-zinc-950 font-black py-4 rounded-2xl hover:bg-brand-hover transition-all flex items-center justify-center gap-2 shadow-lg"
                       >
                          <PencilSimple size={20} weight="bold" /> Mark Complete
                       </button>
                    )}
                 </div>
              </div>
           </motion.div>
         )}
       </AnimatePresence>
     </div>
  );
}

function TaskCard({ task, isAdmin, userId }: { task: LearningTask, isAdmin: boolean, userId?: string }) {
  const isPending = task.status === 'pending';
  const [taskStatus, setTaskStatus] = useState(task.status);
  const { toast } = useToast();
  
  // Submit modal states
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [github, setGithub] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<"idle" | "uploading" | "analyzing" | "verifying" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!github && !liveUrl && !notes) {
      toast("Please provide at least a repository link, a demo URL, or summary notes.", "error");
      return;
    }

    setSubmitting(true);
    setStep("uploading");
    
    // Smooth progress micro-animations
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    await new Promise((resolve) => setTimeout(resolve, 1600));
    setStep("analyzing");
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setStep("verifying");
    await new Promise((resolve) => setTimeout(resolve, 1200));

    try {
      if (userId) {
        await submitTask(task.id, userId, {
          submissionText: notes,
          repositoryUrl: github,
          submissionUrl: liveUrl
        });
      }
      setStep("success");
      setTaskStatus("submitted");
      toast("Task submitted successfully for review!", "success");
      
      setTimeout(() => {
        setIsOpen(false);
        // Reset states
        setNotes("");
        setGithub("");
        setLiveUrl("");
        setStep("idle");
        setProgress(0);
        setSubmitting(false);
      }, 1500);
    } catch (err: any) {
      clearInterval(progressInterval);
      toast(err.message || "Failed to submit task", "error");
      setSubmitting(false);
      setStep("idle");
    }
  };

  return (
    <>
      <div className="bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between min-h-[280px] relative overflow-hidden">
         {taskStatus === 'submitted' && (
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-full flex items-start justify-end p-4 pointer-events-none">
              <CheckCircle size={24} weight="fill" className="text-green-500" />
            </div>
         )}
         <div>
            <div className="flex items-center justify-between mb-6">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${taskStatus === 'pending' ? 'bg-brand/10 text-brand' : 'bg-green-100 text-green-600'}`}>
                  {taskStatus === 'pending' ? <Cpu size={24} weight="duotone" /> : <CheckCircle size={24} weight="fill" />}
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mr-8">Due {task.dueAt}</span>
               </div>
            </div>
            <h3 className="text-2xl font-black font-display text-zinc-900 mb-3 leading-tight">{task.title}</h3>
            <p className="text-zinc-500 text-sm font-medium mb-8 leading-relaxed">{task.description}</p>
         </div>
         
         <div className="flex items-center justify-between pt-6 border-t border-black/5 mt-4">
            <div className="flex items-center gap-2">
               <Sparkle size={18} weight="fill" className="text-[#ff1a1a]" />
               <span className="text-sm font-black text-zinc-900">{task.xpReward} XP</span>
            </div>
            <button 
              onClick={() => {
                 if (isAdmin) {
                    toast("Grading interface active via Instructor Control Room.", "info");
                 } else if (taskStatus === 'pending') {
                    setIsOpen(true);
                 }
              }}
              disabled={!isAdmin && taskStatus !== 'pending'}
              className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
              isAdmin ? 'bg-zinc-950 text-white' : 
              taskStatus === 'pending' ? 'bg-[#ff1a1a] text-white hover:bg-[#cc0000] shadow-md shadow-[#ff1a1a]/20 hover:-translate-y-0.5 active:translate-y-0' : 'bg-green-50 text-green-600 border border-green-100 cursor-not-allowed'
            }`}>
                {isAdmin ? 'Grade Submissions' : taskStatus === 'pending' ? 'Submit Work' : 'Submitted'}
            </button>
         </div>
      </div>

      {/* Advanced Animated Glassmorphism Submission Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 20 }} 
              className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl border border-black/5 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-8 pb-6 bg-zinc-50/50 border-b border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg shadow-black/10">
                    <Code size={22} weight="bold" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#ff1a1a]">Task Submission</span>
                    <h3 className="font-display font-black text-xl text-zinc-900">{task.title}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => !submitting && setIsOpen(false)} 
                  disabled={submitting}
                  className="w-10 h-10 rounded-full bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-400 border border-black/5 transition-colors disabled:opacity-50"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6 flex-1 overflow-y-auto max-h-[75vh]">
                {step === "idle" ? (
                  <>
                    <div className="bg-[#fff5f5] border border-[#ff1a1a]/10 p-5 rounded-2xl flex items-start gap-3">
                      <Lightning size={20} weight="fill" className="text-[#ff1a1a] shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-zinc-700 leading-relaxed">
                        Submit your project to get graded. You can provide a link to your public code repository (GitHub, GitLab), your production live link, and include optional notes detailing your architectural decisions.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* GitHub Link */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">GitHub / Source Repository</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                            <Code size={18} weight="bold" />
                          </span>
                          <input 
                            type="url"
                            placeholder="https://github.com/username/project"
                            value={github}
                            onChange={(e) => setGithub(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#ff1a1a] transition-all"
                          />
                        </div>
                      </div>

                      {/* Production Link */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">Production / Live Demo URL</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                            <ShareNetwork size={18} weight="bold" />
                          </span>
                          <input 
                            type="url"
                            placeholder="https://my-app.vercel.app"
                            value={liveUrl}
                            onChange={(e) => setLiveUrl(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#ff1a1a] transition-all"
                          />
                        </div>
                      </div>

                      {/* Explanation Notes */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">Submission Notes / Summary</label>
                        <textarea 
                          rows={4}
                          placeholder="Provide a brief summary of how you built this, core technologies, and key learnings..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full p-5 bg-zinc-50 border border-black/5 rounded-3xl text-sm font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#ff1a1a] transition-all resize-none"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkle size={18} weight="fill" className="text-[#ff1a1a]" />
                        <span className="text-xs font-black text-zinc-900">Yields +{task.xpReward} XP</span>
                      </div>
                      <button 
                        type="submit"
                        className="px-8 py-4 bg-zinc-900 text-white hover:bg-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-98"
                      >
                        Transmit Submission
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 relative mb-8">
                      {step === "uploading" && (
                        <>
                          <div className="absolute inset-0 rounded-full border-4 border-zinc-100 animate-pulse"></div>
                          <div className="absolute inset-0 rounded-full border-t-4 border-[#ff1a1a] animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-sm text-[#ff1a1a]">
                            {progress}%
                          </div>
                        </>
                      )}
                      {step === "analyzing" && (
                        <div className="absolute inset-0 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center animate-pulse text-orange-500">
                          <Cpu size={36} weight="duotone" className="animate-spin duration-3000" />
                        </div>
                      )}
                      {step === "verifying" && (
                        <div className="absolute inset-0 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center animate-pulse text-blue-500">
                          <Gear size={36} weight="bold" className="animate-spin" />
                        </div>
                      )}
                      {step === "success" && (
                        <motion.div 
                          initial={{ scale: 0.5, rotate: -45 }} 
                          animate={{ scale: 1, rotate: 0 }} 
                          className="absolute inset-0 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/30"
                        >
                          <CheckCircle size={44} weight="bold" />
                        </motion.div>
                      )}
                    </div>

                    <h4 className="font-display font-black text-2xl text-zinc-900 mb-2">
                      {step === "uploading" && "Transmitting Code..."}
                      {step === "analyzing" && "Static Code Analysis..."}
                      {step === "verifying" && "Compiling and Verifying..."}
                      {step === "success" && "Submission Received!"}
                    </h4>
                    <p className="text-zinc-500 font-bold text-xs max-w-sm leading-relaxed uppercase tracking-wider">
                      {step === "uploading" && "Uploading resources to ElSewedy Secure Cloud Core..."}
                      {step === "analyzing" && "Checking syntactical logic and architectural rules..."}
                      {step === "verifying" && "Creating secure delivery record and updating leaderboard..."}
                      {step === "success" && "Your project is queued for mentoring grading feedback."}
                    </p>
                  </div>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MaterialItem({ material, isAdmin }: { material: any, isAdmin: boolean }) {
  return (
    <div className="flex items-center justify-between p-6 rounded-[2rem] bg-zinc-50 hover:bg-brand-neutral/10 transition-all group cursor-pointer border border-transparent hover:border-brand-neutral/30">
       <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center shadow-sm">
            {material.materialType === 'Pdf' ? <FilePdf size={24} className="text-[#EF4444]" weight="fill" /> : <Video size={24} className="text-[#0284c7]" weight="fill" />}
          </div>
          <div className="flex flex-col">
             <span className="font-bold text-sm text-zinc-900 group-hover:text-brand transition-colors">{material.title}</span>
             <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{material.materialType}</span>
          </div>
       </div>
       <div className="flex items-center gap-3">
          {isAdmin && <button className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"><X size={16} weight="bold" /></button>}
          {material.isDownloadable && (
            <DownloadSimple size={20} className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
          )}
       </div>
    </div>
  );
}
