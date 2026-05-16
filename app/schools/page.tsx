"use client";

import Link from "next/link";
import { Buildings, Handshake, TrendUp, ArrowRight } from "@phosphor-icons/react";

export default function SchoolsPage() {
  return (
    <div className="w-full bg-canvas-soft min-h-screen font-body selection:bg-brand selection:text-brand-fg pb-32 pt-12 px-6 lg:px-12">
      
      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto mb-20 bg-white rounded-[3rem] p-8 md:p-16 shadow-sm border border-black/5 relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-[#c2f0ff] rounded-full blur-[100px] opacity-40"></div>
        
        <div className="flex-1 relative z-10">
          <span className="px-4 py-2 bg-[#c2f0ff] text-[#0284c7] text-xs font-bold rounded-xl mb-6 inline-flex items-center gap-2 border border-[#0284c7]/20 shadow-sm">
            <Buildings size={16} weight="fill" /> B2B Partnerships
          </span>
          <h1 className="font-display text-5xl lg:text-7xl font-black tracking-tight text-zinc-900 leading-[1.1] mb-6">
            Empower your <span className="text-[#0284c7]">students</span> with modern tech skills.
          </h1>
          <p className="text-zinc-600 text-lg font-medium mb-10 max-w-lg leading-relaxed">
            Partner with ElSewedy GenZ Coders to bring project-first programming, robotics, and AI curriculum to your school.
          </p>
          <Link href="/schools/apply" className="px-8 py-4 bg-[#0284c7] hover:bg-[#026b9e] text-white rounded-full font-bold text-lg shadow-[0_8px_20px_-6px_rgba(2,132,199,0.5)] transition-all active:scale-95 inline-flex items-center gap-2">
            Become a Partner <ArrowRight size={20} weight="bold" />
          </Link>
        </div>
        
        <div className="flex-1 relative z-10 w-full">
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-50 rounded-[2rem] p-6 border border-black/5 h-48 flex flex-col justify-end">
                 <div className="text-4xl font-black text-zinc-900 mb-1">12+</div>
                 <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Partner Schools</div>
              </div>
              <div className="bg-[#0284c7] text-white rounded-[2rem] p-6 border border-black/5 h-48 flex flex-col justify-end translate-y-8 shadow-xl">
                 <div className="text-4xl font-black mb-1">500+</div>
                 <div className="text-sm font-bold text-white/70 uppercase tracking-widest">Students Enrolled</div>
              </div>
           </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-[1400px] mx-auto mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
            <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6 text-zinc-900">
              <TrendUp size={32} weight="duotone" />
            </div>
            <h3 className="text-2xl font-display font-bold text-zinc-900 mb-3">Premium Curriculum</h3>
            <p className="text-zinc-600 font-medium">Access our industry-aligned courses taught by practicing engineers.</p>
          </div>
          
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
            <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6 text-zinc-900">
              <Handshake size={32} weight="duotone" />
            </div>
            <h3 className="text-2xl font-display font-bold text-zinc-900 mb-3">Revenue Sharing</h3>
            <p className="text-zinc-600 font-medium">Generate additional revenue for your school through our partnership model.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
            <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6 text-zinc-900">
              <Buildings size={32} weight="duotone" />
            </div>
            <h3 className="text-2xl font-display font-bold text-zinc-900 mb-3">Dedicated Dashboard</h3>
            <p className="text-zinc-600 font-medium">Track your students' progress, attendance, and performance in real-time.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
