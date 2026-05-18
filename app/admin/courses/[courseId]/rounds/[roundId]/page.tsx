"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAdminRound, getAdminRounds, updateRound, updateRoundZoom, generateRoundZoom,
  createAdminTask, createAdminQuiz, addAdminQuizQuestion,
  createRoundWeek, getApplicationDetails, updateCourseStep, uploadCourseMaterial,
  deleteRoundWeek, deleteCourseMaterial, deleteLearningTask, deleteQuiz,
  getAdminRoundWeeks, getAdminCourseMaterials, getAdminRoundTasks, getAdminRoundQuizzes, getAdminRoundStudents,
  notifyRoundStudents
} from "@/lib/api";
import type { RoundDetail, WeekItem, MaterialItem, StudentItem, QuizItem, TaskItem, CourseRound } from "@/lib/types";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import { PremiumSwitch, PremiumCheckbox } from "@/components/PremiumControls";
import {
  ArrowLeft, UsersThree, CalendarBlank, Certificate, Video,
  FilePdf, DownloadSimple, PencilSimple, X, FloppyDisk,
  CheckCircle, Clock, MonitorPlay, Link as LinkIcon,
  Microphone, Chalkboard, Gear, UploadSimple, Student,
  ChatsCircle, Terminal, Cpu, Plus, GameController, ClipboardText, Eye,
  Broadcast, Play, Stop, DotsNine, ListBullets, CaretRight, CaretDown,
  BookmarkSimple, Slideshow, Headphones, Sparkle, Question, Target, Flag,
  CopySimple, Bell
} from "@phosphor-icons/react";

type Tab = "overview" | "sessions" | "materials" | "zoom" | "students" | "room" | "tasks";

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "room", label: "Command Center", icon: Broadcast },
  { key: "overview", label: "Overview", icon: Cpu },
  { key: "sessions", label: "Sessions", icon: Slideshow },
  { key: "materials", label: "Materials", icon: FilePdf },
  { key: "tasks", label: "Tasks & Quizzes", icon: ClipboardText },
  { key: "zoom", label: "Zoom", icon: Video },
  { key: "students", label: "Students", icon: UsersThree },
];

