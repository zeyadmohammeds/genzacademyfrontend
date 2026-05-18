"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Clock, UsersThree, MagnifyingGlass } from "@phosphor-icons/react";
import type { Course, CourseRound } from "@/lib/types";
import { GuestCartButton } from "@/components/GuestCartButton";

const imageFor = (seed: string) => `https://picsum.photos/seed/${seed}/1200/800`;

export function CoursesExperience({ courses, rounds }: { courses: Course[]; rounds: CourseRound[] }) {
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("All");

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = filterLevel === "All" || course.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="w-full bg-canvas-soft min-h-screen font-body selection:bg-zinc-900 selection:text-white">
      
      {/* Editorial Hero */}
      <section className="px-6 lg:px-12 pt-16 pb-12 lg:pt-24 lg:pb-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col gap-6 max-w-4xl">
            <span className="text-zinc-500 font-bold tracking-widest text-xs uppercase flex items-center gap-4">
              <span className="w-8 h-px bg-zinc-300"></span>
              The Academy Directory
            </span>
            <h1 className="font-display text-6xl lg:text-[7rem] font-black tracking-tighter leading-[0.85] text-zinc-950">
              Future-proof <br /> your intellect.
            </h1>
            <p className="text-zinc-500 text-lg lg:text-xl max-w-xl leading-relaxed mt-4">
              Intensive, project-driven learning protocols designed for the next generation of technological architects.
            </p>
          </div>
        </div>
      </section>

      {/* Advanced Filter Bar */}
      <div className="sticky top-[80px] z-30 w-full px-6 lg:px-12 py-4 bg-canvas-soft/80 backdrop-blur-xl border-y border-black/5">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80 group">
              <MagnifyingGlass size={20} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
              <input 
                type="text" 
                placeholder="Search catalog..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/60 border border-black/10 pl-12 pr-4 py-3 text-lg font-bold text-zinc-900 placeholder:text-zinc-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {["All", "Beginner", "Intermediate", "Advanced"].map((level) => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`shrink-0 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  filterLevel === level 
                    ? "bg-ink text-canvas shadow-md" 
                    : "bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-black/5"
                }`}
              >
                {level === "All" ? "All Protocols" : level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editorial Grid Layout */}
      <section className="px-6 lg:px-12 py-12 lg:py-24">
        <div className="max-w-[1400px] mx-auto">
          {filteredCourses.length === 0 ? (
            <div className="w-full py-32 flex flex-col items-center justify-center text-center">
              <span className="font-display text-4xl font-bold text-zinc-300 mb-4">Null Result.</span>
              <p className="text-zinc-500 text-lg">No tracks align with your current telemetry. Adjust parameters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-16">
              {filteredCourses.map((course, idx) => {
                // Impeccable constraint: varied layout. 
                // Every 3rd item spans 8 cols (large feature), others span 4.
                const isFeatured = idx % 3 === 0;
                const colSpan = isFeatured ? "lg:col-span-8" : "lg:col-span-4";
                
                return (
                  <article 
                    key={course.id}
                    className={`group flex flex-col relative ${colSpan}`}
                  >
                    <Link href={`/courses/${course.slug}`} className="block relative w-full overflow-hidden rounded-[2.5rem] bg-zinc-200 mb-6 aspect-[4/3] shadow-sm transform-gpu">
                      <Image 
                        src={imageFor(`course-${course.slug}`)} 
                        alt={course.title} 
                        fill 
                        className="object-cover scale-100 group-hover:scale-105 transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)]"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                      
                      {/* Floating Status Pill */}
                      <div className="absolute top-6 left-6 flex gap-2 z-10">
                        <span className="bg-white/90 backdrop-blur-md text-zinc-950 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
                          {course.level}
                        </span>
                      </div>
                      
                      {/* Interaction Overlay */}
                      <div className="absolute bottom-6 right-6 w-12 h-12 bg-white text-zinc-950 rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-xl z-10">
                        <ArrowRight size={20} weight="bold" className="-rotate-45" />
                      </div>
                    </Link>

                    <div className="flex flex-col flex-1 pl-2">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <Link href={`/courses/${course.slug}`}>
                          <h2 className="font-display text-3xl font-bold text-zinc-900 leading-[1.1] group-hover:text-ember transition-colors line-clamp-2">
                            {course.title}
                          </h2>
                        </Link>
                        <span className="font-display font-bold text-xl text-zinc-400 shrink-0">
                          EGP {course.priceEgp.toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-zinc-500 text-base leading-relaxed mb-6 line-clamp-2 flex-1 max-w-[85%]">
                        {course.shortDescription}
                      </p>
                      
                      <div className="flex items-center justify-between border-t border-black/10 pt-4 mt-auto">
                        <div className="flex items-center gap-6 text-sm font-bold text-zinc-900">
                          <span className="flex items-center gap-2">
                            <Clock size={16} weight="bold" className="text-zinc-400" />
                            {course.coreSessions + course.supportSessions} Weeks
                          </span>
                          <span className="flex items-center gap-2">
                            <UsersThree size={16} weight="bold" className="text-zinc-400" />
                            Age {course.minimumAge}+
                          </span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity duration-300">
                           <GuestCartButton course={course} />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
