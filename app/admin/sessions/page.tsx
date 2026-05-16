"use client";

import { useEffect, useState } from "react";
import { getAdminSessions } from "@/lib/api";
import Link from "next/link";
import { Calendar, Clock, VideoCamera, Plus, ArrowLeft, PencilSimple, X, FloppyDisk } from "@phosphor-icons/react";
import { useToast } from "@/lib/toast-context";

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getAdminSessions().then(setSessions).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
            <ArrowLeft size={14} weight="bold" /> Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">Master Calendar</h1>
          <p className="text-zinc-500 font-medium">Global view of all academy sessions.</p>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 shadow-sm border border-black/5">
        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <Calendar size={48} weight="fill" className="text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">No sessions scheduled.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, idx) => {
              const date = session.scheduledAt ? new Date(session.scheduledAt) : new Date();
              return (
                <div key={session.id || idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-6 rounded-2xl border border-black/5 hover:border-black/10 transition-colors bg-zinc-50">
                  <div className="flex items-start gap-3 sm:gap-4 mb-4 md:mb-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-zinc-900 text-brand rounded-xl flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold uppercase">{date.toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-xl font-black leading-none mt-0.5 text-white">{date.getDate()}</span>
                    </div>
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-white border border-black/5 text-zinc-700 text-[10px] font-bold uppercase tracking-widest rounded mb-2">{session.cohortName || 'All'}</span>
                      <h4 className="font-bold text-zinc-900 text-lg leading-tight">{session.title}</h4>
                      <p className="text-sm text-zinc-500 font-medium flex items-center gap-2 mt-2">
                        <Clock size={16} /> {session.scheduledAt} · {session.courseName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                      session.status === "Completed" ? "bg-green-100 text-green-700" :
                      session.status === "InProgress" ? "bg-blue-100 text-blue-700" :
                      session.status === "Cancelled" ? "bg-red-100 text-red-700" :
                      "bg-brand-hover text-zinc-900"
                    }`}>{session.status || "Scheduled"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}