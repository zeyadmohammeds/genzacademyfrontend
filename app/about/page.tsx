"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trophy, Target, Lightbulb, UsersThree } from "@phosphor-icons/react";

export default function AboutPage() {
  return (
    <div className="w-full bg-canvas-soft min-h-screen font-body selection:bg-brand selection:text-brand-fg pb-32 pt-12 px-6 lg:px-12">
      
      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto mb-20 bg-ink rounded-[3rem] p-8 md:p-16 shadow-sm border border-black/5 relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-brand rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-hover rounded-full blur-[100px] opacity-10"></div>
        
        <div className="relative z-10 max-w-3xl">
          <span className="px-4 py-2 bg-white/10 text-white text-xs font-bold rounded-xl mb-6 inline-flex items-center gap-2 border border-white/10 shadow-sm backdrop-blur-md">
            Our Mission
          </span>
          <h1 className="font-display text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6">
            Empowering the Next Generation of <span className="text-brand">Builders</span>.
          </h1>
          <p className="text-zinc-400 text-lg lg:text-xl font-medium mb-10 leading-relaxed">
            ElSewedy GenZ Coders is Egypt's leading project-first technology academy for youth. We believe in learning by doing, transforming consumers into creators.
          </p>
        </div>
      </section>

      {/* Values Grid */}
      <section className="max-w-[1400px] mx-auto mb-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-black tracking-tight text-zinc-900 mb-4">Core Values</h2>
          <p className="text-zinc-500 font-medium text-lg">The principles that drive our academy.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5 flex flex-col group hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-brand-hover rounded-2xl flex items-center justify-center mb-6 text-zinc-900">
              <Target size={32} weight="fill" />
            </div>
            <h3 className="text-2xl font-display font-bold text-zinc-900 mb-3">Project-First</h3>
            <p className="text-zinc-600 font-medium text-sm">We don't just teach theory. Every student builds real-world applications and hardware from day one.</p>
          </div>
          
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5 flex flex-col group hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-[#e4d3ff] rounded-2xl flex items-center justify-center mb-6 text-[#7c3aed]">
              <Trophy size={32} weight="fill" />
            </div>
            <h3 className="text-2xl font-display font-bold text-zinc-900 mb-3">Excellence</h3>
            <p className="text-zinc-600 font-medium text-sm">We hold our students to high standards, encouraging them to push boundaries and master their craft.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5 flex flex-col group hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-[#c2f0ff] rounded-2xl flex items-center justify-center mb-6 text-[#0284c7]">
              <Lightbulb size={32} weight="fill" />
            </div>
            <h3 className="text-2xl font-display font-bold text-zinc-900 mb-3">Innovation</h3>
            <p className="text-zinc-600 font-medium text-sm">We teach cutting-edge technologies, from AI to advanced robotics, preparing students for the future.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5 flex flex-col group hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-[#ffd5dc] rounded-2xl flex items-center justify-center mb-6 text-[#e11d48]">
              <UsersThree size={32} weight="fill" />
            </div>
            <h3 className="text-2xl font-display font-bold text-zinc-900 mb-3">Community</h3>
            <p className="text-zinc-600 font-medium text-sm">We foster a collaborative environment where students, parents, and engineers work together.</p>
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto text-center">
         <div className="bg-brand rounded-[3rem] p-12 lg:p-24 relative overflow-hidden shadow-lg">
           <div className="relative z-10 flex flex-col items-center">
             <h2 className="font-display text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">Ready to start your journey?</h2>
             <p className="text-white/80 font-medium text-lg max-w-lg mb-10">Join hundreds of students already building the future.</p>
             <Link href="/courses" className="px-8 py-4 bg-white text-brand rounded-full font-bold text-lg hover:bg-zinc-100 transition-colors shadow-md">
               Explore Courses
             </Link>
           </div>
         </div>
      </section>

    </div>
  );
}
