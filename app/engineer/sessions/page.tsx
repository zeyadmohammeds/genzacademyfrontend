"use client";

import { Calendar, Clock, VideoCamera, Users } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getEngineerSessions } from "@/lib/api";

export default function EngineerSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEngineerSessions().then((res) => {
      setSessions(res || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">Manage Sessions</h1>
          <p className="text-zinc-500 font-medium">Your upcoming teaching schedule and room access.</p>
        </div>
        <button className="bg-ink text-canvas px-6 py-3 rounded-full font-bold text-sm hover:bg-zinc-800 transition-colors shadow-md w-fit">
          + Create Ad-hoc Session
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
        {loading ? (
          <div className="text-zinc-500 font-bold">Loading sessions...</div>
        ) : sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session, idx) => (
              <div key={idx} className="border border-black/5 bg-zinc-50 rounded-[2rem] p-6 hover:-translate-y-1 transition-transform group relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-[#ff1a1a]"></div>
                  <div className="flex justify-between items-start mb-4 mt-2">
                    <span className="px-3 py-1 bg-white border border-black/5 text-zinc-700 rounded-lg text-xs font-bold uppercase tracking-widest">{session.group}</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-zinc-500"><Users size={14} weight="fill" /> {session.students}</span>
                  </div>
                  
                  <h3 className="font-display text-xl font-bold text-zinc-900 mb-4 h-14">{session.title}</h3>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-600"><Calendar size={16} className="text-zinc-400" /> {session.date}</div>
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-600"><Clock size={16} className="text-zinc-400" /> {session.time}</div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {session.zoomStartUrl && (
                    <a 
                      href={session.zoomStartUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full py-3 bg-[#ff1a1a] hover:bg-[#cc0000] text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-[#ff1a1a]/15"
                    >
                      <VideoCamera size={18} weight="fill" /> Start Live Zoom
                    </a>
                  )}
                  <Link href={`/engineer/sessions/${session.id}`} className="w-full py-3 bg-ink hover:bg-black text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    Open Session Dashboard
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-zinc-500 font-medium">No sessions scheduled at this time.</div>
        )}
      </div>
    </div>
  );
}
