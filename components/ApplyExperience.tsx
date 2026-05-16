"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle, Question, Desktop, Sparkle, ListChecks, ShieldCheck } from "@phosphor-icons/react";
import { apiGet, apiPost } from "@/lib/api";
import type { Course } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

export function ApplyExperience({ courses }: { courses: Course[] }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || "");
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    return (
      <main className="page-shell inner-page">
        <section className="section-pad" style={{ textAlign: "center", padding: "120px 20px" }}>
          <div className="auth-lock-icon" style={{ 
            width: 80, height: 80, background: "var(--paper-strong)", borderRadius: "50%", 
            display: "grid", placeItems: "center", margin: "0 auto 32px", color: "var(--brand)" 
            }}>
            <ShieldCheck size={48} weight="duotone" />
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900 }}>Login Required</h1>
          <p style={{ color: "var(--muted)", maxWidth: 500, margin: "24px auto", fontSize: "1.1rem" }}>
            To ensure your application is tracked correctly, you must be signed in to your ElSewedy Academy account.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 40 }}>
            <Link href="/auth" className="button button-dark">Sign in to Apply</Link>
            <Link href="/courses" className="button button-light">Browse Courses</Link>
          </div>
        </section>
      </main>
    );
  }

  useEffect(() => {
    if (selectedCourseId) {
      async function loadQuestions() {
        try {
          const qs = await apiGet<any[]>(`/api/applications/questions?courseId=${selectedCourseId}`, []);
          setQuestions(qs);
        } catch (e) {
          // Fallback to demo if none found
          setQuestions([
            { id: "q1", questionText: "Why do you want to join this course?", questionType: "text" },
            { id: "q2", questionText: "What is your current experience level?", questionType: "text" }
          ]);
        }
      }
      loadQuestions();
    }
  }, [selectedCourseId]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  async function submit() {
    if (!user) return alert("You must be logged in to apply.");
    setBusy(true);
    try {
      await apiPost("/api/applications", {
        courseId: selectedCourseId,
        studentEmail: user.email,
        studentName: user.displayName,
        answers: Object.entries(answers).map(([id, val]) => ({ questionId: id, answerText: val }))
      });
      setSubmitted(true);
    } catch (e) {
      alert("Error: " + (e instanceof Error ? e.message : "Unknown error"));
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <main className="page-shell inner-page">
        <section className="section-pad animate-fade" style={{ textAlign: "center", padding: "100px 20px" }}>
          <div className="success-icon-wrap" style={{ 
            width: 80, height: 80, background: "var(--brand-soft)", borderRadius: "50%", 
            display: "grid", placeItems: "center", margin: "0 auto 32px", color: "var(--brand)" 
          }}>
            <CheckCircle size={48} weight="duotone" />
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: 900 }}>Application Received!</h1>
          <p style={{ color: "var(--muted)", maxWidth: 500, margin: "24px auto", fontSize: "1.2rem" }}>
            Our technical team will review your assessment. You'll receive a notification and an email once you're accepted into the course round.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 40 }}>
            <a href="/dashboard" className="button button-dark">Go to Dashboard</a>
            <a href="/courses" className="button button-light">Browse More</a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell inner-page">
      <section className="section-pad">
        <div className="apply-header" style={{ maxWidth: 800, margin: "0 auto 60px", textAlign: "center" }}>
          <p className="section-kicker">Admission Portal</p>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, marginTop: 12 }}>
            Join the Next Generation.
            <Sparkle size={32} weight="duotone" style={{ verticalAlign: "middle", marginLeft: 12, color: "var(--solar)" }} />
          </h1>
        </div>

        <div className="apply-wizard-card ops-card" style={{ maxWidth: 800, margin: "0 auto", padding: 0, overflow: "hidden" }}>
          <div className="wizard-sidebar" style={{ background: "var(--paper-strong)", padding: 40, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <div className="stepper-horizontal" style={{ display: "flex", gap: 40 }}>
              {[
                { n: 1, l: "Select Course" },
                { n: 2, l: "Technical Assessment" },
                { n: 3, l: "Final Review" }
              ].map(s => (
                <div key={s.n} className={`step-item ${step === s.n ? "active" : ""} ${step > s.n ? "done" : ""}`} style={{ 
                  display: "flex", alignItems: "center", gap: 12, opacity: step >= s.n ? 1 : 0.4 
                }}>
                  <div className="step-num" style={{ 
                    width: 32, height: 32, borderRadius: "50%", background: step >= s.n ? "var(--ink)" : "transparent",
                    border: "2px solid var(--ink)", color: step >= s.n ? "#fff" : "var(--ink)",
                    display: "grid", placeItems: "center", fontWeight: 800
                  }}>{step > s.n ? <CheckCircle size={20} weight="bold" /> : s.n}</div>
                  <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="wizard-content" style={{ padding: 40 }}>
            {step === 1 && (
              <div className="step-pane animate-fade">
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
                  <Desktop size={32} weight="duotone" color="var(--brand)" />
                  <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Choose your track</h2>
                </div>
                <div className="course-selector-grid" style={{ display: "grid", gap: 16 }}>
                  {courses.map(course => (
                    <div 
                      key={course.id} 
                      className={`course-opt ${selectedCourseId === course.id ? "selected" : ""}`}
                      onClick={() => setSelectedCourseId(course.id)}
                      style={{ 
                        padding: 24, borderRadius: 20, border: "2px solid", 
                        borderColor: selectedCourseId === course.id ? "var(--ink)" : "rgba(0,0,0,0.05)",
                        background: selectedCourseId === course.id ? "rgba(0,0,0,0.02)" : "transparent",
                        cursor: "pointer", transition: "200ms"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong style={{ display: "block", fontSize: "1.1rem" }}>{course.title}</strong>
                          <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{course.level} • {course.coreSessions} Sessions</span>
                        </div>
                        {selectedCourseId === course.id && <CheckCircle size={24} weight="fill" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step-pane animate-fade">
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
                  <Question size={32} weight="duotone" color="var(--brand)" />
                  <div>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Technical Assessment</h2>
                    <p style={{ color: "var(--muted)" }}>Assessment for: {selectedCourse?.title}</p>
                  </div>
                </div>
                <div className="questions-stack" style={{ display: "grid", gap: 32 }}>
                  {questions.map(q => (
                    <label key={q.id} style={{ display: "block" }}>
                      <span style={{ display: "block", marginBottom: 12, fontWeight: 700, fontSize: "1.05rem" }}>{q.questionText}</span>
                      <textarea 
                        rows={4} 
                        required 
                        value={answers[q.id] || ""}
                        onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                        placeholder="Type your detailed answer here..." 
                        style={{ padding: 20, borderRadius: 16, background: "var(--paper-soft)", border: "1px solid rgba(0,0,0,0.1)" }}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="step-pane animate-fade" style={{ textAlign: "center" }}>
                <div className="review-hero" style={{ padding: "40px 0" }}>
                  <div style={{ width: 64, height: 64, background: "var(--brand-soft)", borderRadius: 16, display: "grid", placeItems: "center", margin: "0 auto 24px" }}>
                    <ListChecks size={32} weight="duotone" color="var(--brand)" />
                  </div>
                  <h2 style={{ fontSize: "2rem", fontWeight: 900 }}>Ready to Submit?</h2>
                  <p style={{ color: "var(--muted)", maxWidth: 500, margin: "16px auto" }}>
                    Double check your answers. Once submitted, your application will enter the review queue.
                  </p>
                </div>
                <div className="review-summary" style={{ background: "var(--paper-soft)", padding: 24, borderRadius: 20, textAlign: "left" }}>
                  <strong style={{ display: "block", marginBottom: 8 }}>Applying for:</strong>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{selectedCourse?.title}</div>
                </div>
              </div>
            )}

            <div className="wizard-actions" style={{ marginTop: 48, display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: 32 }}>
              {step > 1 ? (
                <button className="button button-light" onClick={() => setStep(step - 1)}>
                  <ArrowLeft size={18} weight="bold" /> Back
                </button>
              ) : <div />}
              
              {step < 3 ? (
                <button className="button button-dark" onClick={() => setStep(step + 1)}>
                  Continue <ArrowRight size={18} weight="bold" />
                </button>
              ) : (
                <button className="button button-dark" disabled={busy} onClick={submit}>
                  {busy ? "Submitting..." : "Submit Application"} <CheckCircle size={18} weight="bold" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
