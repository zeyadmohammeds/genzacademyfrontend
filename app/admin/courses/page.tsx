"use client";

import { useEffect, useState } from "react";
import { getAdminCourses, createAdminCourse, updateAdminCourse, deleteAdminCourse, getAdminQuestions, deleteAdminQuestion, getAdminRounds, createAdminRound } from "@/lib/api";
import type { AdminCourse } from "@/lib/types";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import { Folder, Plus, ArrowLeft, Trash, PencilSimple, X, FloppyDisk, CheckCircle, ArrowRight } from "@phosphor-icons/react";

type WizardStep = 1 | 2 | 3;

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [editing, setEditing] = useState<AdminCourse | null>(null);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const { toast } = useToast();

  // Step 1: Course data
  const [form, setForm] = useState({
    title: "", slug: "", subtitle: "", description: "", shortDescription: "",
    outcome: "", priceEgp: 0, coverImageUrl: "", iconName: "", colorHex: "",
    level: "Beginner", phase: 1, isActive: true, isFeatured: false,
    coreSessions: 8, supportSessions: 4, sortOrder: 0,
    minimumAge: 8, maximumAge: 18
  });

  // Step 2: Questions
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState({ questionText: "", questionType: "Mcq", optionsJson: "[]", isRequired: true, sortOrder: 0 });

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
      outcome: "", priceEgp: 0, coverImageUrl: "", iconName: "", colorHex: "",
      level: "Beginner", phase: 1, isActive: true, isFeatured: false,
      coreSessions: 8, supportSessions: 4, sortOrder: 0,
      minimumAge: 8, maximumAge: 18
    });
    setQuestions([]);
    setNewQuestion({ questionText: "", questionType: "Mcq", optionsJson: "[]", isRequired: true, sortOrder: 0 });
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
      coverImageUrl: course.coverImageUrl || "", iconName: course.iconName || "",
      colorHex: course.colorHex || "", level: course.level || "Beginner",
      phase: course.phase || 1, isActive: course.isActive,
      isFeatured: course.isFeatured || false,
      coreSessions: course.coreSessions || 8, supportSessions: course.supportSessions || 4,
      sortOrder: course.sortOrder || 0, minimumAge: course.minimumAge || 8,
      maximumAge: course.maximumAge || 18
    });
    setShowWizard(true);
  };

  // Step 1: Save course
  const handleSaveCourse = async () => {
    if (!form.title || !form.slug) { toast("Title and slug required", "error"); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateAdminCourse(editing.id, form);
        toast("Course updated", "success");
        setShowWizard(false);
      } else {
        const result = await createAdminCourse(form);
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
    setQuestions(prev => [...prev, { ...newQuestion, id: `temp-${Date.now()}` }]);
    setNewQuestion({ questionText: "", questionType: "Mcq", optionsJson: "[]", isRequired: true, sortOrder: questions.length });
    toast("Question added", "success");
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  // Step 3: Create round
  const handleCreateRound = async () => {
    if (!roundForm.name || !roundForm.slug) { toast("Round name and slug required", "error"); return; }
    setSaving(true);
    try {
      await createAdminRound(roundForm);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-black/5 hover:-translate-y-1 transition-all group relative">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: course.colorHex ? `${course.colorHex}20` : '#f4f4f5' }}>
                {course.iconName || '📚'}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(course)} className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl transition-colors"><PencilSimple size={16} weight="bold" /></button>
                <button onClick={() => handleDelete(course.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"><Trash size={16} weight="bold" /></button>
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
              <div><div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Price</div><div className="text-xl font-black text-zinc-900">{course.priceEgp} EGP</div></div>
              <div className="text-right"><div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Sessions</div><div className="text-sm font-bold text-zinc-600">{course.coreSessions}C / {course.supportSessions}S</div></div>
            </div>
            <Link
              href={`/admin/courses/${course.id}`}
              className="w-full block text-center px-4 py-3 bg-zinc-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-colors"
            >
              View Rounds & Enter Room
            </Link>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-20">
          <Folder size={48} weight="fill" className="text-zinc-200 mx-auto mb-4" />
          <p className="text-zinc-500 font-medium">No courses yet. Click "New Course" to start!</p>
        </div>
      )}

      {/* Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-t-[1.5rem] sm:rounded-[2.5rem] w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-black/5">
            {/* Header with steps */}
            <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 border-b border-black/5 rounded-t-[1.5rem] sm:rounded-t-[2.5rem]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-900">
                  {editing ? "Edit Course" : `Step ${step}: ${steps.find(s => s.num === step)?.label}`}
                </h2>
                <button onClick={() => setShowWizard(false)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center shrink-0"><X size={18} weight="bold" /></button>
              </div>
              {!editing && (
                <div className="flex gap-2">
                  {steps.map((s) => (
                    <div key={s.num} className={`flex-1 h-1.5 rounded-full transition-colors ${step === s.num ? 'bg-zinc-900' : step > s.num ? 'bg-green-400' : 'bg-zinc-200'}`} />
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Title *</label>
                      <input {...field("title")} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold focus:ring-2 focus:ring-black/10 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Slug *</label>
                      <input {...field("slug")} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-mono font-bold text-sm focus:ring-2 focus:ring-black/10 outline-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Subtitle</label>
                    <input {...field("subtitle")} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold focus:ring-2 focus:ring-black/10 outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea {...field("description")} rows={3} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-medium focus:ring-2 focus:ring-black/10 outline-none resize-none" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Price (EGP)</label>
                      <input type="number" {...field("priceEgp")} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold focus:ring-2 focus:ring-black/10 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Level</label>
                      <select {...field("level")} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold focus:ring-2 focus:ring-black/10 outline-none">
                        <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Phase</label>
                      <input type="number" {...field("phase")} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold focus:ring-2 focus:ring-black/10 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Sort Order</label>
                      <input type="number" {...field("sortOrder")} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold focus:ring-2 focus:ring-black/10 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Min Age</label>
                      <input type="number" {...field("minimumAge")} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold focus:ring-2 focus:ring-black/10 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Max Age</label>
                      <input type="number" {...field("maximumAge")} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold focus:ring-2 focus:ring-black/10 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Core Sessions</label>
                      <input type="number" {...field("coreSessions")} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold focus:ring-2 focus:ring-black/10 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Support Sessions</label>
                      <input type="number" {...field("supportSessions")} className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold focus:ring-2 focus:ring-black/10 outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))} className="w-5 h-5 rounded accent-black" /><span className="font-bold text-sm">Active</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm(prev => ({ ...prev, isFeatured: e.target.checked }))} className="w-5 h-5 rounded accent-brand" /><span className="font-bold text-sm">Featured</span></label>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="bg-brand-hover rounded-2xl p-5">
                    <h3 className="font-bold text-zinc-900 mb-1">Application Questions</h3>
                    <p className="text-sm text-zinc-600">Add questions students must answer when applying to this course.</p>
                  </div>

                  {/* Question list */}
                  <div className="space-y-2">
                    {questions.length === 0 ? (
                      <div className="text-center py-8 text-zinc-400 text-sm font-medium">No questions added yet.</div>
                    ) : (
                      questions.map((q, i) => (
                        <div key={q.id} className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl border border-black/5">
                          <span className="w-6 h-6 rounded-full bg-zinc-200 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-zinc-900 truncate">{q.questionText}</div>
                            <div className="text-[10px] text-zinc-400 font-bold uppercase">{q.questionType}</div>
                          </div>
                          <button onClick={() => removeQuestion(q.id)} className="text-red-400 hover:text-red-600"><Trash size={14} weight="bold" /></button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add question form */}
                  <div className="border-t border-black/5 pt-5">
                    <h4 className="font-bold text-sm text-zinc-900 mb-3">Add Question</h4>
                    <div className="flex flex-col gap-1.5 mb-3">
                      <input value={newQuestion.questionText} onChange={e => setNewQuestion(prev => ({ ...prev, questionText: e.target.value }))} placeholder="Enter question text..." className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold text-sm focus:ring-2 focus:ring-black/10 outline-none" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                      <select value={newQuestion.questionType} onChange={e => setNewQuestion(prev => ({ ...prev, questionType: e.target.value }))} className="w-full sm:w-auto px-4 py-3 bg-zinc-50 rounded-xl border border-black/5 font-bold text-sm focus:ring-2 focus:ring-black/10 outline-none">
                        <option value="Mcq">Multiple Choice</option>
                        <option value="TrueFalse">True/False</option>
                        <option value="ShortAnswer">Short Answer</option>
                      </select>
                      <button onClick={addQuestion} className="w-full sm:w-auto px-5 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors">+ Add</button>
                    </div>
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
                  <div className="flex flex-col gap-3 pt-1">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-12 h-6 rounded-full relative transition-colors ${roundForm.isEnrollmentOpen ? 'bg-green-500' : 'bg-zinc-300'}`}>
                        <input type="checkbox" className="hidden" checked={roundForm.isEnrollmentOpen} onChange={e => setRoundForm(prev => ({ ...prev, isEnrollmentOpen: e.target.checked }))} />
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${roundForm.isEnrollmentOpen ? 'left-7' : 'left-1'}`} />
                      </div>
                      <span className="font-bold text-sm text-zinc-900">Enrollment Open</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-12 h-6 rounded-full relative transition-colors ${roundForm.requireEngineerApproval ? 'bg-purple-500' : 'bg-zinc-300'}`}>
                        <input type="checkbox" className="hidden" checked={roundForm.requireEngineerApproval} onChange={e => setRoundForm(prev => ({ ...prev, requireEngineerApproval: e.target.checked }))} />
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${roundForm.requireEngineerApproval ? 'left-7' : 'left-1'}`} />
                      </div>
                      <span className="font-bold text-sm text-zinc-900">Require Engineer Approval</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white p-4 sm:p-6 border-t border-black/5 flex justify-between rounded-b-[1.5rem] sm:rounded-b-[2.5rem]">
              {editing ? (
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full justify-end">
                  <button onClick={() => setShowWizard(false)} className="w-full sm:w-auto px-6 py-3 bg-white border border-black/10 text-zinc-700 rounded-xl font-bold text-sm hover:bg-zinc-50">Cancel</button>
                  <button onClick={handleSaveCourse} disabled={saving} className="w-full sm:w-auto px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                    <FloppyDisk size={18} weight="bold" /> {saving ? "Saving..." : "Update Course"}
                  </button>
                </div>
              ) : step === 1 ? (
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full justify-end">
                  <button onClick={() => setShowWizard(false)} className="w-full sm:w-auto px-6 py-3 bg-white border border-black/10 text-zinc-700 rounded-xl font-bold text-sm hover:bg-zinc-50">Cancel</button>
                  <button onClick={handleSaveCourse} disabled={saving} className="w-full sm:w-auto px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                    {saving ? "Saving..." : "Save & Next"} <ArrowRight size={18} weight="bold" />
                  </button>
                </div>
              ) : step === 2 ? (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full justify-between">
                  <button onClick={() => setStep(1)} className="w-full sm:w-auto px-6 py-3 bg-white border border-black/10 text-zinc-700 rounded-xl font-bold text-sm hover:bg-zinc-50">← Back</button>
                  <button onClick={() => setStep(3)} className="w-full sm:w-auto px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black flex items-center justify-center gap-2 shadow-lg">
                    Next: Create Round <ArrowRight size={18} weight="bold" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full justify-between">
                  <button onClick={() => setStep(2)} className="w-full sm:w-auto px-6 py-3 bg-white border border-black/10 text-zinc-700 rounded-xl font-bold text-sm hover:bg-zinc-50">← Back</button>
                  <button onClick={handleCreateRound} disabled={saving} className="w-full sm:w-auto px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                    <CheckCircle size={18} weight="bold" /> {saving ? "Creating..." : "Create Round & Finish"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}