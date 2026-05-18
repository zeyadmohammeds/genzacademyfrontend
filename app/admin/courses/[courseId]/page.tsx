"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getAdminCourse, getAdminCourses, getAdminRounds,
  getAdminCourseMaterials,
  createAdminRound, updateRound, deleteAdminRound as deleteRoundApi,
} from "@/lib/api";
import type { AdminCourse, AdminCourseDetail, CourseRound } from "@/lib/types";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import { PremiumSwitch } from "@/components/PremiumControls";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import {
  Plus, ArrowLeft, PencilSimple, Trash, UsersThree,
  CalendarBlank, ArrowRight, X, FloppyDisk, CheckCircle, Door,
  BookOpen, FileText, Presentation, Video, YoutubeLogo,
  Code, Link as LinkIcon, DownloadSimple, GraduationCap,
  ChartBar, Clock, MapPin, Target, Globe,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "overview" | "rounds" | "materials" | "sessions";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <ChartBar size={14} weight="bold" /> },
  { id: "rounds", label: "Rounds", icon: <UsersThree size={14} weight="bold" /> },
  { id: "materials", label: "Materials", icon: <FileText size={14} weight="bold" /> },
  { id: "sessions", label: "Sessions", icon: <Clock size={14} weight="bold" /> },
];

const materialIcon = (type: string) => {
  switch (type) {
    case "Pdf": return <FileText size={18} weight="fill" className="text-red-500" />;
    case "PowerPoint": return <Presentation size={18} weight="fill" className="text-orange-500" />;
    case "Video": return <Video size={18} weight="fill" className="text-blue-500" />;
    case "Link": return <LinkIcon size={18} weight="bold" className="text-zinc-500" />;
    case "CodeRepository": return <Code size={18} weight="fill" className="text-zinc-700" />;
    case "Recording": return <YoutubeLogo size={18} weight="fill" className="text-red-500" />;
    default: return <FileText size={18} weight="fill" className="text-zinc-400" />;
  }
};

