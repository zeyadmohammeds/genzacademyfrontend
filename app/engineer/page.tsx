"use client";

import { useAuth } from "@/lib/auth-context";
import { UsersThree, ClipboardText, CalendarCheck, WarningCircle, VideoCamera } from "@phosphor-icons/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getEngineerDashboard } from "@/lib/api";

export default function EngineerDashboardOverview() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEngineerDashboard().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="w-full px-6 pt-10 text-zinc-500 font-bold">Loading dashboard...</div>;
  }

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">Engineer Workspace</h1>
        <p className="text-zinc-500 font-medium">Welcome back, {user?.displayName?.split(" ")[0] || "Engineer"}. Here is your teaching overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-black/5 hover:-translate-y-1 transition-transform">
           <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
             <UsersThree size={24} weight="fill" />
           </div>
           <div className="text-3xl font-black text-zinc-900 mb-1">{data?.activeStudents ?? 0}</div>
           <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Students</div>
        </div>
        
        <div className="bg-ink rounded-[2.5rem] p-6 shadow-sm border border-black/5 hover:-translate-y-1 transition-transform">
           <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center mb-4">
             <CalendarCheck size={24} weight="fill" />
           </div>
           <div className="text-3xl font-black text-white mb-1">{data?.upcomingSessions?.length ?? 0}</div>
           <div className="text-xs font-bold text-white/70 uppercase tracking-widest">Upcoming Sessions</div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-black/5 hover:-translate-y-1 transition-transform">
           <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">
             <ClipboardText size={24} weight="fill" />
           </div>
           <div className="text-3xl font-black text-zinc-900 mb-1">{data?.pendingEvaluations ?? 0}</div>
           <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Pending Evaluations</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
           <h2 className="text-2xl font-display font-bold text-zinc-900 mb-6">Today's Schedule</h2>
            {data?.upcomingSessions?.length > 0 ? (
              <div className="space-y-4">
                {data.upcomingSessions.map((session: any, idx: number) => (
                  <div key={idx} className="p-4 bg-zinc-50 border border-black/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div>
                       <div className="font-bold text-zinc-900">{session.title}</div>
                       <div className="text-xs text-zinc-500 font-medium">{session.time} • {session.group}</div>
                     </div>
                     <div className="flex items-center gap-2 self-start sm:self-center">
                       {session.zoomStartUrl ? (
                         <a 
                           href={session.zoomStartUrl} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="px-4 py-2 bg-[#ff1a1a] text-white rounded-xl text-xs font-bold hover:bg-[#cc0000] transition-all flex items-center gap-1 shadow-md shadow-[#ff1a1a]/15"
                         >
                           <VideoCamera size={14} weight="fill" /> Start Zoom
                         </a>
                       ) : (
                         <span className="px-3 py-1.5 bg-zinc-100 text-zinc-400 rounded-lg text-[10px] font-bold">Zoom Link Pending</span>
                       )}
                       <Link 
                         href={`/engineer/sessions`} 
                         className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
                       >
                         Manage
                       </Link>
                     </div>
                  </div>
                ))}
              </div>
            ) : (
             <p className="text-zinc-500 font-medium">No sessions scheduled for today.</p>
           )}
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-[2.5rem] p-8">
           <div className="flex items-center gap-3 mb-4">
             <WarningCircle size={28} className="text-orange-500" weight="fill" />
             <h2 className="text-xl font-display font-bold text-orange-900">Action Needed</h2>
           </div>
           <p className="text-orange-800 text-sm font-medium mb-6">
             You have {data?.pendingEvaluations ?? 0} pending assignments to grade.
           </p>
           <Link href="/engineer/progress" className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors inline-block">
             Grade Assignments
           </Link>
        </div>
      </div>
    </div>
  );
}
