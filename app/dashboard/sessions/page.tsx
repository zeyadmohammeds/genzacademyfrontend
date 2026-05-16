"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, VideoCamera, CheckCircle } from "@phosphor-icons/react";
import { getMySessions } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function StudentSessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getMySessions().then(setSessions).finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const upcomingSessions = sessions.filter(s => s.isUpcoming);
  const pastSessions = sessions.filter(s => !s.isUpcoming);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (dateStr: string, duration: number) => {
    const start = new Date(dateStr);
    const end = new Date(start.getTime() + duration * 60000);
    return `${start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} EET`;
  };

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">My Sessions</h1>
        <p className="text-zinc-500 font-medium">Manage your schedule, join live classes, and watch recordings.</p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm border border-black/5">
          <Calendar size={48} weight="duotone" className="text-zinc-300 mx-auto mb-4" />
          <h3 className="font-display text-2xl font-bold text-zinc-900 mb-2">No sessions yet</h3>
          <p className="text-zinc-500">Sessions will appear here once you're enrolled in courses.</p>
          <Link href="/courses" className="inline-block mt-6 px-6 py-3 bg-brand text-brand-fg font-bold rounded-xl hover:bg-brand-hover transition-colors">
            Browse Courses
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-12">
            <h2 className="text-2xl font-display font-bold text-zinc-900 mb-6">Upcoming Live</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5 relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-2 h-full bg-brand"></div>
                   <div className="flex justify-between items-start mb-6 pl-4">
                      <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-bold uppercase tracking-widest">{session.sessionType}</span>
                      <div className="text-right">
                        <div className="text-zinc-900 font-bold flex items-center gap-2"><Calendar size={16} /> {formatDate(session.scheduledAt)}</div>
                        <div className="text-zinc-500 text-sm font-medium flex items-center gap-2 justify-end mt-1"><Clock size={16} /> {formatTime(session.scheduledAt, session.durationMinutes)}</div>
                      </div>
                   </div>
                   <div className="pl-4">
                     <h3 className="text-2xl font-display font-bold text-zinc-900 mb-2">{session.title}</h3>
                     <p className="text-sm font-bold text-zinc-500 mb-8">Instructor: {session.instructorName || "TBA"}</p>
                     <Link href={`/room/${session.id}`} className="w-full py-4 bg-brand hover:bg-brand-hover text-brand-fg rounded-2xl font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                       <VideoCamera size={20} weight="fill" /> Join Live Room
                     </Link>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold text-zinc-900 mb-6">Past Sessions & Recordings</h2>
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
              <div className="space-y-4">
                {pastSessions.map((session) => (
                  <div key={session.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 border border-transparent hover:border-black/5 transition-all">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${session.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-500'}`}>
                        <CheckCircle size={24} weight="fill" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900">{session.title}</h4>
                        <div className="text-sm text-zinc-500 font-medium">{formatDate(session.scheduledAt)} • {session.status}</div>
                      </div>
                    </div>
                    {session.recordingUrl && (
                      <a href={session.recordingUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-2 border border-black/10 rounded-xl text-sm font-bold text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-2 w-fit">
                        <VideoCamera size={18} weight="duotone" /> Watch Recording
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