export default function RoundRoomPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const roundId = params.roundId as string;
  const [round, setRound] = useState<RoundDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("room");
  const [saving, setSaving] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyForm, setNotifyForm] = useState({ title: "", body: "" });
  const [notifying, setNotifying] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let data = await getAdminRound(roundId);
      if (!data) {
        const rounds = await getAdminRounds();
        const match = rounds.find(r => r.id === roundId || r.slug === roundId);
        if (match) {
          data = await getAdminRound(match.id);
        }
        if (!data && match) {
          const [fallbackWeeks, fallbackMaterials, fallbackTasks, fallbackQuizzes, fallbackStudents] = await Promise.all([
            getAdminRoundWeeks(match.id).catch(() => [] as any[]),
            getAdminCourseMaterials(match.courseId).catch(() => [] as any[]),
            getAdminRoundTasks(match.id).catch(() => [] as any[]),
            getAdminRoundQuizzes(match.id).catch(() => [] as any[]),
            getAdminRoundStudents(match.id).catch(() => [] as any[]),
          ]);
          data = {
            id: match.id,
            courseId: match.courseId,
            courseTitle: match.courseTitle,
            courseSlug: match.courseSlug,
            name: match.name,
            slug: match.slug,
            status: match.status,
            startDate: match.startDate,
            maxStudents: match.maxStudents,
            currentStudents: match.currentStudents,
            isEnrollmentOpen: match.isEnrollmentOpen,
            autoAcceptPaidApplications: match.autoAcceptPaidApplications,
            requireEngineerApproval: match.requireEngineerApproval,
            zoomMeetingId: match.zoomMeetingId ?? undefined,
            zoomJoinUrl: match.zoomJoinUrl ?? undefined,
            zoomStartUrl: match.zoomStartUrl ?? undefined,
            weeks: fallbackWeeks,
            materials: fallbackMaterials,
            students: fallbackStudents,
            quizzes: fallbackQuizzes,
            tasks: fallbackTasks,
          };
        }
      }
      setRound(data);
    } catch {
      toast("Failed to load round data", "error");
    } finally {
      setLoading(false);
    }
  }, [roundId, toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="w-full min-h-screen bg-canvas-soft">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 pb-24">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-48 bg-zinc-200 rounded-xl" />
          <div className="h-10 w-96 bg-zinc-200 rounded-2xl" />
          <div className="flex gap-2">
            {[...Array(7)].map((_, i) => <div key={i} className="h-11 w-32 bg-zinc-200 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-zinc-200 rounded-[2.5rem]" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 h-96 bg-zinc-200 rounded-[2.5rem]" />
            <div className="lg:col-span-5 space-y-6">
              <div className="h-64 bg-zinc-200 rounded-[2.5rem]" />
              <div className="h-80 bg-zinc-200 rounded-[2.5rem]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  if (!round) return (
    <div className="w-full min-h-screen bg-canvas-soft flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-[2rem] bg-zinc-100 flex items-center justify-center mx-auto mb-6 border border-black/5">
          <Broadcast size={40} weight="duotone" className="text-zinc-300" />
        </div>
        <h2 className="text-2xl font-display font-black text-zinc-900 mb-2">Round Not Found</h2>
        <p className="text-sm text-zinc-500 mb-6">This round doesn&#39;t exist or you don&#39;t have access to it.</p>
        <Link href={`/admin/courses/${courseId}`} className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors shadow-lg">
          <ArrowLeft size={16} weight="bold" /> Back to Course
        </Link>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-canvas-soft">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 pb-24">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <Link href={`/admin/courses/${courseId}`} className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
              <ArrowLeft size={14} weight="bold" /> Back to {round.courseTitle}
            </Link>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight mb-2 leading-[0.95]">{round.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 font-medium">
              <span className="text-brand font-bold">{round.courseTitle}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-300" />
              <span className="flex items-center gap-1"><CalendarBlank size={14} weight="bold" /> {round.startDate ? new Date(round.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-300" />
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                round.status === "Active" ? "bg-blue-100 text-blue-700" :
                round.status === "Upcoming" ? "bg-brand-hover text-zinc-800" :
                "bg-zinc-100 text-zinc-500"
              }`}>{round.status}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-300" />
              <span className="flex items-center gap-1"><UsersThree size={14} weight="bold" /> {round.currentStudents}/{round.maxStudents} enrolled</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 lg:mt-0">
            <button onClick={() => { setNotifyForm({ title: `New update in ${round.name}`, body: "" }); setShowNotifyModal(true); }}
              className="px-4 py-2.5 bg-white border border-black/5 hover:border-black/10 rounded-2xl text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-all flex items-center gap-2 shadow-sm">
              <Bell size={14} weight="bold" /> Notify Students
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 mb-8 overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
                activeTab === key
                  ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20"
                  : "bg-white text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-black/5 shadow-sm"
              }`}
            >
              <Icon size={16} weight={activeTab === key ? "fill" : "bold"} />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {activeTab === "room" && <RoomCommandCenter round={round} onRefresh={load} />}
            {activeTab === "overview" && <OverviewTab round={round} onRefresh={load} />}
            {activeTab === "sessions" && <SessionsTab round={round} onRefresh={load} />}
            {activeTab === "materials" && <MaterialsTab round={round} onRefresh={load} />}
            {activeTab === "tasks" && <TasksTab round={round} onRefresh={load} />}
            {activeTab === "zoom" && <ZoomTab round={round} onRefresh={load} />}
            {activeTab === "students" && <StudentsTab round={round} />}
          </motion.div>
        </AnimatePresence>

      {/* Notify Students Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-t-[1.5rem] sm:rounded-[2.5rem] w-full sm:max-w-lg shadow-2xl border border-black/5">
            <div className="p-4 sm:p-6 border-b border-black/5 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-900">Notify Enrolled Students</h2>
              <button onClick={() => setShowNotifyModal(false)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center shrink-0"><X size={18} weight="bold" /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <p className="text-xs text-zinc-500 font-medium">Send a notification to all {round.currentStudents} enrolled students in this round.</p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Title</label>
                <input value={notifyForm.title} onChange={(e) => setNotifyForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold text-sm outline-none focus:bg-white focus:ring-2 focus:ring-black/10 transition-all" placeholder="New update in Round X" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Message</label>
                <textarea value={notifyForm.body} onChange={(e) => setNotifyForm(p => ({ ...p, body: e.target.value }))} rows={3}
                  className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold text-sm outline-none focus:bg-white focus:ring-2 focus:ring-black/10 transition-all resize-none" placeholder="What's new? A session just went live, new task available..." />
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-black/5 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end">
              <button onClick={() => setShowNotifyModal(false)} className="w-full sm:w-auto px-6 py-3 bg-white border border-black/10 text-zinc-700 rounded-xl font-bold text-sm hover:bg-zinc-50">Cancel</button>
              <button onClick={async () => {
                if (!notifyForm.title) { toast("Title is required", "error"); return; }
                setNotifying(true);
                try {
                  const res = await notifyRoundStudents(round.id, notifyForm.title, notifyForm.body || notifyForm.title);
                  toast(`Notification sent to ${res.queued} students!`, "success");
                  setShowNotifyModal(false);
                } catch {
                  toast("Failed to send notification", "error");
                } finally {
                  setNotifying(false);
                }
              }} disabled={notifying}
                className="w-full sm:w-auto px-6 py-3 bg-brand text-white rounded-xl font-bold text-sm hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                <Bell size={16} weight="bold" /> {notifying ? "Sending..." : `Notify ${round.currentStudents} Students`}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      </div>
  );
}

function OverviewTab({ round, onRefresh }: { round: RoundDetail; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: round.name,
    startDate: round.startDate,
    maxStudents: round.maxStudents,
    isEnrollmentOpen: round.isEnrollmentOpen,
    requireEngineerApproval: round.requireEngineerApproval,
    autoAcceptPaidApplications: round.autoAcceptPaidApplications,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateRound(round.id, {
        name: form.name,
        startDate: new Date(form.startDate).toISOString(),
        maxStudents: form.maxStudents,
        isEnrollmentOpen: form.isEnrollmentOpen,
        requireEngineerApproval: form.requireEngineerApproval,
        autoAcceptPaidApplications: form.autoAcceptPaidApplications,
      });
      toast("Round settings updated", "success");
      setEditing(false);
      onRefresh();
    } catch (e: any) {
      toast(e.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const weekCount = round.weeks?.length || 0;
  const completedWeeks = round.weeks?.filter(w => w.status === "Completed").length || 0;
  const liveWeeks = round.weeks?.filter(w => w.status === "Live").length || 0;
  const studentCount = round.students?.length || 0;
  const materialCount = round.materials?.length || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: `${studentCount} / ${round.maxStudents}`, icon: UsersThree, color: "bg-blue-100 text-blue-600" },
          { label: "Sessions", value: `${completedWeeks}/${weekCount} completed`, icon: MonitorPlay, color: liveWeeks > 0 ? "bg-green-100 text-green-600" : "bg-zinc-100 text-zinc-600" },
          { label: "Materials", value: `${materialCount} uploaded`, icon: FilePdf, color: "bg-brand-hover text-brand" },
          { label: "Instructor", value: round.instructorName || "Not assigned", icon: Chalkboard, color: "bg-purple-100 text-purple-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={20} weight="fill" />
            </div>
            <div className="text-2xl font-black text-zinc-900 mb-1">{stat.value}</div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-black/5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-zinc-900">Round Settings</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-2">
              <PencilSimple size={14} weight="bold" /> Edit
            </button>
          )}
        </div>
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Name</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Start Date</label>
                <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Max Students</label>
                <input type="number" value={form.maxStudents} onChange={e => setForm(p => ({ ...p, maxStudents: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold" />
              </div>
            </div>
            <div className="flex flex-col gap-4 py-2">
              {[
                { key: "isEnrollmentOpen" as const, label: "Enrollment Open" },
                { key: "requireEngineerApproval" as const, label: "Require Engineer Approval" },
                { key: "autoAcceptPaidApplications" as const, label: "Auto-Accept Paid Applications" },
              ].map(({ key, label }) => (
                <PremiumSwitch
                  key={key}
                  checked={form[key]}
                  onChange={(val) => setForm(p => ({ ...p, [key]: val }))}
                  label={label}
                />
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(false)} className="px-6 py-3 bg-white border border-black/10 text-zinc-700 rounded-xl font-bold text-sm hover:bg-zinc-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black disabled:opacity-50 flex items-center gap-2 shadow-lg">
                <FloppyDisk size={18} weight="bold" /> {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailItem label="Status" value={round.status} />
            <DetailItem label="Start Date" value={round.startDate ? new Date(round.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'} />
            <DetailItem label="Capacity" value={`${round.currentStudents} / ${round.maxStudents} students`} />
            <DetailItem label="Enrollment" value={round.isEnrollmentOpen ? "Open" : "Closed"} />
            <DetailItem label="Engineer Approval" value={round.requireEngineerApproval ? "Required" : "Not required"} />
            <DetailItem label="Auto-Accept Paid" value={round.autoAcceptPaidApplications ? "Yes" : "No"} />
        </div>
      )}

    </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-50 rounded-2xl p-4">
      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="font-bold text-zinc-900">{value}</div>
    </div>
  );
}

function SessionsTab({ round, onRefresh }: { round: RoundDetail; onRefresh: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: "", sessionLink: "", recordingUrl: "", weekNumber: 0, weekTitle: "", sessionType: "" });
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    weekTitle: "", sessionType: "Core", status: "Scheduled",
    sessionLink: "", recordingUrl: "", weekNumber: 1
  });
  const { toast } = useToast();
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [allRounds, setAllRounds] = useState<CourseRound[]>([]);
  const [selectedSourceRoundId, setSelectedSourceRoundId] = useState<string>("");
  const [sourceRoundSessions, setSourceRoundSessions] = useState<WeekItem[]>([]);
  const [copying, setCopying] = useState(false);
  const [selectedSessionsToCopy, setSelectedSessionsToCopy] = useState<Set<string>>(new Set());

  const startEdit = (week: WeekItem) => {
    setEditingId(week.id);
    setEditForm({
      status: week.status, sessionLink: week.sessionLink || "", recordingUrl: week.recordingUrl || "",
      weekNumber: week.weekNumber, weekTitle: week.weekTitle, sessionType: week.sessionType,
    });
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      await updateCourseStep(id, {
        status: editForm.status, sessionLink: editForm.sessionLink || null,
        recordingUrl: editForm.recordingUrl || null, weekNumber: editForm.weekNumber,
        weekTitle: editForm.weekTitle, sessionType: editForm.sessionType,
      });
      toast("Session updated", "success");
      setEditingId(null);
      onRefresh();
    } catch (e: any) {
      toast(e.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSession = async () => {
    if (!addForm.weekTitle) { toast("Session Title is required", "error"); return; }
    setSaving(true);
    try {
      await createRoundWeek(round.id, {
        weekTitle: addForm.weekTitle, sessionType: addForm.sessionType,
        status: addForm.status, sessionLink: addForm.sessionLink || null,
        recordingUrl: addForm.recordingUrl || null, weekNumber: addForm.weekNumber,
      });
      toast("New session created!", "success");
      setShowAddForm(false);
      onRefresh();
    } catch (e: any) {
      toast(e.message || "Failed to create session", "error");
    } finally {
      setSaving(false);
    }
  };

  const weeks = round.weeks || [];

  useEffect(() => {
    if (weeks.length > 0) {
      setAddForm(p => ({ ...p, weekNumber: Math.max(...weeks.map(w => w.weekNumber)) + 1 }));
    }
  }, [weeks]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button onClick={() => {
          setAddForm({
            weekTitle: "", sessionType: "Core", status: "Scheduled",
            sessionLink: "", recordingUrl: "",
            weekNumber: weeks.length > 0 ? Math.max(...weeks.map(w => w.weekNumber)) + 1 : 1
          });
          setShowAddForm(true);
        }} className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-colors flex items-center gap-2 shadow-lg cursor-pointer">
          <Plus size={16} weight="bold" /> Add Weekly Session
        </button>
        <button onClick={async () => {
          const rounds = await getAdminRounds();
          setAllRounds(rounds.filter(r => r.id !== round.id));
          setSelectedSourceRoundId("");
          setSourceRoundSessions([]);
          setSelectedSessionsToCopy(new Set());
          setShowCopyModal(true);
        }} className="px-5 py-2.5 bg-white border border-black/10 text-zinc-700 rounded-xl font-bold text-xs hover:bg-zinc-50 transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
          <CopySimple size={16} weight="bold" /> Copy from Another Round
        </button>
      </div>

      {weeks.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-black/5 text-center">
          <MonitorPlay size={48} weight="fill" className="text-zinc-200 mx-auto mb-4 animate-pulse" />
          <p className="text-zinc-500 font-medium">No sessions created yet for this round.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-black/5">
            <h2 className="text-xl font-display font-bold text-zinc-900">Weekly Sessions</h2>
            <p className="text-sm text-zinc-500 mt-1">Manage session status, links, and recordings.</p>
          </div>
          <div className="divide-y divide-black/5">
            {weeks.map((week, i) => (
              <div key={week.id} className="p-4 sm:p-6 hover:bg-zinc-50 transition-colors">
                {editingId === week.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 rounded-full bg-zinc-900 text-white text-xs font-black flex items-center justify-center">W{week.weekNumber}</span>
                      <span className="font-bold text-zinc-900">{week.weekTitle}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Session Title</label>
                        <input type="text" value={editForm.weekTitle} onChange={e => setEditForm(p => ({ ...p, weekTitle: e.target.value }))}
                          className="px-3 py-2.5 bg-zinc-50 rounded-xl border border-black/5 font-bold text-sm" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Session Type</label>
                        <select value={editForm.sessionType} onChange={e => setEditForm(p => ({ ...p, sessionType: e.target.value }))}
                          className="px-3 py-2.5 bg-zinc-50 rounded-xl border border-black/5 font-bold text-sm">
                          <option value="Core">Core Lecture</option>
                          <option value="TechnicalSupport">Mentorship/Support</option>
                          <option value="Workshop">Workshop</option>
                          <option value="Review">Review</option>
                          <option value="Showcase">Showcase</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</label>
                        <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                          className="px-3 py-2.5 bg-zinc-50 rounded-xl border border-black/5 font-bold text-sm">
                          <option value="Scheduled">Scheduled</option>
                          <option value="Live">Live</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Week Number</label>
                        <input type="number" value={editForm.weekNumber} onChange={e => setEditForm(p => ({ ...p, weekNumber: Number(e.target.value) }))}
                          className="px-3 py-2.5 bg-zinc-50 rounded-xl border border-black/5 font-bold text-sm" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Session Link</label>
                      <input value={editForm.sessionLink} onChange={e => setEditForm(p => ({ ...p, sessionLink: e.target.value }))}
                        placeholder="https://zoom.us/j/..."
                        className="px-3 py-2.5 bg-zinc-50 rounded-xl border border-black/5 font-mono font-bold text-sm" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recording URL</label>
                      <input value={editForm.recordingUrl} onChange={e => setEditForm(p => ({ ...p, recordingUrl: e.target.value }))}
                        placeholder="https://..."
                        className="px-3 py-2.5 bg-zinc-50 rounded-xl border border-black/5 font-mono font-bold text-sm" />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-white border border-black/10 text-zinc-700 rounded-xl font-bold text-xs hover:bg-zinc-50">Cancel</button>
                      <button onClick={() => handleSave(week.id)} disabled={saving} className="px-5 py-2 bg-zinc-900 text-white rounded-xl font-bold text-xs hover:bg-black disabled:opacity-50 flex items-center gap-2">
                        <FloppyDisk size={14} weight="bold" /> {saving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:min-w-[200px]">
                      <span className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 text-xs font-black flex items-center justify-center shrink-0">{week.weekNumber}</span>
                      <div>
                        <div className="font-bold text-zinc-900 text-sm">{week.weekTitle}</div>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{week.sessionType} &middot; {week.durationMinutes}min</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        week.status === "Completed" ? "bg-green-100 text-green-700" :
                        week.status === "Live" ? "bg-red-100 text-red-700" :
                        week.status === "Cancelled" ? "bg-zinc-100 text-zinc-400" :
                        "bg-blue-100 text-blue-700"
                      }`}>{week.status}</span>
                      {week.sessionLink && (
                        <a href={week.sessionLink} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline" title="Session Link">
                          <LinkIcon size={14} weight="bold" />
                        </a>
                      )}
                      {week.recordingUrl && (
                        <a href={week.recordingUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline" title="Recording">
                          <MonitorPlay size={14} weight="bold" />
                        </a>
                      )}
                    </div>
                    <button onClick={() => startEdit(week)} className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl transition-colors shrink-0" title="Edit session">
                      <PencilSimple size={14} weight="bold" />
                    </button>
                    <button onClick={async () => {
                      if (!window.confirm(`Delete session "${week.weekTitle}"?`)) return;
                      try {
                        await deleteRoundWeek(round.id, week.id);
                        toast("Session deleted", "success");
                        onRefresh();
                      } catch {
                        toast("Failed to delete session", "error");
                      }
                    }} className="p-2 bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-xl transition-colors shrink-0" title="Delete session">
                      <X size={14} weight="bold" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Copy Sessions from Another Round */}
      {showCopyModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-t-[1.5rem] sm:rounded-[2.5rem] w-full sm:max-w-xl shadow-2xl border border-black/5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-6 border-b border-black/5 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-lg font-display font-bold text-zinc-900">Copy Sessions</h2>
                <p className="text-xs text-zinc-500 mt-1">Select a source round and choose sessions to duplicate.</p>
              </div>
              <button onClick={() => setShowCopyModal(false)} className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center"><X size={18} weight="bold" /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Source Round</label>
                <select value={selectedSourceRoundId} onChange={async (e) => {
                  const val = e.target.value;
                  setSelectedSourceRoundId(val);
                  setSelectedSessionsToCopy(new Set());
                  if (val) {
                    const source = await getAdminRound(val);
                    setSourceRoundSessions(source?.weeks || []);
                  } else {
                    setSourceRoundSessions([]);
                  }
                }} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 text-sm font-medium cursor-pointer outline-none text-zinc-800">
                  <option value="">-- Select a round --</option>
                  {allRounds.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              {sourceRoundSessions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">{sourceRoundSessions.length} sessions available</label>
                    <button onClick={() => {
                      if (selectedSessionsToCopy.size === sourceRoundSessions.length) {
                        setSelectedSessionsToCopy(new Set());
                      } else {
                        setSelectedSessionsToCopy(new Set(sourceRoundSessions.map(s => s.id)));
                      }
                    }} className="text-[10px] font-bold text-brand hover:underline uppercase tracking-widest">
                      {selectedSessionsToCopy.size === sourceRoundSessions.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  {sourceRoundSessions.map(s => (
                    <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedSessionsToCopy.has(s.id) ? "bg-brand-hover border-brand/30" : "bg-zinc-50 border-black/5 hover:bg-zinc-100"
                    }`}>
                      <input type="checkbox" checked={selectedSessionsToCopy.has(s.id)} onChange={() => {
                        const next = new Set(selectedSessionsToCopy);
                        if (next.has(s.id)) next.delete(s.id); else next.add(s.id);
                        setSelectedSessionsToCopy(next);
                      }} className="w-4 h-4 accent-brand" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-zinc-900 truncate">W{s.weekNumber}: {s.weekTitle}</div>
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{s.sessionType} · {s.durationMinutes || 90}min</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {selectedSourceRoundId && sourceRoundSessions.length === 0 && (
                <div className="py-8 text-center text-sm font-bold text-zinc-400">No sessions in this round.</div>
              )}
            </div>
            <div className="p-4 sm:p-6 border-t border-black/5 flex justify-end gap-3 shrink-0">
              <button onClick={() => setShowCopyModal(false)} className="px-6 py-3 bg-white border border-black/10 text-zinc-700 rounded-xl font-bold text-sm hover:bg-zinc-50 cursor-pointer">Cancel</button>
              <button onClick={async () => {
                if (selectedSessionsToCopy.size === 0) { toast("Select at least one session", "error"); return; }
                setCopying(true);
                try {
                  for (const sessionId of selectedSessionsToCopy) {
                    const src = sourceRoundSessions.find(s => s.id === sessionId);
                    if (!src) continue;
                    await createRoundWeek(round.id, {
                      weekTitle: src.weekTitle,
                      sessionType: src.sessionType,
                      status: "Scheduled",
                      sessionLink: src.sessionLink || null,
                      recordingUrl: src.recordingUrl || null,
                      weekNumber: src.weekNumber,
                    });
                  }
                  toast(`Copied ${selectedSessionsToCopy.size} session(s) successfully`, "success");
                  setShowCopyModal(false);
                  onRefresh();
                } catch {
                  toast("Failed to copy sessions", "error");
                } finally {
                  setCopying(false);
                }
              }} disabled={copying || selectedSessionsToCopy.size === 0}
                className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black disabled:opacity-50 flex items-center gap-2 shadow-lg cursor-pointer">
                <CopySimple size={16} weight="bold" /> {copying ? "Copying..." : `Copy ${selectedSessionsToCopy.size} Session(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-t-[1.5rem] sm:rounded-[2.5rem] w-full sm:max-w-lg shadow-2xl border border-black/5 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 border-b border-black/5 flex justify-between items-center">
              <h2 className="text-lg font-display font-bold text-zinc-900">Add Weekly Session</h2>
              <button onClick={() => setShowAddForm(false)} className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center"><X size={18} weight="bold" /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 text-xs font-bold text-zinc-700">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Session Title *</label>
                  <input value={addForm.weekTitle} onChange={e => setAddForm(p => ({ ...p, weekTitle: e.target.value }))}
                    className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 text-sm font-medium focus:ring-2 focus:ring-black/10 outline-none text-zinc-800"
                    placeholder="e.g. Memory Layout & Pointers Deep Dive" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Week #</label>
                  <input type="number" value={addForm.weekNumber} onChange={e => setAddForm(p => ({ ...p, weekNumber: Number(e.target.value) || 1 }))}
                    className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 text-sm font-medium focus:ring-2 focus:ring-black/10 outline-none text-zinc-800" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Session Type</label>
                  <select value={addForm.sessionType} onChange={e => setAddForm(p => ({ ...p, sessionType: e.target.value }))}
                    className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 text-sm font-medium focus:ring-2 focus:ring-black/10 cursor-pointer outline-none text-zinc-800">
                    <option value="Core">Core Lecture</option>
                    <option value="TechnicalSupport">Mentorship/Support</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Review">Review</option>
                    <option value="Showcase">Showcase</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Initial Status</label>
                  <select value={addForm.status} onChange={e => setAddForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 text-sm font-medium focus:ring-2 focus:ring-black/10 cursor-pointer outline-none text-zinc-800">
                    <option value="Scheduled">Scheduled</option>
                    <option value="Live">Live Room Open</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Live Broadcast / Meeting Link</label>
                <input value={addForm.sessionLink} onChange={e => setAddForm(p => ({ ...p, sessionLink: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 text-sm font-medium focus:ring-2 focus:ring-black/10 outline-none font-mono text-zinc-800"
                  placeholder="https://zoom.us/j/..." />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Recording Archive URL</label>
                <input value={addForm.recordingUrl} onChange={e => setAddForm(p => ({ ...p, recordingUrl: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 text-sm font-medium focus:ring-2 focus:ring-black/10 outline-none font-mono text-zinc-800"
                  placeholder="https://drive.google.com/..." />
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-black/5 flex justify-end gap-3">
              <button onClick={() => setShowAddForm(false)} className="px-6 py-3 bg-white border border-black/10 text-zinc-700 rounded-xl font-bold text-sm hover:bg-zinc-50 cursor-pointer">Cancel</button>
              <button onClick={handleAddSession} disabled={saving} className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black disabled:opacity-50 flex items-center gap-2 shadow-lg cursor-pointer">
                {saving ? "Creating..." : "Create Session"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MaterialsTab({ round, onRefresh }: { round: RoundDetail; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", materialType: "Pdf", url: "", isDownloadable: true });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!form.title || !form.url) { toast("Title and URL are required", "error"); return; }
    setSaving(true);
    try {
      await uploadCourseMaterial(round.courseId, {
        title: form.title, materialType: form.materialType,
        url: form.url, isDownloadable: form.isDownloadable,
      });
      toast("Material uploaded", "success");
      setShowForm(false);
      setForm({ title: "", materialType: "Pdf", url: "", isDownloadable: true });
      onRefresh();
    } catch (e: any) {
      toast(e.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const materials = round.materials || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-colors flex items-center gap-2 shadow-lg">
          <UploadSimple size={16} weight="bold" /> Upload Material
        </button>
      </div>

      {materials.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-black/5 text-center">
          <FilePdf size={48} weight="fill" className="text-zinc-200 mx-auto mb-4" />
          <p className="text-zinc-500 font-medium">No materials uploaded yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-black/5 divide-y divide-black/5 overflow-hidden">
          {materials.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-hover flex items-center justify-center shrink-0">
                  {m.materialType === "Video" ? <MonitorPlay size={20} weight="fill" className="text-brand" /> :
                   m.materialType === "Link" ? <LinkIcon size={20} weight="fill" className="text-brand" /> :
                   <FilePdf size={20} weight="fill" className="text-brand" />}
                </div>
                <div>
                  <div className="font-bold text-zinc-900">{m.title}</div>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{m.materialType}{m.isDownloadable ? "" : " · View Only"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={m.url} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-2">
                  <DownloadSimple size={14} weight="bold" /> Open
                </a>
                <button onClick={async () => {
                  if (!window.confirm(`Delete material "${m.title}"?`)) return;
                  try {
                    await deleteCourseMaterial(m.id);
                    toast("Material deleted", "success");
                    onRefresh();
                  } catch {
                    toast("Failed to delete material", "error");
                  }
                }} className="p-2 bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-xl transition-colors" title="Delete material">
                  <X size={14} weight="bold" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-t-[1.5rem] sm:rounded-[2.5rem] w-full sm:max-w-lg shadow-2xl border border-black/5">
            <div className="p-4 sm:p-6 border-b border-black/5 flex justify-between items-center">
              <h2 className="text-lg font-display font-bold text-zinc-900">Upload Material</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center"><X size={18} weight="bold" /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Title</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold" placeholder="Session Playbook PDF" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Type</label>
                  <select value={form.materialType} onChange={e => setForm(p => ({ ...p, materialType: e.target.value }))}
                    className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold">
                    <option value="Pdf">PDF</option>
                    <option value="Video">Video</option>
                    <option value="Link">Link</option>
                    <option value="PowerPoint">PowerPoint</option>
                    <option value="CodeRepository">Code Repository</option>
                    <option value="Worksheet">Worksheet</option>
                    <option value="Recording">Recording</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 justify-end pb-1">
                  <PremiumCheckbox checked={form.isDownloadable} onChange={(val) => setForm(p => ({ ...p, isDownloadable: val }))} label="Downloadable" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">URL</label>
                <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-mono font-bold text-sm" placeholder="https://..." />
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-black/5 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-6 py-3 bg-white border border-black/10 text-zinc-700 rounded-xl font-bold text-sm hover:bg-zinc-50">Cancel</button>
              <button onClick={handleUpload} disabled={saving} className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black disabled:opacity-50 flex items-center gap-2 shadow-lg">
                <UploadSimple size={18} weight="bold" /> {saving ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ZoomTab({ round, onRefresh }: { round: RoundDetail; onRefresh: () => void }) {
  const [form, setForm] = useState({
    zoomMeetingId: round.zoomMeetingId || "",
    zoomJoinUrl: round.zoomJoinUrl || "",
    zoomStartUrl: round.zoomStartUrl || "",
  });
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateRoundZoom(round.id, {
        zoomMeetingId: form.zoomMeetingId || null,
        zoomJoinUrl: form.zoomJoinUrl || null,
        zoomStartUrl: form.zoomStartUrl || null,
      } as any);
      toast("Zoom configuration saved", "success");
      onRefresh();
    } catch (e: any) {
      toast(e.message || "Failed to save Zoom config", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateRoundZoom(round.id);
      setForm({
        zoomMeetingId: res.zoomMeetingId || "",
        zoomJoinUrl: res.zoomJoinUrl || "",
        zoomStartUrl: res.zoomStartUrl || "",
      });
      toast("Zoom meeting generated successfully!", "success");
      onRefresh();
    } catch (e: any) {
      toast(e.message || "Failed to generate Zoom meeting", "error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-black/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
          <Video size={24} weight="fill" className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-zinc-900">Zoom Meeting Configuration</h2>
          <p className="text-sm text-zinc-500">Configure or dynamically generate a Zoom meeting for this round.</p>
        </div>
      </div>
      <div className="space-y-4 max-w-lg">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Meeting ID</label>
          <input value={form.zoomMeetingId} onChange={e => setForm(p => ({ ...p, zoomMeetingId: e.target.value }))}
            className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-mono font-bold" placeholder="123 456 7890" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Join URL</label>
          <input value={form.zoomJoinUrl} onChange={e => setForm(p => ({ ...p, zoomJoinUrl: e.target.value }))}
            className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-mono font-bold text-sm" placeholder="https://zoom.us/j/..." />
          {form.zoomJoinUrl && (
            <a href={form.zoomJoinUrl} target="_blank" rel="noopener noreferrer"
              className="text-brand text-xs font-bold hover:underline mt-1 inline-flex items-center gap-1">
              <LinkIcon size={12} weight="bold" /> Open Join URL
            </a>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Start URL (Host)</label>
          <input value={form.zoomStartUrl} onChange={e => setForm(p => ({ ...p, zoomStartUrl: e.target.value }))}
            className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-mono font-bold text-sm" placeholder="https://zoom.us/s/..." />
          {form.zoomStartUrl && (
            <a href={form.zoomStartUrl} target="_blank" rel="noopener noreferrer"
              className="text-amber-600 text-xs font-bold hover:underline mt-1 inline-flex items-center gap-1">
              <LinkIcon size={12} weight="bold" /> Open Start URL (Host)
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <button onClick={handleSave} disabled={saving || generating}
            className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black disabled:opacity-50 flex items-center gap-2 shadow-lg">
            <FloppyDisk size={18} weight="bold" /> {saving ? "Saving..." : "Save Zoom Config"}
          </button>
          <button onClick={handleGenerate} disabled={saving || generating}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-lg transition-all">
            <Video size={18} weight="bold" /> {generating ? "Generating..." : "Generate Dynamic Zoom Session"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentsTab({ round }: { round: RoundDetail }) {
  const students = round.students || [];
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [appDetails, setAppDetails] = useState<any>(null);
  const [loadingApp, setLoadingApp] = useState(false);
  const { toast } = useToast();

  const handleViewAnswers = async (appId: string) => {
    setSelectedApp(appId);
    setLoadingApp(true);
    try {
      const data = await getApplicationDetails(appId);
      setAppDetails(data);
    } catch {
      toast("Failed to load application answers", "error");
    } finally {
      setLoadingApp(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-black/5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-zinc-900">Enrolled Students</h2>
            <p className="text-sm text-zinc-500 mt-1">{students.length} student{students.length !== 1 ? 's' : ''} enrolled</p>
          </div>
          <span className="px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-full text-xs font-bold">{round.currentStudents} / {round.maxStudents}</span>
        </div>
      </div>
      {students.length === 0 ? (
        <div className="p-8 sm:p-12 text-center">
          <UsersThree size={48} weight="fill" className="text-zinc-200 mx-auto mb-4" />
          <p className="text-zinc-500 font-medium">No students enrolled in this round yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-black/5">
          {students.map((s) => (
            <div key={s.studentUserId} className="flex items-center justify-between p-4 sm:p-6 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-black text-zinc-600 shrink-0">
                  {s.studentName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-zinc-900 text-sm">{s.studentName}</div>
                  <div className="text-xs text-zinc-400">{s.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {s.applicationId && (
                  <button onClick={() => handleViewAnswers(s.applicationId!)}
                    className="p-2 hover:bg-zinc-100 text-zinc-600 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
                    title="View Application Answers">
                    <Eye size={16} weight="bold" />
                    <span>View Answers</span>
                  </button>
                )}
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                  {s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end transition-all">
          <div className="w-full max-w-xl h-full bg-white shadow-2xl p-6 sm:p-8 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-display font-black text-zinc-900">Screening Answer Sheet</h3>
                <p className="text-xs text-zinc-500 mt-1">Application ID: {selectedApp.substring(0, 8)}...</p>
              </div>
              <button onClick={() => { setSelectedApp(null); setAppDetails(null); }}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-600">
                <X size={20} weight="bold" />
              </button>
            </div>

            {loadingApp ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <div className="spinner mb-4" />
                <p className="text-sm font-bold text-zinc-400">Loading screening answers...</p>
              </div>
            ) : appDetails ? (
              <div className="space-y-6">
                <div className="bg-zinc-50 border border-black/5 rounded-[1.5rem] p-5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Application Score</div>
                    <div className="text-2xl font-black text-zinc-900">{appDetails.applicationScore ?? "N/A"} XP</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      appDetails.status === "Accepted" ? "bg-green-100 text-green-700" :
                      appDetails.status === "QuestionsPassed" ? "bg-blue-100 text-blue-700" :
                      "bg-zinc-100 text-zinc-600"
                    }`}>
                      {appDetails.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Questionnaire Breakdown</h4>
                  {appDetails.answers && appDetails.answers.length > 0 ? (
                    appDetails.answers.map((ans: any, idx: number) => (
                      <div key={ans.id} className="bg-white border border-black/5 rounded-2xl p-5 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="font-bold text-sm text-zinc-900">
                            <span className="text-zinc-400 font-mono mr-1.5">{idx + 1}.</span>
                            {ans.questionText}
                          </div>
                          {ans.isCorrect !== null && (
                            <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              ans.isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {ans.isCorrect ? "Correct" : "Incorrect"}
                            </span>
                          )}
                        </div>
                        <div className="bg-zinc-50 border border-black/5 rounded-xl p-3.5">
                          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">Student Response:</div>
                          <p className="text-sm font-medium text-zinc-800">{ans.answerText || <span className="italic text-zinc-400">Empty</span>}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-zinc-400 text-sm">No answers recorded.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-400 text-sm">Failed to retrieve answer details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RoomCommandCenter({ round, onRefresh }: { round: RoundDetail; onRefresh: () => void }) {
  const { toast } = useToast();
  const [savingStep, setSavingStep] = useState<string | null>(null);
  const [liveWeekId, setLiveWeekId] = useState<string | null>(
    round.weeks?.find(w => w.status === "Live")?.id ?? null
  );
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const students = round.students || [];
  const weeks = round.weeks || [];
  const materials = round.materials || [];

  const completedCount = weeks.filter(w => w.status === "Completed").length;
  const liveWeek = weeks.find(w => w.status === "Live");
  const scheduledCount = weeks.filter(w => w.status === "Scheduled").length;
  const progressPercent = weeks.length > 0 ? Math.round((completedCount / weeks.length) * 100) : 0;
  const capacityPercent = round.maxStudents > 0 ? Math.round((round.currentStudents / round.maxStudents) * 100) : 0;

  const handleSetStatus = async (weekId: string, status: string) => {
    setSavingStep(weekId);
    try {
      await updateCourseStep(weekId, { status });
      toast(`Session marked as ${status}`, "success");
      onRefresh();
      setLiveWeekId(status === "Live" ? weekId : null);
      if (status === "Live") {
        const week = weeks.find(w => w.id === weekId);
        notifyRoundStudents(round.id, "Live Session Started!", `"${week?.weekTitle || "Session"}" is now live. Join now!`).catch(() => {});
      }
    } catch {
      toast("Failed to update session status", "error");
    } finally {
      setSavingStep(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(label);
      setTimeout(() => setCopyFeedback(null), 2000);
    });
  };

  return (
    <div className="space-y-6">

      {/* Live Status Banner — Full Width Hero */}
      {liveWeek ? (
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black rounded-[2.5rem] p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute top-[-30%] right-[-10%] w-[400px] h-[400px] bg-brand/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-5%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px]" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-brand/20 flex items-center justify-center border border-brand/30 shrink-0 shadow-lg shadow-brand/10">
                <Broadcast size={32} weight="fill" className="text-brand animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="px-3 py-1 bg-brand/20 border border-brand/30 text-brand text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Live Broadcast</span>
                  <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight leading-[1.05] mb-1">{liveWeek.weekTitle}</h2>
                <p className="text-white/50 text-sm font-medium">Week {liveWeek.weekNumber} &middot; {liveWeek.sessionType} Session &middot; {liveWeek.durationMinutes || 90} min</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {round.zoomStartUrl ? (
                <a href={round.zoomStartUrl} target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-brand hover:bg-brand-hover text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2.5 shadow-lg shadow-brand/30 active:scale-95">
                  <Video size={18} weight="fill" /> Start Zoom (Host)
                </a>
              ) : liveWeek.sessionLink ? (
                <a href={liveWeek.sessionLink} target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-brand hover:bg-brand-hover text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2.5 shadow-lg shadow-brand/30 active:scale-95">
                  <Video size={18} weight="fill" /> Join Session
                </a>
              ) : (
                <div className="px-6 py-3.5 bg-white/10 border border-white/10 rounded-2xl text-white/40 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Question size={16} weight="bold" /> No Link Configured
                </div>
              )}
              <button onClick={() => handleSetStatus(liveWeek.id, "Completed")} disabled={savingStep === liveWeek.id}
                className="px-6 py-3.5 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2.5 active:scale-95 disabled:opacity-50">
                <Stop size={16} weight="fill" /> End Session
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-black/5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-black/5 flex items-center justify-center shrink-0">
              <Broadcast size={28} weight="duotone" className="text-zinc-300" />
            </div>
            <div>
              <div className="text-lg font-black text-zinc-900 leading-none mb-0.5">Command Center — Standby</div>
              <p className="text-sm font-bold text-zinc-400">No active session. Select a session below to go live.</p>
            </div>
          </div>
          {weeks.find(w => w.status === "Scheduled") && (
            <button onClick={() => handleSetStatus(weeks.find(w => w.status === "Scheduled")!.id, "Live")} disabled={!!savingStep}
              className="px-6 py-3.5 bg-zinc-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2.5 shadow-lg active:scale-95 disabled:opacity-50 shrink-0">
              <Play size={16} weight="fill" /> Start Next Session
            </button>
          )}
        </div>
      )}

      {/* Bento Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[2rem] p-5 sm:p-6 border border-black/5 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-zinc-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Capacity</span>
            <span className={`text-xs font-black ${capacityPercent >= 90 ? "text-brand" : "text-emerald-600"}`}>{capacityPercent}%</span>
          </div>
          <div className="text-3xl font-display font-black text-zinc-900 leading-none mb-2">{round.currentStudents}<span className="text-lg font-bold text-zinc-400">/{round.maxStudents}</span></div>
          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${capacityPercent >= 90 ? "bg-brand" : "bg-emerald-500"}`} style={{ width: `${capacityPercent}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 sm:p-6 border border-black/5 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-zinc-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Course Progress</span>
            <span className="text-xs font-black text-zinc-900">{progressPercent}%</span>
          </div>
          <div className="text-3xl font-display font-black text-zinc-900 leading-none mb-2">{completedCount}<span className="text-lg font-bold text-zinc-400">/{weeks.length}</span></div>
          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-zinc-900 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 sm:p-6 border border-black/5 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-zinc-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Materials</span>
            <FilePdf size={16} weight="bold" className="text-brand" />
          </div>
          <div className="text-3xl font-display font-black text-zinc-900 leading-none mb-1">{materials.length}</div>
          <div className="text-xs font-bold text-zinc-400">learning assets uploaded</div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 sm:p-6 border border-black/5 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-zinc-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Sessions Left</span>
            <CalendarBlank size={16} weight="bold" className="text-blue-500" />
          </div>
          <div className="text-3xl font-display font-black text-zinc-900 leading-none mb-1">{scheduledCount}</div>
          <div className="text-xs font-bold text-zinc-400">upcoming scheduled</div>
        </div>
      </div>

      {/* Main 3-Column Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Session Timeline (8 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-black/5 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-black/5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-black text-zinc-900 leading-none mb-1">Session Timeline</h2>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{weeks.length} total &middot; {completedCount} completed &middot; {liveWeek ? "1 live" : `${scheduledCount} upcoming`}</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setExpandedSession(expandedSession === "all" ? null : "all")}
                className={`p-2 rounded-xl transition-colors ${expandedSession === "all" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"}`}
                title="Toggle all details"
              >
                <ListBullets size={18} weight="bold" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-black/5 max-h-[600px] overflow-y-auto">
            {weeks.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 text-sm font-medium">No sessions yet. Create your first session to begin.</div>
            ) : weeks.map((week) => {
              const isExpanded = expandedSession === week.id || expandedSession === "all";
              return (
                <div
                  key={week.id}
                  className={`transition-all duration-200 cursor-pointer ${week.status === "Live" ? "bg-gradient-to-r from-brand/5 to-transparent" : "hover:bg-zinc-50"}`}
                  onClick={() => setExpandedSession(isExpanded ? null : week.id)}
                >
                  <div className="p-4 sm:p-5 lg:p-6">
                    <div className="flex items-center gap-4">
                      {/* Week Number Badge */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-sm font-black border-2 transition-all ${
                        week.status === "Live" ? "bg-brand border-brand text-white shadow-lg shadow-brand/30" :
                        week.status === "Completed" ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                        week.status === "Cancelled" ? "bg-zinc-100 border-zinc-200 text-zinc-300" :
                        "bg-zinc-50 border-zinc-200 text-zinc-500"
                      }`}>
                        {week.status === "Live" ? <Broadcast size={20} weight="fill" /> :
                         week.status === "Completed" ? <CheckCircle size={20} weight="fill" /> :
                         week.weekNumber}
                      </div>

                      {/* Session Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-black text-sm text-zinc-900 truncate">{week.weekTitle}</span>
                          <CaretDown size={14} weight="bold" className={`text-zinc-400 transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          <span>{week.sessionType}</span>
                          <span>&middot;</span>
                          <span>{week.durationMinutes || 90} min</span>
                          {week.sessionLink && <span>&middot;</span>}
                          {week.sessionLink && <LinkIcon size={10} weight="bold" className="text-brand" />}
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`hidden lg:inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          week.status === "Live" ? "bg-brand/10 text-brand" :
                          week.status === "Completed" ? "bg-emerald-50 text-emerald-700" :
                          week.status === "Cancelled" ? "bg-zinc-100 text-zinc-400" :
                          "bg-blue-50 text-blue-600"
                        }`}>{week.status}</span>

                        {week.status === "Scheduled" && (
                          <button onClick={(e) => { e.stopPropagation(); handleSetStatus(week.id, "Live"); }} disabled={!!savingStep || !!liveWeek}
                            className="px-3.5 py-2 bg-brand hover:bg-red-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-40 active:scale-95 shadow-sm">
                            {savingStep === week.id ? "..." : "Go Live"}
                          </button>
                        )}
                        {week.status === "Live" && (
                          <button onClick={(e) => { e.stopPropagation(); handleSetStatus(week.id, "Completed"); }} disabled={savingStep === week.id}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95 shadow-sm">
                            {savingStep === week.id ? "..." : "Complete"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 ml-16 pl-4 border-l-2 border-black/5 space-y-3 animate-fade">
                        {week.sessionLink && (
                          <div className="flex items-center gap-2">
                            <LinkIcon size={14} weight="bold" className="text-brand shrink-0" />
                            <a href={week.sessionLink} target="_blank" rel="noopener noreferrer"
                              className="text-xs font-bold text-zinc-600 hover:text-brand truncate"
                              onClick={(e) => e.stopPropagation()}>
                              {week.sessionLink}
                            </a>
                          </div>
                        )}
                        {week.recordingUrl && (
                          <div className="flex items-center gap-2">
                            <MonitorPlay size={14} weight="fill" className="text-emerald-500 shrink-0" />
                            <a href={week.recordingUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs font-bold text-zinc-600 hover:text-emerald-600 truncate"
                              onClick={(e) => e.stopPropagation()}>
                              Recording: {week.recordingUrl}
                            </a>
                          </div>
                        )}
                        {!week.sessionLink && !week.recordingUrl && (
                          <p className="text-xs text-zinc-400 italic">No links configured for this session.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* Zoom Quick-Launch Card */}
          <div className="bg-white rounded-[2.5rem] p-6 border border-black/5 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Video size={22} weight="fill" className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-900 leading-none mb-0.5">Zoom Quick-Launch</h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Start or join the live meeting</p>
              </div>
            </div>
            {round.zoomMeetingId ? (
              <div className="space-y-3">
                <div className="bg-zinc-50 border border-black/5 rounded-2xl p-4 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Meeting ID</div>
                    <span className="font-mono font-bold text-sm text-zinc-900 tracking-wider">{round.zoomMeetingId}</span>
                  </div>
                  <button onClick={() => copyToClipboard(round.zoomMeetingId!, "ID")}
                    className="w-9 h-9 rounded-xl hover:bg-zinc-200 transition-colors text-zinc-400 hover:text-zinc-700 flex items-center justify-center">
                    {copyFeedback === "ID" ? <CheckCircle size={18} weight="fill" className="text-emerald-500" /> : <CopyIcon size={18} />}
                  </button>
                </div>
                <div className="flex gap-2">
                  {round.zoomJoinUrl && (
                    <a href={round.zoomJoinUrl} target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-blue-600/20">
                      <Video size={16} weight="fill" /> Join as Guest
                    </a>
                  )}
                  <button onClick={() => copyToClipboard(round.zoomJoinUrl || round.zoomStartUrl || "", "URL")}
                    className="w-11 h-11 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-2xl transition-colors border border-black/5 flex items-center justify-center">
                    <LinkIcon size={16} weight="bold" />
                  </button>
                </div>
                {round.zoomStartUrl && (
                  <a href={round.zoomStartUrl} target="_blank" rel="noopener noreferrer"
                    className="w-full py-3 bg-zinc-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg">
                    <Microphone size={16} weight="fill" /> Start as Host
                  </a>
                )}
              </div>
            ) : (
              <div className="py-5 text-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mx-auto mb-3 border border-black/5">
                  <Video size={28} weight="duotone" className="text-zinc-300" />
                </div>
                <p className="text-sm font-bold text-zinc-400 mb-1">No Zoom Configured</p>
                <p className="text-[10px] text-zinc-400 font-medium">Set up Zoom in the Zoom tab or generate dynamically.</p>
              </div>
            )}
          </div>

          {/* Student Roster Card */}
          <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-black/5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-zinc-900 leading-none mb-0.5">Student Roster</h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{students.length} enrolled</p>
              </div>
              <div className="flex -space-x-2">
                {students.slice(0, 5).map((s, i) => (
                  <div key={s.studentUserId} title={s.studentName}
                    className="w-8 h-8 rounded-full bg-zinc-200 border-2 border-white flex items-center justify-center text-[10px] font-black text-zinc-600 shrink-0"
                    style={{ zIndex: 5 - i }}>
                    {s.studentName.charAt(0).toUpperCase()}
                  </div>
                ))}
                {students.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-brand border-2 border-white flex items-center justify-center text-[9px] font-black text-white shrink-0">
                    +{students.length - 5}
                  </div>
                )}
              </div>
            </div>
            <div className={`overflow-y-auto ${showAllStudents ? "max-h-[400px]" : "max-h-[240px]"}`}>
              {students.length === 0 ? (
                <div className="p-8 text-center text-sm font-bold text-zinc-400">No students enrolled yet.</div>
              ) : students.map((s, i) => (
                <div key={s.studentUserId} className={`flex items-center gap-3 px-5 sm:px-6 py-3.5 hover:bg-zinc-50 transition-colors border-b border-black/5 last:border-b-0 ${i < 3 ? "bg-gradient-to-r from-brand/[0.02] to-transparent" : ""}`}>
                  <div className="w-9 h-9 rounded-2xl bg-zinc-100 flex items-center justify-center text-xs font-black text-zinc-600 shrink-0">
                    {s.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-zinc-900 truncate leading-none">{s.studentName}</div>
                    <div className="text-[10px] font-bold text-zinc-400 truncate">{s.email}</div>
                  </div>
                  <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest shrink-0">
                    {s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                  </div>
                </div>
              ))}
            </div>
            {students.length > 5 && (
              <button onClick={() => setShowAllStudents(!showAllStudents)}
                className="p-3.5 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 border-t border-black/5 transition-colors">
                {showAllStudents ? "Show Less" : `View All ${students.length} Students`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Materials Quick-View Grid */}
      {materials.length > 0 && (
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-black/5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-display font-black text-zinc-900">Course Materials</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{materials.length} assets available</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {materials.map((m) => (
              <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-zinc-50 hover:bg-brand-hover rounded-2xl border border-black/5 hover:border-black/10 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-black/5 flex items-center justify-center shrink-0">
                  {m.materialType === "Video" ? <MonitorPlay size={18} weight="fill" className="text-blue-500" />
                    : m.materialType === "Link" ? <LinkIcon size={18} weight="fill" className="text-brand" />
                    : <FilePdf size={18} weight="fill" className="text-[#EF4444]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-zinc-900 truncate leading-none mb-0.5">{m.title}</div>
                  <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{m.materialType}</div>
                </div>
                <DownloadSimple size={14} weight="bold" className="text-zinc-300 group-hover:text-zinc-600 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CopyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TasksTab({ round, onRefresh }: { round: RoundDetail; onRefresh: () => void }) {
  const [subTab, setSubTab] = useState<"tasks" | "quizzes">("tasks");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState<string | null>(null);

  const [taskForm, setTaskForm] = useState({
    title: "", description: "", instructions: "",
    taskType: "Code", submissionType: "Link", maxScore: 100, xpReward: 500
  });

  const [quizForm, setQuizForm] = useState({
    title: "", quizType: "Formative", timeLimitMinutes: 30, maxAttempts: 2,
    passScore: 70, xpReward: 400, isPublished: true
  });

  const [questionForm, setQuestionForm] = useState({
    questionText: "", questionType: "Mcq", points: 10, explanation: "", sortOrder: 1,
    options: [
      { optionText: "", isCorrect: true, sortOrder: 1 },
      { optionText: "", isCorrect: false, sortOrder: 2 },
    ]
  });

  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleCreateTask = async () => {
    if (!taskForm.title) { toast("Task title is required", "error"); return; }
    setSaving(true);
    try {
      await createAdminTask({
        courseRoundId: round.id, dueHoursAfterSession: 72, rubricJson: "{}", ...taskForm
      });
      toast("Task created successfully", "success");
      setShowTaskForm(false);
      setTaskForm({
        title: "", description: "", instructions: "",
        taskType: "Code", submissionType: "Link", maxScore: 100, xpReward: 500
      });
      onRefresh();
    } catch (e: any) {
      toast(e.message || "Failed to create task", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (!quizForm.title) { toast("Quiz title is required", "error"); return; }
    setSaving(true);
    try {
      await createAdminQuiz({ courseRoundId: round.id, ...quizForm });
      toast("Quiz created successfully", "success");
      setShowQuizForm(false);
      setQuizForm({
        title: "", quizType: "Formative", timeLimitMinutes: 30, maxAttempts: 2,
        passScore: 70, xpReward: 400, isPublished: true
      });
      onRefresh();
    } catch (e: any) {
      toast(e.message || "Failed to create quiz", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!questionForm.questionText) { toast("Question text is required", "error"); return; }
    if (!showQuestionForm) return;
    setSaving(true);
    try {
      await addAdminQuizQuestion({ quizId: showQuestionForm, ...questionForm });
      toast("Question added successfully", "success");
      setShowQuestionForm(null);
      setQuestionForm({
        questionText: "", questionType: "Mcq", points: 10, explanation: "", sortOrder: 1,
        options: [{ optionText: "", isCorrect: true, sortOrder: 1 }, { optionText: "", isCorrect: false, sortOrder: 2 }]
      });
      onRefresh();
    } catch (e: any) {
      toast(e.message || "Failed to add question", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddOption = () => {
    setQuestionForm({
      ...questionForm,
      options: [...questionForm.options, { optionText: "", isCorrect: false, sortOrder: questionForm.options.length + 1 }]
    });
  };

  const handleRemoveOption = (index: number) => {
    const nextOptions = questionForm.options.filter((_, i) => i !== index).map((opt, i) => ({ ...opt, sortOrder: i + 1 }));
    setQuestionForm({ ...questionForm, options: nextOptions });
  };

  const tasks = round.tasks || [];
  const quizzes = round.quizzes || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-4 shadow-sm border border-black/5">
        <div className="flex gap-2">
          <button onClick={() => setSubTab("tasks")}
            className={`px-5 py-2 rounded-2xl font-bold text-xs transition-all ${subTab === "tasks" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-50"}`}>
            Tasks & Projects ({tasks.length})
          </button>
          <button onClick={() => setSubTab("quizzes")}
            className={`px-5 py-2 rounded-2xl font-bold text-xs transition-all ${subTab === "quizzes" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-50"}`}>
            Quizzes ({quizzes.length})
          </button>
        </div>
        <button onClick={() => subTab === "tasks" ? setShowTaskForm(true) : setShowQuizForm(true)}
          className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2">
          <Plus size={16} weight="bold" />
          <span>Create {subTab === "tasks" ? "Task" : "Quiz"}</span>
        </button>
      </div>

      {subTab === "tasks" ? (
        tasks.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border border-black/5 shadow-sm">
            <ClipboardText size={48} weight="fill" className="text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">No learning tasks created for this round yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tasks.map((t) => (
              <div key={t.id} className="bg-white rounded-[2.5rem] p-6 border border-black/5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-zinc-100 text-zinc-800 rounded-full text-[10px] font-black uppercase tracking-wider">{t.taskType}</span>
                    <span className="text-xs font-bold text-zinc-400"><Target size={14} weight="fill" className="inline mr-1 text-brand" />{t.xpReward} XP</span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">{t.title}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-3 mb-6">{t.description}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-black/5">
                  <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{t.submissionType} submission</div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-bold text-zinc-700">{t.maxScore} pts max</div>
                    <button onClick={async () => {
                      if (!window.confirm(`Delete task "${t.title}"?`)) return;
                      try {
                        await deleteLearningTask(t.id);
                        toast("Task deleted", "success");
                        onRefresh();
                      } catch {
                        toast("Failed to delete task", "error");
                      }
                    }} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-lg transition-colors" title="Delete task">
                      <X size={12} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        quizzes.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border border-black/5 shadow-sm">
            <GameController size={48} weight="fill" className="text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">No interactive quizzes created for this round yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map((q) => (
              <div key={q.id} className="bg-white rounded-[2.5rem] p-6 border border-black/5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-zinc-100 text-zinc-800 rounded-full text-[10px] font-black uppercase tracking-wider">{q.quizType}</span>
                    <span className="text-xs font-bold text-zinc-400"><Flag size={14} weight="fill" className="inline mr-1 text-brand" />{q.xpReward} XP</span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">{q.title}</h3>
                  <div className="space-y-2 text-sm text-zinc-500 mb-6">
                    <div className="flex items-center gap-2"><Clock size={16} /> <span>{q.timeLimitMinutes} Minutes Limit</span></div>
                    <div className="flex items-center gap-2"><Certificate size={16} /> <span>Passing: {q.passScore}%</span></div>
                    <div className="flex items-center gap-2"><UsersThree size={16} /> <span>Attempts: {q.maxAttempts} max</span></div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-black/5 gap-3">
                  <span className="text-xs font-bold text-zinc-600">{q.questionsCount || 0} Questions</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowQuestionForm(q.id)}
                      className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5">
                      <Plus size={14} weight="bold" />
                      <span>Add Question</span>
                    </button>
                    <button onClick={async () => {
                      if (!window.confirm(`Delete quiz "${q.title}"?`)) return;
                      try {
                        await deleteQuiz(q.id);
                        toast("Quiz deleted", "success");
                        onRefresh();
                      } catch {
                        toast("Failed to delete quiz", "error");
                      }
                    }} className="p-2 bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-xl transition-colors" title="Delete quiz">
                      <X size={14} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {showTaskForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <h3 className="text-xl font-display font-black text-zinc-900">Create New Round Task</h3>
              <button onClick={() => setShowTaskForm(false)} className="p-2 hover:bg-zinc-50 rounded-full text-zinc-400 hover:text-zinc-600"><X size={20} weight="bold" /></button>
            </div>
            <div className="space-y-4 text-xs font-bold text-zinc-700">
              <div className="space-y-1.5">
                <label>Task Title</label>
                <input type="text" placeholder="e.g. Building our First Responsive Layout"
                  value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label>Task Type</label>
                  <select value={taskForm.taskType} onChange={(e) => setTaskForm({ ...taskForm, taskType: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all cursor-pointer">
                    <option value="Code">Coding Task</option>
                    <option value="Design">Design Task</option>
                    <option value="Reflection">Reflection Task</option>
                    <option value="Project">Milestone Project</option>
                    <option value="Research">Research</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label>Submission Format</label>
                  <select value={taskForm.submissionType} onChange={(e) => setTaskForm({ ...taskForm, submissionType: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all cursor-pointer">
                    <option value="Link">GitHub or URL Link</option>
                    <option value="File">Document/Zip Upload</option>
                    <option value="Text">Rich Text Answer</option>
                    <option value="Image">Image Upload</option>
                    <option value="Repository">Code Repository</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label>Brief Description</label>
                <textarea rows={2} placeholder="Summarize the core goal of the task..."
                  value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all resize-none" />
              </div>
              <div className="space-y-1.5">
                <label>Detailed Steps / Instructions</label>
                <textarea rows={4} placeholder="Provide step-by-step learning tasks instructions..."
                  value={taskForm.instructions} onChange={(e) => setTaskForm({ ...taskForm, instructions: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label>Max Score (Points)</label>
                  <input type="number" value={taskForm.maxScore} onChange={(e) => setTaskForm({ ...taskForm, maxScore: parseInt(e.target.value) || 100 })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label>XP Reward amount</label>
                  <input type="number" value={taskForm.xpReward} onChange={(e) => setTaskForm({ ...taskForm, xpReward: parseInt(e.target.value) || 100 })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" />
                </div>
              </div>
            </div>
            <button onClick={handleCreateTask} disabled={saving}
              className="w-full bg-zinc-950 hover:bg-black text-white py-3 rounded-2xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? "Creating..." : "Publish Learning Task"}
            </button>
          </div>
        </div>
      )}

      {showQuizForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <h3 className="text-xl font-display font-black text-zinc-900">Create Interactive Quiz</h3>
              <button onClick={() => setShowQuizForm(false)} className="p-2 hover:bg-zinc-50 rounded-full text-zinc-400 hover:text-zinc-600"><X size={20} weight="bold" /></button>
            </div>
            <div className="space-y-4 text-xs font-bold text-zinc-700">
              <div className="space-y-1.5">
                <label>Quiz Title</label>
                <input type="text" placeholder="e.g. Master C++ Pointers and Memory"
                  value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label>Quiz Category Type</label>
                  <select value={quizForm.quizType} onChange={(e) => setQuizForm({ ...quizForm, quizType: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all cursor-pointer">
                    <option value="Formative">Formative Challenge</option>
                    <option value="MidCourse">Mid-Course Assessment</option>
                    <option value="FinalExam">Final Examination</option>
                    <option value="LiveChallenge">Live Session Quiz</option>
                    <option value="Bonus">Bonus Quiz</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label>Time Limit (Minutes)</label>
                  <input type="number" value={quizForm.timeLimitMinutes} onChange={(e) => setQuizForm({ ...quizForm, timeLimitMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label>Max Attempts</label>
                  <input type="number" value={quizForm.maxAttempts} onChange={(e) => setQuizForm({ ...quizForm, maxAttempts: parseInt(e.target.value) || 2 })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label>Passing Score (%)</label>
                  <input type="number" value={quizForm.passScore} onChange={(e) => setQuizForm({ ...quizForm, passScore: parseInt(e.target.value) || 70 })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label>XP Reward</label>
                  <input type="number" value={quizForm.xpReward} onChange={(e) => setQuizForm({ ...quizForm, xpReward: parseInt(e.target.value) || 100 })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" />
                </div>
              </div>
            </div>
            <button onClick={handleCreateQuiz} disabled={saving}
              className="w-full bg-zinc-950 hover:bg-black text-white py-3 rounded-2xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? "Creating..." : "Save and Set Up Questions"}
            </button>
          </div>
        </div>
      )}

      {showQuestionForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <div>
                <h3 className="text-xl font-display font-black text-zinc-900">Add Quiz Question</h3>
                <p className="text-xs text-zinc-500 mt-1">Quiz ID: {showQuestionForm.substring(0, 8)}...</p>
              </div>
              <button onClick={() => setShowQuestionForm(null)} className="p-2 hover:bg-zinc-50 rounded-full text-zinc-400 hover:text-zinc-600"><X size={20} weight="bold" /></button>
            </div>
            <div className="space-y-4 text-xs font-bold text-zinc-700">
              <div className="space-y-1.5">
                <label>Question text or Prompt</label>
                <textarea rows={2} placeholder="e.g. What is the output of 'cout << &ptr;' if ptr is an int pointers?"
                  value={questionForm.questionText} onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label>Question Type</label>
                  <select value={questionForm.questionType} onChange={(e) => setQuestionForm({ ...questionForm, questionType: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all cursor-pointer">
                    <option value="Mcq">Multiple Choice (Single Correct)</option>
                    <option value="TrueFalse">True or False</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label>Points</label>
                  <input type="number" value={questionForm.points} onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 10 })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label>Interactive Options Choices</label>
                  {questionForm.questionType === "Mcq" && (
                    <button onClick={handleAddOption}
                      className="text-brand hover:underline text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Plus size={12} weight="bold" /> Add Option
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {questionForm.options.map((opt, index) => (
                    <div key={index} className="flex items-center gap-3 bg-zinc-50 border border-black/5 p-3 rounded-2xl">
                      <input type="radio" name="correct-option" checked={opt.isCorrect}
                        onChange={() => {
                          const nextOpts = questionForm.options.map((o, idx) => ({ ...o, isCorrect: idx === index }));
                          setQuestionForm({ ...questionForm, options: nextOpts });
                        }}
                        className="cursor-pointer text-zinc-950 focus:ring-zinc-950" />
                      <input type="text" placeholder={`Option #${index + 1}`} value={opt.optionText}
                        onChange={(e) => {
                          const nextOpts = [...questionForm.options];
                          nextOpts[index].optionText = e.target.value;
                          setQuestionForm({ ...questionForm, options: nextOpts });
                        }}
                        className="flex-1 bg-transparent border-none p-0 text-sm font-medium outline-none" />
                      {questionForm.options.length > 2 && (
                        <button onClick={() => handleRemoveOption(index)}
                          className="p-1 hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600 rounded-lg transition-all">
                          <X size={14} weight="bold" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label>Explanation (Optional)</label>
                <textarea rows={2} placeholder="Explain why this choice is correct..."
                  value={questionForm.explanation} onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-black/5 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all resize-none" />
              </div>
            </div>
            <button onClick={handleAddQuestion} disabled={saving}
              className="w-full bg-zinc-950 hover:bg-black text-white py-3 rounded-2xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? "Adding..." : "Add to Quiz Questionnaire"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
