"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Clock, UsersThree, ShoppingCart, Sparkle, CheckCircle, BookOpen, Lightning } from "@phosphor-icons/react";
import { CourseIcon } from "@/components/IconMapper";
import type { Course, CourseRound } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { useState } from "react";
import { useCartUi } from "@/lib/cart-ui-context";

export function CourseDetailExperience({ course, rounds }: { course: Course; rounds: CourseRound[] }) {
  const { user } = useAuth();
  const { addItem, removeItem, isInCart, cart, guestItems } = useCart();
  const { openDrawer } = useCartUi();
  const { toast } = useToast();
  const [addingToCart, setAddingToCart] = useState(false);
  const inCart = isInCart(course.id);

  const skills: string[] = (() => {
    try { return JSON.parse(course.skillsTaughtJson || "[]"); } catch { return []; }
  })();

  const handleToggleCart = async () => {
    setAddingToCart(true);
    try {
      if (inCart) {
        await removeItem(course.id);
        toast(`${course.title} removed from cart`, "info");
      } else {
        await addItem(course);
        toast(`${course.title} added to cart!`, "success");
        openDrawer();
      }
    } catch {
      toast("Could not update cart", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="w-full px-6 lg:px-12 py-8 max-w-[1400px] mx-auto">
      
      {/* Breadcrumb */}
      <Link href="/courses" className="text-brand text-sm font-bold hover:underline mb-6 flex items-center gap-2 w-fit">
        <ArrowLeft weight="bold" /> Back to All Tracks
      </Link>

      {/* Hero Banner */}
      <div className="bg-ink rounded-[3rem] p-8 lg:p-14 text-white mb-10 relative overflow-hidden shadow-xl min-h-[320px] flex flex-col justify-end">
        {course.coverImageUrl ? (
          <>
            <Image src={course.coverImageUrl} alt={course.title} fill className="object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute top-[-40%] right-[-15%] w-[500px] h-[500px] bg-brand rounded-full blur-[180px] opacity-20"></div>
            <div className="absolute bottom-[-30%] left-[-10%] w-[400px] h-[400px] bg-[#7c3aed] rounded-full blur-[150px] opacity-15"></div>
          </>
        )}
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-4 py-2 bg-white/10 text-white/90 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-white/10">
                {course.level}
              </span>
              <span className="px-4 py-2 bg-brand-hover/20 text-brand text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-brand-hover/20 backdrop-blur-md">
                Ages {course.minimumAge}+
              </span>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                <CourseIcon iconName={course.iconName} className="w-5 h-5 text-white" size={20} />
              </div>
            </div>
            
            <h1 className="font-display text-4xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-6">
              {course.title}
            </h1>
            <p className="text-white/60 text-lg font-medium leading-relaxed max-w-lg">
              {course.shortDescription}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Investment</div>
            <div className="font-display text-5xl font-black text-white">
              EGP {course.priceEgp.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
        
        {/* Left: Content */}
        <div className="flex flex-col gap-8">
          
          {/* About */}
          <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-black/5">
            <h2 className="text-2xl font-display font-bold text-zinc-900 mb-6">About This Track</h2>
            <p className="text-zinc-600 font-medium leading-relaxed mb-6">
              {course.description || course.shortDescription}
            </p>
            <p className="text-zinc-600 font-medium leading-relaxed">
              This program is engineered for immersion. From day one, you build real projects using industry-standard tools. The track combines {course.coreSessions} core build sessions with {course.supportSessions} technical support labs.
            </p>
          </div>

          {/* Outcome */}
          <div className="bg-brand-hover rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-brand-hover">
            <div className="flex items-center gap-3 mb-4">
              <Lightning size={24} weight="fill" className="text-zinc-900" />
              <h3 className="text-xl font-bold text-zinc-900">What You'll Build</h3>
            </div>
            <p className="text-zinc-800 font-medium text-lg leading-relaxed">
              {course.outcome}
            </p>
          </div>

          {/* Skills Grid */}
          {skills.length > 0 && (
            <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-black/5">
              <h2 className="text-2xl font-display font-bold text-zinc-900 mb-6">Skills You'll Master</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {skills.map((skill, i) => {
                  const pillColors = [
                    "bg-[#e4d3ff] text-[#7c3aed]",
                    "bg-[#c2f0ff] text-[#0284c7]",
                    "bg-brand-hover text-zinc-900",
                    "bg-[#ffd5dc] text-[#e11d48]",
                  ];
                  return (
                    <span key={skill} className={`${pillColors[i % pillColors.length]} px-5 py-3 rounded-2xl text-sm font-bold text-center`}>
                      {skill}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Session Structure */}
          <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-black/5">
            <h2 className="text-2xl font-display font-bold text-zinc-900 mb-6">Program Structure</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-canvas-soft rounded-2xl p-6 text-center">
                <div className="text-3xl font-black text-zinc-900 mb-1">{course.coreSessions}</div>
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Core Sessions</div>
              </div>
              <div className="bg-canvas-soft rounded-2xl p-6 text-center">
                <div className="text-3xl font-black text-zinc-900 mb-1">{course.supportSessions}</div>
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Support Labs</div>
              </div>
              <div className="bg-canvas-soft rounded-2xl p-6 text-center">
                <div className="text-3xl font-black text-zinc-900 mb-1">{course.coreSessions + course.supportSessions}</div>
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Weeks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sticky Action Panel */}
        <div className="sticky top-28 flex flex-col gap-6">
          
          {/* Action Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex items-center justify-between pb-4 border-b border-black/5">
                <span className="text-zinc-500 font-medium flex items-center gap-2 text-sm">
                  <Clock size={16} weight="bold" /> Duration
                </span>
                <span className="font-bold text-zinc-900">{course.coreSessions + course.supportSessions} Weeks</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-black/5">
                <span className="text-zinc-500 font-medium flex items-center gap-2 text-sm">
                  <UsersThree size={16} weight="bold" /> Age Range
                </span>
                <span className="font-bold text-zinc-900">{course.minimumAge}+{course.maximumAge ? ` to ${course.maximumAge}` : ""}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-black/5">
                <span className="text-zinc-500 font-medium flex items-center gap-2 text-sm">
                  <BookOpen size={16} weight="bold" /> Sessions
                </span>
                <span className="font-bold text-zinc-900">{course.coreSessions} Core + {course.supportSessions} Labs</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleToggleCart}
                disabled={addingToCart}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3 ${
                  inCart
                    ? 'bg-white border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-50'
                    : 'bg-brand hover:bg-brand-hover text-brand-fg shadow-[0_8px_20px_-6px_rgba(159,232,112,0.45)]'
                }`}
              >
                <ShoppingCart size={22} weight={inCart ? "fill" : "bold"} />
                {addingToCart ? "Updating..." : inCart ? "Remove from Cart" : "Add to Cart"}
              </button>
              
              {user && (
                <Link 
                  href={`/apply?course=${course.slug}`} 
                  className="w-full py-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-wider text-sm transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] shadow-md shadow-zinc-950/10"
                >
                  Apply Now <Sparkle size={18} weight="fill" />
                </Link>
              )}
              
              {!user && (
                <Link 
                  href={`/auth?returnUrl=/courses/${course.slug}`}
                  className="w-full py-3 bg-white border border-black/10 text-zinc-700 rounded-2xl font-bold text-sm transition-colors text-center hover:border-black/30"
                >
                  Sign in to apply
                </Link>
              )}
            </div>
          </div>

          {/* Active Rounds */}
          <div className="bg-[#e4d3ff] rounded-[2rem] p-6 shadow-sm border border-[#7c3aed]/10">
            <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Sparkle size={18} weight="fill" className="text-[#7c3aed]" /> Available Rounds
            </h3>
            {rounds.length === 0 ? (
              <p className="text-zinc-600 text-sm font-medium">No active rounds scheduled. Check back soon.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {rounds.map(round => (
                  <div key={round.id} className="bg-white/60 rounded-2xl p-4 border border-[#7c3aed]/10">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-zinc-900">{round.name}</span>
                      <span className="text-[10px] font-bold text-[#7c3aed] bg-white px-2 py-1 rounded-full">
                        {round.currentStudents}/{round.maxStudents}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-zinc-500 flex items-center gap-1">
                      <Clock size={12} weight="bold" />
                      Starts {new Date(round.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
