"use client";

import { useEffect, useState } from "react";
import { getAdminCourses, createAdminCourse, updateAdminCourse, deleteAdminCourse, getAdminQuestions, createAdminQuestion, deleteAdminQuestion, getAdminRounds, createAdminRound } from "@/lib/api";
import type { AdminCourse } from "@/lib/types";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import { PremiumSwitch } from "@/components/PremiumControls";
import { Folder, Plus, ArrowLeft, Trash, PencilSimple, X, FloppyDisk, CheckCircle, ArrowRight, MagnifyingGlass } from "@phosphor-icons/react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { CourseIcon } from "@/components/IconMapper";

type WizardStep = 1 | 2 | 3;

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [editing, setEditing] = useState<AdminCourse | null>(null);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPhase, setFilterPhase] = useState("all");
  const { toast } = useToast();

  const filteredCourses = courses.filter(c => {
    const q = searchQuery.toLowerCase();
    if (q && !c.title.toLowerCase().includes(q) && !c.slug.toLowerCase().includes(q) && !(c.subtitle || "").toLowerCase().includes(q)) return false;
    if (filterLevel !== "all" && c.level !== filterLevel) return false;
    if (filterStatus === "active" && !c.isActive) return false;
    if (filterStatus === "inactive" && c.isActive) return false;
    if (filterStatus === "archived" && !c.isDeleted) return false;
    if (filterStatus === "live" && c.isDeleted) return false;
    if (filterPhase !== "all" && c.phase.toString() !== filterPhase) return false;
    return true;
  });

  const activeCount = courses.filter(c => c.isActive && !c.isDeleted).length;
  const archivedCount = courses.filter(c => c.isDeleted).length;

  // Step 1: Course data
  const [form, setForm] = useState({
    title: "", slug: "", subtitle: "", description: "", shortDescription: "",
    outcome: "", priceEgp: 0, coverImageUrl: "", imageUrl: "", iconName: "", colorHex: "",
    level: "Beginner", phase: 1, isActive: true, isFeatured: false, isDeleted: false,
    coreSessions: 8, supportSessions: 4, sortOrder: 0,
    minimumAge: 8, maximumAge: 18
  });

  // Step 2: Questions
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState({
    questionText: "", questionType: "Mcq", optionsJson: "[]",
    isRequired: true, sortOrder: 0, correctAnswer: "", helpText: "", autoGrade: true,
  });
  const [mcqOptions, setMcqOptions] = useState<{ text: string; isCorrect: boolean }[]>([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ]);

  // Step 3: Round
  const [roundForm, setRoundForm] = useState({
    courseId: "", name: "", slug: "",
    startDate: new Date().toISOString().split('T')[0],
    maxStudents: 20, isEnrollmentOpen: true,
    autoAcceptPaidApplications: false, requireEngineerApproval: true,
  });

  useEffect(() => {
    getAdminCourses().then(setCourses).finally(() => setLoading(false));
  }, []);

  const resetWizard = () => {
    setStep(1);
    setCreatedCourseId(null);
    setForm({
      title: "", slug: "", subtitle: "", description: "", shortDescription: "",
      outcome: "", priceEgp: 0, coverImageUrl: "", imageUrl: "", iconName: "", colorHex: "",
      level: "Beginner", phase: 1, isActive: true, isFeatured: false, isDeleted: false,
      coreSessions: 8, supportSessions: 4, sortOrder: 0,
      minimumAge: 8, maximumAge: 18
    });
    setQuestions([]);
    setNewQuestion({ questionText: "", questionType: "Mcq", optionsJson: "[]", isRequired: true, sortOrder: 0, correctAnswer: "", helpText: "", autoGrade: true });
    setMcqOptions([{ text: "", isCorrect: true }, { text: "", isCorrect: false }]);
    setRoundForm({
      courseId: "", name: "", slug: "",
      startDate: new Date().toISOString().split('T')[0],
      maxStudents: 20, isEnrollmentOpen: true,
      autoAcceptPaidApplications: false, requireEngineerApproval: true,
    });
  };

  const openCreate = () => {
    setEditing(null);
    resetWizard();
    setShowWizard(true);
  };

  const openEdit = (course: AdminCourse) => {
    setEditing(course);
    setForm({
      title: course.title, slug: course.slug, subtitle: course.subtitle || "",
      description: course.description || "", shortDescription: course.shortDescription || "",
      outcome: course.outcome || "", priceEgp: course.priceEgp,
      coverImageUrl: course.coverImageUrl || "", imageUrl: course.imageUrl || "", iconName: course.iconName || "",
      colorHex: course.colorHex || "", level: course.level || "Beginner",
      phase: course.phase || 1, isActive: course.isActive,
      isFeatured: course.isFeatured || false, isDeleted: course.isDeleted || false,
      coreSessions: course.coreSessions || 8, supportSessions: course.supportSessions || 4,
      sortOrder: course.sortOrder || 0, minimumAge: course.minimumAge || 8,
      maximumAge: course.maximumAge || 18
    });
    setStep(1);
    getAdminQuestions(course.id).then(setQuestions).catch(() => setQuestions([]));
    setRoundForm(prev => ({ ...prev, courseId: course.id }));
    setShowWizard(true);
  };

  // Step 1: Save course
  const handleSaveCourse = async () => {
    if (!form.title || !form.slug) { toast("Title and slug required", "error"); return; }
    setSaving(true);
    
    // Prepare updated form fields for Cloudinary if base64 uploads exist
    let coverUrl = form.coverImageUrl;
    let thumbUrl = form.imageUrl;
    
    try {
      if ((form.coverImageUrl && form.coverImageUrl.startsWith("data:")) || (form.imageUrl && form.imageUrl.startsWith("data:"))) {
         toast("Uploading media, please wait...", "info");
      }

      if (form.coverImageUrl && form.coverImageUrl.startsWith("data:")) {
        coverUrl = await uploadToCloudinary(form.coverImageUrl, "courses/covers");
      }
      if (form.imageUrl && form.imageUrl.startsWith("data:")) {
        thumbUrl = await uploadToCloudinary(form.imageUrl, "courses/thumbnails");
      }
    } catch (cloudinaryError: any) {
      toast("Media upload failed: " + cloudinaryError.message, "error");
      setSaving(false);
      return;
    }

    const payload = {
      ...form,
      coverImageUrl: coverUrl,
      imageUrl: thumbUrl
    };

    try {
      if (editing) {
        await updateAdminCourse(editing.id, payload);
        setRoundForm(prev => ({ ...prev, courseId: editing.id }));
        toast("Course updated successfully!", "success");
        setStep(2);
      } else {
        const result = await createAdminCourse(payload);
        setCreatedCourseId(result.id);
        setRoundForm(prev => ({ ...prev, courseId: result.id }));
        toast("Course created! Now add questions.", "success");
        setStep(2);
      }
      const updated = await getAdminCourses();
      setCourses(updated);
    } catch (e: any) {
      toast(e.message || "Failed to save course", "error");
    } finally { setSaving(false); }
  };

  // Step 2: Add question
  const addQuestion = async () => {
    if (!newQuestion.questionText) { toast("Question text required", "error"); return; }
    const targetCourseId = editing ? editing.id : createdCourseId;
    if (!targetCourseId) { toast("Course ID not found", "error"); return; }

    // Build optionsJson and correctAnswer based on question type
    let optionsJson = "[]";
    let correctAnswer = "";
    if (newQuestion.questionType === "Mcq") {
      if (mcqOptions.filter(o => o.text.trim()).length < 2) {
        toast("MCQ needs at least 2 options", "error"); return;
      }
      if (!mcqOptions.some(o => o.isCorrect)) {
        toast("Mark one option as correct", "error"); return;
      }
      optionsJson = JSON.stringify(mcqOptions.filter(o => o.text.trim()).map(o => o.text.trim()));
      correctAnswer = mcqOptions.find(o => o.isCorrect)?.text.trim() || "";
    } else if (newQuestion.questionType === "TrueFalse") {
      optionsJson = JSON.stringify(["True", "False"]);
      correctAnswer = newQuestion.correctAnswer || "True";
    }

    try {
      const payload = {
        courseId: targetCourseId,
        questionText: newQuestion.questionText,
        questionType: newQuestion.questionType,
        optionsJson,
        correctAnswer: correctAnswer || null,
        helpText: newQuestion.helpText || null,
        autoGrade: newQuestion.autoGrade,
        isRequired: newQuestion.isRequired,
        sortOrder: questions.length + 1,
      };
      const res = await createAdminQuestion(payload);
      setQuestions(prev => [...prev, { ...payload, id: res.id }]);
      setNewQuestion({ questionText: "", questionType: "Mcq", optionsJson: "[]", isRequired: true, sortOrder: questions.length + 2, correctAnswer: "", helpText: "", autoGrade: true });
      setMcqOptions([{ text: "", isCorrect: true }, { text: "", isCorrect: false }]);
      toast("Question added", "success");
    } catch (e: any) {
      toast("Failed to add question", "error");
    }
  };

  const removeQuestion = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      await deleteAdminQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast("Question deleted", "success");
    } catch (e: any) {
      toast("Failed to delete", "error");
    }
  };

  // Step 3: Create round
  const handleCreateRound = async () => {
    if (!roundForm.name || !roundForm.slug) { toast("Round name and slug required", "error"); return; }
    
    // Ensure courseId is always valid, falling back to editing.id or createdCourseId
    const targetCourseId = roundForm.courseId || (editing ? editing.id : createdCourseId);
    if (!targetCourseId) { toast("Cannot create round: Course ID is missing. Please save the course first.", "error"); return; }

    setSaving(true);
    try {
      await createAdminRound({ ...roundForm, courseId: targetCourseId });
      toast("Round created for this course!", "success");
      setShowWizard(false);
      setCourses(await getAdminCourses());
    } catch (e: any) {
      toast(e.message || "Failed to create round", "error");
    } finally { setSaving(false); }
  };

  const field = (key: keyof typeof form) => ({
    value: (form[key] ?? "") as string | number,
    onChange: (e: any) => {
      const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm(prev => ({ ...prev, [key]: val }));
    }
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Archive this course?")) return;
    try {
      await deleteAdminCourse(id);
      setCourses(courses.filter(c => c.id !== id));
      toast("Course archived", "success");
    } catch (e: any) { toast(e.message || "Failed", "error"); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const steps = editing ? [{ num: 1, label: "Edit Course" }] : [
    { num: 1, label: "Course Data" },
    { num: 2, label: "Questions" },
    { num: 3, label: "Round" }
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
            <ArrowLeft size={14} weight="bold" /> Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">Course Management</h1>
          <p className="text-zinc-500 font-medium">Create and edit academy courses with full setup wizard.</p>
        </div>
        <button onClick={openCreate} className="w-full sm:w-auto bg-zinc-900 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg">
          <Plus size={18} weight="bold" /> New Course
        </button>
      </div>

      {/* Stats & Filter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm">
          <div className="text-2xl font-black text-zinc-900 font-mono">{courses.length}</div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Courses</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm">
          <div className="text-2xl font-black text-emerald-600 font-mono">{activeCount}</div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm">
          <div className="text-2xl font-black text-zinc-400 font-mono">{archivedCount}</div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Archived</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm">
          <div className="text-2xl font-black text-brand font-mono">{filteredCourses.length}</div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Showing</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass size={14} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by title, slug..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-black/5 rounded-xl text-xs font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-zinc-300"
          />
        </div>
        <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}
          className="px-3 py-2.5 bg-white border border-black/5 rounded-xl text-xs font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-black/10 transition-all cursor-pointer">
          <option value="all">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Creator">Creator</option>
          <option value="Builder">Builder</option>
          <option value="Advanced">Advanced</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 bg-white border border-black/5 rounded-xl text-xs font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-black/10 transition-all cursor-pointer">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
        <select value={filterPhase} onChange={(e) => setFilterPhase(e.target.value)}
          className="px-3 py-2.5 bg-white border border-black/5 rounded-xl text-xs font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-black/10 transition-all cursor-pointer">
          <option value="all">All Phases</option>
          {[1, 2, 3, 4, 5].map(p => <option key={p} value={p.toString()}>Phase {p}</option>)}
        </select>
        {(searchQuery || filterLevel !== "all" || filterStatus !== "all" || filterPhase !== "all") && (
          <button onClick={() => { setSearchQuery(""); setFilterLevel("all"); setFilterStatus("all"); setFilterPhase("all"); }}
            className="px-3 py-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1.5">
            <X size={12} weight="bold" /> Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className={`bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-black/20 hover:-translate-y-2 transition-all transition duration-300 ease-in-out group relative ${course.isDeleted ? 'opacity-70 grayscale-[0.5]' : ''}`}>
            {course.isDeleted && <div className="absolute top-4 left-4 bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-20 shadow-md">Archived</div>}
            
            <div className="w-full aspect-video rounded-[1.5rem] bg-zinc-950 mb-6 relative overflow-hidden group-hover:shadow-lg transition-all duration-500 border border-black/5">
              {course.coverImageUrl || course.imageUrl ? (
                <img 
                  src={course.coverImageUrl || course.imageUrl} 
                  alt={course.title} 
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1c0000] to-[#3a0000] flex flex-col items-center justify-center p-6 text-center">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,26,26,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,26,26,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                  <div className="w-12 h-12 rounded-2xl bg-[#ffe6e6]/10 flex items-center justify-center text-[#ff1a1a] mb-3 relative z-10 shadow-[0_0_20px_rgba(255,26,26,0.15)] group-hover:scale-110 transition-transform duration-500">
                    <CourseIcon iconName={course.iconName} className="drop-shadow-[0_0_8px_#ff1a1a]" size={24} />
                  </div>
                  <div className="text-[8px] font-black uppercase tracking-[0.25em] text-[#ff1a1a] relative z-10 mb-1">
                    EL SEWEDY GENZ TRACK
                  </div>
                </div>
              )}
              
              {/* Overlay Actions */}
              <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => openEdit(course)} className="w-9 h-9 bg-white/90 hover:bg-white backdrop-blur-md text-zinc-900 rounded-xl flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95"><PencilSimple size={16} weight="bold" /></button>
                <button onClick={() => handleDelete(course.id)} className="w-9 h-9 bg-red-500/90 hover:bg-red-500 backdrop-blur-md text-white rounded-xl flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95"><Trash size={16} weight="bold" /></button>
              </div>
            </div>
            <h3 className="font-display text-xl font-bold text-zinc-900 mb-1">{course.title}</h3>
            <p className="text-sm font-medium text-zinc-500 mb-3">{course.subtitle || course.slug}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded text-xs font-bold uppercase">{course.level}</span>
              <span className="px-2.5 py-1 bg-brand-hover text-zinc-700 rounded text-xs font-bold">Phase {course.phase}</span>
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${course.isActive ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-400'}`}>{course.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flex items-center justify-between border-t border-black/5 pt-5 mt-4 mb-4">
              <div><div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Investment</div><div className="text-xl font-black text-zinc-900">{course.priceEgp} EGP</div></div>
              <div className="text-right"><div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Sessions</div><div className="text-sm font-bold text-zinc-600">{course.coreSessions}C / {course.supportSessions}S</div></div>
            </div>
            <Link
              href={`/admin/courses/${course.slug}`}
              className="w-full block text-center px-4 py-3 bg-zinc-950 text-white hover:bg-[#cc0000] rounded-xl font-black uppercase tracking-wider text-[10px] transition-all duration-300 active:scale-[0.98] shadow-sm"
            >
              View Rounds & Enter Room
            </Link>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-20">
          <Folder size={48} weight="fill" className="text-zinc-200 mx-auto mb-4" />
          <p className="text-zinc-500 font-medium">{searchQuery || filterLevel !== "all" || filterStatus !== "all" || filterPhase !== "all" ? "No courses match your filters." : 'No courses yet. Click "New Course" to start!'}</p>
        </div>
      )}

      {/* Advanced Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-zinc-950/40 backdrop-blur-md">
          <div className="bg-zinc-50 rounded-[2rem] sm:rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/20 flex flex-col animate-in zoom-in-95 duration-300 ease-out relative">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand/10 to-transparent pointer-events-none" />

            {/* Premium Header */}
            <div className="bg-white/80 backdrop-blur-xl z-20 px-8 py-6 border-b border-black/5 relative shrink-0">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand mb-2 flex items-center gap-2">
                    <span className="w-4 h-px bg-brand"></span> Course Architect
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-display font-black text-zinc-900 tracking-tight leading-none">
                    {editing ? "Edit Course Data" : `Step ${step}: ${steps.find(s => s.num === step)?.label}`}
                  </h2>
                </div>
                <button 
                  onClick={() => setShowWizard(false)} 
                  className="w-10 h-10 rounded-full border border-black/5 hover:border-black/10 hover:bg-zinc-100 flex items-center justify-center shrink-0 transition-all text-zinc-400 hover:text-zinc-900 active:scale-95 bg-white shadow-sm"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
              
              {!editing && (
                <div className="flex gap-2">
                  {steps.map((s) => (
                    <div key={s.num} className="flex-1 relative">
                      <div className={`h-1.5 rounded-full transition-all duration-500 ${step === s.num ? 'bg-zinc-950 scale-y-125' : step > s.num ? 'bg-brand' : 'bg-black/5'}`} />
                      {step === s.num && (
                         <div className="absolute top-3 left-0 text-[9px] font-black uppercase tracking-widest text-zinc-900 animate-in fade-in slide-in-from-top-1">{s.label}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar relative z-10 space-y-8 bg-zinc-50/50">
              {step === 1 && (
                <div className="space-y-8 max-w-3xl mx-auto">
                  {/* Title & Slug */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Course Title *</label>
                      <input {...field("title")} placeholder="e.g. Intro to Creative Robotics" className="w-full px-4 py-3 bg-zinc-50 hover:bg-zinc-100/50 rounded-2xl border border-black/5 font-bold focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Slug Reference URL *</label>
                      <input {...field("slug")} placeholder="intro-robotics" className="w-full px-4 py-3 bg-zinc-50 hover:bg-zinc-100/50 rounded-2xl border border-black/5 font-mono font-bold text-sm focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all" />
                    </div>
                  </div>

                  {/* Subtitle & Descriptions */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Card Subtitle / Cohort Tagline</label>
                    <input {...field("subtitle")} placeholder="e.g. Ages 13–16 · Intermediate · Phase 1" className="w-full px-4 py-3 bg-zinc-50 hover:bg-zinc-100/50 rounded-2xl border border-black/5 font-bold focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Short Description (for cards)</label>
                      <textarea {...field("shortDescription")} rows={2} placeholder="Summarize the course impact in 2 sentences..." className="w-full px-4 py-3 bg-zinc-50 hover:bg-zinc-100/50 rounded-2xl border border-black/5 font-medium focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all resize-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Learning Outcomes (separate by comma)</label>
                      <textarea {...field("outcome")} rows={2} placeholder="Build actual robots, Code hardware microchips, Team presentation..." className="w-full px-4 py-3 bg-zinc-50 hover:bg-zinc-100/50 rounded-2xl border border-black/5 font-medium focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all resize-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Main Detailed Description</label>
                    <textarea {...field("description")} rows={3} placeholder="Provide an inspirational description for the course details page..." className="w-full px-4 py-3 bg-zinc-50 hover:bg-zinc-100/50 rounded-2xl border border-black/5 font-medium focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all resize-none" />
                  </div>

                  {/* Premium Visuals & Images with Live Previews */}
                  <div className="bg-zinc-50 p-6 rounded-[2.5rem] border border-black/5 space-y-6">
                    <div className="flex justify-between items-center border-b border-black/5 pb-4">
                      <h4 className="text-xs font-black text-zinc-800 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-zinc-950 animate-pulse"></span>
                        Premium Branding & Media Hub
                      </h4>
                      <span className="text-[10px] text-zinc-400 font-bold bg-zinc-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider">Base64 Realtime Previewer</span>
                    </div>

                    {/* Pre-seeded High-Fidelity Banner Presets */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Curated Branding Presets (Click to Auto-Design)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          {
                            name: "Creative Robotics",
                            icon: "🤖",
                            colorHex: "#F59E0B",
                            cover: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
                            thumb: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80",
                            desc: "Robotics"
                          },
                          {
                            name: "Intro to C++ Coding",
                            icon: "💻",
                            colorHex: "#0EA5E9",
                            cover: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
                            thumb: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=300&q=80",
                            desc: "Intro C++"
                          },
                          {
                            name: "Advanced C++ SFML",
                            icon: "⚡",
                            colorHex: "#EF4444",
                            cover: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
                            thumb: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=300&q=80",
                            desc: "Adv C++"
                          },
                          {
                            name: "Web Dev & AI",
                            icon: "🌐",
                            colorHex: "#10B981",
                            cover: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80",
                            thumb: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80",
                            desc: "Web & AI"
                          },
                          {
                            name: "Cybersecurity",
                            icon: "🛡️",
                            colorHex: "#6366F1",
                            cover: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
                            thumb: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=300&q=80",
                            desc: "CyberSec"
                          },
                          {
                            name: "Mobile Engineering",
                            icon: "📱",
                            colorHex: "#EC4899",
                            cover: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80",
                            thumb: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=300&q=80",
                            desc: "Mobile App"
                          },
                          {
                            name: "Data Science",
                            icon: "📊",
                            colorHex: "#14B8A6",
                            cover: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
                            thumb: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=300&q=80",
                            desc: "Python Data"
                          },
                          {
                            name: "Scratch Creative Code",
                            icon: "🎨",
                            colorHex: "#8B5CF6",
                            cover: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
                            thumb: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=300&q=80",
                            desc: "Scratch"
                          }
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setForm(p => ({
                                ...p,
                                coverImageUrl: preset.cover,
                                imageUrl: preset.thumb,
                                iconName: preset.icon,
                                colorHex: preset.colorHex
                              }));
                            }}
                            className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col items-start gap-1.5 ${
                              form.coverImageUrl === preset.cover
                                ? "bg-zinc-950 text-white border-zinc-950 ring-2 ring-black/10"
                                : "bg-white text-zinc-700 border-black/5 hover:bg-zinc-50"
                            }`}
                          >
                            <span className="text-xl">{preset.icon}</span>
                            <span className="text-[10px] font-black tracking-tight leading-none truncate w-full">{preset.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Drag and Drop Custom Base64 Uploader */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Cover Image Upload */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Custom Cover Background</label>
                        <div className="flex flex-col gap-2">
                          <input
                            value={form.coverImageUrl || ""}
                            onChange={(e) => setForm(p => ({ ...p, coverImageUrl: e.target.value }))}
                            placeholder="Or paste cover URL..."
                            className="w-full px-4 py-2.5 bg-white rounded-xl border border-black/5 font-bold text-xs focus:ring-2 focus:ring-black/10 outline-none transition-all"
                          />
                          <div className="relative border-2 border-dashed border-zinc-200 hover:border-zinc-400 bg-white rounded-2xl p-4 text-center cursor-pointer transition-colors group">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const r = new FileReader();
                                  r.onload = () => {
                                    setForm(p => ({ ...p, coverImageUrl: r.result as string }));
                                  };
                                  r.readAsDataURL(file);
                                }
                                e.target.value = '';
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <span className="text-zinc-400 group-hover:text-zinc-600 text-[10px] font-black uppercase tracking-wider">Drag or Click to Upload</span>
                              <span className="text-[9px] text-zinc-400 font-medium">PNG, JPG, WebP up to 4MB</span>
                            </div>
                          </div>
                          {form.coverImageUrl ? (
                            <div className="h-28 rounded-2xl overflow-hidden border border-black/5 relative group bg-zinc-950 shadow-inner">
                              <img src={form.coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover opacity-90 animate-in fade-in" />
                              <button
                                type="button"
                                onClick={() => setForm(p => ({ ...p, coverImageUrl: "" }))}
                                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                              >
                                <X size={14} weight="bold" />
                              </button>
                            </div>
                          ) : (
                            <div className="h-28 rounded-2xl border border-dashed border-zinc-200 flex items-center justify-center text-[10px] text-zinc-400 font-bold bg-white/50">No Cover Loaded</div>
                          )}
                        </div>
                      </div>

                      {/* Course Thumbnail Image Upload */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Custom Thumbnail Image</label>
                        <div className="flex flex-col gap-2">
                          <input
                            value={form.imageUrl || ""}
                            onChange={(e) => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                            placeholder="Or paste thumbnail URL..."
                            className="w-full px-4 py-2.5 bg-white rounded-xl border border-black/5 font-bold text-xs focus:ring-2 focus:ring-black/10 outline-none transition-all"
                          />
                          <div className="relative border-2 border-dashed border-zinc-200 hover:border-zinc-400 bg-white rounded-2xl p-4 text-center cursor-pointer transition-colors group">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const r = new FileReader();
                                  r.onload = () => {
                                    setForm(p => ({ ...p, imageUrl: r.result as string }));
                                  };
                                  r.readAsDataURL(file);
                                }
                                e.target.value = '';
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <span className="text-zinc-400 group-hover:text-zinc-600 text-[10px] font-black uppercase tracking-wider">Drag or Click to Upload</span>
                              <span className="text-[9px] text-zinc-400 font-medium">PNG, JPG, WebP up to 4MB</span>
                            </div>
                          </div>
                          {form.imageUrl ? (
                            <div className="h-28 rounded-2xl overflow-hidden border border-black/5 relative group bg-zinc-950 shadow-inner">
                              <img src={form.imageUrl} alt="Thumbnail Preview" className="w-full h-full object-cover opacity-90 animate-in fade-in" />
                              <button
                                type="button"
                                onClick={() => setForm(p => ({ ...p, imageUrl: "" }))}
                                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                              >
                                <X size={14} weight="bold" />
                              </button>
                            </div>
                          ) : (
                            <div className="h-28 rounded-2xl border border-dashed border-zinc-200 flex items-center justify-center text-[10px] text-zinc-400 font-bold bg-white/50">No Thumbnail Loaded</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Standard Icon & Hex Pickers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-black/5 pt-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Icon Name/Emoji Symbol</label>
                        <input
                          value={form.iconName || ""}
                          onChange={(e) => setForm(p => ({ ...p, iconName: e.target.value }))}
                          placeholder="🤖 or 🌐"
                          className="w-full px-4 py-3 bg-white rounded-2xl border border-black/5 font-bold focus:ring-2 focus:ring-black/10 outline-none transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Theme Accent Color Hex</label>
                        <div className="flex gap-2 items-center">
                          <input
                            value={form.colorHex || ""}
                            onChange={(e) => setForm(p => ({ ...p, colorHex: e.target.value }))}
                            placeholder="#10B981"
                            className="flex-1 px-4 py-3 bg-white rounded-2xl border border-black/5 font-mono font-bold focus:ring-2 focus:ring-black/10 outline-none transition-all"
                          />
                          <div className="w-12 h-12 rounded-2xl border border-black/5 shrink-0 shadow-sm transition-all" style={{ backgroundColor: form.colorHex || '#f4f4f5' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Level & Age range settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Tuition Pricing (EGP)</label>
                      <input type="number" {...field("priceEgp")} className="w-full px-4 py-3 bg-zinc-50 rounded-2xl border border-black/5 font-bold focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Student Minimum Age</label>
                      <input type="number" {...field("minimumAge")} className="w-full px-4 py-3 bg-zinc-50 rounded-2xl border border-black/5 font-bold focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Student Maximum Age</label>
                      <input type="number" {...field("maximumAge")} className="w-full px-4 py-3 bg-zinc-50 rounded-2xl border border-black/5 font-bold focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Core Training Sessions</label>
                      <input type="number" {...field("coreSessions")} className="w-full px-4 py-3 bg-zinc-50 rounded-2xl border border-black/5 font-bold focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Support/Mentorship Sessions</label>
                      <input type="number" {...field("supportSessions")} className="w-full px-4 py-3 bg-zinc-50 rounded-2xl border border-black/5 font-bold focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Dashboard Sort Order</label>
                      <input type="number" {...field("sortOrder")} className="w-full px-4 py-3 bg-zinc-50 rounded-2xl border border-black/5 font-bold focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all" />
                    </div>
                  </div>

                  {/* Level Pill Badges Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Target Proficiency Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setForm(p => ({ ...p, level: lvl }))}
                          className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
                            form.level === lvl
                              ? "bg-zinc-950 text-white border-zinc-950 shadow-sm"
                              : "bg-zinc-50 text-zinc-600 border-black/5 hover:bg-zinc-100/50"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                   {/* Premium iOS styled switch buttons */}
                   <div className="flex flex-wrap items-center gap-6 bg-zinc-50 p-4 rounded-2xl border border-black/5">
                     <PremiumSwitch
                       checked={form.isActive}
                       onChange={(val) => setForm(p => ({ ...p, isActive: val }))}
                       label="Course Room Active"
                     />
                     <PremiumSwitch
                       checked={form.isFeatured}
                       onChange={(val) => setForm(p => ({ ...p, isFeatured: val }))}
                       label="Featured Placement"
                     />
                     {editing && (
                       <PremiumSwitch
                         checked={form.isDeleted}
                         onChange={(val) => setForm(p => ({ ...p, isDeleted: val }))}
                         label="Is Archived (Deleted)"
                       />
                     )}
                   </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="bg-brand-hover rounded-2xl p-5">
                    <h3 className="font-bold text-zinc-900 mb-1">Application Screening Questions</h3>
                    <p className="text-sm text-zinc-600">Design MCQ, True/False, or open-ended questions students must answer when applying.</p>
                  </div>

                  {/* Question list */}
                  <div className="space-y-2">
                    {questions.length === 0 ? (
                      <div className="text-center py-8 text-zinc-400 text-sm font-medium">No questions added yet. Build your screening quiz below.</div>
                    ) : (
                      questions.map((q, i) => {
                        let parsedOpts: string[] = [];
                        try { parsedOpts = JSON.parse(q.optionsJson || "[]"); } catch {}
                        return (
                          <div key={q.id} className="p-4 bg-zinc-50 rounded-xl border border-black/5">
                            <div className="flex items-start gap-3">
                              <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm text-zinc-900">{q.questionText}</div>
                                <div className="text-[10px] text-zinc-400 font-bold uppercase mt-1">
                                  {q.questionType === "Mcq" ? "Multiple Choice" : q.questionType === "TrueFalse" ? "True / False" : "Short Answer"}
                                  {q.correctAnswer && <span className="text-green-600 ml-2">✓ Correct: {q.correctAnswer}</span>}
                                </div>
                                {parsedOpts.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {parsedOpts.map((opt: string, oi: number) => (
                                      <span key={oi} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                        opt === q.correctAnswer ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-black/5 text-zinc-600"
                                      }`}>{opt}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button onClick={() => removeQuestion(q.id)} className="text-red-400 hover:text-red-600 shrink-0 mt-0.5"><Trash size={14} weight="bold" /></button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Advanced Add Question Form */}
                  <div className="border-t border-black/5 pt-5 space-y-4">
                    <h4 className="font-bold text-sm text-zinc-900">New Question Builder</h4>

                    {/* Question type selector */}
                    <div className="flex gap-2">
                      {[
                        { value: "Mcq", label: "MCQ" },
                        { value: "TrueFalse", label: "True/False" },
                        { value: "ShortAnswer", label: "Open Text" },
                      ].map(t => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => {
                            setNewQuestion(prev => ({ ...prev, questionType: t.value, correctAnswer: t.value === "TrueFalse" ? "True" : "" }));
                            if (t.value === "TrueFalse") {
                              setMcqOptions([{ text: "True", isCorrect: true }, { text: "False", isCorrect: false }]);
                            } else if (t.value === "Mcq") {
                              setMcqOptions([{ text: "", isCorrect: true }, { text: "", isCorrect: false }]);
                            }
                          }}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            newQuestion.questionType === t.value
                              ? "bg-zinc-950 text-white border-zinc-950"
                              : "bg-zinc-50 text-zinc-600 border-black/5 hover:bg-zinc-100"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Question text */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Question Text *</label>
                      <textarea
                        rows={2}
                        value={newQuestion.questionText}
                        onChange={e => setNewQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                        placeholder="e.g. What programming language interests you the most?"
                        className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold text-sm focus:ring-2 focus:ring-black/10 outline-none resize-none"
                      />
                    </div>

                    {/* MCQ Options Builder */}
                    {newQuestion.questionType === "Mcq" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Answer Choices (select correct one)</label>
                          {mcqOptions.length < 6 && (
                            <button
                              type="button"
                              onClick={() => setMcqOptions(prev => [...prev, { text: "", isCorrect: false }])}
                              className="text-brand text-[10px] font-black uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <Plus size={12} weight="bold" /> Add Option
                            </button>
                          )}
                        </div>
                        {mcqOptions.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setMcqOptions(prev => prev.map((o, i) => ({ ...o, isCorrect: i === idx })))}
                              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                opt.isCorrect ? "border-green-500 bg-green-500 text-white" : "border-zinc-300 bg-white hover:border-zinc-400"
                              }`}
                            >
                              {opt.isCorrect && <CheckCircle size={14} weight="fill" />}
                            </button>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={e => {
                                const next = [...mcqOptions];
                                next[idx].text = e.target.value;
                                setMcqOptions(next);
                              }}
                              placeholder={`Option ${idx + 1}`}
                              className="flex-1 px-3 py-2.5 bg-zinc-50 rounded-xl border border-black/5 text-sm font-medium outline-none focus:ring-2 focus:ring-black/5"
                            />
                            {mcqOptions.length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const next = mcqOptions.filter((_, i) => i !== idx);
                                  if (!next.some(o => o.isCorrect) && next.length > 0) next[0].isCorrect = true;
                                  setMcqOptions(next);
                                }}
                                className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                              >
                                <X size={14} weight="bold" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* True/False Selector */}
                    {newQuestion.questionType === "TrueFalse" && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Correct Answer</label>
                        <div className="flex gap-3">
                          {["True", "False"].map(val => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setNewQuestion(prev => ({ ...prev, correctAnswer: val }))}
                              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border cursor-pointer ${
                                newQuestion.correctAnswer === val
                                  ? val === "True" ? "bg-green-50 border-green-300 text-green-700" : "bg-red-50 border-red-300 text-red-700"
                                  : "bg-zinc-50 border-black/5 text-zinc-500 hover:bg-zinc-100"
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submit button */}
                    <button
                      onClick={addQuestion}
                      className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus size={16} weight="bold" /> Add Question to Screening
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="bg-brand-hover rounded-2xl p-5">
                    <h3 className="font-bold text-zinc-900 mb-1">Create Course Round</h3>
                    <p className="text-sm text-zinc-600">Set up the first cohort/round for this course with enrollment settings.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Round Name *</label>
                      <input value={roundForm.name} onChange={e => setRoundForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Summer 2026" className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold focus:ring-2 focus:ring-black/10 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Slug *</label>
                      <input value={roundForm.slug} onChange={e => setRoundForm(prev => ({ ...prev, slug: e.target.value }))} placeholder="summer-2026" className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-mono font-bold text-sm focus:ring-2 focus:ring-black/10 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Start Date</label>
                      <input type="date" value={roundForm.startDate} onChange={e => setRoundForm(prev => ({ ...prev, startDate: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold focus:ring-2 focus:ring-black/10 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Max Students</label>
                      <input type="number" value={roundForm.maxStudents} onChange={e => setRoundForm(prev => ({ ...prev, maxStudents: Number(e.target.value) }))} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold focus:ring-2 focus:ring-black/10 outline-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 pt-2">
                    <PremiumSwitch
                      checked={roundForm.isEnrollmentOpen}
                      onChange={(val) => setRoundForm(prev => ({ ...prev, isEnrollmentOpen: val }))}
                      label="Enrollment Open"
                    />
                    <PremiumSwitch
                      checked={roundForm.requireEngineerApproval}
                      onChange={(val) => setRoundForm(prev => ({ ...prev, requireEngineerApproval: val }))}
                      label="Require Engineer Approval"
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Footer Action Bar */}
            <div className="bg-white p-6 sm:px-8 sm:py-6 border-t border-black/5 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 relative z-20">
              {step === 1 ? (
                <div className="flex flex-col-reverse sm:flex-row gap-3 w-full justify-end">
                  <button onClick={() => setShowWizard(false)} className="w-full sm:w-auto px-6 py-4 bg-white border border-black/10 text-zinc-600 rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-zinc-50 hover:text-zinc-900 transition-all active:scale-95">Cancel</button>
                  <button onClick={handleSaveCourse} disabled={saving} className="w-full sm:w-auto px-8 py-4 bg-zinc-950 text-white rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-brand disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all active:scale-95">
                    <FloppyDisk size={18} weight="bold" /> {saving ? "Saving..." : editing ? "Update Course" : "Save & Continue"}
                  </button>
                </div>
              ) : step === 2 ? (
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-between">
                  <button onClick={() => setStep(1)} className="w-full sm:w-auto px-6 py-4 bg-white border border-black/10 text-zinc-600 rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-zinc-50 transition-all active:scale-95">← Back to Data</button>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {editing && <button onClick={() => setShowWizard(false)} className="w-full sm:w-auto px-8 py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-zinc-200 transition-all active:scale-95">Save & Close</button>}
                    <button onClick={() => setStep(3)} className="w-full sm:w-auto px-8 py-4 bg-zinc-950 text-white rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-brand flex items-center justify-center gap-2 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all active:scale-95">
                      {editing ? "Skip to Rounds" : "Next: Launch Round"} <ArrowRight size={18} weight="bold" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-between">
                  <button onClick={() => setStep(2)} className="w-full sm:w-auto px-6 py-4 bg-white border border-black/10 text-zinc-600 rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-zinc-50 transition-all active:scale-95">← Back to Questions</button>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {editing && <button onClick={() => setShowWizard(false)} className="w-full sm:w-auto px-8 py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-black uppercase tracking-wider text-xs hover:bg-zinc-200 transition-all active:scale-95">Close</button>}
                    <button onClick={handleCreateRound} disabled={saving} className="w-full sm:w-auto px-8 py-4 bg-brand text-zinc-950 rounded-2xl font-black uppercase tracking-wider text-xs hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_10px_30px_-10px_rgba(159,232,112,0.5)] transition-all active:scale-95">
                      <Plus size={18} weight="bold" /> {saving ? "Creating..." : "Initialize First Round"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}