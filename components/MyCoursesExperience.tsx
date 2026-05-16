"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, BookBookmark } from "@phosphor-icons/react";

const imageFor = (seed: string) => `https://picsum.photos/seed/${seed}/1200/800`;

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
};

export function MyCoursesExperience({ enrollments }: { enrollments: Enrollment[] }) {
  const activeEnrollments = enrollments.filter((e) => e.status === "Active" || e.status === "Accepted" || e.status === "Enrolled");

  return (
    <div className="w-full bg-canvas-soft min-h-screen font-body selection:bg-zinc-900 selection:text-white pb-32">
      
      {/* Editorial Hero */}
      <section className="px-6 lg:px-12 pt-16 pb-12 lg:pt-24 lg:pb-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col gap-6 max-w-4xl">
            <span className="text-zinc-500 font-bold tracking-widest text-xs uppercase flex items-center gap-4">
              <span className="w-8 h-px bg-zinc-300"></span>
              Student Protocol
            </span>
            <h1 className="font-display text-6xl lg:text-[7rem] font-black tracking-tighter leading-[0.85] text-zinc-950">
              Active <br /> Deployments.
            </h1>
            <p className="text-zinc-500 text-lg lg:text-xl max-w-xl leading-relaxed mt-4">
              Access your current learning environments. Resume your progression and push to the next milestone.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Grid Layout */}
      <section className="px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto border-t border-black/10 pt-16">
          {activeEnrollments.length === 0 ? (
            <div className="w-full py-32 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 mb-8 flex items-center justify-center rounded-full bg-white border border-black/10 shadow-sm">
                 <BookBookmark size={32} className="text-zinc-300" weight="duotone" />
              </div>
              <span className="font-display text-4xl font-bold text-zinc-300 mb-4">No active deployments.</span>
              <p className="text-zinc-500 text-lg mb-8 max-w-md">You haven't been accepted into any protocols yet, or you haven't initialized any applications.</p>
              <Link href="/courses" className="bg-ink text-canvas font-bold px-8 py-4 rounded-full shadow-lg hover:bg-zinc-800 transition-all duration-300 flex items-center gap-3 group">
                Browse Directory <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-16">
              {activeEnrollments.map((enrollment) => {
                const courseTitle = enrollment.courseTitle || `Course`;
                
                return (
                  <article 
                    key={enrollment.id}
                    className="group flex flex-col relative"
                  >
                    <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-zinc-200 mb-8 aspect-[16/9] shadow-md transform-gpu isolate">
                      <Image 
                        src={imageFor(`course-${enrollment.courseId}`)} 
                        alt={courseTitle} 
                        fill 
                        className="object-cover scale-100 group-hover:scale-105 transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)]"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 z-10"></div>
                      
                      {/* Floating Status Pill */}
                      <div className="absolute top-6 left-6 flex gap-2 z-20">
                        <span className="bg-white/90 backdrop-blur-md text-zinc-950 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
                          {enrollment.progressPercent.toFixed(0)}% Complete
                        </span>
                      </div>
                      
                      {/* Action Overlaid */}
                      <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none">
                        <Link href={`/room/${enrollment.courseId}`} className="bg-white text-zinc-950 font-bold px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 pointer-events-auto transform hover:scale-105 transition-transform">
                          Enter Control Room <ArrowUpRight size={18} weight="bold" />
                        </Link>
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 pl-2">
                      <div className="flex items-start justify-between gap-4 mb-4 border-b border-black/10 pb-6">
                        <h2 className="font-display text-4xl font-black text-zinc-900 leading-[1.1] tracking-tight line-clamp-2">
                          {courseTitle}
                        </h2>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <div className="flex items-center gap-4 text-sm font-bold text-zinc-500 uppercase tracking-widest">
                           <span>Cohort:</span>
                           <span className="text-mint flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-mint animate-pulse"></span>
                             {enrollment.cohortName}
                           </span>
                        </div>
                        <Link href={`/room/${enrollment.courseId}`} className="text-zinc-900 font-bold flex items-center gap-2 group/link">
                          Connect <ArrowRight size={16} weight="bold" className="group-hover/link:translate-x-1 transition-transform" />
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
