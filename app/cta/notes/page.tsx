"use client";

import { Notepad, Plus } from "@phosphor-icons/react";

export default function CTANotesPage() {
  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">Behavioral Notes</h1>
          <p className="text-zinc-500 font-medium">Record student engagement and behavior during sessions.</p>
        </div>
        <button className="bg-brand hover:bg-brand-hover text-brand-fg px-6 py-3 rounded-full font-bold text-sm transition-colors shadow-md shadow-brand/30 flex items-center gap-2">
          <Plus size={18} weight="bold" /> New Note
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
         
         <div className="space-y-4">
           <div className="p-6 bg-zinc-50 border border-black/5 rounded-2xl">
             <div className="flex items-center justify-between mb-4">
               <div>
                 <h4 className="font-bold text-zinc-900">Omar Yasser</h4>
                 <div className="text-xs font-medium text-zinc-500">Session: C++ Pointers • Jun 15</div>
               </div>
               <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Positive</span>
             </div>
             <p className="text-sm text-zinc-700 leading-relaxed bg-white p-4 rounded-xl border border-black/5">
               Omar was highly engaged today. He helped another student debug their code in the breakout room.
             </p>
           </div>
         </div>

      </div>
    </div>
  );
}
