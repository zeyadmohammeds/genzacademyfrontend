"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle, Warning, ArrowRight, ArrowUpRight, ShieldCheck, XCircle, Bell, CalendarBlank, CaretRight } from "@phosphor-icons/react";
import type { Course, CourseApplication } from "@/lib/types";

type MyApplicationsProps = {
  courses: Course[];
  applications: CourseApplication[];
};

export function MyApplicationsExperience({ courses, applications }: MyApplicationsProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('all');

  // Filter application list dynamically
  const filteredApplications = applications.filter(app => {
    const status = app.status.toLowerCase();
    if (filter === 'pending') {
      return status === 'pending' || status === 'submitted' || status === 'reviewing';
    }
    if (filter === 'accepted') {
      return status === 'accepted' || status === 'paid' || status === 'approved';
    }
    return true;
  });

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-10 py-12">
      
      {/* Header with high-end typography and interactive filtering tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-black/5 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff1a1a] mb-2 block">
            Academic Status
          </span>
          <h1 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-zinc-900 leading-none">
            My Applications
          </h1>
          <p className="text-zinc-500 font-medium text-sm mt-3 max-w-md">
            Monitor admissions progress, clear registration balances, and access your active digital course rooms.
          </p>
        </div>
        
        {/* State-of-the-art interactive pills */}
        <div className="flex bg-zinc-100 p-1.5 rounded-2xl w-fit self-start md:self-end">
          <button 
            onClick={() => setFilter('all')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              filter === 'all' 
                ? 'bg-zinc-900 text-white shadow-md' 
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All Tracks ({applications.length})
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              filter === 'pending' 
                ? 'bg-zinc-900 text-white shadow-md' 
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Pending ({applications.filter(a => ['pending','submitted','reviewing'].includes(a.status.toLowerCase())).length})
          </button>
          <button 
            onClick={() => setFilter('accepted')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              filter === 'accepted' 
                ? 'bg-zinc-900 text-white shadow-md' 
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Accepted ({applications.filter(a => ['accepted','paid','approved'].includes(a.status.toLowerCase())).length})
          </button>
        </div>
      </div>

      {filteredApplications.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredApplications.map((app) => {
            const course = courses.find(c => c.id === app.courseId);
            const statusLower = app.status.toLowerCase();
            
            const isAccepted = statusLower === "accepted" || statusLower === "approved" || statusLower === "paid";
            const isPaid = app.paymentCompleted || statusLower === "paid";
            const isRejected = statusLower === "rejected";
            const isPending = !isAccepted && !isRejected;

            // Configure dynamic luxury-tier styles per state
            let cardStyle = {
              bg: "bg-white border border-zinc-100 shadow-sm",
              badgeBg: "bg-zinc-50 border border-zinc-200 text-zinc-600",
              badgeLabel: app.status,
              iconWrapper: "bg-zinc-50 border border-zinc-200 text-zinc-400",
              icon: <Clock size={28} weight="fill" />
            };

            if (isRejected) {
              cardStyle = {
                bg: "bg-[#fffdfd] border border-red-100/80 shadow-sm hover:shadow-md",
                badgeBg: "bg-red-50 border border-red-100 text-red-600",
                badgeLabel: "Application Declined",
                iconWrapper: "bg-red-50 border border-red-100 text-red-500",
                icon: <XCircle size={28} weight="fill" />
              };
            } else if (isPending) {
              cardStyle = {
                bg: "bg-[#fffdf6] border border-amber-200/60 shadow-sm hover:shadow-md",
                badgeBg: "bg-amber-50 border border-amber-200/50 text-amber-700",
                badgeLabel: "Review in Progress",
                iconWrapper: "bg-amber-50 border border-amber-200/50 text-amber-500 animate-[pulse_2s_infinite]",
                icon: <Clock size={28} weight="fill" />
              };
            } else if (isAccepted && !isPaid) {
              cardStyle = {
                bg: "bg-[#faf8ff] border border-purple-200/60 shadow-sm hover:shadow-md",
                badgeBg: "bg-purple-50 border border-purple-200/50 text-purple-700",
                badgeLabel: "Seat Offered — Awaiting Payment",
                iconWrapper: "bg-purple-50 border border-purple-200/50 text-purple-500",
                icon: <ShieldCheck size={28} weight="fill" />
              };
            } else if (isAccepted && isPaid) {
              cardStyle = {
                bg: "bg-[#f5fdf9] border border-emerald-200/60 shadow-sm hover:shadow-md",
                badgeBg: "bg-emerald-50 border border-emerald-200/50 text-emerald-700",
                badgeLabel: "Enrollment Complete",
                iconWrapper: "bg-emerald-50 border border-emerald-200/50 text-emerald-500",
                icon: <CheckCircle size={28} weight="fill" />
              };
            }

            return (
              <div 
                key={app.id} 
                className={`${cardStyle.bg} rounded-[2.5rem] p-8 flex flex-col lg:flex-row justify-between lg:items-center gap-8 relative group transition-all duration-300 hover:-translate-y-0.5`}
              >
                <div className="flex gap-6 items-start sm:items-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${cardStyle.iconWrapper}`}>
                    {cardStyle.icon}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${cardStyle.badgeBg}`}>
                        {cardStyle.badgeLabel}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-black text-zinc-900 leading-tight">
                      {course?.title || "Specialized Tech Track"}
                    </h3>
                    <div className="text-zinc-400 font-bold text-xs mt-2 uppercase tracking-widest flex items-center gap-2">
                      <span>Applied: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                      {course?.level && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                          <span className="text-[#ff1a1a]">{course.level}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:items-center gap-4 shrink-0 sm:self-start lg:self-center">
                  {/* State-Based Visual Gates */}
                  {isPending && (
                    <div className="px-6 py-3.5 bg-zinc-50 border border-black/5 text-zinc-500 font-bold text-xs uppercase tracking-widest rounded-xl text-center">
                      Review in Progress
                    </div>
                  )}

                  {isRejected && (
                    <div className="px-6 py-3.5 bg-zinc-50 border border-black/5 text-zinc-400 font-bold text-xs uppercase tracking-widest rounded-xl text-center">
                      Application Declined
                    </div>
                  )}

                  {isAccepted && !isPaid && (
                    <Link
                      href={`/payment?applicationId=${app.id}&courseId=${app.courseId}&courseName=${encodeURIComponent(course?.title || "Course")}&amount=${app.applicationScore > 0 ? course?.priceEgp || 2500 : 2500}`}
                      className="px-8 py-4 bg-[#ff1a1a] text-white hover:bg-[#cc0000] rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-[#ff1a1a]/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-center"
                    >
                      Complete Payment <ArrowRight size={14} weight="bold" />
                    </Link>
                  )}

                  {isAccepted && isPaid && (
                    <>
                      {course?.isActive !== false ? (
                        <Link 
                          href={`/room/${app.courseId}`} 
                          className="px-8 py-4 bg-primary text-white border border-[#ff1a1a] border-1.5 hover:bg-[#ff1a1a]/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 text-center"
                        >
                          Enter Course Room <ArrowUpRight size={14} weight="bold" style={{color:"#ff0000ff"}}/>
                        </Link>
                      ) : (
                        <div className="flex flex-col gap-2 max-w-sm">
                          <button 
                            disabled 
                            className="px-8 py-4 bg-zinc-100 text-zinc-400 border border-zinc-200 rounded-2xl font-black text-xs uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            Preparation Stage <CalendarBlank size={14} />
                          </button>
                          <div className="bg-amber-50 border border-amber-200/50 p-4 rounded-2xl flex flex-col gap-2 shadow-sm">
                            <div className="flex items-start gap-2">
                              <Warning size={16} weight="fill" className="text-amber-600 shrink-0 mt-0.5" />
                              <p className="text-[11px] font-medium text-amber-900 leading-relaxed">
                                This course doesn&apos;t start yet. We will notify you via email and phone once the dynamic cohort launches.
                              </p>
                            </div>
                            <Link 
                              href="/dashboard/profile"
                              className="text-[10px] font-black uppercase tracking-wider text-amber-700 hover:text-amber-950 flex items-center gap-1 mt-1 transition-colors"
                            >
                              Configure notification preferences <CaretRight size={10} weight="bold" />
                            </Link>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-zinc-50/50 rounded-[2.5rem] py-24 flex flex-col items-center justify-center text-center border border-zinc-100">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-8 border border-zinc-100 shadow-sm">
             <Warning size={40} weight="duotone" className="text-zinc-300" />
          </div>
          <h3 className="font-display text-2xl font-black text-zinc-900 mb-3">No applications found</h3>
          <p className="text-zinc-400 font-medium text-sm mb-10 max-w-sm">
            {filter === 'all' 
              ? "You haven't initiated any specialized tech track applications yet." 
              : `No applications fit the "${filter}" filter criteria at this time.`}
          </p>
          <Link href="/courses" className="bg-[#ff1a1a] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md shadow-[#ff1a1a]/20 hover:bg-[#cc0000] hover:-translate-y-0.5 transition-all flex items-center gap-2">
            Browse Course Catalog <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      )}
    </div>
  );
}
