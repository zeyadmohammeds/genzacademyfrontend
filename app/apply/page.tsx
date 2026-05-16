"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getCourseBySlug, getApplicationQuestions, submitCourseApplication } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import type { Course, ApplicationQuestion } from "@/lib/types";
import { Sparkle, CheckCircle, Warning, ArrowLeft, Question } from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";

const imageFor = (seed: string, width = 1200, height = 400) => `https://picsum.photos/seed/${seed}/${width}/${height}`;

export default function ApplicationWorkflowPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("course");
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<ApplicationQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    getCourseBySlug(slug).then(c => {
      setCourse(c);
      if (c) {
        getApplicationQuestions(c.id).then(qs => {
          setQuestions(qs);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, [slug]);

  if (!user) {
    return (
      <div className="w-full min-h-[100dvh] flex items-center justify-center bg-canvas-soft px-4 font-body">
        <div className="bg-white rounded-[2rem] p-12 max-w-lg w-full text-center shadow-xl border border-black/5">
          <div className="w-16 h-16 bg-zinc-100 text-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
             <Warning size={32} weight="duotone" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-zinc-500 mb-8">You need to be logged in to apply for a course.</p>
          <Link href={`/auth?returnUrl=/apply?course=${slug}`} className="bg-ink text-canvas px-8 py-4 rounded-full font-bold shadow-md hover:bg-zinc-800 transition-colors inline-block w-full">
            Sign In to Apply
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="w-full min-h-[100dvh] flex items-center justify-center bg-canvas-soft">
      <div className="w-8 h-8 border-4 border-black/10 border-t-zinc-900 rounded-full animate-spin"></div>
    </div>
  );

  if (!course) {
    return (
      <div className="w-full min-h-[100dvh] flex items-center justify-center bg-canvas-soft px-4 font-body">
        <div className="bg-white rounded-[2rem] p-12 max-w-lg w-full text-center shadow-xl border border-black/5">
          <Warning size={64} weight="duotone" className="text-ember mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold mb-4">Course Missing</h1>
          <p className="text-zinc-500 mb-8">The requested course track could not be found in our directory.</p>
          <Link href="/courses" className="bg-ink text-canvas px-8 py-4 rounded-full font-bold shadow-md hover:bg-zinc-800 transition-colors inline-block">
            Browse Active Tracks
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <main className="w-full min-h-[100dvh] flex items-center justify-center bg-canvas-soft px-4 py-24 font-body">
        <section className="bg-white rounded-[2.5rem] p-12 lg:p-16 max-w-2xl w-full text-center shadow-2xl border border-black/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-mint via-transparent to-transparent"></div>
          
          <div className="w-24 h-24 bg-mint/10 text-mint rounded-full flex items-center justify-center mx-auto mb-8 relative z-10">
            <CheckCircle size={48} weight="fill" />
          </div>
          <h1 className="font-display text-4xl font-black mb-4 relative z-10">Application Submitted!</h1>
          <p className="text-zinc-500 text-lg mb-10 relative z-10">
            Your application for <strong className="text-zinc-900">{course.title}</strong> has been successfully received by our review team.
          </p>
          
          <div className="bg-zinc-50 border border-black/5 p-6 rounded-2xl mb-10 text-left relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Next Steps</span>
            <p className="text-zinc-700 font-medium">Our evaluation team will review your credentials and answers within the next 48 hours. Keep an eye on your applications tab.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link href="/applications" className="bg-ink text-canvas font-bold px-8 py-4 rounded-full hover:bg-zinc-800 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
              <Sparkle weight="fill" className="text-brand-fg" /> View My Applications
            </Link>
            <Link href="/courses" className="bg-white border border-black/10 text-zinc-900 font-bold px-8 py-4 rounded-full hover:bg-zinc-50 shadow-sm transition-all flex items-center justify-center">
              Browse More Tracks
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const handleOptionChange = (qId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async () => {
    for (const q of questions) {
      if (q.isRequired && !answers[q.id]) {
        toast("Please answer all required questions before submitting.", "error");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        courseId: course.id,
        courseRoundId: null,
        studentEmail: user.email,
        studentName: user.displayName,
        answers: Object.entries(answers).map(([questionId, answerText]) => ({ questionId, answerText }))
      };
      
      await submitCourseApplication(payload);
      setSuccess(true);
      toast("Application successfully submitted.", "success");
    } catch (e: any) {
      toast(e.message || "Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[100dvh] bg-canvas-soft text-zinc-900 font-body relative overflow-x-hidden">
      
      {/* Header Banner */}
      <div className="w-full h-[300px] bg-zinc-950 relative overflow-hidden flex items-end pb-12">
         <Image 
           src={imageFor(`course-${course.slug}`)}
           alt={course.title}
           fill
           className="object-cover opacity-30 mix-blend-overlay"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent"></div>
         <div className="w-full max-w-[1000px] mx-auto px-6 lg:px-12 relative z-10">
            <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors mb-6">
              <ArrowLeft size={16} weight="bold" /> Back to Course
            </Link>
            <h1 className="font-display text-4xl lg:text-5xl font-black text-white tracking-tight mb-2">
              Apply to {course.title}
            </h1>
            <p className="text-zinc-400 text-lg">Complete the assessment questions below to be considered for the upcoming round.</p>
         </div>
      </div>

      <div className="w-full max-w-[1000px] mx-auto px-6 lg:px-12 py-12 -mt-16 relative z-20">
         
         <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl border border-black/5 flex flex-col gap-10">
           
           {questions.length === 0 ? (
             <div className="text-center py-16">
               <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle size={40} className="text-mint" weight="duotone" />
               </div>
               <h3 className="font-display text-2xl font-bold mb-2">No pre-requisite questions</h3>
               <p className="text-zinc-500 mb-8 max-w-md mx-auto">This course does not require an assessment. You can submit your application immediately.</p>
             </div>
           ) : (
             <div className="flex flex-col gap-12">
               {questions.map((q, i) => (
                 <div key={q.id} className="flex flex-col gap-4">
                   <div className="flex items-start gap-4">
                     <div className="w-8 h-8 rounded-full bg-zinc-950 text-brand-fg flex items-center justify-center font-bold text-sm shrink-0 mt-1">
                       {i + 1}
                     </div>
                     <div className="flex flex-col">
                       <h3 className="font-display text-xl font-bold leading-snug">
                         {q.questionText} {q.isRequired && <span className="text-negative">*</span>}
                       </h3>
                       {q.helpText && <p className="text-zinc-500 text-sm mt-1">{q.helpText}</p>}
                     </div>
                   </div>

                   <div className="pl-12">
                     {q.questionType === "ShortAnswer" ? (
                       <textarea 
                         rows={4} 
                         placeholder="Enter your detailed response..."
                         value={answers[q.id] || ""}
                         onChange={(e) => handleOptionChange(q.id, e.target.value)}
                         className="w-full bg-zinc-50 border border-black/10 rounded-2xl p-5 text-zinc-900 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all shadow-sm resize-none"
                       />
                     ) : (
                       <div className="flex flex-col gap-3">
                         {JSON.parse(q.optionsJson || "[]").map((opt: string) => {
                           const isSelected = answers[q.id] === opt;
                           return (
                             <label 
                               key={opt} 
                               className={`flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-all ${
                                 isSelected ? "bg-zinc-950 border-zinc-950 text-white shadow-md" : "bg-white border-black/10 text-zinc-700 hover:border-black/30 hover:bg-zinc-50"
                               }`}
                             >
                               <input 
                                 type="radio" 
                                 name={q.id} 
                                 value={opt}
                                 checked={isSelected}
                                 onChange={() => handleOptionChange(q.id, opt)}
                                 className="sr-only"
                               />
                               <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-brand-neutral" : "border-black/20"}`}>
                                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-neutral"></div>}
                               </div>
                               <span className={`font-semibold ${isSelected ? "text-white" : "text-zinc-900"}`}>{opt}</span>
                             </label>
                           );
                         })}
                       </div>
                     )}
                   </div>
                 </div>
               ))}
             </div>
           )}

           <div className="pt-8 border-t border-black/5 mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3 bg-brand-neutral/20 text-zinc-900 px-4 py-2 rounded-xl">
                 <Sparkle size={20} className="text-[#d8b4fe]" weight="fill" />
                 <span className="text-sm font-bold">Completing this application earns you +500 XP.</span>
              </div>
              <button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="bg-[#f9644d] text-white px-10 py-5 rounded-full font-bold shadow-[0_8px_20px_-6px_rgba(249,100,77,0.5)] hover:bg-[#e0503a] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? "Submitting Application..." : "Submit Application"}
              </button>
           </div>
         </div>
      </div>
    </div>
  );
}
