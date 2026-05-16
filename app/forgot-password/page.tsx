"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, EnvelopeSimple } from "@phosphor-icons/react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="flex min-h-[100dvh] w-full bg-canvas-soft text-zinc-900 font-body relative items-center justify-center p-6">
      <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] p-10 shadow-xl border border-black/5 relative overflow-hidden">
         {!submitted ? (
           <>
              <div className="mb-8">
                 <h2 className="font-display text-3xl font-black text-zinc-900 tracking-tight mb-2">Reset Password</h2>
                 <p className="text-zinc-500 font-medium text-sm">Enter your email address and we'll send you a link to reset your password.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <EnvelopeSimple size={20} className="text-zinc-400" />
                   </div>
                   <input 
                     type="email" 
                     placeholder="Email Address" 
                     required 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full bg-zinc-50 border border-black/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 shadow-sm transition-all"
                   />
                 </div>

                 <button 
                   type="submit" 
                   disabled={loading}
                   className="w-full bg-ink text-canvas font-bold text-sm py-4 rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-lg shadow-black/10 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                   {loading ? "Sending link..." : "Send Reset Link"}
                   {!loading && <ArrowRight size={16} weight="bold" />}
                 </button>
              </form>
           </>
         ) : (
           <div className="text-center animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                 <EnvelopeSimple size={32} weight="duotone" />
              </div>
              <h2 className="font-display text-2xl font-black text-zinc-900 tracking-tight mb-2">Check your email</h2>
              <p className="text-zinc-500 font-medium text-sm mb-8">
                 We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
              </p>
           </div>
         )}
         
         <div className="mt-8 text-center border-t border-black/5 pt-6">
            <Link href="/auth" className="text-sm font-bold text-brand hover:underline">Return to Login</Link>
         </div>
      </div>
    </div>
  );
}
