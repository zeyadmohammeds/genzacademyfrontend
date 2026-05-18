"use client";

import { useEffect, useState } from "react";
import { getAdminRounds, createAdminRound, updateRound, getAdminCourses } from "@/lib/api";
import type { CourseRound, AdminCourse } from "@/lib/types";
import { Plus, X, FloppyDisk, ArrowLeft, UsersThree, CalendarBlank, PencilSimple, Trash, Certificate, ArrowRight, FolderOpen } from "@phosphor-icons/react";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import { PremiumSwitch } from "@/components/PremiumControls";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";

export default function AdminRoundsPage() {
  const [rounds, setRounds] = useState<CourseRound[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CourseRound | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    courseId: "", name: "", slug: "",
    startDate: new Date().toISOString().split('T')[0],
    maxStudents: 20, isEnrollmentOpen: true,
    autoAcceptPaidApplications: false, requireEngineerApproval: true,
  });

  useEffect(() => {
    Promise.all([getAdminRounds(), getAdminCourses()])
      .then(([r, c]) => { setRounds(r); setCourses(c); })
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      courseId: courses[0]?.id || "",
      name: "", slug: "",
      startDate: new Date().toISOString().split('T')[0],
      maxStudents: 20, isEnrollmentOpen: true,
      autoAcceptPaidApplications: false, requireEngineerApproval: true,
    });
    setShowForm(true);
  };

  const openEdit = (round: CourseRound, courseId: string) => {
    setEditing(round);
    setForm({
      courseId,
      name: round.name, slug: round.slug,
      startDate: round.startDate || new Date().toISOString().split('T')[0],
      maxStudents: round.maxStudents,
      isEnrollmentOpen: round.isEnrollmentOpen,
      autoAcceptPaidApplications: round.autoAcceptPaidApplications || false,
      requireEngineerApproval: round.requireEngineerApproval || true,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) { toast("Name and slug are required", "error"); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateRound(editing.id, form);
        toast("Round updated", "success");
      } else {
        await createAdminRound(form);
        toast("Round created", "success");
      }
      setRounds(await getAdminRounds());
      setShowForm(false);
    } catch (e: any) {
      toast(e.message || "Failed to save round", "error");
    } finally { setSaving(false); }
  };

  const field = (key: keyof typeof form) => ({
    value: (form[key] ?? "") as string | number,
    onChange: (e: any) => {
      const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm(prev => ({ ...prev, [key]: val }));
    }
  });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
            <ArrowLeft size={14} weight="bold" /> Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">Cohort Orchestration</h1>
          <p className="text-zinc-500 font-medium">Manage educational cycles, enrollment capacity, and start dates.</p>
        </div>
        <button onClick={openCreate} className="w-full sm:w-auto bg-zinc-900 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg btn-micro">
          <Plus size={18} weight="bold" /> New Round
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : rounds.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={32} className="text-zinc-300" />}
          title="No cohorts yet"
          description="Create your first cohort round to start enrolling students."
          action={
            <button onClick={openCreate} className="px-5 py-2.5 bg-ink text-white rounded-full text-sm font-bold hover:bg-zinc-800 transition-colors">
              Create First Round
            </button>
          }
        />
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {rounds.map((r) => (
          <div key={r.id} className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-md border border-black/5 hover:border-black/10 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-200 via-brand to-zinc-950 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-display font-black text-zinc-900 tracking-tight leading-none mb-1 group-hover:text-brand transition-colors">{r.name}</h2>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest font-mono">{r.slug}</span>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                  r.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-brand-hover text-zinc-900 border-brand-hover/10"
                }`}>{r.status}</span>
              </div>
              <div className="space-y-3.5 mb-6">
                <div className="flex items-center gap-3 text-xs font-bold text-zinc-600">
                  <div className="w-8 h-8 rounded-xl bg-zinc-50 border border-black/5 flex items-center justify-center text-zinc-400">
                    <Certificate size={16} weight="fill" />
                  </div>
                  <span className="truncate max-w-[200px]">{r.courseTitle}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-zinc-600">
                  <div className="w-8 h-8 rounded-xl bg-zinc-50 border border-black/5 flex items-center justify-center text-zinc-400">
                    <CalendarBlank size={16} weight="fill" />
                  </div>
                  <span>{r.startDate ? new Date(r.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'}</span>
                </div>
              </div>

              {/* Progress and Capacity Visualizer */}
              <div className="bg-zinc-50 rounded-2.5xl p-5 mb-6 border border-black/5 shadow-inner">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <UsersThree size={14} weight="bold" /> Real Enrolled Students
                  </span>
                  <span className="text-xs font-black text-zinc-900 font-mono">
                    {r.currentStudents} <span className="text-zinc-400">/ {r.maxStudents}</span>
                  </span>
                </div>
                <div className="w-full h-2.5 bg-zinc-200/60 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${
                      (r.currentStudents / Math.max(r.maxStudents, 1)) >= 0.9 
                        ? 'bg-brand' 
                        : (r.currentStudents / Math.max(r.maxStudents, 1)) >= 0.5 
                        ? 'bg-zinc-900' 
                        : 'bg-zinc-400'
                    }`}
                    style={{ width: `${Math.min((r.currentStudents / Math.max(r.maxStudents, 1)) * 100, 100)}%` }} 
                  />
                </div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${r.isEnrollmentOpen ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                    {r.isEnrollmentOpen ? 'Admissions Active' : 'Admissions Paused'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-black/5 shrink-0">
              <button 
                onClick={() => openEdit(r, r.courseId)} 
                className="p-3 bg-zinc-50 border border-black/5 hover:border-black/10 hover:bg-zinc-100 text-zinc-600 rounded-2xl transition-all duration-200 active:scale-95 flex items-center justify-center"
                title="Configure Cohort Settings"
              >
                <PencilSimple size={16} weight="bold" />
              </button>
              
              <Link 
                href={`/admin/courses/${r.courseSlug || r.courseId}/rounds/${r.id}`}
                className="px-5 py-3 bg-zinc-950 text-white hover:bg-brand rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-md transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
              >
                Enter Room <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-t-[1.5rem] sm:rounded-[2.5rem] w-full sm:max-w-xl shadow-2xl border border-black/5">
            <div className="p-4 sm:p-6 border-b border-black/5 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-900">{editing ? "Edit Round" : "New Round"}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center shrink-0"><X size={18} weight="bold" /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Course</label>
                <select {...field("courseId")} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold">
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Name</label>
                  <input {...field("name")} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold" placeholder="Summer 2026" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Slug</label>
                  <input {...field("slug")} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-mono font-bold text-sm" placeholder="summer-2026" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Start Date</label>
                  <input type="date" {...field("startDate")} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Max Students</label>
                  <input type="number" {...field("maxStudents")} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold" />
                </div>
              </div>
              <div className="flex flex-col gap-4 pt-2">
                <PremiumSwitch
                  checked={!!form.isEnrollmentOpen}
                  onChange={(val) => setForm(p => ({ ...p, isEnrollmentOpen: val }))}
                  label="Enrollment Open"
                />
                <PremiumSwitch
                  checked={!!form.requireEngineerApproval}
                  onChange={(val) => setForm(p => ({ ...p, requireEngineerApproval: val }))}
                  label="Require Engineer Approval"
                />
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-black/5 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="w-full sm:w-auto px-6 py-3 bg-white border border-black/10 text-zinc-700 rounded-xl font-bold text-sm hover:bg-zinc-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="w-full sm:w-auto px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                <FloppyDisk size={18} weight="bold" /> {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}