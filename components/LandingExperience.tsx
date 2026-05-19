"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  BookBookmark, 
  ChalkboardTeacher, 
  Brain, 
  Trophy, 
  Robot, 
  Sparkle, 
  PlayCircle, 
  Star, 
  Users,
  Target,
  Lightbulb,
  CheckCircle,
  CaretUp,
  CaretDown
} from "@phosphor-icons/react";
import type { Course, CourseRound, LeaderboardEntry } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { CourseIcon } from "@/components/IconMapper";

type LandingExperienceProps = {
  courses: Course[];
  rounds: CourseRound[];
  leaderboard: LeaderboardEntry[];
};

export function LandingExperience({ courses, rounds, leaderboard }: LandingExperienceProps) {
  const { user } = useAuth();
  const featuredCourses = courses.slice(0, 4);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } as any }
  };

  return (
    <div className="w-full bg-canvas-soft min-h-screen font-body selection:bg-brand selection:text-brand-fg pb-32 pt-12 px-6 lg:px-12 overflow-hidden">
      
      {/* Hero Section */}
      <motion.section 
        id="hero"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-[1400px] mx-auto mb-24 bg-white rounded-[3rem] p-8 md:p-16 shadow-sm border border-black/5 relative overflow-hidden flex flex-col md:flex-row items-center gap-12"
      >
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-brand-hover rounded-full blur-[100px] opacity-40"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#ffe6e6] rounded-full blur-[100px] opacity-40"></div>
        
        <div className="flex-1 relative z-10">
          <motion.span 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="px-4 py-2 bg-brand-hover text-zinc-900 text-xs font-bold rounded-xl mb-6 inline-flex items-center gap-2 border border-brand-hover/50 shadow-sm"
          >
            <Sparkle size={16} weight="fill" className="text-brand" /> Future-Ready Academy
          </motion.span>
          <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4, duration: 0.8 }}
             className="font-display text-6xl lg:text-8xl font-black tracking-tight text-zinc-900 leading-[1.05] mb-6"
          >
            Build your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-ink-deep">legacy</span> in code.
          </motion.h1>
          <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.6 }}
             className="text-zinc-600 text-lg lg:text-xl font-medium mb-10 max-w-xl leading-relaxed"
          >
            A premium educational ecosystem engineered for the next generation of software engineers, roboticists, and innovators.
          </motion.p>
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.8 }}
             className="flex flex-wrap items-center gap-4"
          >
            {user ? (
              <Link href="/dashboard" className="px-8 py-4 bg-brand hover:bg-brand-hover text-brand-fg rounded-full font-bold text-lg shadow-[0_8px_20px_-6px_rgba(159,232,112,0.45)] transition-all active:scale-95 flex items-center gap-2">
                Enter My Room <ArrowRight size={20} weight="bold" />
              </Link>
            ) : (
              <Link href="/auth" className="px-8 py-4 bg-brand hover:bg-brand-hover text-brand-fg rounded-full font-bold text-lg shadow-[0_8px_20px_-6px_rgba(159,232,112,0.45)] transition-all active:scale-95 flex items-center gap-2">
                Join the Academy <ArrowRight size={20} weight="bold" />
              </Link>
            )}
            <Link href="/courses" className="px-8 py-4 bg-white border border-black/10 text-zinc-800 hover:border-black/30 rounded-full font-bold text-lg shadow-sm transition-colors flex items-center gap-2 group">
              Explore Tracks <PlayCircle size={22} className="text-zinc-400 group-hover:text-zinc-800 transition-colors" weight="fill" />
            </Link>
          </motion.div>
        </div>
        
        <div className="flex-1 relative z-10 w-full flex justify-center">
          <motion.div 
             initial={{ opacity: 0, x: 50, rotate: 10 }}
             animate={{ opacity: 1, x: 0, rotate: 0 }}
             transition={{ delay: 0.5, type: "spring", stiffness: 60 }}
             className="relative w-full max-w-md aspect-square"
          >
            <div className="absolute inset-0 bg-[#ffcccc] rounded-[3rem] rotate-6 scale-105 shadow-sm border border-[#cc0000]/10 transition-transform duration-700 hover:rotate-12"></div>
            <div className="absolute inset-0 bg-zinc-950 rounded-[3rem] p-8 shadow-2xl flex flex-col items-center justify-center text-center z-10 -rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden group">
               <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-shimmer"></div>
               
               <div className="w-24 h-24 rounded-full bg-brand/20 mb-6 flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                 <Trophy size={48} weight="duotone" />
               </div>
               <h3 className="font-display text-3xl font-black text-white mb-2 tracking-tight">Top Engineer</h3>
               <p className="text-zinc-400 font-medium mb-8 px-4">
                 <strong className="text-white">{leaderboard[0]?.studentName ?? "Mariam"}</strong> is leading the server with <span className="text-brand font-bold">{leaderboard[0]?.xpTotal ?? 2840} XP</span>
               </p>
               
               <div className="flex -space-x-4">
                  {[1, 2, 3, 4, 5].map((i, idx) => (
                    <motion.img 
                      key={i} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + (idx * 0.1) }}
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=U${i}&backgroundColor=ffe6e6,ffcccc,ffb3b3,ff9999`} 
                      className="w-14 h-14 rounded-full border-4 border-zinc-950 shadow-md relative z-10" 
                      alt="Student" 
                      style={{ zIndex: 10 - idx }}
                    />
                  ))}
               </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Metrics Section */}
      <section className="max-w-[1400px] mx-auto mb-24">
         <div className="bg-zinc-950 rounded-[2.5rem] p-10 lg:p-16 flex flex-col md:flex-row justify-around items-center gap-12 text-center shadow-xl">
            <div>
               <div className="text-5xl lg:text-7xl font-black text-white mb-2 tracking-tighter">15+</div>
               <div className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Specialized Tracks</div>
            </div>
            <div className="w-full md:w-px h-px md:h-24 bg-zinc-800"></div>
            <div>
               <div className="text-5xl lg:text-7xl font-black text-brand mb-2 tracking-tighter">5k+</div>
               <div className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Active Students</div>
            </div>
            <div className="w-full md:w-px h-px md:h-24 bg-zinc-800"></div>
            <div>
               <div className="text-5xl lg:text-7xl font-black text-brand mb-2 tracking-tighter">98%</div>
               <div className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Completion Rate</div>
            </div>
         </div>
      </section>

      {/* Value Bento Grid */}
      <motion.section 
        id="features"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-[1400px] mx-auto mb-32"
      >
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl font-black tracking-tight text-zinc-900 mb-6">The Platform Engine</h2>
          <p className="text-zinc-500 font-medium text-xl max-w-2xl mx-auto">A totally unified learning experience. We replaced 5 different apps with one powerful interface.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-black/5 flex flex-col justify-between group hover:shadow-md transition-all overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="relative z-10 mb-8">
               <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-8">
                 <ChalkboardTeacher size={36} weight="fill" />
               </div>
               <h3 className="text-4xl font-display font-black text-zinc-900 mb-4 tracking-tight">Live Virtual Classrooms</h3>
               <p className="text-zinc-600 font-medium text-lg leading-relaxed max-w-lg">Zero external links. Every session runs directly in the platform with integrated attendance tracking, real-time Q&A, and behavioral scoring by our CTAs.</p>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-ink rounded-[2.5rem] p-10 shadow-xl flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand-hover/10 rounded-full blur-2xl translate-y-1/4 translate-x-1/4"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-brand-hover/20 text-brand rounded-2xl flex items-center justify-center mb-8">
                <Trophy size={36} weight="fill" />
              </div>
              <h3 className="text-3xl font-display font-black text-white mb-4 tracking-tight">XP Economy</h3>
              <p className="text-zinc-400 font-medium leading-relaxed">Students earn experience points for assignments, attendance, and helping peers. Climb the global leaderboard and earn digital badges.</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[#ffcccc] rounded-[2.5rem] p-10 shadow-sm border border-[#cc0000]/10 group hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 bg-white/50 text-[#cc0000] rounded-2xl flex items-center justify-center mb-8">
              <Brain size={36} weight="fill" />
            </div>
            <h3 className="text-2xl font-display font-black text-zinc-900 mb-4 tracking-tight">Automated Grading</h3>
            <p className="text-zinc-700 font-medium leading-relaxed">Smart assessments provide instant feedback, allowing engineers to focus on complex code reviews rather than multiple-choice grading.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#ffe6e6] rounded-[2.5rem] p-10 shadow-sm border border-[#ff1a1a]/10 group hover:-translate-y-1 transition-transform relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="w-16 h-16 bg-white/50 text-[#ff1a1a] rounded-2xl flex items-center justify-center mb-8">
                  <Users size={36} weight="fill" />
                </div>
                <h3 className="text-3xl font-display font-black text-zinc-900 mb-4 tracking-tight">Connected Ecosystem</h3>
                <p className="text-zinc-700 font-medium leading-relaxed">Four distinct portals (Student, Parent, Engineer, CTA) that sync perfectly. Parents track progress live, CTAs log behavioral notes, and engineers manage curriculum.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Courses Showcase */}
      <motion.section 
        id="courses"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="max-w-[1400px] mx-auto mb-32"
      >
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-5xl font-black tracking-tight text-zinc-900 mb-4">Master Your Track</h2>
            <p className="text-zinc-500 font-medium text-xl">Industry-vetted curriculums designed to take you from absolute beginner to shipping real products.</p>
          </div>
          <Link href="/courses" className="flex text-zinc-900 bg-white border border-black/10 px-6 py-3 rounded-full font-bold items-center gap-2 hover:bg-zinc-50 transition-colors shadow-sm">
            Explore All Courses <ArrowRight size={18} weight="bold" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredCourses.map((course, idx) => {
            const colors = [
              { bg: "bg-ink", text: "text-white", badgeBg: "bg-white/10", badgeText: "text-white", desc: "text-zinc-400" },
              { bg: "bg-white", text: "text-zinc-900", badgeBg: "bg-zinc-100", badgeText: "text-zinc-700", desc: "text-zinc-500" },
              { bg: "bg-brand-hover", text: "text-zinc-900", badgeBg: "bg-white/50", badgeText: "text-zinc-800", desc: "text-zinc-700" },
              { bg: "bg-white", text: "text-zinc-900", badgeBg: "bg-zinc-100", badgeText: "text-zinc-700", desc: "text-zinc-500" },
            ];
            const theme = colors[idx % 4];

            return (
              <motion.div 
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                key={course.id} 
                className={`${theme.bg} rounded-[2.5rem] p-10 shadow-sm border border-black/5 flex flex-col group transition-all`}
              >
                <div className="flex justify-between items-start mb-8">
                  <span className={`px-4 py-2 ${theme.badgeBg} ${theme.badgeText} text-xs font-bold rounded-xl tracking-wide uppercase`}>
                    {course.level}
                  </span>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${theme.badgeBg} shadow-sm`}>
                    <CourseIcon iconName={course.iconName} className={`w-7 h-7 ${theme.text}`} size={28} />
                  </div>
                </div>
                
                <h3 className={`text-4xl font-display font-black tracking-tight leading-tight mb-4 ${theme.text}`}>{course.title}</h3>
                <p className={`${theme.desc} font-medium text-lg mb-12 flex-1 leading-relaxed`}>{course.shortDescription}</p>
                
                <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-black/10 gap-6">
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.badgeText} opacity-70 mb-1`}>Duration</span>
                      <span className={`text-xl font-black tracking-tight ${theme.text}`}>{course.coreSessions} Weeks</span>
                    </div>
                    <div className="w-px h-8 bg-black/10"></div>
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.badgeText} opacity-70 mb-1`}>Format</span>
                      <span className={`text-xl font-black tracking-tight ${theme.text}`}>Live / Online</span>
                    </div>
                  </div>
                  <Link href={`/courses/${course.slug}`} className={`w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm text-center transition-transform active:scale-95 ${idx % 4 === 0 ? "bg-brand text-brand-fg" : idx % 4 === 2 ? "bg-ink text-canvas" : "bg-ink text-canvas"}`}>
                    View Details
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* About Section */}
      <section id="about" className="max-w-[1400px] mx-auto mb-32">
        <div className="bg-ink rounded-[3rem] p-12 lg:p-20 shadow-sm border border-black/5 relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-brand rounded-full blur-[100px] opacity-20"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-hover rounded-full blur-[100px] opacity-10"></div>
          
          <div className="relative z-10 max-w-3xl">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="px-4 py-2 bg-white/10 text-white text-xs font-bold rounded-xl mb-8 inline-flex items-center gap-2 border border-white/10 shadow-sm backdrop-blur-md"
            >
              Our Mission
            </motion.span>
            <h2 className="font-display text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] mb-8">
              Empowering the Next Generation of <span className="text-brand">Builders</span>.
            </h2>
            <p className="text-zinc-400 text-lg lg:text-xl font-medium mb-12 leading-relaxed">
              ElSewedy GenZ Coders is Egypt's leading project-first technology academy for youth. We believe in learning by doing, transforming consumers into creators through a rigorous, engineered curriculum.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left w-full">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                <Target size={32} weight="fill" className="text-brand mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Project-First</h4>
                <p className="text-zinc-400 text-sm">Every student builds real-world applications and hardware from day one. No dry theory.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                <Lightbulb size={32} weight="fill" className="text-[#ffe6e6] mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Future-Ready</h4>
                <p className="text-zinc-400 text-sm">Mastering AI, advanced robotics, and software architecture to lead the global tech shift.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-[1400px] mx-auto mb-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-5xl font-black tracking-tight text-zinc-900 mb-6">
            Simple, transparent <span className="text-brand">pricing</span>.
          </h2>
          <p className="text-zinc-500 text-lg font-medium">
            Invest in your child's future. All tracks include live sessions, technical support, and life-time access to the GenZ community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
          {[
            {
              name: "Beginner Track",
              price: "500 EGP",
              desc: "Perfect for ages 10-13 starting their journey.",
              color: "bg-brand-hover",
              textColor: "text-zinc-900",
              btnClass: "bg-zinc-900 text-white hover:bg-black",
              features: ["8 Core Live Sessions", "4 Technical Support Weeks", "Scratch & Basic Logic", "Academy Certificate", "Parent Dashboard Access"],
            },
            {
              name: "Intermediate Track",
              price: "600 EGP",
              desc: "For ages 13-16 ready to code in text.",
              color: "bg-ink",
              textColor: "text-white",
              btnClass: "bg-brand text-brand-fg hover:bg-brand-hover",
              popular: true,
              features: ["8 Core Live Sessions", "4 Technical Support Weeks", "Intro to C++ & Python", "Build Console Apps", "Academy Certificate", "Parent Dashboard Access"],
            },
            {
              name: "Maker & Advanced",
              price: "700+ EGP",
              desc: "Hardware and advanced software engineering.",
              color: "bg-white",
              textColor: "text-zinc-900",
              btnClass: "bg-zinc-900 text-white hover:bg-black",
              features: ["8 Core Live Sessions", "4 Technical Support Weeks", "Robotics or Advanced OOP", "Physical Kits (Optional)", "Academy Certificate", "Parent Dashboard Access"],
            }
          ].map((plan, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ y: -10 }}
              className={`${plan.color} rounded-[3rem] p-10 shadow-sm border ${plan.color === 'bg-white' ? 'border-black/5' : 'border-transparent'} flex flex-col relative`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-brand text-brand-fg text-xs font-bold rounded-full shadow-md uppercase tracking-wider">
                  Most Popular
                </span>
              )}
              <h3 className={`font-display text-3xl font-black mb-2 ${plan.textColor}`}>{plan.name}</h3>
              <p className={`text-sm mb-10 ${plan.textColor === 'text-white' ? 'text-zinc-400' : 'text-zinc-500'}`}>{plan.desc}</p>
              
              <div className={`text-5xl font-black mb-10 ${plan.textColor}`}>
                {plan.price} <span className="text-lg font-bold opacity-50">/course</span>
              </div>

              <ul className="space-y-4 mb-12 flex-1">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className={`flex items-start gap-3 text-sm font-bold ${plan.textColor === 'text-white' ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    <CheckCircle size={22} weight="fill" className={plan.textColor === 'text-white' ? 'text-brand' : 'text-[#cc0000]'} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/courses" className={`w-full py-5 rounded-2xl font-black text-center transition-all active:scale-[0.98] ${plan.btnClass}`}>
                Explore Track
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="max-w-[1400px] mx-auto mb-32">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl font-black tracking-tight text-zinc-900 mb-6">Learn from the <span className="text-brand">Best</span>.</h2>
          <p className="text-zinc-500 font-medium text-xl max-w-2xl mx-auto">Our instructors aren't just teachers—they are practicing software engineers and roboticists.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: "Ahmed El-Sherif", role: "Lead Engineer", specialty: "Web & AI", seed: "ahmed" },
            { name: "Sara Mahmoud", role: "Senior Instructor", specialty: "Robotics", seed: "sara" },
            { name: "Omar Hassan", role: "Curriculum Lead", specialty: "Game Dev", seed: "omar" },
          ].map((member, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ y: -8 }}
              className="bg-white rounded-[3rem] p-10 shadow-sm border border-black/5 flex flex-col items-center text-center group transition-all"
            >
              <div className="w-40 h-40 rounded-full overflow-hidden mb-8 bg-zinc-100 border-8 border-zinc-50 shadow-inner group-hover:scale-105 transition-transform">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${member.seed}&backgroundColor=f0f0f0`} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-3xl font-display font-black text-zinc-900 mb-2">{member.name}</h3>
              <p className="text-brand font-black text-sm mb-4 uppercase tracking-widest">{member.role}</p>
              <p className="text-zinc-500 font-medium text-lg leading-relaxed">{member.specialty} expert with 10+ years of studio experience.</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="max-w-[1400px] mx-auto">
         <div className="bg-brand rounded-[4rem] p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl shadow-brand/20">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
               <h2 className="font-display text-5xl lg:text-8xl font-black text-white tracking-tight mb-8">Ready to build the future?</h2>
               <p className="text-white/80 font-medium text-xl lg:text-2xl max-w-2xl mx-auto mb-16 leading-relaxed">
                 Join Egypt's elite league of GenZ developers. Build real products. Earn XP. Lead the server.
               </p>
               <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                  <Link href="/auth" className="px-12 py-6 bg-ink text-canvas rounded-full font-black text-xl hover:bg-black transition-transform active:scale-95 shadow-2xl w-full sm:w-auto">
                    Create Your Profile
                  </Link>
                  <Link href="/schools" className="px-12 py-6 bg-transparent border-2 border-white text-white rounded-full font-black text-xl hover:bg-white/10 transition-colors w-full sm:w-auto">
                    Partnerships
                  </Link>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<string | null>("0-0");

  const faqs = [
    {
      category: "General",
      items: [
        { q: "Who can join the academy?", a: "ElSewedy GenZ Coders is designed for youth ages 10 to 18. Our courses are structured by age group and skill level." },
        { q: "Are the sessions online or offline?", a: "Our core sessions are conducted live online via our integrated Course Room platform, allowing students from anywhere to join." },
      ]
    },
    {
      category: "Enrollment",
      items: [
        { q: "How does the application work?", a: "Apply for a track, answer short questions, and once accepted by our engineers, you'll be invited to enroll." },
        { q: "Is there a sibling discount?", a: "Yes, we offer an automatic 10% discount when you enroll two or more siblings." },
      ]
    }
  ];

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <section id="faq" className="max-w-[1000px] mx-auto mb-32 scroll-mt-24">
      <div className="text-center mb-16">
        <h2 className="font-display text-5xl font-black tracking-tight text-zinc-900 mb-4">
          Any <span className="text-brand">Questions</span>?
        </h2>
        <p className="text-zinc-500 text-lg font-medium">Everything you need to know about the GenZ experience.</p>
      </div>

      <div className="space-y-8">
        {faqs.map((group, gIdx) => (
          <div key={gIdx}>
            <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-4">
              {group.category}
              <div className="flex-1 h-px bg-black/5"></div>
            </h3>
            <div className="grid gap-4">
              {group.items.map((item, iIdx) => {
                const id = `${gIdx}-${iIdx}`;
                const isOpen = openIndex === id;
                return (
                  <div key={iIdx} className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden transition-all">
                    <button 
                      onClick={() => toggle(id)}
                      className="w-full px-8 py-6 flex items-center justify-between text-left"
                    >
                      <span className="font-bold text-zinc-900 text-lg">{item.q}</span>
                      {isOpen ? <CaretUp size={24} className="text-brand" weight="bold" /> : <CaretDown size={24} className="text-zinc-400" weight="bold" />}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-8 pb-8"
                        >
                          <p className="text-zinc-600 font-medium text-lg leading-relaxed pt-4 border-t border-black/5">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
