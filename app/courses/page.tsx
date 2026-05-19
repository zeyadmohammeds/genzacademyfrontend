"use client";

import { useEffect, useState } from "react";
import { getCourses } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import type { Course } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Sparkle, BookmarkSimple, ShoppingCart, MagnifyingGlass } from "@phosphor-icons/react";
import { CourseIcon } from "@/components/IconMapper";

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { addItem, removeItem, isInCart, cart } = useCart();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    getCourses().then(setCourses).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const filtered = courses.filter(c => {
    const matchesFilter = filter === "all" || (c.level || "").toLowerCase() === filter;
    const matchesSearch = !searchQuery || 
      (c.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.shortDescription || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  const uniqueLevels = Array.from(new Set(courses.map(c => c.level).filter(Boolean)));
  const filters = [
    { id: "all", label: "All Tracks" },
    ...uniqueLevels.map(lvl => ({
      id: lvl.toLowerCase(),
      label: lvl
    }))
  ];

  const handleAdd = async (course: Course) => {
    if (isInCart(course.id)) {
      await removeItem(course.id);
      toast(`${course.title} removed from cart`, "info");
    } else {
      await addItem(course);
      toast(`${course.title} added to cart`, "success");
    }
  };

  return (
    <div className="w-full px-4 md:px-10 py-12 bg-canvas-soft min-h-screen">
      {/* Header Info */}
      <div className="mb-12">
        <span className="text-xs font-black uppercase tracking-widest text-brand bg-ink px-4 py-1.5 rounded-full mb-3 inline-block">
          Curriculum Catalogue
        </span>
        <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight text-zinc-900 leading-tight">
          All Courses & Tracks
        </h1>
        <p className="text-zinc-500 font-medium text-lg mt-2 max-w-2xl">
          Learn project-first engineering with live mentoring, structured levels, and automated AI code feedback.
        </p>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-10 pb-6 border-b border-black/5">
        <div className="relative flex-1 max-w-md group">
          <input 
            type="text" 
            placeholder="Search intelligence tracks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-6 rounded-full border border-black/10 bg-white text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-brand/25 focus:border-zinc-900 shadow-sm transition-all duration-300 group-hover:border-black/20"
          />
          <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button 
              key={f.id} 
              onClick={() => setFilter(f.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm active:scale-95 ${
                filter === f.id 
                  ? "bg-ink text-white shadow-md scale-105" 
                  : "bg-white border border-black/10 text-zinc-700 hover:border-black/30 hover:bg-zinc-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filtered.map((course, idx) => {
          const colors = [
            { bg: "bg-brand-hover", badgeBg: "bg-ink", badgeText: "text-white", border: "border-brand-hover", iconColor: "text-zinc-800" },
            { bg: "bg-[#e4d3ff]", badgeBg: "bg-white/60", badgeText: "text-[#7c3aed]", border: "border-[#7c3aed]/20", iconColor: "text-zinc-800" },
            { bg: "bg-[#c2f0ff]", badgeBg: "bg-white/60", badgeText: "text-[#0284c7]", border: "border-[#0284c7]/20", iconColor: "text-zinc-800" },
            { bg: "bg-[#ffd5dc]", badgeBg: "bg-white/60", badgeText: "text-[#e11d48]", border: "border-[#e11d48]/20", iconColor: "text-zinc-800" },
          ];
          const theme = colors[idx % 4];

          return (
            <div 
              key={course.id} 
              className={`${theme.bg} rounded-[2rem] p-6 shadow-sm relative group hover:-translate-y-1 transition-transform duration-300 flex flex-col ${
                isInCart(course.id) ? "ring-4 ring-zinc-950 border-transparent shadow-lg scale-[1.01]" : "border border-black/5"
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-1">
                  <span className={`px-3 py-1 ${theme.badgeBg} ${theme.badgeText} text-[10px] font-bold rounded-lg ${theme.border !== 'border-brand-hover' ? 'border ' + theme.border : ''} w-fit`}>
                    {course.level} · {course.minimumAge}+{course.maximumAge ? `-${course.maximumAge}` : ""}
                  </span>
                  {isInCart(course.id) && (
                    <span className="text-[9px] font-black tracking-widest text-zinc-950 uppercase bg-brand-hover border border-zinc-950/20 px-2 py-0.5 rounded-full w-fit">
                      Selected in Cart
                    </span>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/50 shadow-inner`}>
                  <CourseIcon iconName={course.iconName} className="w-5 h-5 text-zinc-900" size={20} />
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold leading-tight mb-4 text-zinc-900 pr-4">{course.title}</h2>
                <p className="text-zinc-800 text-sm font-medium mb-6 line-clamp-2">{course.shortDescription}</p>
              </div>
              
              <div className="mb-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-600 mb-1">Duration</span>
                  <span className="text-sm font-bold text-zinc-900">{course.coreSessions} Weeks</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-zinc-600 mb-1">Investment</span>
                  <span className="text-sm font-bold text-zinc-900">{course.priceEgp} EGP</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-black/5 gap-2">
                <Link href={`/courses/${course.slug}`} className="text-zinc-900 font-bold text-sm hover:underline">
                  View Details
                </Link>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAdd(course)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border active:scale-90 ${
                      isInCart(course.id)
                        ? 'bg-zinc-900 text-white border-zinc-900 hover:bg-black'
                        : 'bg-white/60 hover:bg-white text-zinc-700 border-black/5'
                    }`}
                    title={isInCart(course.id) ? "Remove from cart" : "Add to cart"}
                  >
                    <ShoppingCart size={18} weight={isInCart(course.id) ? "fill" : "bold"} />
                  </button>
                  <Link href={`/apply?course=${course.slug}`} className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-brand-fg rounded-full font-bold text-sm shadow-md transition-colors flex items-center gap-2">
                    Apply <Sparkle size={16} weight="fill" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Promo Banner */}
      <div className="bg-ink rounded-[2rem] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-xl">
        <div className="mb-6 md:mb-0">
          <h2 className="text-3xl font-display font-bold leading-tight mb-2">Not sure where to start?</h2>
          <p className="text-zinc-400 font-medium max-w-md">Take our quick placement quiz to find the perfect track for your skills and age level.</p>
        </div>
        <Link href="/quiz" className="px-8 py-4 bg-brand hover:bg-brand-hover text-brand-fg rounded-2xl font-bold text-lg shadow-[0_8px_20px_-6px_rgba(159,232,112,0.45)] transition-all active:scale-[0.98] flex items-center gap-2 whitespace-nowrap">
          Take Placement Quiz <ArrowRight size={20} weight="bold" />
        </Link>
      </div>
    </div>
  );
}