const typeColors: Record<string, string> = {
  Pdf: "bg-red-50 text-red-600 border-red-100",
  PowerPoint: "bg-orange-50 text-orange-600 border-orange-100",
  Video: "bg-blue-50 text-blue-600 border-blue-100",
  Link: "bg-zinc-50 text-zinc-600 border-zinc-100",
  CodeRepository: "bg-zinc-900 text-white border-zinc-900",
  Worksheet: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Recording: "bg-red-50 text-red-600 border-red-100",
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<AdminCourseDetail | null>(null);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [rounds, setRounds] = useState<CourseRound[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CourseRound | null>(null);
  const [saving, setSaving] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "", slug: "",
    startDate: new Date().toISOString().split('T')[0],
    maxStudents: 20, isEnrollmentOpen: true,
    autoAcceptPaidApplications: false, requireEngineerApproval: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [courseData, allCourses, foundRounds, foundMaterials] = await Promise.all([
        getAdminCourse(courseId),
        getAdminCourses(),
        getAdminRounds(courseId),
        getAdminCourseMaterials(courseId),
      ]);
      setCourses(allCourses);
      setCourse(courseData as AdminCourseDetail);
      setRounds(foundRounds);
      setMaterials(foundMaterials);

      const allSessions: any[] = [];
      const allStudentsMap = new Map<string, any>();
      await Promise.all(foundRounds.map(async (r) => {
        try {
          const detail = await import("@/lib/api").then(m => m.getAdminRound(r.id));
          if (detail) {
            allSessions.push(...detail.weeks.map((w: any) => ({ ...w, roundName: r.name, roundId: r.id })));
            detail.students.forEach((s: any) => {
              if (!allStudentsMap.has(s.studentUserId)) {
                allStudentsMap.set(s.studentUserId, { ...s, roundName: r.name, roundId: r.id });
              }
            });
          }
        } catch {}
      }));
      setSessions(allSessions);
      setAllStudents(Array.from(allStudentsMap.values()));
    } catch (e: any) {
      toast(e.message || "Failed to load course", "error");
    } finally {
      setLoading(false);
    }
  }, [courseId, toast]);

  useEffect(() => { load(); }, [load]);

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

  if (!course && !loading) return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-[2rem] bg-zinc-100 flex items-center justify-center mx-auto mb-6 border border-black/5">
          <BookOpen size={40} weight="duotone" className="text-zinc-300" />
        </div>
        <h2 className="text-2xl font-display font-black text-zinc-900 mb-2">Course Not Found</h2>
        <p className="text-sm text-zinc-500 mb-6">This course doesn&apos;t exist or you don&apos;t have access to it.</p>
        <Link href="/admin/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors shadow-lg">
          <ArrowLeft size={16} weight="bold" /> Back to Courses
        </Link>
      </div>
    </div>
  );

  if (loading) return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-48 bg-zinc-200 rounded-xl" />
        <div className="h-10 w-96 bg-zinc-200 rounded-2xl" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-11 w-28 bg-zinc-200 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-zinc-200 rounded-[2.5rem]" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-zinc-200 rounded-[2.5rem]" />
          <div className="h-96 bg-zinc-200 rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-canvas-soft">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 pb-24">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3">
            <Link href="/admin/courses" className="text-brand text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:underline">
              <ArrowLeft size={14} weight="bold" /> Back to Courses
            </Link>
            <span className="text-zinc-300">|</span>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Quick Switch:</label>
              <select
                value={course!.slug || courseId}
                onChange={(e) => router.push(`/admin/courses/${e.target.value}`)}
                className="px-3 py-1.5 bg-zinc-50 border border-black/5 rounded-xl text-xs font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-black/10 transition-all cursor-pointer"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.slug}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {course!.coverImageUrl ? (
                <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-black/5 shadow-sm">
                  <img src={course!.coverImageUrl} alt={course!.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center border border-black/5 shrink-0" style={{ backgroundColor: course!.colorHex ? `${course!.colorHex}15` : undefined }}>
                  <BookOpen size={24} weight="fill" className="text-zinc-400" />
                </div>
              )}
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">{course!.title}</h1>
                <p className="text-sm text-zinc-500 font-medium">{course!.subtitle || course!.slug} &middot; {course!.level} &middot; Phase {course!.phase}{course!.isActive ? '' : ' · Archived'}</p>
              </div>
            </div>
            <button onClick={openCreate} className="w-full sm:w-auto bg-zinc-900 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg">
              <Plus size={18} weight="bold" /> New Round
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 overflow-x-auto scrollbar-none">
          <div className="flex gap-1.5 min-w-max p-1 bg-white rounded-2xl border border-black/5 shadow-sm">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === t.id
                    ? "bg-zinc-900 text-white shadow-lg"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-[2.5rem] p-6 border border-black/5 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-brand-hover flex items-center justify-center mb-3">
                      <MapPin size={20} weight="bold" className="text-brand" />
                    </div>
                    <div className="text-3xl font-black text-zinc-900 font-mono">{course!.roundsCount}</div>
                    <div className="text-xs text-zinc-500 font-bold mt-1">Total Rounds</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-1">{course!.activeRoundsCount} active</div>
                  </div>
                  <div className="bg-white rounded-[2.5rem] p-6 border border-black/5 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-brand-hover flex items-center justify-center mb-3">
                      <GraduationCap size={20} weight="bold" className="text-brand" />
                    </div>
                    <div className="text-3xl font-black text-zinc-900 font-mono">{course!.enrollmentsCount}</div>
                    <div className="text-xs text-zinc-500 font-bold mt-1">Enrolled Students</div>
                  </div>
                  <div className="bg-white rounded-[2.5rem] p-6 border border-black/5 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-brand-hover flex items-center justify-center mb-3">
                      <FileText size={20} weight="bold" className="text-brand" />
                    </div>
                    <div className="text-3xl font-black text-zinc-900 font-mono">{course!.materialsCount}</div>
                    <div className="text-xs text-zinc-500 font-bold mt-1">Course Materials</div>
                    <div className="text-[10px] text-zinc-400 font-bold mt-1">{materials.filter(m => m.isPublished).length} published</div>
                  </div>
                  <div className="bg-white rounded-[2.5rem] p-6 border border-black/5 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-brand-hover flex items-center justify-center mb-3">
                      <Clock size={20} weight="bold" className="text-brand" />
                    </div>
                    <div className="text-3xl font-black text-zinc-900 font-mono">{course!.sessionsCount}</div>
                    <div className="text-xs text-zinc-500 font-bold mt-1">Total Sessions</div>
                    <div className="text-[10px] text-zinc-400 font-bold mt-1">{course!.coreSessions}C / {course!.supportSessions}S per round</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Course Info */}
                  <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-black/5 shadow-sm">
                    <h3 className="text-lg font-black text-zinc-900 mb-4">Course Information</h3>
                    <div className="space-y-4 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Slug</div>
                          <div className="font-mono font-bold text-zinc-700">{course!.slug}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Level</div>
                          <div className="font-bold text-zinc-700">{course!.level}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Phase</div>
                          <div className="font-bold text-zinc-700">Phase {course!.phase}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Price</div>
                          <div className="font-bold text-zinc-700">{course!.priceEgp.toLocaleString()} EGP</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Age Range</div>
                          <div className="font-bold text-zinc-700">{course!.minimumAge}{course!.maximumAge ? ` - ${course!.maximumAge}` : '+'} years</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Sort Order</div>
                          <div className="font-bold text-zinc-700">{course!.sortOrder}</div>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-black/5">
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${course!.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-zinc-50 text-zinc-500 border-zinc-200'}`}>
                            {course!.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {course!.isFeatured && <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-amber-50 text-amber-700 border-amber-100">Featured</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Round Overview */}
                  <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-black/5 shadow-sm">
                    <h3 className="text-lg font-black text-zinc-900 mb-4">Rounds at a Glance</h3>
                    {rounds.length === 0 ? (
                      <EmptyState
                        icon={<Door size={24} className="text-zinc-300" />}
                        title="No rounds yet"
                        description="Create the first round to start enrolling students."
                        action={
                          <button onClick={openCreate} className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors">
                            <Plus size={14} weight="bold" className="inline mr-1" /> Create Round
                          </button>
                        }
                      />
                    ) : (
                      <div className="space-y-3">
                        {rounds.slice(0, 5).map(r => (
                          <Link key={r.id} href={`/admin/courses/${course!.slug}/rounds/${r.id}`}
                            className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors group"
                          >
                            <div>
                              <div className="font-bold text-sm text-zinc-900 group-hover:text-brand transition-colors">{r.name}</div>
                              <div className="text-[10px] text-zinc-400 font-mono font-bold">{r.slug} &middot; {r.currentStudents}/{r.maxStudents} enrolled</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                r.status === "Active" ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                              }`}>{r.status}</span>
                              <ArrowRight size={14} weight="bold" className="text-zinc-300 group-hover:text-brand transition-colors" />
                            </div>
                          </Link>
                        ))}
                        {rounds.length > 5 && (
                          <button onClick={() => setActiveTab("rounds")} className="w-full text-center text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors py-2">
                            View all {rounds.length} rounds
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Rounds Tab */}
            {activeTab === "rounds" && (
              rounds.length === 0 ? (
                <EmptyState
                  icon={<Door size={32} className="text-zinc-300" />}
                  title="No rounds yet"
                  description="Create the first round for this course to start enrolling students."
                  action={
                    <button onClick={openCreate} className="px-5 py-2.5 bg-zinc-900 text-white rounded-full text-sm font-bold hover:bg-zinc-800 transition-colors">
                      Create First Round
                    </button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {rounds.map((r) => (
                    <div key={r.id} className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-black/5 hover:border-black/10 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden card-lift">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-200 via-brand to-zinc-950 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h2 className="text-xl font-display font-black text-zinc-900 tracking-tight leading-none mb-1 group-hover:text-brand transition-colors">{r.name}</h2>
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest font-mono">{r.slug}</span>
                          </div>
                          <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                            r.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-brand-hover text-zinc-800 border-brand-hover/10"
                          }`}>{r.status}</span>
                        </div>
                        <div className="space-y-3.5 mb-6">
                          <div className="flex items-center gap-3 text-xs font-bold text-zinc-600">
                            <div className="w-8 h-8 rounded-xl bg-zinc-50 border border-black/5 flex items-center justify-center text-zinc-400">
                              <CalendarBlank size={16} weight="fill" />
                            </div>
                            <span>{r.startDate ? new Date(r.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'}</span>
                          </div>
                        </div>
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
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(r)}
                            className="p-3 bg-zinc-50 border border-black/5 hover:border-black/10 hover:bg-zinc-100 text-zinc-600 rounded-2xl transition-all duration-200 active:scale-95 flex items-center justify-center"
                            title="Configure Round"
                          >
                            <PencilSimple size={16} weight="bold" />
                          </button>
                          <button onClick={() => handleDelete(r.id)}
                            className="p-3 bg-red-50 border border-red-150 hover:bg-red-100 hover:border-red-200 text-red-600 rounded-2xl transition-all duration-200 active:scale-95 flex items-center justify-center"
                            title="Archive Round"
                          >
                            <Trash size={16} weight="bold" />
                          </button>
                        </div>
                        <Link
                          href={`/admin/courses/${course!.slug || courseId}/rounds/${r.id}`}
                          className="px-5 py-3 bg-zinc-900 text-white hover:bg-brand rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-md transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
                        >
                          Enter Room <ArrowRight size={14} weight="bold" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Materials Tab */}
            {activeTab === "materials" && (
              <div className="space-y-4">
                {materials.length === 0 ? (
                  <EmptyState
                    icon={<FileText size={32} className="text-zinc-300" />}
                    title="No materials yet"
                    description="Upload materials from any round's room page to make them available here."
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materials.map((m) => (
                      <div key={m.id} className="bg-white rounded-[2.5rem] p-5 border border-black/5 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-black/5 flex items-center justify-center shrink-0">
                          {materialIcon(m.materialType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${(typeColors as any)[m.materialType] || 'bg-zinc-50 text-zinc-600 border-zinc-100'}`}>
                              {m.materialType}
                            </span>
                            {m.isPublished && <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Published</span>}
                          </div>
                          <h4 className="font-bold text-sm text-zinc-900 truncate">{m.title}</h4>
                          <div className="flex items-center gap-3 mt-2">
                            <a href={m.url} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] font-bold text-brand hover:underline flex items-center gap-1"
                            >
                              <Globe size={10} weight="bold" /> Open
                            </a>
                            {m.isDownloadable && (
                              <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                                <DownloadSimple size={10} weight="bold" /> Downloadable
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === "sessions" && (
              <div className="space-y-4">
                {sessions.length === 0 ? (
                  <EmptyState
                    icon={<Clock size={32} className="text-zinc-300" />}
                    title="No sessions yet"
                    description="Create sessions from any round's room page to see them aggregated here."
                  />
                ) : (
                  <div className="space-y-2">
                    {sessions.map((s) => (
                      <div key={s.id} className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          s.status === "Live" ? 'bg-brand text-white animate-pulse' :
                          s.status === "Completed" ? 'bg-emerald-50 text-emerald-600' :
                          'bg-zinc-50 text-zinc-500'
                        }`}>
                          {s.status === "Live" ? 'LIVE' : s.weekNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-zinc-900 truncate">{s.weekTitle || `Session ${s.weekNumber}`}</div>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 mt-0.5">
                            <span>{s.sessionType}</span>
                            <span>&middot;</span>
                            <span>{s.durationMinutes} min</span>
                            <span>&middot;</span>
                            <Link href={`/admin/courses/${course!.slug}/rounds/${s.roundId}`} className="text-brand hover:underline">
                              {s.roundName}
                            </Link>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                          s.status === "Live" ? 'bg-red-50 text-red-600 border-red-100' :
                          s.status === "Completed" ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-zinc-50 text-zinc-500 border-zinc-200'
                        }`}>{s.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Round Form Modal */}
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
    </div>
  );
}
