"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import type { CourseRoom, SessionWeek, LearningTask } from "@/lib/types";
import { 
  Books, MonitorPlay, UsersThree, Trophy, 
  ArrowRight, PlayCircle, LockKey, CheckCircle,
  Video, FilePdf, DownloadSimple, Sparkle,
  Clock, Calendar, IdentificationBadge, CaretDown,
  Terminal, HardDrive, Cpu, X, Microphone,
  VideoCamera, ChatTeardropText, ShareNetwork,
  UserPlus, Gear, UploadSimple, Plus, PencilSimple,
  Code, PencilSimpleLine, Student
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/lib/toast-context";
import { submitTask, uploadCourseMaterial, updateCourseStep, requestZoomSignature } from "@/lib/api";

export function CourseRoomExperience({ room, isAdminView = false }: { room: CourseRoom, isAdminView?: boolean }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"curriculum" | "tasks" | "vault">("curriculum");
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [zoomLoading, setZoomLoading] = useState(false);
  const [zoomSignature, setZoomSignature] = useState<{ signature: string; sdkKey: string } | null>(null);
  const zoomClientRef = useRef<any>(null);
  const zoomRootRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Interaction Handlers
  const handleUploadMaterial = async () => {
    const title = prompt("Material Title:");
    if (!title) return;
    try {
      await uploadCourseMaterial(room.courseId, {
        title,
        materialType: "Pdf",
        url: "#",
        isDownloadable: true
      });
      toast("Material uploaded to vault", "success");
    } catch (err) {
      toast("Upload failed", "error");
    }
  };

  const handleNewStep = async () => {
    toast("Cycle creation initialized", "info");
  };

  const handleJoinLive = async () => {
    if (!room.zoomMeetingId) {
      toast("No live session configured for this course", "error");
      return;
    }
    setZoomLoading(true);
    try {
      const role = isInstructor ? 1 : 0;
      const sig = await requestZoomSignature(room.zoomMeetingId, role);
      setZoomSignature({ signature: sig.signature, sdkKey: sig.sdkKey });
      setIsLiveActive(true);
    } catch (err) {
      toast("Failed to initialize live session", "error");
      setZoomLoading(false);
    }
  };

  useEffect(() => {
    if (!isLiveActive || !zoomSignature || !zoomRootRef.current) return;

    const initZoom = async () => {
      try {
        const { ZoomMtg } = await import("@zoom/meetingsdk");
        ZoomMtg.setZoomJSLib("https://source.zoom.us/2.21.0/lib", "/av");
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareWebSDK();

        ZoomMtg.init({
          leaveUrl: window.location.href,
          success: () => {
            ZoomMtg.join({
              signature: zoomSignature.signature,
              meetingNumber: room.zoomMeetingId || "",
              userName: user?.displayName || "Student",
              sdkKey: zoomSignature.sdkKey,
              passWord: room.zoomMeetingPassword || "",
              success: () => {
                setZoomLoading(false);
              },
              error: (err: any) => {
                console.error("Zoom join error:", err);
                toast("Failed to join session", "error");
                setZoomLoading(false);
              }
            });
          },
          error: (err: any) => {
            console.error("Zoom init error:", err);
            toast("Failed to initialize Zoom", "error");
            setZoomLoading(false);
          }
        });
      } catch (err) {
        console.error("Zoom SDK error:", err);
        toast("Failed to load Zoom SDK", "error");
        setZoomLoading(false);
      }
    };

    initZoom();
  }, [isLiveActive, zoomSignature]);

  useEffect(() => {
    return () => {
      import("@zoom/meetingsdk").then(({ ZoomMtg }) => {
        ZoomMtg.leaveMeeting({});
      }).catch(() => {});
    };
  }, []);

  const handleCloseLive = () => {
    import("@zoom/meetingsdk").then(({ ZoomMtg }) => {
      ZoomMtg.leaveMeeting({});
    }).catch(() => {});
    setIsLiveActive(false);
    setZoomSignature(null);
    setZoomLoading(false);
  };

  if (!user) return null;

  // Determine Role for Session
  const isInstructor = user.role === "Instructor" || user.role === "engineer" || isAdminView;
  const isTechnical = user.role === "cta" || user.role === "technical";

  const currentWeek = room.weeks.find(w => w.status === "Live") || room.weeks.find(w => w.status === "Scheduled") || room.weeks[0];

  if (room.weeks.length === 0) {
    return (
      <div className="w-full px-6 lg:px-12 pt-6 pb-24 flex flex-col gap-8 bg-canvas-soft min-h-screen font-body">
        <div className="bg-ink text-white rounded-[3rem] p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-brand/20 text-brand text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full">Course Room</span>
              {room.instructorName && (
                <span className="bg-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full flex items-center gap-2">
                  <IdentificationBadge size={14} weight="fill" /> {room.instructorName}
                </span>
              )}
            </div>
            <h1 className="font-display text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-4">{room.courseTitle}</h1>
            {room.courseDescription && (
              <p className="text-zinc-400 font-medium text-lg max-w-2xl leading-relaxed">{room.courseDescription}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm border border-black/5">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Cpu size={32} weight="fill" className="text-zinc-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-zinc-900 mb-2">Your course is ready</h2>
          <p className="text-zinc-500 font-medium max-w-md mx-auto">Sessions will appear here once the instructor publishes them. In the meantime, explore your materials and tasks below.</p>
          {room.materials.length > 0 && (
            <div className="mt-8 max-w-lg mx-auto">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Available Materials</h3>
              <div className="space-y-2">
                {room.materials.map(m => (
                  <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-colors text-left">
                    <FilePdf size={20} weight="fill" className="text-brand" />
                    <span className="font-bold text-zinc-900">{m.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          {room.tasks.length > 0 && (
            <div className="mt-6 max-w-lg mx-auto">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Pending Tasks</h3>
              {room.tasks.filter(t => t.status === "pending").map(t => (
                <div key={t.id} className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl text-left mb-2">
                  <Cpu size={20} weight="fill" className="text-amber-600" />
                  <div>
                    <div className="font-bold text-zinc-900 text-sm">{t.title}</div>
                    <div className="text-xs text-zinc-500">{t.xpReward} XP · Due {t.dueAt}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24 flex flex-col gap-8 bg-canvas-soft min-h-screen font-body relative">
      
      {/* Live Session Portal (Zoom Embedding) */}
      <AnimatePresence>
         {isLiveActive && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col overflow-hidden"
            >
               {/* Session Header */}
               <div className="h-16 px-6 bg-zinc-900 border-b border-white/10 flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                     <div className="bg-brand px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest animate-pulse">Live</div>
                     <h3 className="font-display font-bold">{room.courseTitle} — {currentWeek.weekTitle}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-xs font-bold text-zinc-500">Encrypted Protocol Active</span>
                     <button onClick={handleCloseLive} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={24} weight="bold" />
                     </button>
                  </div>
               </div>

               {/* Video Area */}
               <div className="flex-1 relative flex">
                  <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
                     <div className="w-full h-full max-w-5xl aspect-video bg-zinc-900 rounded-2xl shadow-2xl relative overflow-hidden">
                        {!zoomSignature ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                             <div className="flex flex-col items-center gap-4">
                                <div className="w-24 h-24 rounded-full bg-zinc-700 animate-pulse"></div>
                                <span className="text-zinc-500 font-display font-bold">Initializing Secure Connection...</span>
                             </div>
                          </div>
                        ) : (
                          <div ref={zoomRootRef} className="absolute inset-0" />
                        )}
                        
                        {/* Role Overlay */}
                        {zoomSignature && (
                        <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-white flex items-center gap-3 border border-white/10">
                           <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                           <span className="text-sm font-bold">{user?.displayName || "Student"} ({isInstructor ? "Instructor" : "Participant"})</span>
                        </div>
                        )}
                     </div>
                  </div>

                  {/* Participation Sidebar */}
                  <div className="w-80 bg-zinc-900 border-l border-white/10 hidden lg:flex flex-col">
                     <div className="p-6 border-b border-white/5">
                        <h4 className="text-white font-bold text-sm mb-4">Participants (24)</h4>
                        <div className="space-y-3">
                           {['You', 'Nour A.', 'Youssef K.', 'Mariam S.'].map((p, i) => (
                             <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center text-[10px] text-zinc-400">{p[0]}</div>
                                <span className="text-sm text-zinc-300 font-medium">{p}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                     <div className="flex-1 p-6 overflow-y-auto">
                        <h4 className="text-white font-bold text-sm mb-4">Chat</h4>
                        <div className="space-y-4">
                           <div className="bg-white/5 p-3 rounded-xl">
                              <span className="block text-[10px] font-black text-brand uppercase mb-1">System</span>
                              <p className="text-xs text-zinc-400">Welcome to the Intelligence Sync. Protocol active.</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Control Bar */}
               <div className="h-24 bg-zinc-950 border-t border-white/10 flex items-center justify-center gap-4">
                  <ControlBtn icon={<Microphone size={24} />} label="Mute" />
                  <ControlBtn icon={<VideoCamera size={24} />} label="Video" />
                  <div className="w-px h-10 bg-white/10 mx-2" />
                  <ControlBtn icon={<ShareNetwork size={24} />} label="Share" />
                  <ControlBtn icon={<ChatTeardropText size={24} />} label="Chat" />
                  <ControlBtn icon={<UserPlus size={24} />} label="Peers" />
                  <div className="w-px h-10 bg-white/10 mx-2" />
                  <ControlBtn icon={<Gear size={24} />} label="Settings" />
                  <button className="ml-8 bg-red-600 hover:bg-red-700 text-white font-black px-8 py-3 rounded-xl transition-all active:scale-95 text-xs uppercase tracking-widest">
                     End Session
                  </button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
      
      {/* Header Room Banner */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-ink text-canvas rounded-[3rem] p-10 lg:p-16 relative overflow-hidden shadow-2xl border border-white/5"
      >
        <div className="absolute inset-0 opacity-[0.2] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="bg-brand-neutral text-zinc-950 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
              {isInstructor ? "Authorized Instructor Node" : "Intelligence Protocol Active"}
            </span>
            <span className="bg-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-full flex items-center gap-2 border border-white/10 backdrop-blur-sm">
              <UsersThree size={16} weight="fill" className="text-brand" />
              {room.weeks.length} Sessions
            </span>
            {room.instructorName && (
              <span className="bg-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-full flex items-center gap-2 border border-white/10 backdrop-blur-sm">
                <IdentificationBadge size={16} weight="fill" className="text-brand" />
                {room.instructorName}
              </span>
            )}
          </div>
          
          <h1 className="font-display text-5xl lg:text-8xl font-black tracking-tighter leading-[0.85] mb-4">
             {room.courseTitle}
             <span className="block text-brand opacity-50 font-display font-medium text-2xl lg:text-3xl mt-3 tracking-normal italic">{room.roundName}</span>
          </h1>
          
          {room.courseDescription && (
            <p className="text-zinc-400 font-medium text-base max-w-2xl leading-relaxed mt-4">{room.courseDescription}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-6 mt-10">
            <button 
              onClick={handleJoinLive}
              disabled={zoomLoading || !room.zoomMeetingId}
              className="group bg-white text-zinc-950 text-sm font-black px-12 py-6 rounded-[2rem] shadow-xl hover:bg-brand-neutral transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {zoomLoading ? (
                <span className="w-7 h-7 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
              ) : (
                <MonitorPlay size={28} weight="fill" className="group-hover:scale-110 transition-transform" />
              )}
              {isInstructor ? "Broadcast Live Session" : "Enter Live Session"}
            </button>
            
           {isAdminView && (
             <button className="bg-white/5 border border-white/10 text-zinc-400 text-sm font-bold px-10 py-6 rounded-[2rem] hover:bg-white/10 transition-all flex items-center gap-3">
               <Gear size={24} /> Admin Controls
             </button>
           )}
          </div>
        </div>
      </motion.section>

      {/* Interface Controls */}
      <div className="flex items-center justify-between gap-2">
         <div className="flex items-center gap-2 bg-zinc-200/50 p-2 rounded-[2.5rem]">
            {(['curriculum', 'tasks', 'vault'] as const).map((t) => (
              <button 
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-8 py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all ${
                  activeTab === t ? 'bg-ink text-canvas shadow-lg' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {t === "curriculum" ? "Curriculum" : t === "tasks" ? "Tasks" : "Resources"}
              </button>
            ))}
         </div>

         {isAdminView && (
           <div className="flex items-center gap-4">
              <button 
                onClick={handleUploadMaterial}
                className="bg-ink text-canvas px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
              >
                <UploadSimple size={18} weight="bold" /> Upload Material
              </button>
              <button 
                onClick={handleNewStep}
                className="bg-white border border-black/10 text-zinc-950 px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-50 transition-all"
              >
                <Plus size={18} weight="bold" /> New Session
              </button>
           </div>
         )}
      </div>

      {/* Main Experience Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-10">
        
        {/* Primary Interaction Area */}
        <div className="space-y-8">
           <AnimatePresence mode="wait">
             {activeTab === 'curriculum' && (
               <motion.div 
                 key="curriculum"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="space-y-6"
               >
                 {room.weeks.map((week, idx) => (
                   <CurriculumCard 
                     key={week.sessionInstanceId} 
                     week={week} 
                     idx={idx} 
                     isExpanded={expandedWeek === week.sessionInstanceId}
                     onToggle={() => setExpandedWeek(expandedWeek === week.sessionInstanceId ? null : week.sessionInstanceId)}
                     isAdmin={isAdminView}
                   />
                 ))}
               </motion.div>
             )}

             {activeTab === 'tasks' && (
               <motion.div 
                 key="tasks"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="grid grid-cols-1 md:grid-cols-2 gap-6"
               >
                 {room.tasks.map((task) => (
                   <TaskCard key={task.id} task={task} isAdmin={isAdminView} userId={user?.id} />
                 ))}
               </motion.div>
             )}

             {activeTab === 'vault' && (
               <motion.div 
                 key="vault"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="bg-white rounded-[3rem] p-10 border border-black/5 shadow-sm"
               >
                 <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-ink text-canvas flex items-center justify-center">
                          <HardDrive size={32} weight="duotone" />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black font-display">Resources</h3>
                          <p className="text-zinc-500 text-sm font-medium">Session materials, playbooks, and recordings.</p>
                       </div>
                    </div>
                    {isAdminView && (
                       <button className="bg-zinc-100 p-4 rounded-2xl hover:bg-zinc-200 transition-colors">
                          <UploadSimple size={24} weight="bold" />
                       </button>
                    )}
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {room.materials.map(m => (
                      <MaterialItem key={m.id} material={m} isAdmin={isAdminView} />
                    ))}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Sidebar */}
        <aside className="space-y-10">
           
           {/* Current Session Tracker */}
           <div className="bg-brand text-brand-fg rounded-[3rem] p-10 shadow-2xl shadow-brand/20 relative overflow-hidden">
              <div className="relative z-10">
                 <div className="flex items-center justify-between mb-8">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-3 py-1.5 rounded-lg">Live Status</span>
                    <Clock size={24} weight="fill" className="text-white/50" />
                 </div>
                 <h4 className="text-3xl font-black font-display leading-none mb-4">Next Session</h4>
                 {currentWeek ? (
                   <>
                     <div className="flex items-baseline gap-2 mb-8">
                       <span className="text-5xl font-black font-display">Week</span>
                       <span className="text-5xl font-black font-display">{currentWeek.weekNumber}</span>
                     </div>
                     <div className="p-5 rounded-[2rem] bg-black/10 border border-white/10">
                       <div className="flex items-center gap-3 mb-2">
                          <PlayCircle size={24} weight="fill" className="text-brand-fg" />
                          <span className="text-xs font-black uppercase tracking-widest">{currentWeek.status === "Live" ? "Active Now" : "Upcoming"}</span>
                       </div>
                       <p className="text-sm font-bold opacity-80">{currentWeek.weekTitle}</p>
                       <p className="text-[10px] font-bold opacity-60 mt-1">{currentWeek.sessionType} · {currentWeek.durationMinutes} min</p>
                     </div>
                   </>
                 ) : (
                   <p className="text-white/70 font-medium">No sessions scheduled</p>
                 )}
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-60 h-60 bg-white rounded-full blur-[100px] opacity-20"></div>
           </div>

           {/* Instructor Card */}
           {room.instructorName && (
             <div className="bg-white rounded-[3rem] p-8 border border-black/5 shadow-sm">
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-16 h-16 rounded-2xl bg-zinc-100 overflow-hidden border border-black/5">
                   {room.instructorAvatar ? (
                     <Image src={room.instructorAvatar} alt={room.instructorName} width={64} height={64} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-xl font-black text-zinc-400">
                       {room.instructorName[0]}
                     </div>
                   )}
                 </div>
                 <div>
                   <div className="flex items-center gap-1 mb-1">
                     <IdentificationBadge size={14} weight="fill" className="text-brand" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Instructor</span>
                   </div>
                   <h4 className="font-display text-xl font-black text-zinc-900">{room.instructorName}</h4>
                 </div>
               </div>
               {room.instructorBio && (
                 <p className="text-sm text-zinc-600 font-medium leading-relaxed mb-4">{room.instructorBio}</p>
               )}
               <div className="flex gap-2 flex-wrap">
                 <span className="bg-zinc-100 text-zinc-700 text-[10px] font-bold px-3 py-1.5 rounded-lg">Embedded Systems</span>
                 <span className="bg-zinc-100 text-zinc-700 text-[10px] font-bold px-3 py-1.5 rounded-lg">Robotics</span>
                 <span className="bg-zinc-100 text-zinc-700 text-[10px] font-bold px-3 py-1.5 rounded-lg">STEM</span>
               </div>
             </div>
           )}

            {/* Quick Tools */}
            <div className="bg-white rounded-[3rem] p-8 border border-black/5 shadow-sm">
               <h3 className="font-display text-xl font-black text-zinc-900 mb-6">Quick Tools</h3>
               <div className="grid grid-cols-2 gap-3">
                  <Link href="/quiz" className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 text-white flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform shadow-md">
                     <PencilSimpleLine size={24} weight="bold" />
                     <span className="text-[9px] font-black uppercase tracking-wider text-center">Quizzes</span>
                  </Link>
                  <Link href="/playground" className="bg-gradient-to-br from-cyan-500 to-blue-700 rounded-2xl p-5 text-white flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform shadow-md">
                     <Code size={24} weight="bold" />
                     <span className="text-[9px] font-black uppercase tracking-wider text-center">Playground</span>
                  </Link>
                  <Link href="/leaderboard" className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform shadow-md">
                     <Trophy size={24} weight="bold" />
                     <span className="text-[9px] font-black uppercase tracking-wider text-center">Rankings</span>
                  </Link>
                  <Link href="/dashboard/progress" className="bg-gradient-to-br from-emerald-500 to-green-700 rounded-2xl p-5 text-white flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform shadow-md">
                     <Student size={24} weight="bold" />
                     <span className="text-[9px] font-black uppercase tracking-wider text-center">Progress</span>
                  </Link>
               </div>
            </div>

            {/* Cohort Leaderboard */}
            <div className="bg-ink rounded-[3rem] p-10 shadow-xl text-white">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="font-display text-2xl font-black">Cohort Rank</h3>
                 <Sparkle size={24} weight="fill" className="text-brand-fg" />
              </div>
              
              <div className="flex items-center gap-5 p-6 rounded-[2.5rem] bg-white/5 border border-white/10 mb-8">
                <div className="w-20 h-20 rounded-[1.8rem] border-2 border-brand-neutral p-1 relative">
                  <Image 
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.displayName}&backgroundColor=f0f0f0`} 
                    alt="Avatar" 
                    width={80}
                    height={80}
                    className="w-full h-full rounded-[1.4rem] bg-zinc-200" 
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand text-brand-fg rounded-lg flex items-center justify-center font-black text-xs shadow-lg">
                    #4
                  </div>
                </div>
                <div className="flex flex-col">
                   <span className="text-3xl font-black font-display text-white">{room.progress.xpTotal}</span>
                   <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total XP</span>
                </div>
              </div>

              <div className="space-y-3">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-[1.5rem] hover:bg-white/5 transition-all group">
                      <div className="flex items-center gap-4">
                         <span className="w-5 text-[10px] font-black text-zinc-600 group-hover:text-brand-fg">0{i}</span>
                         <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=Peer${i}&backgroundColor=f0f0f0`} className="w-10 h-10 rounded-full border border-white/5" alt="Peer" />
                         <span className="text-sm font-bold opacity-70 group-hover:opacity-100 transition-opacity">Academy Member {i}</span>
                      </div>
                      <span className="text-xs font-black text-brand-fg">{1500 - (i * 120)} XP</span>
                   </div>
                 ))}
              </div>
           </div>

        </aside>
      </div>
    </div>
  );
}

function ControlBtn({ icon, label }: { icon: React.ReactNode, label: string }) {
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
  const { toast } = useToast();
  
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between min-h-[280px]">
       <div>
          <div className="flex items-center justify-between mb-6">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPending ? 'bg-brand/10 text-brand' : 'bg-green-100 text-green-600'}`}>
                {isPending ? <Cpu size={24} weight="duotone" /> : <CheckCircle size={24} weight="fill" />}
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Due {task.dueAt}</span>
                {isAdmin && <span className="text-[8px] font-black text-ember uppercase">Admin Config</span>}
             </div>
          </div>
          <h3 className="text-2xl font-black font-display text-zinc-900 mb-3 leading-tight">{task.title}</h3>
          <p className="text-zinc-500 text-sm font-medium mb-8">{task.description}</p>
       </div>
       
       <div className="flex items-center justify-between pt-6 border-t border-black/5 mt-4">
          <div className="flex items-center gap-2">
             <Sparkle size={18} weight="fill" className="text-brand-fg" />
             <span className="text-sm font-black text-zinc-900">{task.xpReward} XP</span>
          </div>
          <button 
            onClick={async () => {
               if (isAdmin) {
                  toast("Grading interface active", "info");
               } else if (isPending) {
                  const url = prompt("Submit your work URL:");
                  if (!url) return;
                  try {
                     await submitTask(task.id, userId!, { submissionUrl: url });
                     toast("Submitted for review!", "success");
                  } catch {
                     toast("Submission failed", "error");
                  }
               }
            }}
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
            isAdmin ? 'bg-brand-neutral text-zinc-950' : 
            isPending ? 'bg-zinc-900 text-white hover:bg-black' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
          }`}>
             {isAdmin ? 'Grade Submissions' : isPending ? 'Submit Work' : 'Graded'}
          </button>
       </div>
    </div>
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
