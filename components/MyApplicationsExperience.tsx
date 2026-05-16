"use client";

import Link from "next/link";
import { Clock, CheckCircle, Warning, ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import type { Course, CourseApplication } from "@/lib/types";

type MyApplicationsProps = {
  courses: Course[];
  applications: CourseApplication[];
};

export function MyApplicationsExperience({ courses, applications }: MyApplicationsProps) {
  return (
    <div className="w-full px-10 py-8">
      
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <h1 className="text-4xl font-display font-black tracking-tight text-zinc-900">
          My Applications
        </h1>
        <div className="flex gap-2">
          <button className="px-5 py-2.5 bg-ink text-white rounded-full text-sm font-bold shadow-md hover:bg-black transition-colors">
            All Applications
          </button>
          <button className="px-5 py-2.5 bg-white border border-black/10 text-zinc-700 rounded-full text-sm font-bold hover:border-black/30 transition-colors shadow-sm">
            Pending
          </button>
          <button className="px-5 py-2.5 bg-white border border-black/10 text-zinc-700 rounded-full text-sm font-bold hover:border-black/30 transition-colors shadow-sm">
            Accepted
          </button>
        </div>
      </div>

      {applications.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {applications.map((app, idx) => {
            const course = courses.find(c => c.id === app.courseId);
            const isAccepted = app.status.toLowerCase() === "accepted";
            
            const theme = isAccepted 
              ? { bg: "bg-[#e4d3ff]", badgeBg: "bg-white/60", badgeText: "text-[#7c3aed]", border: "border-[#7c3aed]/20" }
              : { bg: "bg-brand-hover", badgeBg: "bg-ink", badgeText: "text-white", border: "border-brand-hover" };

            return (
              <div key={app.id} className={`${theme.bg} rounded-[2rem] p-6 lg:p-8 shadow-sm border border-black/5 flex flex-col md:flex-row justify-between md:items-center gap-6 relative group hover:-translate-y-1 transition-transform duration-300`}>
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shrink-0 border-2 ${theme.border} ${isAccepted ? 'bg-white/50 text-[#7c3aed]' : 'bg-black/5 text-zinc-900'}`}>
                    {isAccepted ? <CheckCircle size={32} weight="fill" /> : <Clock size={32} weight="fill" />}
                  </div>
                  <div>
                    <span className={`px-3 py-1 ${theme.badgeBg} ${theme.badgeText} text-xs font-bold rounded-lg inline-block mb-3 ${theme.border !== 'border-brand-hover' ? 'border ' + theme.border : ''}`}>
                      {app.status}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-zinc-900 leading-tight">
                      {course?.title || "Course Application"}
                    </h3>
                    <div className="text-zinc-700 font-medium text-sm mt-2">
                      Applied on {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  {app.paymentUnlocked && !app.paymentCompleted && (
                    <Link
                      href={`/payment?applicationId=${app.id}&courseId=${app.courseId}&courseName=${encodeURIComponent(course?.title || "Course")}&amount=${app.applicationScore > 0 ? course?.priceEgp || 2500 : 2500}`}
                      className="bg-brand text-brand-fg px-8 py-3.5 rounded-full text-sm font-bold shadow-md hover:bg-brand-hover transition-colors flex items-center gap-2"
                    >
                      Complete Payment <ArrowRight size={16} weight="bold" />
                    </Link>
                  )}
                  {isAccepted && (
                    <Link href={`/room/${app.courseId}`} className="bg-ink text-white px-8 py-3.5 rounded-full text-sm font-bold shadow-md hover:bg-black transition-colors flex items-center gap-2">
                      Enter Course Room <ArrowUpRight size={16} weight="bold" />
                    </Link>
                  )}
                  {!isAccepted && !app.paymentUnlocked && (
                    <div className="px-6 py-3 text-zinc-600 font-bold text-sm">
                      Awaiting Review
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-canvas-soft rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-center border border-black/5">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm">
             <Warning size={48} weight="duotone" className="text-zinc-300" />
          </div>
          <h3 className="font-display text-3xl font-bold text-zinc-900 mb-4">No applications yet</h3>
          <p className="text-zinc-500 font-medium mb-10 max-w-md">You haven't submitted any course applications. Browse our catalog and apply to your first track.</p>
          <Link href="/courses" className="bg-brand text-brand-fg px-10 py-4 rounded-2xl font-bold text-lg shadow-[0_8px_20px_-6px_rgba(159,232,112,0.45)] hover:bg-brand-hover hover:-translate-y-1 transition-all active:scale-[0.98] flex items-center gap-2">
            Browse Catalog <ArrowRight size={20} weight="bold" />
          </Link>
        </div>
      )}
    </div>
  );
}
