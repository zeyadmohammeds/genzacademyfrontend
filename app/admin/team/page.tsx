"use client";

import { useEffect, useState } from "react";
import { getAdminUsers, toggleUserActive, updateUserRole } from "@/lib/api";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import { UsersFour, ShieldCheck, Plus, ArrowLeft, CheckCircle, XCircle, FloppyDisk, FileCsv } from "@phosphor-icons/react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { exportToCsv } from "@/lib/csv-export";

const ROLE_OPTIONS = [
  { value: "academy_admin", label: "Admin", color: "bg-red-100 text-red-700" },
  { value: "engineer", label: "Engineer", color: "bg-blue-100 text-blue-700" },
  { value: "cta", label: "CTA", color: "bg-brand-hover text-zinc-900" },
  { value: "parent", label: "Parent", color: "bg-purple-100 text-purple-700" },
  { value: "student", label: "Student", color: "bg-zinc-100 text-zinc-600" },
];

export default function AdminTeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    getAdminUsers().then(setTeam).finally(() => setLoading(false));
  }, []);

  const handleToggleActive = async (id: string) => {
    try {
      const result = await toggleUserActive(id);
      setTeam(team.map(u => u.id === id ? { ...u, isActive: result.isActive } : u));
      toast(result.isActive ? "User activated" : "User deactivated", "success");
    } catch (e: any) {
      toast(e.message || "Failed", "error");
    }
  };

  const handleRoleUpdate = async (id: string) => {
    if (!selectedRole) return;
    try {
      await updateUserRole(id, selectedRole);
      setTeam(team.map(u => u.id === id ? { ...u, role: selectedRole } : u));
      setEditingRole(null);
      toast("Role updated", "success");
    } catch (e: any) {
      toast(e.message || "Failed", "error");
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
            <ArrowLeft size={14} weight="bold" /> Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">Team & Roles</h1>
          <p className="text-zinc-500 font-medium">Manage Academy staff, roles, and access permissions.</p>
        </div>
        <div className="flex items-center gap-3">
          {team.length > 0 && (
            <button onClick={() => exportToCsv(team.map((m: any) => ({ Name: m.displayName || m.email, Email: m.email, Role: m.role, Status: m.isActive ? "Active" : "Inactive", Joined: m.createdAt })), "team")}
              className="px-5 py-3 bg-zinc-50 border border-black/10 rounded-2xl font-bold text-sm text-zinc-700 flex items-center gap-2 hover:bg-zinc-100 transition-colors micro-hover">
              <FileCsv size={18} weight="bold" /> Export CSV
            </button>
          )}
          <button className="bg-zinc-900 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg btn-micro">
            <Plus size={18} weight="bold" /> Invite Staff
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm border border-black/5">
        {loading ? (
          <SkeletonTable rows={6} cols={6} />
        ) : team.length === 0 ? (
          <EmptyState
            icon={<UsersFour size={32} className="text-zinc-300" />}
            title="No team members found"
            description="Invite staff members to get started."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Member</th>
                  <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Email</th>
                  <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Role</th>
                  <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                  <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Joined</th>
                  <th className="text-right py-3 sm:py-4 px-2 sm:px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {team.map((member) => (
                  <tr key={member.id} className="border-b border-black/5 hover:bg-zinc-50 transition-colors">
                    <td className="py-3 sm:py-4 px-2 sm:px-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-zinc-200 flex items-center justify-center shrink-0 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${member.email}&backgroundColor=f0f0f0`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="font-bold text-zinc-900 text-sm sm:text-base">{member.displayName || member.email}</div>
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-zinc-600 font-medium truncate max-w-[120px] sm:max-w-none">{member.email}</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4">
                      {editingRole === member.id ? (
                        <div className="flex items-center gap-2">
                          <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}
                            className="px-2 py-1.5 bg-zinc-50 border border-black/10 rounded-lg text-xs font-bold focus:ring-2 focus:ring-black/10 outline-none">
                            {ROLE_OPTIONS.filter(r => r.value !== 'student').map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                          <button onClick={() => handleRoleUpdate(member.id)} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><CheckCircle size={14} weight="bold" /></button>
                          <button onClick={() => setEditingRole(null)} className="p-1.5 bg-zinc-100 text-zinc-500 rounded-lg hover:bg-zinc-200"><XCircle size={14} weight="bold" /></button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                          ROLE_OPTIONS.find(r => r.value === member.role)?.color || 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {member.role === 'academy_admin' && <ShieldCheck size={14} weight="fill" />}
                          {ROLE_OPTIONS.find(r => r.value === member.role)?.label || member.role}
                        </span>
                      )}
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4">
                      <button onClick={() => handleToggleActive(member.id)}
                        className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-colors ${
                          member.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${member.isActive ? 'bg-green-500' : 'bg-zinc-300'}`} />
                        {member.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-zinc-500 text-xs sm:text-sm">{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '-'}</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditingRole(member.id); setSelectedRole(member.role); }}
                          className="px-2 sm:px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-lg text-[10px] sm:text-xs font-bold hover:bg-zinc-200 transition-colors">
                          Edit Role
                        </button>
                      </div>
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