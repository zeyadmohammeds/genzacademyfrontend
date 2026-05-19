"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { 
  User, EnvelopeSimple, Phone, MapPin, Camera, FloppyDisk, 
  Key, Bell, Medal, CheckCircle, Shield, DeviceMobile, 
  WhatsappLogo, ArrowClockwise, Lightning, Trophy, Calendar
} from "@phosphor-icons/react";
import { useToast } from "@/lib/toast-context";
import { 
  updateProfile, changePassword, getNotificationSettings, 
  updateNotificationSettings, type NotificationSettings, 
  DEFAULT_NOTIFICATION_SETTINGS 
} from "@/lib/api";

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const { toast } = useToast();
  
  // Profile update state
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    phoneNumber: "",
    city: "Cairo, Egypt",
    department: "Computer Science & Engineering"
  });

  // Password state
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Notification state
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);

  // Sync profile data from auth context
  useEffect(() => {
    if (user) {
      const names = user.displayName ? user.displayName.split(" ") : ["", ""];
      const fName = names[0] || "";
      const lName = names.slice(1).join(" ") || "";
      setProfileForm(prev => ({
        ...prev,
        firstName: fName,
        lastName: lName,
        bio: (user as any).bio || "Gaining deep machine learning and coding skills to create advanced technologies.",
        phoneNumber: (user as any).phoneNumber || "+20 123 456 7890"
      }));
    }
  }, [user]);

  // Load notification settings on load
  useEffect(() => {
    let active = true;
    const fetchSettings = async () => {
      try {
        setNotifLoading(true);
        const data = await getNotificationSettings();
        if (active && data) {
          setNotifSettings(data);
        }
      } catch (err) {
        console.error("Failed to load notifications preferences", err);
      } finally {
        if (active) setNotifLoading(false);
      }
    };
    fetchSettings();
    return () => {
      active = false;
    };
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ArrowClockwise className="animate-spin text-brand" size={40} />
        <p className="text-zinc-500 font-bold tracking-tight">Accessing Secure Profile Protocols...</p>
      </div>
    );
  }

  // Handle personal details save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      toast("First name and Last name are required.", "error");
      return;
    }

    setProfileSaving(true);
    try {
      await updateProfile({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        bio: profileForm.bio,
        phoneNumber: profileForm.phoneNumber
      });
      await refresh();
      toast("Personal Intelligence Profile updated successfully!", "success");
    } catch (err: any) {
      toast(err.message || "Failed to update profile", "error");
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle password update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast("Please provide both current and new passwords.", "error");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast("New passwords do not match.", "error");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast("Your password has been successfully updated.", "success");
    } catch (err: any) {
      toast(err.message || "Password change rejected. Verify your current password.", "error");
    } finally {
      setPasswordSaving(false);
    }
  };

  // Handle notification setting updates
  const handleNotifToggle = async (key: keyof NotificationSettings) => {
    const updated = {
      ...notifSettings,
      [key]: !notifSettings[key]
    };
    setNotifSettings(updated);
    try {
      await updateNotificationSettings(updated);
      toast("Notification preferences updated.", "success");
    } catch (err) {
      toast("Failed to save changes.", "error");
      // Revert state
      setNotifSettings(notifSettings);
    }
  };

  // Handle WhatsApp phone number change
  const handleWhatsAppPhoneChange = async (val: string) => {
    const updated = {
      ...notifSettings,
      whatsAppNumber: val
    };
    setNotifSettings(updated);
    try {
      await updateNotificationSettings(updated);
    } catch {
      // Silent fail
    }
  };

  // Real level progress calculation
  const totalXp = user.totalXp || 0;
  const level = user.level || 1;
  const nextLevelXp = level * 1000;
  const prevLevelXp = (level - 1) * 1000;
  const levelProgress = Math.min(
    100,
    Math.max(0, ((totalXp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100)
  );

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24 bg-canvas-soft min-h-screen">
      
      {/* Premium Banner Header */}
      <section className="bg-white rounded-[2.5rem] border border-black/5 shadow-sm relative overflow-hidden flex flex-col mb-10">
        <div className="h-44 w-full bg-zinc-950 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand via-transparent to-transparent"></div>
          <button className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-white/20 transition-all flex items-center gap-2">
             <Camera size={16} /> Edit Banner
          </button>
        </div>
        
        <div className="px-10 pb-10 relative flex flex-col md:flex-row gap-6 items-start md:items-end -mt-14">
          <div className="relative group">
            <div className="w-28 h-28 rounded-[2rem] border-4 border-white bg-zinc-100 overflow-hidden shadow-md">
               <img 
                 src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.displayName}&backgroundColor=f0f0f0`}
                 alt="User avatar"
                 className="w-full h-full object-cover"
               />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-zinc-900 text-white rounded-xl flex items-center justify-center border-2 border-white shadow-sm hover:bg-zinc-800 transition-colors">
               <Camera size={14} />
            </button>
          </div>
          
          <div className="flex-1 pb-1">
             <div className="flex items-center gap-3 mb-1.5 flex-wrap">
               <h1 className="font-display text-3xl font-black text-zinc-900 tracking-tight">{user.displayName}</h1>
               <span className="bg-[#ffe6e6] text-[#ff1a1a] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-[#ff1a1a]/10">
                 {user.role}
               </span>
             </div>
             <p className="text-zinc-500 font-bold text-sm tracking-tight flex items-center gap-2 flex-wrap">
               @{user.displayName.toLowerCase().replace(/\s/g, "_")} 
               <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span> 
               Level {user.level || 1} Apprentice
             </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Forms column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Personal Information */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
             <div className="flex items-center justify-between mb-8">
               <h3 className="font-display text-2xl font-black text-zinc-900 flex items-center gap-2">
                 <User size={24} className="text-zinc-900" /> Personal Identity Protocol
               </h3>
               <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-widest">
                 <CheckCircle size={18} weight="fill" /> Active
               </div>
             </div>
             
             <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-900 uppercase tracking-wider block">First Name</label>
                    <input 
                      type="text" 
                      value={profileForm.firstName} 
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-900 uppercase tracking-wider block">Last Name</label>
                    <input 
                      type="text" 
                      value={profileForm.lastName} 
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-900 uppercase tracking-wider block">Secure Email</label>
                    <input 
                      type="email" 
                      value={user.email} 
                      disabled 
                      className="w-full bg-zinc-100/60 border border-zinc-100 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-400 cursor-not-allowed outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-900 uppercase tracking-wider block">Phone Number</label>
                    <input 
                      type="tel" 
                      value={profileForm.phoneNumber} 
                      onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-900 uppercase tracking-wider block">Location Department</label>
                    <input 
                      type="text" 
                      value={profileForm.city} 
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-900 uppercase tracking-wider block">Department Track</label>
                    <input 
                      type="text" 
                      value={profileForm.department} 
                      disabled 
                      className="w-full bg-zinc-100/60 border border-zinc-100 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-400 cursor-not-allowed outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-900 uppercase tracking-wider block">Goals & Personal Bio</label>
                  <textarea 
                    rows={4} 
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all resize-none"
                    placeholder="Describe your learning mission..."
                  />
                </div>

                <div className="pt-4 border-t border-black/5 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={profileSaving}
                    className="bg-zinc-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.97] flex items-center justify-center gap-2 shadow-md disabled:opacity-50 !text-white"
                    style={{ color: '#ffffff' }}
                  >
                    <FloppyDisk size={18} weight="bold" /> {profileSaving ? "Synchronizing..." : "Save Identity Changes"}
                  </button>
                </div>
             </form>
          </div>

          {/* Direct Notification Settings */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
             <h3 className="font-display text-2xl font-black text-zinc-900 mb-2 flex items-center gap-2">
               <Bell size={24} className="text-zinc-900" /> Notifications & Comms Preferences
             </h3>
             <p className="text-zinc-500 text-sm font-medium mb-8">Control which communication protocols we use to notify you about course events, assignments, and approvals.</p>

             {notifLoading ? (
               <div className="flex justify-center py-6">
                 <ArrowClockwise className="animate-spin text-zinc-400" size={24} />
               </div>
             ) : (
               <div className="space-y-6">
                 
                 {/* Email Toggle */}
                 <div className="flex items-center justify-between p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
                   <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                       <EnvelopeSimple size={20} className="text-blue-500" weight="fill" />
                     </div>
                     <div>
                       <span className="block font-black text-sm text-zinc-900">Secure Email Updates</span>
                       <span className="block text-xs text-zinc-400 font-bold">Important announcements directly to your secure inbox.</span>
                     </div>
                   </div>
                   <button 
                     type="button"
                     onClick={() => handleNotifToggle("emailEnabled")}
                     className={`w-14 h-8 rounded-full transition-all duration-300 relative ${notifSettings.emailEnabled ? 'bg-zinc-900' : 'bg-zinc-200'}`}
                   >
                     <div className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all duration-300 ${notifSettings.emailEnabled ? 'left-7' : 'left-1'}`} />
                   </button>
                 </div>

                 {/* WhatsApp Toggle & Setup */}
                 <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-4">
                   <div className="flex items-center justify-between">
                     <div className="flex items-start gap-4">
                       <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                         <WhatsappLogo size={20} className="text-green-500" weight="fill" />
                       </div>
                       <div>
                         <span className="block font-black text-sm text-zinc-900">WhatsApp Notification Stream</span>
                         <span className="block text-xs text-zinc-400 font-bold">Receive dynamic class schedules and direct alerts on your phone.</span>
                       </div>
                     </div>
                     <button 
                       type="button"
                       onClick={() => handleNotifToggle("whatsAppEnabled")}
                       className={`w-14 h-8 rounded-full transition-all duration-300 relative ${notifSettings.whatsAppEnabled ? 'bg-zinc-900' : 'bg-zinc-200'}`}
                     >
                       <div className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all duration-300 ${notifSettings.whatsAppEnabled ? 'left-7' : 'left-1'}`} />
                     </button>
                   </div>
                   
                   {notifSettings.whatsAppEnabled && (
                     <div className="pt-3 border-t border-zinc-200/60 flex items-center gap-4">
                       <div className="flex-1">
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">WhatsApp Verification Number</label>
                         <input 
                           type="tel"
                           placeholder="+20 123 456 7890"
                           defaultValue={notifSettings.whatsAppNumber || ""}
                           onBlur={(e) => handleWhatsAppPhoneChange(e.target.value)}
                           className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-900 focus:ring-1 focus:ring-brand outline-none transition-all"
                         />
                       </div>
                     </div>
                   )}
                 </div>

                 {/* SMS Toggle */}
                 <div className="flex items-center justify-between p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
                   <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                       <DeviceMobile size={20} className="text-purple-500" weight="fill" />
                     </div>
                     <div>
                       <span className="block font-black text-sm text-zinc-900">Emergency SMS Alerts</span>
                       <span className="block text-xs text-zinc-400 font-bold">Failsafe critical text updates for urgent schedules.</span>
                     </div>
                   </div>
                   <button 
                     type="button"
                     onClick={() => handleNotifToggle("smsEnabled")}
                     className={`w-14 h-8 rounded-full transition-all duration-300 relative ${notifSettings.smsEnabled ? 'bg-zinc-900' : 'bg-zinc-200'}`}
                   >
                     <div className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all duration-300 ${notifSettings.smsEnabled ? 'left-7' : 'left-1'}`} />
                   </button>
                 </div>

               </div>
             )}
          </div>

          {/* Password & Security */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
            <h3 className="font-display text-2xl font-black text-zinc-900 mb-2 flex items-center gap-2">
              <Shield size={24} className="text-zinc-900" /> Vault Security Protocols
            </h3>
            <p className="text-zinc-500 text-sm font-medium mb-8">Change your access password regularly to keep your academy resources safe.</p>
            
            <form onSubmit={handleUpdatePassword} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-black text-zinc-900 uppercase tracking-wider block">Current Password</label>
                   <input 
                     type="password" 
                     placeholder="••••••••" 
                     value={passwordForm.currentPassword}
                     onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                     className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all" 
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-black text-zinc-900 uppercase tracking-wider block">New Password</label>
                   <input 
                     type="password" 
                     placeholder="••••••••" 
                     value={passwordForm.newPassword}
                     onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                     className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all" 
                   />
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-black text-zinc-900 uppercase tracking-wider block">Confirm New Password</label>
                   <input 
                     type="password" 
                     placeholder="••••••••" 
                     value={passwordForm.confirmPassword}
                     onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                     className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all" 
                   />
                 </div>
               </div>
               
               <div className="pt-4 border-t border-black/5 flex justify-end">
                 <button 
                   type="submit"
                   disabled={passwordSaving}
                   className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-8 py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.97] disabled:opacity-60"
                 >
                   {passwordSaving ? "Updating Vault..." : "Update Vault Password"}
                 </button>
               </div>
            </form>
          </div>
        </div>

        {/* Sidebar right details */}
        <div className="space-y-8">
          
          {/* Circular Level Progress Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-sm text-center flex flex-col items-center">
             <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Learning Department Standing</span>
             
             {/* Progress meter */}
             <div className="relative w-40 h-40 flex items-center justify-center mb-6">
               <svg className="w-full h-full transform -rotate-90">
                 <circle 
                   cx="80" 
                   cy="80" 
                   r="70" 
                   className="stroke-zinc-100" 
                   strokeWidth="10" 
                   fill="none" 
                 />
                 <circle 
                   cx="80" 
                   cy="80" 
                   r="70" 
                   className="stroke-brand transition-all duration-1000 ease-out" 
                   strokeWidth="10" 
                   fill="none" 
                   strokeDasharray={439.8}
                   strokeDashoffset={439.8 - (439.8 * levelProgress) / 100}
                   strokeLinecap="round"
                 />
               </svg>
               
               <div className="absolute flex flex-col items-center justify-center text-center">
                 <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Level</span>
                 <span className="font-display text-4xl font-black text-zinc-900 leading-none">{level}</span>
                 <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">Apprentice</span>
               </div>
             </div>

             <div className="w-full space-y-2">
               <div className="flex justify-between items-center text-xs font-black">
                 <span className="text-zinc-400">{user.totalXp} XP</span>
                 <span className="text-brand">{nextLevelXp} XP</span>
               </div>
               <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                 <div className="h-full bg-brand rounded-full transition-all duration-1000" style={{ width: `${levelProgress}%` }}></div>
               </div>
               <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-wider mt-2">
                 Earn {(nextLevelXp - totalXp)} XP more to level up!
               </span>
             </div>
          </div>

          {/* Gamified details */}
          <div className="bg-zinc-900 rounded-[2.5rem] p-8 shadow-xl text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand/10 to-transparent pointer-events-none"></div>
            <h3 className="font-display text-2xl font-black mb-6 flex items-center gap-3">
              Academy Badges <Medal size={24} weight="fill" className="text-brand" />
            </h3>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                   <Lightning size={24} className="text-brand" weight="fill" />
                </div>
                <div>
                   <span className="block font-black text-sm">Protocol Pioneer</span>
                   <span className="block text-[10px] text-zinc-400 font-bold">Completed account initialization workflow.</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                   <Trophy size={24} className="text-purple-400" weight="fill" />
                </div>
                <div>
                   <span className="block font-black text-sm">Top Leaderboard</span>
                   <span className="block text-[10px] text-zinc-400 font-bold">Maintained active standing in cohort.</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                   <Calendar size={24} className="text-blue-400" weight="fill" />
                </div>
                <div>
                   <span className="block font-black text-sm">Streaker Node</span>
                   <span className="block text-[10px] text-zinc-400 font-bold">Logged in 3 consecutive days.</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
