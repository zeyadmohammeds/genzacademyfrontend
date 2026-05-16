"use client";

import { useAuth } from "@/lib/auth-context";
import { UsersThree, Notepad, CalendarCheck, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getCTADashboard } from "@/lib/api";

export default function CTADashboardOverview() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCTADashboard().then((res) => {
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
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">CTA Workspace</h1>
        <p className="text-zinc-500 font-medium">Welcome back, {user?.displayName?.split(" ")[0] || "CTA"}. Here is your support summary.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-ink rounded-[2.5rem] p-6 shadow-sm border border-black/5 hover:-translate-y-1 transition-transform">
           <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center mb-4">
             <CalendarCheck size={24} weight="fill" />
           </div>
           <div className="text-3xl font-black text-white mb-1">{data?.sessionsToSupport ?? 0}</div>
           <div className="text-xs font-bold text-white/70 uppercase tracking-widest">Sessions to Support</div>
        </div>
        
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-black/5 hover:-translate-y-1 transition-transform">
           <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
             <UsersThree size={24} weight="fill" />
           </div>
           <div className="text-3xl font-black text-zinc-900 mb-1">{data?.studentsMentored ?? 0}</div>
           <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Students Mentored</div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-black/5 hover:-translate-y-1 transition-transform">
           <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-4">
             <Notepad size={24} weight="fill" />
           </div>
           <div className="text-3xl font-black text-zinc-900 mb-1">{data?.pendingNotes ?? 0}</div>
           <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Pending Notes</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
           <h2 className="text-2xl font-display font-bold text-zinc-900 mb-6">Upcoming Support Sessions</h2>
           {data?.upcomingSupport?.length > 0 ? (
             <div className="space-y-4">
               {data.upcomingSupport.map((session: any, idx: number) => (
                 <div key={idx} className="p-4 bg-zinc-50 border border-black/5 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-zinc-900">{session.title}</div>
                      <div className="text-xs text-zinc-500 font-medium">{session.time} • Lead: {session.lead}</div>
                    </div>
                    <Link href="/cta/sessions" className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors">Join</Link>
                 </div>
               ))}
             </div>
           ) : (
             <p className="text-zinc-500 font-medium">No support sessions scheduled for today.</p>
           )}
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-[2.5rem] p-8">
           <div className="flex items-center gap-3 mb-4">
             <WarningCircle size={28} className="text-orange-500" weight="fill" />
             <h2 className="text-xl font-display font-bold text-orange-900">Action Needed</h2>
           </div>
           <p className="text-orange-800 text-sm font-medium mb-6">
             You need to submit your behavioral notes for {data?.pendingNotes ?? 0} students from your recent sessions.
           </p>
           <Link href="/cta/notes" className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors inline-block">
             Write Notes
           </Link>
        </div>
      </div>
    </div>
  );
}
