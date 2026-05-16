"use client";

import { Folder, Users } from "@phosphor-icons/react";
import Link from "next/link";

export default function EngineerCoursesPage() {
  const courses = [
    { id: "C-01", name: "Intro to C++", level: "Intermediate", students: 120, groups: 3, status: "Active" },
    { id: "C-02", name: "Robotics Basics", level: "Beginner", students: 45, groups: 1, status: "Active" },
  ];

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">My Courses</h1>
        <p className="text-zinc-500 font-medium">Courses you are currently assigned to teach.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, idx) => (
          <div key={idx} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5 hover:-translate-y-1 transition-transform group">
            <div className="flex justify-between items-start mb-6">
               <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-700">
                 <Folder size={28} weight="fill" />
               </div>
               <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold uppercase tracking-widest">{course.status}</span>
            </div>
            
            <h3 className="font-display text-2xl font-bold text-zinc-900 mb-1">{course.name}</h3>
            <p className="text-sm font-medium text-zinc-500 mb-6">{course.level}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8 border-t border-black/5 pt-6">
               <div>
                 <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Users size={14}/> Students</div>
                 <div className="text-xl font-black text-zinc-900">{course.students}</div>
               </div>
               <div>
                 <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Groups</div>
                 <div className="text-xl font-black text-zinc-900">{course.groups}</div>
               </div>
            </div>

            <Link href={`/engineer/courses/${course.id}`} className="w-full py-3 bg-zinc-50 hover:bg-zinc-100 border border-black/5 text-zinc-900 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center">
               Manage Curriculum
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
