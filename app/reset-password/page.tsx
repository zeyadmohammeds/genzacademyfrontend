"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LockKey, CheckCircle, Warning } from "@phosphor-icons/react";
import { apiPost } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = searchParams.get("token") || "";
    const u = searchParams.get("userId") || "";
    setToken(t);
    setUserId(u);
    if (!t || !u) {
      setError("Invalid or expired password reset link.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !userId) {
      setError("Invalid password reset link parameters.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiPost("/api/auth/reset-password", {
        userId,
        token,
        newPassword: password
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] p-10 shadow-xl border border-black/5 relative overflow-hidden">
       {!submitted ? (
         <>
            <div className="mb-8">
               <h2 className="font-display text-3xl font-black text-zinc-900 tracking-tight mb-2">Create New Password</h2>
               <p className="text-zinc-500 font-medium text-sm">Please choose a strong password with at least 8 characters.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
               {error && (
                 <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-3">
                   <Warning size={20} className="shrink-0" />
                   <span className="leading-snug">{error}</span>
                 </div>
               )}

               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <LockKey size={20} className="text-zinc-400" />
                 </div>
                 <input 
                   type="password" 
                   placeholder="New Password" 
                   required 
                   disabled={!token || !userId}
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-zinc-50 border border-black/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 shadow-sm transition-all disabled:opacity-50"
                 />
               </div>

               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <LockKey size={20} className="text-zinc-400" />
                 </div>
                 <input 
                   type="password" 
                   placeholder="Confirm New Password" 
                   required 
                   disabled={!token || !userId}
                   value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}
                   className="w-full bg-zinc-50 border border-black/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 shadow-sm transition-all disabled:opacity-50"
                 />
               </div>

               <button 
                 type="submit" 
                 disabled={loading || !token || !userId}
                 className="w-full bg-ink text-canvas font-bold text-sm py-4 rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-lg shadow-black/10 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {loading ? "Resetting password..." : "Reset Password"}
                 {!loading && <ArrowRight size={16} weight="bold" />}
               </button>
            </form>
         </>
       ) : (
         <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
               <CheckCircle size={32} weight="duotone" />
            </div>
            <h2 className="font-display text-2xl font-black text-zinc-900 tracking-tight mb-2">Password Reset Successful</h2>
            <p className="text-zinc-500 font-medium text-sm mb-8">
               Your password has been successfully updated. You can now log in with your new credentials.
            </p>
         </div>
       )}
       
       <div className="mt-8 text-center border-t border-black/5 pt-6">
          <Link href="/auth" className="text-sm font-bold text-brand hover:underline">Return to Login</Link>
       </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[100dvh] w-full bg-canvas-soft text-zinc-900 font-body relative items-center justify-center p-6">
      <Suspense fallback={
        <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] p-10 shadow-xl border border-black/5 text-center font-bold">
          Loading reset session...
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
