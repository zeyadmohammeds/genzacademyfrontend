"use client";

import { MagnifyingGlass, Funnel, Student } from "@phosphor-icons/react";

export default function EngineerStudentsPage() {
  const students = [
    { name: "Omar Yasser", course: "Intro to C++", group: "Group A", attendance: "95%", grade: "A", id: "STU-9821" },
    { name: "Lina Tarek", course: "Intro to C++", group: "Group A", attendance: "100%", grade: "A+", id: "STU-4512" },
    { name: "Youssef Ahmed", course: "Robotics Basics", group: "Group B", attendance: "80%", grade: "B", id: "STU-1123" },
  ];

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">Student Directory</h1>
        <p className="text-zinc-500 font-medium">Browse and search all students across your active courses.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
         
         {/* Toolbar */}
         <div className="flex flex-col md:flex-row gap-4 mb-8">
           <div className="relative flex-1">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <MagnifyingGlass size={20} className="text-zinc-400" />
             </div>
             <input type="text" placeholder="Search students by name or ID..." className="w-full bg-zinc-50 border border-black/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40" />
           </div>
           <button className="px-6 py-3 bg-zinc-50 border border-black/10 rounded-2xl font-bold text-sm text-zinc-700 flex items-center gap-2 hover:bg-zinc-100 transition-colors">
             <Funnel size={18} weight="bold" /> Filter by Course
           </button>
         </div>

         {/* Table */}
         <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Student</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Course & Group</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Attendance</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Current Grade</th>
                  <th className="text-right py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu, idx) => (
                  <tr key={idx} className="border-b border-black/5 hover:bg-zinc-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-zinc-200 flex items-center justify-center text-zinc-500">
                           <Student size={20} weight="fill" />
                         </div>
                         <div>
                           <div className="font-bold text-zinc-900">{stu.name}</div>
                           <div className="text-xs font-medium text-zinc-500 font-mono">{stu.id}</div>
                         </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-zinc-700">{stu.course}</div>
                      <div className="text-xs font-bold text-zinc-400 uppercase">{stu.group}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-zinc-900">{stu.attendance}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-700 font-bold">
                        {stu.grade}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors">
                         View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
