"use client";

import { useState, useEffect, type FormEvent } from "react";
import Image from "next/image";
import { ArrowRight, LockKey, EnvelopeSimple, User } from "@phosphor-icons/react";
import { apiPost, API_BASE } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Script from "next/script";

export function AuthExperience() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refresh } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const formData = Object.fromEntries(form.entries());
    
    const payload = {
      email: String(formData.email).trim(),
      password: String(formData.password),
      rememberMe: false
    };
    
    try {
      if (tab === "login") {
        await apiPost("/api/auth/login", payload);
      } else {
        await apiPost("/api/auth/register", {
          email: payload.email,
          password: payload.password,
          firstName: String(formData.firstName || "New"),
          lastName: String(formData.lastName || "User"),
          phoneNumber: null,
          referralCode: null
        });
      }
      
      const u = await refresh();
      if (u) {
        const role = u.role?.toLowerCase() || "";
        const isStaff = ["academy_admin", "admin", "engineer", "cta"].includes(role);
        if (isStaff || u.profileCompleted) {
          router.push(isStaff ? "/admin" : "/dashboard");
        } else {
          router.push("/onboarding");
        }
      }
    } catch (err: any) {
      let msg = err.message || "Login failed";
      if (msg.includes("Invalid email or password")) {
        msg = "Invalid email or password. Please try again.";
      } else if (msg.includes("locked")) {
        msg = "Too many login attempts. Please try again later.";
      } else if (msg.includes("fetch")) {
        msg = "Cannot connect to server. Please make sure the backend is running.";
      } else if (msg.includes("email")) {
        msg = "Please check your email and try again.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);

  // Client-side Google Token Handler
  const handleGoogleCredentialResponse = async (response: any) => {
    setIsRedirecting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/google-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Google token authentication failed");
      }

      const data = await res.json();
      if (data.success) {
        const u = await refresh();
        if (u) {
          const role = u.role?.toLowerCase() || "";
          const isStaff = ["academy_admin", "admin", "engineer", "cta"].includes(role);
          if (isStaff || u.profileCompleted) {
            router.push(isStaff ? "/admin" : "/dashboard");
          } else {
            router.push("/onboarding");
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
      setIsRedirecting(false);
    }
  };

  // Setup Google Identity Services Client
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initializeGoogle = () => {
      const google = (window as any).google;
      if (google) {
        try {
          google.accounts.id.initialize({
            client_id: "657065188070-80edljn8ugu9uinsbp1sd6e93a55f5bg.apps.googleusercontent.com",
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Trigger One Tap if possible for high-end luxury feel
          google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed()) {
              console.log("Google One Tap: not displayed", notification.getNotDisplayedReason());
            }
          });

          setGoogleInitialized(true);
        } catch (err) {
          console.error("Failed to initialize Google Identity Services:", err);
        }
      }
    };

    if ((window as any).google) {
      initializeGoogle();
    } else {
      const handleGsiLoaded = () => initializeGoogle();
      window.addEventListener("google-gsi-loaded", handleGsiLoaded);
      return () => window.removeEventListener("google-gsi-loaded", handleGsiLoaded);
    }
  }, []);

  const handleGoogleLogin = () => {
    setIsRedirecting(true);
    setError(null);

    const google = (window as any).google;
    if (google && googleInitialized) {
      // Programmatically trigger One Tap credential check
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If prompt fails or is skipped, fallback instantly to backend challenge redirection
          const returnUrl = window.location.origin;
          window.location.href = `${API_BASE}/api/auth/google?returnUrl=${encodeURIComponent(returnUrl)}`;
        }
      });
      
      // Auto-fallback check timer in case prompt gets completely ignored
      setTimeout(() => {
        if (isRedirecting) {
          const returnUrl = window.location.origin;
          window.location.href = `${API_BASE}/api/auth/google?returnUrl=${encodeURIComponent(returnUrl)}`;
        }
      }, 5000);
    } else {
      // Instant redirect to backend auth flow
      const returnUrl = window.location.origin;
      window.location.href = `${API_BASE}/api/auth/google?returnUrl=${encodeURIComponent(returnUrl)}`;
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full bg-canvas-soft text-zinc-900 font-body relative">
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive" 
        onLoad={() => {
          window.dispatchEvent(new Event("google-gsi-loaded"));
        }}
      />
      
      {/* Redirecting Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center animate-in fade-in duration-500">
           <div className="w-24 h-24 relative mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-white/5 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-t-4 border-brand animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <img src="/logoss.png" alt="Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
              </div>
           </div>
           <h2 className="text-white font-display text-2xl font-bold tracking-tight mb-2">Initiating Protocol</h2>
           <p className="text-zinc-500 text-sm font-medium">Connecting to Google Intelligence Hub...</p>
        </div>
      )}
      
      {/* Visual Side */}
      <div className="hidden lg:flex w-1/2 p-4">
        <div className="w-full h-full bg-zinc-950 rounded-[2.5rem] p-16 flex flex-col justify-between relative overflow-hidden shadow-2xl">
           <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-brand via-transparent to-transparent pointer-events-none"></div>
           
           <div className="relative z-10">
             <div className="w-16 h-16 rounded-[14px] bg-white/5 flex items-center justify-center mb-16 border border-white/10 shadow-[0_4px_24px_rgba(255,26,26,0.2)] hover:scale-105 transition-transform cursor-pointer">
               <img src="/logoss.png" alt="GZ" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
             </div>
             
             <h1 className="font-display text-6xl font-black text-white leading-[0.9] tracking-tight mb-8">
               Enter the <br/>Academy.
             </h1>
             <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
               A high-end technical training ecosystem. Sign in to access your course rooms, submit tasks, and check your standing on the leaderboard.
             </p>
           </div>
           
           <div className="relative z-10 flex items-center gap-4 border-t border-white/10 pt-8">
              <div className="flex -space-x-3">
                 <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin&backgroundColor=d2b8fb" className="w-10 h-10 rounded-full border-2 border-zinc-950" alt="student" />
                 <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Teacher&backgroundColor=ffe885" className="w-10 h-10 rounded-full border-2 border-zinc-950" alt="teacher" />
                 <img src="https://api.dicebear.com/7.x/notionists/svg?seed=User&backgroundColor=b8e8fb" className="w-10 h-10 rounded-full border-2 border-zinc-950" alt="admin" />
              </div>
              <span className="text-sm font-semibold text-zinc-500">Over 1,200+ active students</span>
           </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative">
         <div className="w-full max-w-[420px]">
            <div className="mb-12">
               <h2 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-3">Welcome back</h2>
               <p className="text-zinc-500 font-medium">Please enter your details to sign in.</p>
            </div>

            <div className="flex bg-zinc-200/50 p-1.5 rounded-2xl mb-8">
               <button 
                 onClick={() => setTab("login")}
                 className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${tab === "login" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
               >
                 Sign In
               </button>
               <button 
                 onClick={() => setTab("register")}
                 className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${tab === "register" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
               >
                 Register
               </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
               {error && (
                 <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-3">
                   {error}
                 </div>
               )}

               {tab === "register" && (
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <User size={20} className="text-zinc-400" />
                   </div>
                   <input 
                     name="displayName" 
                     placeholder="Full Name" 
                     required 
                     className="w-full bg-white border border-black/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 shadow-sm transition-all"
                   />
                 </div>
               )}

               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <EnvelopeSimple size={20} className="text-zinc-400" />
                 </div>
                 <input 
                   name="email" 
                   type="text" 
                   placeholder="Email Address" 
                   required 
                   className="w-full bg-white border border-black/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 shadow-sm transition-all"
                 />
               </div>

               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <LockKey size={20} className="text-zinc-400" />
                 </div>
                 <input 
                   name="password" 
                   type="password" 
                   placeholder="Password" 
                   required 
                   className="w-full bg-white border border-black/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 shadow-sm transition-all"
                 />
               </div>

               {tab === "login" && (
                 <div className="flex justify-end -mt-2">
                    <button type="button" className="text-xs font-bold text-brand hover:underline">Forgot password?</button>
                 </div>
               )}

               <button 
                 type="submit" 
                 disabled={loading}
                 className="w-full bg-ink text-canvas font-bold text-sm py-4 rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-lg shadow-black/10 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {loading ? "Processing..." : (tab === "login" ? "Sign In to Academy" : "Create Account")}
                 {!loading && <ArrowRight size={16} weight="bold" />}
               </button>

               <div className="flex items-center gap-4 my-2">
                   <div className="h-px bg-black/5 flex-1"></div>
                   <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">or continue with</span>
                   <div className="h-px bg-black/5 flex-1"></div>
                </div>

                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading || isRedirecting}
                  className="w-full bg-white border border-black/10 text-zinc-900 font-bold text-sm py-4 rounded-2xl hover:bg-zinc-50 hover:border-black/20 transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google Intelligence Protocol
                </button>
            </form>
         </div>
      </div>

    </div>
  );
}
