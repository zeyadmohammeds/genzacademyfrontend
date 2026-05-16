"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { updateProfile } from "@/lib/api";
import { Camera, Medal, PencilSimple, User, EnvelopeSimple, Phone, GraduationCap, CheckCircle } from "@phosphor-icons/react";
import { useToast } from "@/lib/toast-context";

export function ProfileExperience() {
  const { user, refresh } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.displayName?.split(" ")[0] || "",
    lastName: user?.displayName?.split(" ").slice(1).join(" ") || "",
    bio: (user as any)?.bio || "",
    phoneNumber: (user as any)?.phoneNumber || ""
  });
  const { toast } = useToast();

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        bio: form.bio,
        phoneNumber: form.phoneNumber
      });
      await refresh();
      setIsEditing(false);
      toast("Profile updated successfully", "success");
    } catch (err: any) {
      toast(err.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full px-10 pt-4 pb-24 flex flex-col gap-10 bg-canvas-soft min-h-screen">
      
      {/* Cover & Avatar Header */}
      <section className="bg-white rounded-[2rem] border border-black/5 shadow-sm relative overflow-hidden flex flex-col">
        {/* Cover */}
        <div className="h-48 w-full bg-zinc-950 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand via-transparent to-transparent"></div>
          <button className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-white/20 transition-all flex items-center gap-2">
             <Camera size={16} /> Edit Cover
          </button>
        </div>
        
        {/* Profile Info */}
        <div className="px-12 pb-12 relative flex flex-col md:flex-row gap-8 items-start md:items-end -mt-16">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-zinc-200 overflow-hidden shadow-md">
               <Image 
                 src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.displayName}&backgroundColor=f0f0f0`}
                 alt="User avatar"
                 width={128}
                 height={128}
                 className="object-cover"
               />
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-zinc-900 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:bg-zinc-800 transition-colors">
               <Camera size={16} />
            </button>
          </div>
          
          <div className="flex-1 pb-2">
             <div className="flex items-center gap-3 mb-1">
               <h1 className="font-display text-3xl font-black text-zinc-900 tracking-tight">{user.displayName}</h1>
               <span className="bg-brand-hover text-zinc-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                 {user.role}
               </span>
             </div>
             <p className="text-zinc-500 font-bold text-sm tracking-tight flex items-center gap-2">
               @{user.displayName.toLowerCase().replace(/\s/g, "_")} 
               <span className="w-1 h-1 rounded-full bg-zinc-300"></span> 
               Level {user.level || 1} Apprentice
             </p>
          </div>
          
          <div className="pb-2 flex gap-3">
             <button 
               onClick={() => setIsEditing(!isEditing)}
               className="bg-white border border-black/10 text-zinc-900 text-sm font-bold px-8 py-3.5 rounded-2xl hover:bg-zinc-50 shadow-sm transition-all flex items-center gap-2 active:scale-95"
             >
               <PencilSimple size={18} weight="bold" /> {isEditing ? "Cancel" : "Edit Intelligence Profile"}
             </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        
        {/* Main Details */}
        <section className="flex flex-col gap-6">
           <div className="bg-white rounded-[3rem] p-10 border border-black/5 shadow-sm">
             <div className="flex items-center justify-between mb-10">
               <h2 className="font-display text-2xl font-black text-zinc-900">Personal Protocol</h2>
               {!isEditing && (
                 <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-widest">
                   <CheckCircle size={18} weight="fill" /> Verified Account
                 </div>
               )}
             </div>
             
{isEditing ? (
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">First Name</label>
                    <input 
                      value={form.firstName}
                      onChange={e => setForm({...form, firstName: e.target.value})}
                      className="w-full bg-canvas-soft border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand/20 transition-all" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Last Name</label>
                    <input 
                      value={form.lastName}
                      onChange={e => setForm({...form, lastName: e.target.value})}
                      className="w-full bg-canvas-soft border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand/20 transition-all" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      value={form.phoneNumber}
                      onChange={e => setForm({...form, phoneNumber: e.target.value})}
                      placeholder="+20 123 456 7890"
                      className="w-full bg-canvas-soft border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand/20 transition-all" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Email</label>
                    <input 
                      value={user?.email || ""}
                      disabled
                      className="w-full bg-zinc-100 border-none rounded-2xl px-5 py-4 text-sm font-bold text-zinc-400 cursor-not-allowed" 
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Personal Bio / Vision</label>
                    <textarea 
                      rows={4} 
                      placeholder="What drives your learning?"
                      value={form.bio}
                      onChange={e => setForm({...form, bio: e.target.value})}
                      className="w-full bg-canvas-soft border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-brand/20 transition-all resize-none"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end mt-4">
                     <button 
                       disabled={saving}
                       className="bg-zinc-900 text-white text-sm font-black px-10 py-4 rounded-2xl hover:bg-black shadow-lg transition-all active:scale-95 disabled:opacity-50"
                     >
                       {saving ? "Synchronizing..." : "Update Intelligence"}
                     </button>
                  </div>
                </form>
              ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8">
                 <div className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-[#c2f0ff] flex items-center justify-center shrink-0">
                      <User size={24} weight="fill" className="text-[#0284c7]" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Full Name</span>
                      <span className="text-lg font-black text-zinc-900">{user.displayName}</span>
                    </div>
                 </div>
                 <div className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-[#e4d3ff] flex items-center justify-center shrink-0">
                      <EnvelopeSimple size={24} weight="fill" className="text-[#7c3aed]" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Secure Email</span>
                      <span className="text-lg font-black text-zinc-900">{user.email}</span>
                    </div>
                 </div>
                 <div className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-brand-hover flex items-center justify-center shrink-0">
                      <Phone size={24} weight="fill" className="text-zinc-900" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Direct Contact</span>
                      <span className="text-lg font-black text-zinc-900">+20 123 456 7890</span>
                    </div>
                 </div>
                 <div className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center shrink-0">
                      <GraduationCap size={24} weight="fill" className="text-zinc-400" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Academy Department</span>
                      <span className="text-lg font-black text-zinc-900">Computer Science</span>
                    </div>
                 </div>
               </div>
             )}
           </div>
        </section>

        {/* Right Sidebar */}
        <aside className="flex flex-col gap-8">
          <div className="bg-ink rounded-[3rem] p-10 shadow-xl text-white relative overflow-hidden">
            <h3 className="font-display text-2xl font-black mb-8 flex items-center gap-3">
              Achievements <Medal size={24} weight="fill" className="text-brand" />
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-5 p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-brand-hover flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-12 transition-transform">
                   <Medal size={28} className="text-zinc-900" weight="fill" />
                </div>
                <div className="flex flex-col">
                   <span className="font-black text-sm">Top 10 Leaderboard</span>
                   <span className="text-xs text-zinc-500 font-bold">2 Week Streak</span>
                </div>
              </div>

              <div className="flex items-center gap-5 p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-[#e4d3ff] flex items-center justify-center shrink-0 shadow-lg group-hover:-rotate-12 transition-transform">
                   <GraduationCap size={28} className="text-[#7c3aed]" weight="fill" />
                </div>
                <div className="flex flex-col">
                   <span className="font-black text-sm">Protocol Pioneer</span>
                   <span className="text-xs text-zinc-500 font-bold">First Lab Completed</span>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-[-10%] right-[-10%] w-40 h-40 bg-[#7c3aed] rounded-full blur-[80px] opacity-20"></div>
          </div>

          <div className="bg-white rounded-[3rem] p-8 border border-black/5 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Growth Curve</span>
                <span className="text-sm font-black text-zinc-900">72% Progress</span>
             </div>
             <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-[#0284c7] rounded-full" style={{ width: '72%' }}></div>
             </div>
             <p className="text-[10px] font-bold text-zinc-400 text-center uppercase tracking-widest mt-4">Next Rank: Senior Apprentice</p>
          </div>
        </aside>
      </div>

    </div>
  );
}
