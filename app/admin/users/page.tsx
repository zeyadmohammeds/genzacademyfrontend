"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { UserPlus, ShieldCheck, MagnifyingGlass, Trash, Sparkle } from "@phosphor-icons/react";
import { useToast } from "@/lib/toast-context";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

type AcademyUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  totalXp: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AcademyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    apiGet<AcademyUser[]>("/api/admin/users", []).then(setUsers).finally(() => setLoading(false));
  }, []);

  const handleCreateSystemUser = async (role: string) => {
    const email = role === "academy_admin" ? "admin@elsewedy.com" : "cta@elsewedy.com";
    const name = role === "academy_admin" ? "System Administrator" : "CAT Officer";
    
    try {
      await apiPost("/api/admin/users/create", { email, name, role, password: "Password123!" });
      toast(`${role} user initialized. Credentials: ${email} / Password123!`, "success");
      const updated = await apiGet<AcademyUser[]>("/api/admin/users", []);
      setUsers(updated);
    } catch (e: any) {
      toast(e.message || "Failed to create user", "error");
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.displayName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24"><SkeletonTable rows={5} cols={4} /></div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
            <ArrowLeft size={14} weight="bold" /> Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">Identity Directory</h1>
          <p className="text-zinc-500 font-medium">Manage academy personnel, system administrators, and student terminals.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-full font-bold text-sm hover:bg-black transition-colors shadow-lg" onClick={() => handleCreateSystemUser("academy_admin")}>
            <ShieldCheck size={18} weight="bold" /> Provision Admin
          </button>
          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-black/10 text-zinc-700 px-5 py-3 rounded-full font-bold text-sm hover:bg-zinc-50 transition-colors" onClick={() => handleCreateSystemUser("cta")}>
            <UserPlus size={18} weight="bold" /> Provision CAT
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 shadow-sm border border-black/5">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlass size={18} className="text-zinc-400" />
          </div>
          <input 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-50 border border-black/10 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <EmptyState icon={<UserPlus size={32} weight="fill" />} title="No users found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px]">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Identity</th>
                  <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Authority Level</th>
                  <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">XP</th>
                  <th className="text-right py-3 sm:py-4 px-2 sm:px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-black/5 hover:bg-zinc-50 transition-colors">
                    <td className="py-3 sm:py-4 px-2 sm:px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-zinc-200 flex items-center justify-center font-bold text-sm sm:text-base text-zinc-600 shrink-0">
                          {user.displayName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900 text-sm sm:text-base">{user.displayName}</div>
                          <div className="text-xs text-zinc-500 font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        user.role === "academy_admin" ? "bg-red-100 text-red-700" : "bg-brand-hover text-zinc-900"
                      }`}>
                        {user.role === "academy_admin" && <ShieldCheck size={12} weight="fill" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-zinc-700 text-sm">
                        <Sparkle size={14} weight="fill" className="text-brand" />
                        {user.totalXp}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-right">
                      <button className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                        <Trash size={16} weight="bold" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
