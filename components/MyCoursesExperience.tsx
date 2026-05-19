"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  ArrowUpRight, ArrowRight, BookBookmark, ChartLineUp, 
  Hourglass, UsersThree, PlayCircle, ClipboardText
} from "@phosphor-icons/react";

// Curated high-fidelity Unsplash illustrations per course slug for elite visuals
const COURSE_IMAGES: Record<string, string> = {
  "scratch": "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=1200&q=85",
  "intro-cpp": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=85",
  "advanced-cpp": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=85",
  "robot-build": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=85",
  "web-app-ai": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85",
};

const COURSE_ICONS: Record<string, string> = {
  "scratch": "🎮",
  "intro-cpp": "💻",
  "advanced-cpp": "⚡",
  "robot-build": "🤖",
  "web-app-ai": "🌐",
};

type Enrollment = {
  id: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  cohortName: string;
  status: string;
  progressPercent: number;
  currentSessionTitle?: string;
  nextSessionAt?: string;
  courseImageUrl?: string;
};

export function MyCoursesExperience({ enrollments }: { enrollments: Enrollment[] }) {
  const activeEnrollments = enrollments.filter(
    (e) => e.status === "Active" || e.status === "Accepted" || e.status === "Enrolled"
  );

  return (
    <div className="w-full bg-canvas-soft min-h-screen font-body selection:bg-zinc-900 selection:text-white pb-32">
      
      {/* Premium Editorial Hero */}
      <section className="px-6 lg:px-12 pt-16 pb-12 lg:pt-24 lg:pb-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col gap-6 max-w-4xl">
            <span className="text-zinc-500 font-bold tracking-widest text-xs uppercase flex items-center gap-4">
              <span className="w-8 h-px bg-zinc-300"></span>
              Secure Learning Protocol
            </span>
            <h1 className="font-display text-6xl lg:text-[7rem] font-black tracking-tighter leading-[0.85] text-zinc-950">
              Active <br /> Enrollments.
            </h1>
            <p className="text-zinc-500 text-lg lg:text-xl max-w-xl leading-relaxed mt-4">
              Access your current learning environments. Resume your progression, enter secure live classrooms, and push to the next milestone.
            </p>
          </div>
        </div>
      </section>

      {/* Modern High-End Grid Section */}
      <section className="px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto border-t border-black/10 pt-16">
          {activeEnrollments.length === 0 ? (
            <div className="w-full py-32 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 mb-8 flex items-center justify-center rounded-full bg-white border border-black/10 shadow-sm">
                 <BookBookmark size={32} className="text-zinc-300" weight="duotone" />
              </div>
              <span className="font-display text-4xl font-bold text-zinc-300 mb-4">No active deployments.</span>
              <p className="text-zinc-500 text-lg mb-8 max-w-md">You haven't been accepted into any protocols yet, or you haven't initialized any applications.</p>
              <Link href="/courses" className="bg-zinc-900 hover:bg-black text-white font-black px-8 py-4 rounded-3xl shadow-lg transition-all duration-300 flex items-center gap-3 group">
                Browse Catalog <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-20">
              {activeEnrollments.map((enrollment) => {
                const courseTitle = enrollment.courseTitle || `Course`;
                const slug = enrollment.courseSlug || "";
                
                // Dynamically resolve image
                const resolvedImageUrl = enrollment.courseImageUrl || COURSE_IMAGES[slug] || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=85";
                const icon = COURSE_ICONS[slug] || "💻";

                return (
                  <article 
                    key={enrollment.id}
                    className="group flex flex-col relative"
                  >
                    {/* Advanced Immersive Aspect Container */}
                    <div className="relative w-full overflow-hidden rounded-[3rem] bg-zinc-950 mb-8 aspect-[16/10] shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-black/5 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-700 isolate">
                      
                      {/* Course Image */}
                      <Image 
                        src={resolvedImageUrl} 
                        alt={courseTitle} 
                        fill 
                        className="object-cover scale-100 group-hover:scale-105 transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] filter brightness-95 group-hover:brightness-90"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 z-10"></div>
                      
                      {/* Floating Info Badges on top */}
                      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
                        {/* Course Icon Badge */}
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-xl shadow-lg">
                          {icon}
                        </div>

                        {/* Progress Badge */}
                        <div className="bg-white/90 backdrop-blur-md text-zinc-950 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
                          <ChartLineUp size={14} className="text-brand" weight="bold" />
                          <span>{enrollment.progressPercent.toFixed(0)}% Complete</span>
                        </div>
                      </div>
                      
                      {/* Floating Bottom Course Overview Text */}
                      <div className="absolute bottom-8 left-8 right-8 z-20 flex items-end justify-between gap-6">
                        <div className="min-w-0">
                          <span className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-1.5 block">
                            Active Study Stream
                          </span>
                          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none truncate">
                            {courseTitle}
                          </h3>
                        </div>

                        {/* Control Room Link */}
                        <Link 
                          href={`/room/${enrollment.courseId}`} 
                          className="bg-white text-zinc-950 hover:bg-zinc-900 hover:text-white font-black px-6 py-3.5 rounded-2xl shadow-xl border border-black/5 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 pointer-events-auto flex items-center gap-2 text-xs uppercase tracking-wider shrink-0"
                          style={{ color: '#09090b' }}
                        >
                          <span>Enter Room</span> <ArrowUpRight size={16} weight="bold" />
                        </Link>
                      </div>
                    </div>

                    {/* Metadata Description Info below card */}
                    <div className="flex flex-col flex-1 px-2">
                      <div className="flex items-center justify-between gap-4 border-b border-black/5 pb-4 mb-4">
                        <div className="flex items-center gap-2 text-xs font-black text-zinc-400 uppercase tracking-widest">
                          <Hourglass size={14} className="text-zinc-500" />
                          <span>Active Cohort:</span>
                          <span className="text-zinc-900 font-black">{enrollment.cohortName}</span>
                        </div>
                        
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-green-600 bg-green-50 border border-green-200/50 px-3 py-1 rounded-full uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          Protocol Running
                        </span>
                      </div>
                      
                      {enrollment.currentSessionTitle && (
                        <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-between mb-4">
                          <div className="min-w-0">
                            <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-wider mb-0.5">Current Syllabus Block</span>
                            <span className="block text-xs font-black text-zinc-800 truncate">{enrollment.currentSessionTitle}</span>
                          </div>
                          <Link 
                            href={`/room/${enrollment.courseId}`}
                            className="text-[10px] font-black text-brand uppercase tracking-wider hover:underline shrink-0 ml-4"
                          >
                            Resume Session →
                          </Link>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs font-bold text-zinc-400">
                          {enrollment.nextSessionAt ? `Next lecture scheduled for ${enrollment.nextSessionAt}` : "Cohort currently in progress."}
                        </span>
                        
                        <Link 
                          href={`/room/${enrollment.courseId}`} 
                          className="text-zinc-900 hover:text-brand font-black text-xs uppercase tracking-widest flex items-center gap-1.5 transition-colors group/link"
                        >
                          <span>Room Terminal</span>
                          <ArrowRight size={14} weight="bold" className="group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
