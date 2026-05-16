"use client";

import { Calendar, Clock, VideoCamera } from "@phosphor-icons/react";
import Link from "next/link";

export default function CTASessionsPage() {
  const sessions = [
    { id: "S-101", title: "Intro to C++: Pointers", group: "Group A", date: "June 15, 2026", time: "18:00 - 19:30 EET", lead: "Ahmed El-Sherif" },
    { id: "S-103", title: "Robotics: Sensors", group: "Group A", date: "June 18, 2026", time: "17:00 - 19:00 EET", lead: "Sara Mahmoud" },
  ];

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">Support Schedule</h1>
        <p className="text-zinc-500 font-medium">Live sessions you are assigned to assist.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
        <div className="space-y-4">
          {sessions.map((session, idx) => (
            <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl border border-black/5 bg-zinc-50">
               <div className="flex items-start gap-4 mb-4 md:mb-0">
                 <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar size={28} weight="fill" />
                 </div>
                 <div>
                   <span className="inline-block px-2 py-0.5 bg-zinc-200 text-zinc-700 text-[10px] font-bold uppercase tracking-widest rounded mb-2">{session.group}</span>
                   <h4 className="font-bold text-zinc-900 text-lg leading-tight">{session.title}</h4>
                   <p className="text-sm text-zinc-500 font-medium flex items-center gap-2 mt-2">
                     <Clock size={16} /> {session.time} • Lead: {session.lead}
                   </p>
                 </div>
               </div>
               <Link href={`/room/${session.id}`} className="px-6 py-3 bg-brand hover:bg-brand-hover text-brand-fg rounded-xl font-bold text-sm flex items-center gap-2 transition-colors">
                  <VideoCamera size={18} weight="fill" /> Join as Support
               </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
