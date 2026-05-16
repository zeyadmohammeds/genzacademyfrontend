"use client";

import { CheckCircle, ChartLineUp } from "@phosphor-icons/react";

export default function EngineerProgressPage() {
  const pendingTasks = [
    { title: "C++ Memory Assignment", course: "Intro to C++", group: "Group A", submissions: 12 },
    { title: "Robotics State Machine", course: "Robotics Basics", group: "Group B", submissions: 5 },
  ];

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">Student Progress & Grading</h1>
        <p className="text-zinc-500 font-medium">Evaluate submitted tasks and award XP to your students.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
              <h2 className="text-2xl font-display font-bold text-zinc-900 mb-6 flex items-center gap-2">Pending Evaluations</h2>
              
              <div className="space-y-4">
                {pendingTasks.map((task, idx) => (
                  <div key={idx} className="p-6 bg-zinc-50 border border-black/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-zinc-900 text-lg">{task.title}</h3>
                      <p className="text-sm text-zinc-500 font-medium mb-2">{task.course} • {task.group}</p>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg">
                        {task.submissions} Pending Grades
                      </span>
                    </div>
                    <button className="px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-bold text-sm transition-colors whitespace-nowrap">
                      Start Grading
                    </button>
                  </div>
                ))}
              </div>
            </div>
         </div>

         <div className="lg:col-span-1 space-y-6">
            <div className="bg-ink rounded-[2.5rem] p-6 shadow-sm border border-black/5 text-white">
              <h3 className="font-display text-xl font-bold mb-4">Grading Status</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-bold mb-1">
                    <span className="text-zinc-400">Tasks Graded</span>
                    <span className="text-green-400">85%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full w-[85%]"></div>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  You're doing great! Try to grade tasks within 48 hours of submission to keep students engaged.
                </p>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
