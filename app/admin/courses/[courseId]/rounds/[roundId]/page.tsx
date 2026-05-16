"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAdminRound, updateRound, updateRoundZoom, uploadCourseMaterial, updateCourseStep } from "@/lib/api";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import {
  ArrowLeft, UsersThree, CalendarBlank, Certificate, Video,
  FilePdf, DownloadSimple, PencilSimple, X, FloppyDisk,
  CheckCircle, Clock, MonitorPlay, Link as LinkIcon,
  Microphone, Chalkboard, Gear, UploadSimple, Student,
  ChatsCircle, Terminal, Cpu
} from "@phosphor-icons/react";

type RoundDetail = {
  id: string;
  courseId: string;
  courseTitle: string;
  name: string;
  slug: string;
  status: string;
  startDate: string;
  maxStudents: number;
  currentStudents: number;
  isEnrollmentOpen: boolean;
  autoAcceptPaidApplications: boolean;
  requireEngineerApproval: boolean;
  zoomMeetingId?: string;
  zoomJoinUrl?: string;
  zoomStartUrl?: string;
  instructorName?: string;
  weeks: WeekItem[];
  materials: MaterialItem[];
  students: StudentItem[];
};

type WeekItem = {
  id: string;
  weekNumber: number;
  weekTitle: string;
  sessionType: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  sessionLink?: string;
  recordingUrl?: string;
};

type MaterialItem = {
  id: string;
  title: string;
  materialType: string;
  url: string;
  isDownloadable: boolean;
  isPublished: boolean;
};

type StudentItem = {
  studentUserId: string;
  studentName: string;
  email: string;
  enrolledAt: string;
};

type Tab = "overview" | "sessions" | "materials" | "zoom" | "students" | "room";

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "overview", label: "Overview", icon: Cpu },
  { key: "sessions", label: "Sessions", icon: MonitorPlay },
  { key: "materials", label: "Materials", icon: FilePdf },
  { key: "zoom", label: "Zoom", icon: Video },
  { key: "students", label: "Students", icon: UsersThree },
  { key: "room", label: "Room", icon: Chalkboard },
];

