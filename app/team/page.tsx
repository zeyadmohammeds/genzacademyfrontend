"use client";

import Link from "next/link";
import { LinkedinLogo, GithubLogo, TwitterLogo } from "@phosphor-icons/react";

export default function TeamPage() {
  const team = [
    { name: "Ahmed El-Sherif", role: "Lead Engineer", specialty: "Web & AI", seed: "ahmed" },
    { name: "Sara Mahmoud", role: "Senior Instructor", specialty: "Robotics", seed: "sara" },
    { name: "Omar Hassan", role: "Curriculum Director", specialty: "C++ & Game Dev", seed: "omar" },
    { name: "Nour Ali", role: "Frontend Engineer", specialty: "UI/UX", seed: "nour" },
    { name: "Youssef Kamal", role: "CTA Lead", specialty: "Student Success", seed: "youssef" },
    { name: "Mariam Samir", role: "Backend Engineer", specialty: "Python & Data", seed: "mariam" },
  ];

  return (
    <div className="w-full bg-canvas-soft min-h-screen font-body selection:bg-brand selection:text-brand-fg pb-32 pt-12 px-6 lg:px-12">
      
      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto mb-20 text-center">
        <h1 className="font-display text-5xl lg:text-7xl font-black tracking-tight text-zinc-900 leading-[1.1] mb-6">
          Meet the <span className="text-brand">Engineers</span>.
        </h1>
        <p className="text-zinc-600 text-lg lg:text-xl font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
          Learn from industry professionals. Our instructors are practicing engineers who bring real-world experience directly to the classroom.
        </p>
      </section>

      {/* Team Grid */}
      <section className="max-w-[1400px] mx-auto mb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member, idx) => (
            <div key={idx} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-6 bg-zinc-100 border-4 border-white shadow-md group-hover:scale-105 transition-transform">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${member.seed}&backgroundColor=f0f0f0`} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-display font-bold text-zinc-900 mb-1">{member.name}</h3>
              <p className="text-brand font-bold text-sm mb-2">{member.role}</p>
              <p className="text-zinc-500 font-medium text-sm mb-6 px-4">{member.specialty} expert with a passion for teaching the next generation.</p>
              
              <div className="flex items-center gap-4 mt-auto">
                <a href="#" className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-[#0a66c2] hover:bg-[#0a66c2]/10 transition-colors">
                  <LinkedinLogo size={20} weight="fill" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-black/5 transition-colors">
                  <GithubLogo size={20} weight="fill" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors">
                  <TwitterLogo size={20} weight="fill" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Application */}
      <section className="max-w-[1400px] mx-auto">
         <div className="bg-ink rounded-[3rem] p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-xl overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand-hover rounded-full blur-[80px] opacity-10"></div>
           
           <div className="relative z-10 max-w-lg">
             <h2 className="font-display text-3xl lg:text-4xl font-black text-white mb-4 tracking-tight">Become a CTA</h2>
             <p className="text-zinc-400 font-medium text-lg mb-8">
               Are you a top graduate of our academy? Apply to become a Certified Teaching Assistant and help mentor the next cohort.
             </p>
             <Link href="/apply-cta" className="px-8 py-4 bg-brand-hover text-zinc-900 rounded-full font-bold text-lg hover:bg-brand-neutral transition-colors shadow-md inline-block">
               Apply Now
             </Link>
           </div>
           
           <div className="relative z-10 hidden md:block">
             <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/5 backdrop-blur-sm">
                <span className="font-display font-black text-5xl text-white">CTA</span>
             </div>
           </div>
         </div>
      </section>

    </div>
  );
}
