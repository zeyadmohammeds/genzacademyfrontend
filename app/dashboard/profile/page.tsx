"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { User, EnvelopeSimple, Phone, MapPin, Camera, FloppyDisk } from "@phosphor-icons/react";
import { NotificationPreferences } from "@/components/NotificationPreferences";

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">Profile & Settings</h1>
        <p className="text-zinc-500 font-medium">Manage your personal information and account settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col - Avatar & Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-zinc-100">
                <img 
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.displayName || 'Student'}&backgroundColor=f0f0f0`} 
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-brand text-brand-fg rounded-full flex items-center justify-center hover:bg-brand-hover transition-colors border-2 border-white shadow-sm">
                <Camera size={18} weight="fill" />
              </button>
            </div>
            
            <h2 className="font-display text-2xl font-black text-zinc-900">{user?.displayName || "Academy Student"}</h2>
            <p className="text-zinc-500 font-bold text-sm mb-4 uppercase tracking-wider">{user?.role || "Student"}</p>
            
            <div className="w-full bg-zinc-50 rounded-2xl p-4 border border-black/5">
              <div className="flex items-center gap-3 text-sm font-medium text-zinc-600 mb-3">
                <EnvelopeSimple size={18} weight="duotone" className="text-zinc-400" />
                {user?.email || "student@example.com"}
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-zinc-600 mb-3">
                <Phone size={18} weight="duotone" className="text-zinc-400" />
                +20 123 456 7890
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-zinc-600">
                <MapPin size={18} weight="duotone" className="text-zinc-400" />
                Cairo, Egypt
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - Forms */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
             <h3 className="font-display text-2xl font-bold text-zinc-900 mb-8">Personal Information</h3>
             
             <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-zinc-900">Full Name</label>
                   <input type="text" defaultValue={user?.displayName || ""} className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-zinc-900">Email Address</label>
                   <input type="email" defaultValue={user?.email || ""} disabled className="w-full bg-zinc-100 border border-black/5 rounded-xl px-4 py-3 text-sm text-zinc-500 cursor-not-allowed outline-none" />
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-zinc-900">Phone Number</label>
                   <input type="tel" defaultValue="+20 123 456 7890" className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-zinc-900">Date of Birth</label>
                   <input type="date" defaultValue="2010-05-15" className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-zinc-900" />
                 </div>
               </div>

               <div className="pt-6 border-t border-black/5 mt-8 flex justify-end">
                 <button className="bg-zinc-950 hover:bg-zinc-800 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md">
                   <FloppyDisk size={18} weight="bold" /> Save Changes
                 </button>
               </div>
             </form>
          </div>

          <div className="mt-8">
            <NotificationPreferences />
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5 mt-8">
            <h3 className="font-display text-2xl font-bold text-zinc-900 mb-2">Password & Security</h3>
            <p className="text-zinc-500 text-sm font-medium mb-8">Update your password to keep your account secure.</p>
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
               <div className="space-y-2">
                 <label className="text-sm font-bold text-zinc-900">Current Password</label>
                 <input type="password" placeholder="••••••••" className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all max-w-md" />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-bold text-zinc-900">New Password</label>
                 <input type="password" placeholder="••••••••" className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all max-w-md" />
               </div>
               
               <div className="pt-4">
                 <button className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98]">
                   Update Password
                 </button>
               </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
