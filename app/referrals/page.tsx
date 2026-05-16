"use client";

import { useEffect, useState } from "react";
import { getReferralSummary } from "@/lib/api";
import type { ReferralSummary } from "@/lib/types";
import { 
  Users, Gift, ShareNetwork, Trophy, 
  CheckCircle, Copy, ArrowRight, Wallet,
  ChartLineUp, Star
} from "@phosphor-icons/react";
import { useToast } from "@/lib/toast-context";
import { useAuth } from "@/lib/auth-context";

export default function ReferralsPage() {
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    getReferralSummary().then(setSummary).finally(() => setLoading(false));
  }, []);

  const copyCode = () => {
    if (summary?.referralCode) {
      navigator.clipboard.writeText(summary.referralCode);
      toast("Referral code copied to clipboard", "success");
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="w-full px-8 py-10 lg:px-24 bg-canvas-soft min-h-screen">
      
      {/* Hero Section */}
      <section className="mb-12 relative overflow-hidden bg-zinc-950 rounded-[3.5rem] p-12 lg:p-20 text-white shadow-2xl">
         <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand via-transparent to-transparent"></div>
         
         <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-brand text-xs font-black uppercase tracking-widest mb-8">
               <Star weight="fill" /> Ambassador Program
            </span>
            <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tight leading-[0.9] mb-8">
              Multiply the <br/>Intelligence.
            </h1>
            <p className="text-zinc-400 text-lg font-medium mb-12 leading-relaxed">
              Invite your circle to join the GenZ Academy. Earn XP rewards for every registration and fixed EGP credits for every successful enrollment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
               <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Your Protocol Code</span>
                    <span className="text-2xl font-display font-black tracking-widest">{summary?.referralCode || "INITIALIZING..."}</span>
                  </div>
                  <button 
                    onClick={copyCode}
                    className="w-12 h-12 rounded-xl bg-white text-zinc-900 flex items-center justify-center hover:bg-brand hover:text-brand-fg transition-all active:scale-95"
                  >
                    <Copy size={22} weight="bold" />
                  </button>
               </div>
               <button className="px-10 py-6 bg-brand text-brand-fg rounded-2xl font-black text-lg hover:bg-brand-hover transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-3">
                  Share Network <ShareNetwork size={24} weight="bold" />
               </button>
            </div>
         </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] flex items-center justify-center mb-6 text-[#1d4ed8]">
               <Users size={24} weight="fill" />
            </div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Network Size</span>
            <span className="text-4xl font-display font-black text-zinc-900">{summary?.totalReferrals || 0}</span>
            <p className="text-xs text-zinc-500 font-bold mt-2">Friends registered</p>
         </div>

         <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] flex items-center justify-center mb-6 text-[#059669]">
               <CheckCircle size={24} weight="fill" />
            </div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Conversions</span>
            <span className="text-4xl font-display font-black text-zinc-900">{summary?.paidConversions || 0}</span>
            <p className="text-xs text-zinc-500 font-bold mt-2">Paid enrollments</p>
         </div>

         <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-brand-pale flex items-center justify-center mb-6 text-[#c2410c]">
               <Trophy size={24} weight="fill" />
            </div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">XP Harvested</span>
            <span className="text-4xl font-display font-black text-zinc-900">{summary?.xpEarned || 0}</span>
            <p className="text-xs text-zinc-500 font-bold mt-2">Gamification bonus</p>
         </div>

         <div className="bg-ink p-8 rounded-[2.5rem] shadow-xl text-white">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-brand">
               <Wallet size={24} weight="fill" />
            </div>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Wallet Balance</span>
            <div className="flex items-baseline gap-2">
               <span className="text-4xl font-display font-black text-white">{summary?.discountCreditsEgp || 0}</span>
               <span className="text-sm font-black text-zinc-500">EGP</span>
            </div>
            <p className="text-xs text-zinc-500 font-bold mt-2">Credit for next course</p>
         </div>
      </div>

      {/* Logic / Steps */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         <div className="bg-white rounded-[3rem] p-12 border border-black/5 shadow-sm">
            <h2 className="text-3xl font-display font-black text-zinc-900 mb-10">How it works</h2>
            
            <div className="space-y-10">
               <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-black shrink-0">1</div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 mb-1">Distribute Protocol</h3>
                    <p className="text-zinc-500 text-sm font-medium">Share your unique referral code with friends interested in high-end tech training.</p>
                  </div>
               </div>
               <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-black shrink-0">2</div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 mb-1">Earn Intelligence XP</h3>
                    <p className="text-zinc-500 text-sm font-medium">Get 100 XP immediately when they register. Increase your rank on the global leaderboard.</p>
                  </div>
               </div>
               <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-black shrink-0">3</div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 mb-1">Unlock Wallet Credit</h3>
                    <p className="text-zinc-500 text-sm font-medium">When they enroll in a paid round, you get 100 EGP credit and another 300 XP.</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-white rounded-[3rem] p-12 border border-black/5 shadow-sm flex flex-col justify-between">
            <div>
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                     <ChartLineUp size={20} weight="bold" />
                  </div>
                  <h2 className="text-2xl font-display font-black text-zinc-900">Program Benefits</h2>
               </div>
               
               <div className="space-y-4">
                  {[
                    "Unlimited referral capacity",
                    "Stackable course credits",
                    "Special 'Ambassador' profile badge",
                    "Exclusive invites to tech mixers",
                    "Early access to new track launches"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 border border-black/5">
                       <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                          <ArrowRight size={12} weight="bold" className="text-white" />
                       </div>
                       <span className="text-sm font-bold text-zinc-700">{benefit}</span>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="mt-12 p-8 bg-ink rounded-3xl text-center">
               <p className="text-zinc-400 text-sm font-medium mb-4">Ready to expand the mission?</p>
               <button className="text-brand font-black text-sm uppercase tracking-widest hover:underline">View Leaderboard</button>
            </div>
         </div>
      </section>

    </div>
  );
}
