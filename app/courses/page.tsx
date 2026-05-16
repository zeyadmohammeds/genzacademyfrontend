"use client";

import { useEffect, useState } from "react";
import { getCourses } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import type { Course } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Sparkle, BookmarkSimple, ShoppingCart, MagnifyingGlass } from "@phosphor-icons/react";

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { addItem, removeItem, isInCart, cart } = useCart();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";

  useEffect(() => {
    getCourses().then(setCourses).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const filtered = courses.filter(c => {
    const matchesFilter = filter === "all" || c.level.toLowerCase().includes(filter);
    const matchesSearch = !query || c.title.toLowerCase().includes(query) || c.shortDescription.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
  
  const filters = [
    { id: "all", label: "All Tracks" },
    { id: "beginner", label: "Beginner" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" },
    { id: "maker", label: "Maker" },
  ];

  const handleAdd = async (course: Course) => {
    if (isInCart(course.id)) {
      const itemId = cart?.items.find(i => i.courseId === course.id)?.id || course.id;
      await removeItem(itemId);
      toast(`${course.title} removed from cart`, "info");
    } else {
      await addItem(course);
      toast(`${course.title} added to cart`, "success");
    }
  };

  return (
    <div className="w-full px-10 py-8">
      {/* Header & Tabs */}
      <div className="flex items-end justify-between mb-8">
        <h1 className="text-4xl font-display font-black tracking-tight text-zinc-900">
          All courses
        </h1>
        <div className="flex gap-2">
          {filters.map(f => (
            <button 
              key={f.id} 
              onClick={() => setFilter(f.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-colors shadow-sm ${
                filter === f.id 
                  ? "bg-ink text-white shadow-md" 
                  : "bg-white border border-black/10 text-zinc-700 hover:border-black/30"
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
            <div key={course.id} className={`${theme.bg} rounded-[2rem] p-6 shadow-sm border border-black/5 relative group hover:-translate-y-1 transition-transform duration-300 flex flex-col`}>
              <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 ${theme.badgeBg} ${theme.badgeText} text-xs font-bold rounded-lg ${theme.border !== 'border-brand-hover' ? 'border ' + theme.border : ''}`}>
                  {course.level} · {course.minimumAge}+{course.maximumAge ? `-${course.maximumAge}` : ""}
                </span>
                <span className="text-2xl">{course.iconName ?? "📘"}</span>
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
        <Link href="/courses" className="px-8 py-4 bg-brand hover:bg-brand-hover text-brand-fg rounded-2xl font-bold text-lg shadow-[0_8px_20px_-6px_rgba(159,232,112,0.45)] transition-all active:scale-[0.98] flex items-center gap-2 whitespace-nowrap">
          Take Placement Quiz <ArrowRight size={20} weight="bold" />
        </Link>
      </div>
    </div>
  );
}