"use client";

import { ArrowLeft, CheckCircle, XCircle, Trophy } from "@phosphor-icons/react";
import Link from "next/link";
import { use } from "react";

export default function ParentStudentProgressPage({ params }: { params: Promise<{ studentId: string }> }) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.studentId;

  // Mock data based on ID
  const studentName = studentId === "STU-9821" ? "Omar Yasser" : "Student";

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <Link href="/parent/children" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 mb-8 transition-colors">
        <ArrowLeft size={16} weight="bold" /> Back to Children
      </Link>

      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">{studentName}'s Progress</h1>
          <p className="text-zinc-500 font-medium">ID: {studentId} • Detailed performance report.</p>
        </div>
        <div className="w-16 h-16 bg-ink text-brand rounded-2xl flex items-center justify-center shadow-lg">
           <Trophy size={32} weight="fill" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col - Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-black/5">
             <div className="text-zinc-500 text-xs font-bold uppercase mb-2 tracking-widest">Attendance Rate</div>
             <div className="text-5xl font-black text-green-600 mb-4">95%</div>
             <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
               <div className="bg-green-500 h-2 rounded-full w-[95%]"></div>
             </div>
             <div className="flex justify-between text-xs font-bold text-zinc-400 mt-2">
               <span>0%</span>
               <span>100%</span>
             </div>
          </div>

          <div className="bg-brand rounded-[2.5rem] p-6 shadow-sm border border-ink/10 text-brand-fg relative overflow-hidden">
             <div className="absolute -right-4 -bottom-4 opacity-[0.08]">
                <Trophy size={120} weight="fill" />
             </div>
             <div className="text-brand-fg/70 text-xs font-bold uppercase mb-2 tracking-widest relative z-10">Current Rank</div>
             <div className="text-5xl font-black mb-1 relative z-10">#4</div>
             <div className="text-sm font-medium text-brand-fg/80 relative z-10">Out of 120 students in cohort.</div>
          </div>
        </div>

        {/* Right Col - Details */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
              <h2 className="text-2xl font-display font-bold text-zinc-900 mb-6">Recent Sessions</h2>
              <div className="space-y-4">
                 {[
                   { name: "C++ Session 4: Memory", date: "June 12, 2026", status: "Present", color: "text-green-600 bg-green-100", icon: CheckCircle },
                   { name: "C++ Session 3: Functions", date: "June 8, 2026", status: "Present", color: "text-green-600 bg-green-100", icon: CheckCircle },
                   { name: "C++ Session 2: Loops", date: "June 5, 2026", status: "Missed", color: "text-red-600 bg-red-100", icon: XCircle },
                 ].map((session, idx) => (
                   <div key={idx} className="flex items-center justify-between p-4 border border-black/5 rounded-2xl bg-zinc-50">
                     <div>
                       <div className="font-bold text-zinc-900">{session.name}</div>
                       <div className="text-xs font-medium text-zinc-500 mt-1">{session.date}</div>
                     </div>
                     <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${session.color}`}>
                       <session.icon size={16} weight="fill" /> {session.status}
                     </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
              <h2 className="text-2xl font-display font-bold text-zinc-900 mb-6">Instructor Feedback</h2>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 relative">
                 <div className="text-blue-800 font-medium italic leading-relaxed">
                   "Omar is showing excellent understanding of core programming concepts. He missed one session but quickly caught up by watching the recording and submitting his task flawlessly. Keep it up!"
                 </div>
                 <div className="mt-4 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">AE</div>
                   <div className="text-xs font-bold text-blue-900 uppercase">Ahmed El-Sherif (Lead Eng)</div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
