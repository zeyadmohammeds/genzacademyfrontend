"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getAdminCourses, getAdminRounds, createAdminRound, updateRound, deleteAdminRound as deleteRoundApi
} from "@/lib/api";
import type { AdminCourse, CourseRound } from "@/lib/types";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import {
  Plus, ArrowLeft, PencilSimple, Trash, UsersThree,
  CalendarBlank, ArrowRight, X, FloppyDisk, CheckCircle, Door,
} from "@phosphor-icons/react";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<AdminCourse | null>(null);
  const [rounds, setRounds] = useState<CourseRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CourseRound | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "", slug: "",
    startDate: new Date().toISOString().split('T')[0],
    maxStudents: 20, isEnrollmentOpen: true,
    autoAcceptPaidApplications: false, requireEngineerApproval: true,
  });

  useEffect(() => {
    Promise.all([
      getAdminCourses().then(cs => cs.find(c => c.id === courseId)),
      getAdminRounds(courseId),
    ]).then(([foundCourse, foundRounds]) => {
      setCourse(foundCourse ?? null);
      setRounds(foundRounds);
    }).finally(() => setLoading(false));
  }, [courseId]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "", slug: "",
      startDate: new Date().toISOString().split('T')[0],
      maxStudents: 20, isEnrollmentOpen: true,
      autoAcceptPaidApplications: false, requireEngineerApproval: true,
    });
    setShowForm(true);
  };

  const openEdit = (round: CourseRound) => {
    setEditing(round);
    setForm({
      name: round.name,
      slug: round.slug,
      startDate: round.startDate || new Date().toISOString().split('T')[0],
      maxStudents: round.maxStudents,
      isEnrollmentOpen: round.isEnrollmentOpen,
      autoAcceptPaidApplications: round.autoAcceptPaidApplications || false,
      requireEngineerApproval: round.requireEngineerApproval || true,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) {
      toast("Name and slug are required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateRound(editing.id, { ...form, courseId });
        toast("Round updated", "success");
      } else {
        await createAdminRound({ ...form, courseId });
        toast("Round created", "success");
      }
      setRounds(await getAdminRounds(courseId));
      setShowForm(false);
    } catch (e: any) {
      toast(e.message || "Failed to save round", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this round? This cannot be undone if there are enrollments.")) return;
    try {
      await deleteRoundApi(id);
      setRounds(rounds.filter(r => r.id !== id));
      toast("Round deleted", "success");
    } catch (e: any) {
      toast(e.message || "Failed to delete round", "error");
    }
  };

  const field = (key: keyof typeof form) => ({
    value: (form[key] ?? "") as string | number,
    onChange: (e: any) => {
      const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm(prev => ({ ...prev, [key]: val }));
    }
  });

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!course) return <div className="p-12 text-center text-zinc-500 font-medium">Course not found.</div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin/courses" className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
            <ArrowLeft size={14} weight="bold" /> Back to Courses
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">{course.title}</h1>
          <p className="text-zinc-500 font-medium">{course.subtitle || course.slug} &middot; {course.level} &middot; Phase {course.phase}</p>
        </div>
        <button onClick={openCreate} className="w-full sm:w-auto bg-zinc-900 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg">
          <Plus size={18} weight="bold" /> New Round
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {rounds.map((r) => (
          <div key={r.id} className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-black/5 hover:border-black/10 transition-all flex flex-col justify-between group relative">
            <div>
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="text-xl font-display font-bold text-zinc-900">{r.name}</h2>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{r.slug}</span>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  r.status === "Active" ? "bg-blue-100 text-blue-700" :
                  r.status === "Upcoming" ? "bg-brand-hover text-zinc-800" :
                  "bg-zinc-100 text-zinc-500"
                }`}>{r.status}</span>
              </div>
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2.5 text-sm font-bold text-zinc-600">
                  <CalendarBlank size={18} weight="fill" className="text-zinc-300" />
                  {r.startDate ? new Date(r.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'}
                </div>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-4 mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <UsersThree size={14} weight="bold" /> Capacity
                  </span>
                  <span className="text-sm font-bold text-zinc-900">{r.currentStudents} / {r.maxStudents}</span>
                </div>
                <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                  <div className={`h-full transition-all ${r.currentStudents / Math.max(r.maxStudents, 1) > 0.8 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min((r.currentStudents / Math.max(r.maxStudents, 1)) * 100, 100)}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${r.isEnrollmentOpen ? 'bg-green-500' : 'bg-zinc-300'}`} />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{r.isEnrollmentOpen ? 'Open' : 'Closed'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-black/5">
              <div className="flex gap-2">
                <button onClick={() => openEdit(r)} className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl transition-colors">
                  <PencilSimple size={16} weight="bold" />
                </button>
                <button onClick={() => handleDelete(r.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors">
                  <Trash size={16} weight="bold" />
                </button>
              </div>
              <Link
                href={`/admin/courses/${courseId}/rounds/${r.id}`}
                className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-colors flex items-center gap-2 shadow-lg"
              >
                Enter Room <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>
        ))}
        {rounds.length === 0 && (
          <div className="col-span-full text-center py-16">
            <Door size={48} weight="fill" className="text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium mb-2">No rounds yet for this course.</p>
            <button onClick={openCreate} className="text-brand text-sm font-bold hover:underline">Create the first round</button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-t-[1.5rem] sm:rounded-[2.5rem] w-full sm:max-w-xl shadow-2xl border border-black/5">
            <div className="p-4 sm:p-6 border-b border-black/5 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-900">{editing ? "Edit Round" : "New Round"}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center shrink-0"><X size={18} weight="bold" /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
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
              <div className="flex flex-col gap-3 pt-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${form.isEnrollmentOpen ? 'bg-green-500' : 'bg-zinc-300'}`}>
                    <input type="checkbox" className="hidden" {...field("isEnrollmentOpen")} />
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.isEnrollmentOpen ? 'left-7' : 'left-1'}`} />
                  </div>
                  <span className="font-bold text-sm text-zinc-900">Enrollment Open</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${form.requireEngineerApproval ? 'bg-purple-500' : 'bg-zinc-300'}`}>
                    <input type="checkbox" className="hidden" {...field("requireEngineerApproval")} />
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.requireEngineerApproval ? 'left-7' : 'left-1'}`} />
                  </div>
                  <span className="font-bold text-sm text-zinc-900">Require Engineer Approval</span>
                </label>
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