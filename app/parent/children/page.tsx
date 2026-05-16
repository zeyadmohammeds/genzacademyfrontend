"use client";

import { useState } from "react";
import { Plus, User, Trash, ChartLineUp } from "@phosphor-icons/react";
import Link from "next/link";

export default function ParentChildrenPage() {
  const [children, setChildren] = useState([
    { id: "STU-9821", name: "Omar Yasser", age: 14, currentCourse: "Intro to C++", rank: "#4", xp: "2,840" },
    { id: "STU-4512", name: "Lina Yasser", age: 11, currentCourse: "Scratch Basics", rank: "#12", xp: "1,200" }
  ]);

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">My Children</h1>
          <p className="text-zinc-500 font-medium">Manage and track your enrolled children.</p>
        </div>
        <button className="bg-ink text-canvas px-6 py-3 rounded-full font-bold text-sm hover:bg-zinc-800 transition-colors flex items-center gap-2 shadow-md w-fit">
          <Plus size={18} weight="bold" /> Link Student Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {children.map((child, idx) => (
          <div key={idx} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5 relative overflow-hidden group">
            {/* Design detail */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-hover rounded-full blur-[60px] opacity-20"></div>
            
            <div className="flex items-start justify-between mb-8 relative z-10">
               <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-2xl bg-zinc-100 border-2 border-white shadow-sm overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${child.name}&backgroundColor=f0f0f0`} alt={child.name} className="w-full h-full object-cover" />
                 </div>
                 <div>
                   <h2 className="font-display text-2xl font-black text-zinc-900">{child.name}</h2>
                   <div className="text-sm font-bold text-zinc-500">ID: {child.id} • Age {child.age}</div>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
               <div className="bg-zinc-50 rounded-2xl p-4 border border-black/5">
                 <div className="text-xs font-bold text-zinc-500 uppercase mb-1">Active Course</div>
                 <div className="font-bold text-zinc-900 truncate">{child.currentCourse}</div>
               </div>
               <div className="bg-zinc-50 rounded-2xl p-4 border border-black/5">
                 <div className="text-xs font-bold text-zinc-500 uppercase mb-1">Academy XP</div>
                 <div className="font-bold text-zinc-900 text-brand">{child.xp} XP</div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 relative z-10 border-t border-black/5 pt-6">
              <Link href={`/parent/progress/${child.id}`} className="flex-1 py-3 bg-canvas-soft hover:bg-zinc-200 text-zinc-900 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                <ChartLineUp size={18} weight="bold" /> View Full Progress
              </Link>
              <button className="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-sm transition-colors flex items-center justify-center">
                <Trash size={18} weight="bold" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
