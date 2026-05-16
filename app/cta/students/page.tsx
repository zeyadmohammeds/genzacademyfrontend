"use client";

import { Student } from "@phosphor-icons/react";

export default function CTAStudentsPage() {
  const students = [
    { name: "Omar Yasser", course: "Intro to C++", group: "Group A", notesCount: 4, status: "Needs Help" },
    { name: "Lina Tarek", course: "Intro to C++", group: "Group A", notesCount: 2, status: "On Track" },
  ];

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">My Mentee Group</h1>
        <p className="text-zinc-500 font-medium">Students assigned to you for direct support.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {students.map((stu, idx) => (
             <div key={idx} className="bg-zinc-50 rounded-2xl p-6 border border-black/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border border-black/10 shadow-sm">
                  <Student size={32} className="text-zinc-400" weight="fill" />
                </div>
                <h3 className="font-bold text-zinc-900 text-lg">{stu.name}</h3>
                <p className="text-xs text-zinc-500 font-medium mb-4">{stu.course} • {stu.group}</p>
                
                <span className={`px-3 py-1 text-xs font-bold rounded-full mb-4 ${stu.status === 'Needs Help' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                  {stu.status}
                </span>

                <button className="w-full py-2 bg-white border border-black/10 hover:bg-zinc-100 text-zinc-900 rounded-xl font-bold text-xs transition-colors mt-auto">
                  Add Note ({stu.notesCount} existing)
                </button>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
}
