"use client";

import { useState } from "react";
import { Gift, Copy, CheckCircle, Wallet, UsersThree } from "@phosphor-icons/react";

export default function StudentReferralPage() {
  const [copied, setCopied] = useState(false);
  const referralCode = "GZ-AHMED26";

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://elsewedyacademy.com/register?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">Refer a Friend</h1>
        <p className="text-zinc-500 font-medium">Invite your friends to ElSewedy GenZ Coders and earn rewards!</p>
      </div>

      {/* Hero Banner */}
      <div className="bg-ink rounded-[3rem] p-8 md:p-12 mb-10 relative overflow-hidden shadow-xl">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-brand rounded-full blur-[100px] opacity-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <span className="px-4 py-2 bg-white/10 text-brand text-xs font-bold rounded-xl mb-6 inline-flex items-center gap-2 border border-white/10">
              <Gift size={16} weight="fill" /> Reward Program
            </span>
            <h2 className="font-display text-4xl font-black text-white mb-4">Give 10%, Get 200 EGP</h2>
            <p className="text-zinc-400 font-medium text-lg mb-8 max-w-md">
              Share your link. When a friend signs up and enrolls, they get 10% off their first course, and you earn 200 EGP in academy credit.
            </p>
            
            <div className="bg-white/10 p-2 rounded-2xl border border-white/10 flex items-center backdrop-blur-sm max-w-md">
              <div className="flex-1 px-4 font-mono font-bold text-white truncate text-sm">
                https://elsewedy.com/join?ref={referralCode}
              </div>
              <button 
                onClick={handleCopy}
                className="bg-brand text-zinc-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-white transition-colors flex items-center gap-2 shadow-sm"
              >
                {copied ? <><CheckCircle size={18} weight="bold" /> Copied</> : <><Copy size={18} weight="bold" /> Copy Link</>}
              </button>
            </div>
          </div>
          
          <div className="hidden md:flex w-48 h-48 bg-white/5 rounded-full items-center justify-center border-4 border-white/10 shrink-0">
             <Gift size={80} className="text-brand" weight="duotone" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-2xl font-bold text-zinc-900">Your Stats</h3>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
               <Wallet size={24} weight="fill" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="bg-zinc-50 rounded-2xl p-4 border border-black/5">
               <div className="text-zinc-500 text-xs font-bold uppercase mb-1">Total Earned</div>
               <div className="text-2xl font-black text-zinc-900">400 EGP</div>
             </div>
             <div className="bg-zinc-50 rounded-2xl p-4 border border-black/5">
               <div className="text-zinc-500 text-xs font-bold uppercase mb-1">Friends Joined</div>
               <div className="text-2xl font-black text-zinc-900">2</div>
             </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800 font-medium flex items-start gap-3">
            <CheckCircle size={20} className="text-blue-600 shrink-0 mt-0.5" weight="fill" />
            Your credit is automatically applied to your next course enrollment.
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
           <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-2xl font-bold text-zinc-900">Recent Referrals</h3>
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
               <UsersThree size={24} weight="fill" />
            </div>
          </div>

          <div className="space-y-4">
             {[
               { name: "Omar Yasser", status: "Enrolled", date: "May 20, 2026", reward: "+200 EGP" },
               { name: "Lina Tarek", status: "Signed Up", date: "June 02, 2026", reward: "Pending" },
             ].map((ref, idx) => (
               <div key={idx} className="flex justify-between items-center p-4 rounded-2xl border border-black/5 bg-zinc-50">
                 <div>
                   <h4 className="font-bold text-zinc-900">{ref.name}</h4>
                   <p className="text-xs text-zinc-500 font-medium mt-1">{ref.status} • {ref.date}</p>
                 </div>
                 <div className={`font-bold text-sm ${ref.reward === 'Pending' ? 'text-zinc-400' : 'text-green-600'}`}>
                   {ref.reward}
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
