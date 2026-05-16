"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, VideoCamera, Users, CheckCircle, XCircle } from "@phosphor-icons/react";

export default function EngineerSessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;

  const students = [
    { name: "Omar Yasser", status: "Present", joinTime: "18:01" },
    { name: "Lina Tarek", status: "Present", joinTime: "18:05" },
    { name: "Youssef Ahmed", status: "Absent", joinTime: "--" },
    { name: "Mariam Samir", status: "Present", joinTime: "18:00" },
  ];

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <Link href="/engineer/sessions" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 mb-8 transition-colors">
        <ArrowLeft size={16} weight="bold" /> Back to Schedule
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <span className="px-3 py-1 bg-zinc-200 text-zinc-700 rounded-lg text-xs font-bold uppercase tracking-widest">Group A</span>
             <span className="text-xs font-bold text-zinc-400">ID: {sessionId}</span>
          </div>
          <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">Intro to C++: Pointers</h1>
          <p className="text-zinc-500 font-medium">June 15, 2026 • 18:00 - 19:30 EET</p>
        </div>
        
        <Link href={`/room/${sessionId}`} className="bg-brand hover:bg-brand-hover text-brand-fg px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-brand/30 transition-all active:scale-[0.98] flex items-center gap-2">
          <VideoCamera size={24} weight="fill" /> Launch Virtual Classroom
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col - Attendance */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
              <div className="flex items-center justify-between mb-6 border-b border-black/5 pb-4">
                 <h2 className="text-2xl font-display font-bold text-zinc-900 flex items-center gap-2"><Users size={24} weight="duotone" className="text-brand" /> Attendance Roster</h2>
                 <div className="text-sm font-bold text-zinc-500">3/4 Present</div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/5">
                      <th className="text-left py-3 px-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">Student</th>
                      <th className="text-center py-3 px-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                      <th className="text-right py-3 px-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">Join Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((stu, idx) => (
                      <tr key={idx} className="border-b border-black/5 hover:bg-zinc-50">
                        <td className="py-4 px-2 font-bold text-zinc-900">{stu.name}</td>
                        <td className="py-4 px-2">
                           <div className="flex justify-center">
                             {stu.status === 'Present' ? (
                               <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                 <CheckCircle size={14} weight="fill" /> Present
                               </span>
                             ) : (
                               <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                 <XCircle size={14} weight="fill" /> Absent
                               </span>
                             )}
                           </div>
                        </td>
                        <td className="py-4 px-2 text-right text-sm font-medium text-zinc-500 font-mono">{stu.joinTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>

        {/* Right Col - Tools */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-black/5">
              <h3 className="font-display text-xl font-bold text-zinc-900 mb-4">Session Tools</h3>
              <div className="space-y-3">
                 <button className="w-full py-3 bg-zinc-50 border border-black/10 hover:bg-zinc-100 text-zinc-900 rounded-xl font-bold text-sm transition-colors text-left px-4">
                   Upload Slides/Materials
                 </button>
                 <button className="w-full py-3 bg-zinc-50 border border-black/10 hover:bg-zinc-100 text-zinc-900 rounded-xl font-bold text-sm transition-colors text-left px-4">
                   Create Quiz/Poll
                 </button>
                 <button className="w-full py-3 bg-zinc-50 border border-black/10 hover:bg-zinc-100 text-zinc-900 rounded-xl font-bold text-sm transition-colors text-left px-4">
                   Assign Homework
                 </button>
              </div>
           </div>

           <div className="bg-brand-hover rounded-[2.5rem] p-6 shadow-sm border border-[#e6ce81]">
              <h3 className="font-display text-xl font-bold text-zinc-900 mb-2">Support CTAs</h3>
              <p className="text-sm font-medium text-zinc-700 mb-4">CTAs assigned to this session to help with student questions.</p>
              <div className="flex items-center gap-3 bg-white/50 p-3 rounded-2xl">
                 <div className="w-10 h-10 rounded-xl bg-zinc-200"></div>
                 <div>
                   <div className="font-bold text-zinc-900 text-sm">Youssef Kamal</div>
                   <div className="text-xs text-zinc-600 font-medium">Lead CTA</div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
