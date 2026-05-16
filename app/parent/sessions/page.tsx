"use client";

import { Calendar, Clock, VideoCamera } from "@phosphor-icons/react";

export default function ParentSessionsPage() {
  const sessions = [
    { student: "Omar Yasser", title: "Intro to C++: Pointers", date: "June 15, 2026", time: "18:00 - 19:30 EET" },
    { student: "Lina Yasser", title: "Scratch: Game Logic", date: "June 16, 2026", time: "16:00 - 17:30 EET" },
    { student: "Omar Yasser", title: "Robotics: Sensors Lab", date: "June 18, 2026", time: "17:00 - 19:00 EET" },
  ];

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">Upcoming Schedule</h1>
        <p className="text-zinc-500 font-medium">Consolidated view of all your children's upcoming live sessions.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
        <div className="space-y-4">
          {sessions.map((session, idx) => (
            <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl border border-black/5 hover:border-brand/30 transition-colors bg-zinc-50">
               <div className="flex items-start gap-4 mb-4 md:mb-0">
                 <div className="w-14 h-14 bg-brand-hover rounded-xl flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-zinc-600 uppercase">Jun</span>
                    <span className="text-xl font-black text-zinc-900 leading-none mt-0.5">{session.date.split(' ')[1].replace(',', '')}</span>
                 </div>
                 <div>
                   <span className="inline-block px-2 py-0.5 bg-zinc-200 text-zinc-700 text-[10px] font-bold uppercase tracking-widest rounded mb-2">{session.student}</span>
                   <h4 className="font-bold text-zinc-900 text-lg leading-tight">{session.title}</h4>
                   <p className="text-sm text-zinc-500 font-medium flex items-center gap-2 mt-2">
                     <Clock size={16} /> {session.time}
                   </p>
                 </div>
               </div>
               <button disabled className="px-6 py-3 bg-zinc-100 text-zinc-400 rounded-xl font-bold text-sm flex items-center gap-2 cursor-not-allowed">
                  <VideoCamera size={18} weight="fill" /> Student Only Link
               </button>
            </div>
          ))}
          
          {sessions.length === 0 && (
             <div className="text-center py-12 text-zinc-500 font-medium">No upcoming sessions scheduled for this week.</div>
          )}
        </div>
      </div>
    </div>
  );
}
