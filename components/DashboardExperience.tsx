"use client";

import Image from "next/image";
import Link from "next/link";
import { BookmarkSimple, PlayCircle, Clock } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";

const avatarSeed = (seed: string) => `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=f0f0f0`;

export function DashboardExperience() {
  const { user } = useAuth();

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24 flex flex-col gap-8 bg-canvas-soft min-h-screen font-body">
      
      {/* Header text "Welcome to Learnify" style */}
      <div className="flex items-center gap-2 mb-2">
         <span className="text-zinc-400 font-medium">Welcome to</span>
         <span className="font-display font-bold text-[#f9644d] text-xl tracking-tight">GenZ Academy</span>
      </div>

      {/* "My courses" & Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-2">
         <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight">My courses</h1>
         <div className="flex flex-wrap items-center gap-3">
            <button className="bg-ink text-canvas px-5 py-2.5 rounded-full text-sm font-bold shadow-md">All courses</button>
            <button className="bg-white border border-black/5 text-zinc-600 hover:text-zinc-900 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors">Marketing</button>
            <button className="bg-white border border-black/5 text-zinc-600 hover:text-zinc-900 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors">Computer Science</button>
            <button className="bg-white border border-black/5 text-zinc-600 hover:text-zinc-900 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors">Psychology</button>
         </div>
      </div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Card 1 */}
         <div className="bg-brand rounded-[2rem] p-6 shadow-sm border border-black/5 flex flex-col relative transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
               <span className="bg-zinc-950 text-brand text-xs font-bold px-3 py-1.5 rounded-md">Marketing</span>
               <BookmarkSimple size={24} weight="fill" className="text-zinc-950" />
            </div>
            <h2 className="font-display text-2xl font-bold text-zinc-900 leading-tight mb-8">Creative Writing for Beginners</h2>
            
            <div className="flex justify-between items-end mb-2">
               <span className="text-sm font-bold text-zinc-800">Progress</span>
               <span className="text-sm font-bold text-zinc-800">5/20 lessons</span>
            </div>
            <div className="w-full h-2 bg-zinc-950/10 rounded-full mb-6 overflow-hidden">
               <div className="h-full bg-zinc-950 rounded-full w-[25%]"></div>
            </div>

            <div className="flex justify-between items-center mt-auto">
               <div className="flex -space-x-3">
                  <img src={avatarSeed("1")} className="w-10 h-10 rounded-full border-2 border-brand bg-white" alt="student" />
                  <img src={avatarSeed("2")} className="w-10 h-10 rounded-full border-2 border-brand bg-white" alt="student" />
                  <img src={avatarSeed("3")} className="w-10 h-10 rounded-full border-2 border-brand bg-white" alt="student" />
                  <div className="w-10 h-10 rounded-full border-2 border-brand bg-ink text-canvas flex items-center justify-center text-xs font-bold z-10">+120</div>
               </div>
               <button className="bg-[#f9644d] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-[#e0503a] transition-colors">Continue</button>
            </div>
         </div>

         {/* Card 2 */}
         <div className="bg-[#d8b4fe] rounded-[2rem] p-6 shadow-sm border border-black/5 flex flex-col relative transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
               <span className="bg-white/40 text-zinc-950 text-xs font-bold px-3 py-1.5 rounded-md">Computer Science</span>
               <BookmarkSimple size={24} weight="fill" className="text-zinc-950" />
            </div>
            <h2 className="font-display text-2xl font-bold text-zinc-900 leading-tight mb-8">Digital Illustration with Adobe Illustrator</h2>
            
            <div className="flex justify-between items-end mb-2">
               <span className="text-sm font-bold text-zinc-800">Progress</span>
               <span className="text-sm font-bold text-zinc-800">12/50 lessons</span>
            </div>
            <div className="w-full h-2 bg-zinc-950/10 rounded-full mb-6 overflow-hidden">
               <div className="h-full bg-zinc-950 rounded-full w-[24%]"></div>
            </div>

            <div className="flex justify-between items-center mt-auto">
               <div className="flex -space-x-3">
                  <img src={avatarSeed("4")} className="w-10 h-10 rounded-full border-2 border-[#d8b4fe] bg-white" alt="student" />
                  <img src={avatarSeed("5")} className="w-10 h-10 rounded-full border-2 border-[#d8b4fe] bg-white" alt="student" />
                  <img src={avatarSeed("6")} className="w-10 h-10 rounded-full border-2 border-[#d8b4fe] bg-white" alt="student" />
                  <div className="w-10 h-10 rounded-full border-2 border-[#d8b4fe] bg-brand text-zinc-950 flex items-center justify-center text-xs font-bold z-10">+80</div>
               </div>
               <button className="bg-[#f9644d] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-[#e0503a] transition-colors">Continue</button>
            </div>
         </div>

         {/* Card 3 */}
         <div className="bg-[#bae6fd] rounded-[2rem] p-6 shadow-sm border border-black/5 flex flex-col relative transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
               <span className="bg-white/40 text-zinc-950 text-xs font-bold px-3 py-1.5 rounded-md">Psychology</span>
               <BookmarkSimple size={24} weight="regular" className="text-zinc-950" />
            </div>
            <h2 className="font-display text-2xl font-bold text-zinc-900 leading-tight mb-8">Public Speaking and Leadership</h2>
            
            <div className="flex justify-between items-end mb-2">
               <span className="text-sm font-bold text-zinc-800">Progress</span>
               <span className="text-sm font-bold text-zinc-800">18/22 lessons</span>
            </div>
            <div className="w-full h-2 bg-zinc-950/10 rounded-full mb-6 overflow-hidden">
               <div className="h-full bg-zinc-950 rounded-full w-[80%]"></div>
            </div>

            <div className="flex justify-between items-center mt-auto">
               <div className="flex -space-x-3">
                  <img src={avatarSeed("7")} className="w-10 h-10 rounded-full border-2 border-[#bae6fd] bg-white" alt="student" />
                  <img src={avatarSeed("8")} className="w-10 h-10 rounded-full border-2 border-[#bae6fd] bg-white" alt="student" />
                  <img src={avatarSeed("9")} className="w-10 h-10 rounded-full border-2 border-[#bae6fd] bg-white" alt="student" />
                  <div className="w-10 h-10 rounded-full border-2 border-[#bae6fd] bg-[#d8b4fe] text-zinc-950 flex items-center justify-center text-xs font-bold z-10">+24</div>
               </div>
               <button className="bg-[#f9644d] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-[#e0503a] transition-colors">Continue</button>
            </div>
         </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 mt-2">
         
         {/* Left List */}
         <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
            <div className="flex justify-between items-center mb-8 border-b border-black/5 pb-4">
               <h3 className="font-display text-2xl font-bold text-zinc-900">My next lessons</h3>
               <button className="text-[#f9644d] font-bold text-sm hover:underline">View all lessons</button>
            </div>
            
            <div className="grid grid-cols-[1fr_150px_80px] gap-4 mb-4 text-xs font-bold text-zinc-400 tracking-wider">
               <span>Lesson</span>
               <span>Teacher</span>
               <span className="text-right">Duration</span>
            </div>

            <div className="flex flex-col gap-6">
               {[
                  { num: "01", title: "Introduction to Creative Writing", sub: "Creative writing for beginners", teacher: "Conner Garcia", duration: "22 min", seed: "t1" },
                  { num: "03", title: "Foundations of Public Speaking", sub: "Public Speaking and Leadership", teacher: "Saira Goodman", duration: "40 min", seed: "t2" },
                  { num: "05", title: "Getting to know the tool Adobe Illustrator", sub: "Digital Illustration with Adobe Illustrator", teacher: "Tony Ware", duration: "1h 08 min", seed: "t3" },
                  { num: "11", title: "Understanding audience psychology", sub: "Public Speaking: Basic course", teacher: "Mya Guzman", duration: "26 min", seed: "t4" },
                  { num: "04", title: "The importance of self reflection", sub: "Psychology of influence", teacher: "Zohaib Osborn", duration: "23 min", seed: "t5" },
               ].map((lesson, i) => (
                  <div key={i} className="grid grid-cols-[1fr_150px_80px] gap-4 items-center group cursor-pointer">
                     <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-full bg-zinc-50 border border-black/5 flex flex-col items-center justify-center shrink-0 group-hover:bg-[#f9644d] group-hover:text-white transition-colors">
                           <PlayCircle size={24} weight="fill" className="text-zinc-300 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex flex-col">
                           <span className="font-bold text-sm text-zinc-900 group-hover:text-[#f9644d] transition-colors line-clamp-1">{lesson.num}. {lesson.title}</span>
                           <span className="text-xs text-zinc-500 line-clamp-1">{lesson.sub}</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <img src={avatarSeed(lesson.seed)} className="w-8 h-8 rounded-full bg-zinc-100" alt="teacher" />
                        <span className="text-sm font-bold text-zinc-700">{lesson.teacher}</span>
                     </div>
                     <div className="text-right text-sm font-bold text-zinc-900">
                        {lesson.duration}
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Right Dark Card */}
         <div className="bg-ink text-white rounded-[2.5rem] p-10 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
               <p className="text-zinc-400 font-medium mb-6">New course matching your interests</p>
               <span className="inline-block bg-transparent border border-brand text-brand text-xs font-bold px-3 py-1.5 rounded-md mb-6">Computer Science</span>
               
               <h3 className="font-display text-3xl font-bold leading-tight mb-8">
                  Microsoft Future Ready:<br/>Fundamentals of Big Data
               </h3>

               <p className="text-sm text-zinc-400 mb-4">They are already studying</p>
               <div className="flex -space-x-3 mb-12">
                  <img src={avatarSeed("10")} className="w-12 h-12 rounded-full border-2 border-ink bg-white" alt="student" />
                  <img src={avatarSeed("11")} className="w-12 h-12 rounded-full border-2 border-ink bg-white" alt="student" />
                  <img src={avatarSeed("12")} className="w-12 h-12 rounded-full border-2 border-ink bg-white" alt="student" />
                  <div className="w-12 h-12 rounded-full border-2 border-ink bg-brand text-zinc-950 flex items-center justify-center text-xs font-bold z-10">+100</div>
               </div>
            </div>

            <button className="relative z-10 w-full bg-[#f9644d] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#e0503a] transition-all active:scale-[0.98] shadow-[0_8px_20px_-6px_rgba(249,100,77,0.5)]">
               More details
            </button>
         </div>

      </div>
    </div>
  );
}