export default function RoundRoomPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const roundId = params.roundId as string;
  const [round, setRound] = useState<RoundDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminRound(roundId);
      setRound(data);
    } catch {
      toast("Failed to load round data", "error");
    } finally {
      setLoading(false);
    }
  }, [roundId, toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!round) return <div className="p-12 text-center text-zinc-500 font-medium">Round not found.</div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <Link href={`/admin/courses/${courseId}`} className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
            <ArrowLeft size={14} weight="bold" /> Back to {round.courseTitle}
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-1">{round.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 font-medium">
            <span>{round.courseTitle}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-300" />
            <span className="flex items-center gap-1"><CalendarBlank size={14} weight="bold" /> {round.startDate ? new Date(round.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-300" />
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              round.status === "Active" ? "bg-blue-100 text-blue-700" :
              round.status === "Upcoming" ? "bg-brand-hover text-zinc-800" :
              "bg-zinc-100 text-zinc-500"
            }`}>{round.status}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-8 overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === key
                ? "bg-zinc-900 text-white shadow-lg"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            <Icon size={16} weight={activeTab === key ? "fill" : "bold"} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <OverviewTab round={round} onRefresh={load} />}
      {activeTab === "sessions" && <SessionsTab round={round} onRefresh={load} />}
      {activeTab === "materials" && <MaterialsTab round={round} onRefresh={load} />}
      {activeTab === "zoom" && <ZoomTab round={round} onRefresh={load} />}
      {activeTab === "students" && <StudentsTab round={round} />}
      {activeTab === "room" && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-hover flex items-center justify-center">
              <Chalkboard size={24} weight="fill" className="text-brand" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-zinc-900">Course Room Experience</h2>
              <p className="text-sm text-zinc-500">This room uses the course&apos;s shared components.</p>
            </div>
          </div>
          <iframe
            src={`/room/${round.courseId}`}
            className="w-full h-[600px] rounded-2xl border border-black/5 bg-zinc-50"
            title="Course Room"
          />
        </div>
      )}
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
            <div className="flex flex-col gap-3">
              {[
                { key: "isEnrollmentOpen" as const, label: "Enrollment Open" },
                { key: "requireEngineerApproval" as const, label: "Require Engineer Approval" },
                { key: "autoAcceptPaidApplications" as const, label: "Auto-Accept Paid Applications" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${form[key] ? 'bg-green-500' : 'bg-zinc-300'}`}>
                    <input type="checkbox" className="hidden" checked={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))} />
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form[key] ? 'left-7' : 'left-1'}`} />
                  </div>
                  <span className="font-bold text-sm text-zinc-900">{label}</span>
                </label>
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
  const [editForm, setEditForm] = useState({ status: "", sessionLink: "", recordingUrl: "", weekNumber: 0 });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const startEdit = (week: WeekItem) => {
    setEditingId(week.id);
    setEditForm({
      status: week.status,
      sessionLink: week.sessionLink || "",
      recordingUrl: week.recordingUrl || "",
      weekNumber: week.weekNumber,
    });
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      await updateCourseStep(id, {
        status: editForm.status,
        sessionLink: editForm.sessionLink || null,
        recordingUrl: editForm.recordingUrl || null,
        weekNumber: editForm.weekNumber,
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

  const weeks = round.weeks || [];

  if (weeks.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-black/5 text-center">
        <MonitorPlay size={48} weight="fill" className="text-zinc-200 mx-auto mb-4" />
        <p className="text-zinc-500 font-medium">No sessions created yet for this round.</p>
      </div>
    );
  }

  return (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <span className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
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
                <button onClick={() => startEdit(week)} className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl transition-colors shrink-0">
                  <PencilSimple size={14} weight="bold" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
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
        title: form.title,
        materialType: form.materialType,
        url: form.url,
        isDownloadable: form.isDownloadable,
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
              <a href={m.url} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-2">
                <DownloadSimple size={14} weight="bold" /> Open
              </a>
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
                    <option value="Image">Image</option>
                    <option value="File">File</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pt-5">
                    <input type="checkbox" checked={form.isDownloadable} onChange={e => setForm(p => ({ ...p, isDownloadable: e.target.checked }))}
                      className="w-5 h-5 rounded accent-black" />
                    <span className="font-bold text-sm text-zinc-900">Downloadable</span>
                  </label>
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

  return (
    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-black/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
          <Video size={24} weight="fill" className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-zinc-900">Zoom Meeting Configuration</h2>
          <p className="text-sm text-zinc-500">Configure the Zoom meeting for all sessions in this round.</p>
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
          {round.zoomJoinUrl && (
            <a href={round.zoomJoinUrl} target="_blank" rel="noopener noreferrer"
              className="text-brand text-xs font-bold hover:underline mt-1 inline-flex items-center gap-1">
              <LinkIcon size={12} weight="bold" /> Open Join URL
            </a>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Start URL (Host)</label>
          <input value={form.zoomStartUrl} onChange={e => setForm(p => ({ ...p, zoomStartUrl: e.target.value }))}
            className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-mono font-bold text-sm" placeholder="https://zoom.us/s/..." />
          {round.zoomStartUrl && (
            <a href={round.zoomStartUrl} target="_blank" rel="noopener noreferrer"
              className="text-amber-600 text-xs font-bold hover:underline mt-1 inline-flex items-center gap-1">
              <LinkIcon size={12} weight="bold" /> Open Start URL (Host)
            </a>
          )}
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black disabled:opacity-50 flex items-center gap-2 shadow-lg mt-4">
          <FloppyDisk size={18} weight="bold" /> {saving ? "Saving..." : "Save Zoom Config"}
        </button>
      </div>
    </div>
  );
}

function StudentsTab({ round }: { round: RoundDetail }) {
  const students = round.students || [];

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
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                {s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}