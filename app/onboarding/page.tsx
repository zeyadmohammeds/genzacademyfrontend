"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CaretRight, Sparkle, UserCircle } from "@phosphor-icons/react";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

const STEPS = ["basics", "interests", "goals"];
const INTEREST_OPTIONS = ["Robotics", "AI", "Web apps", "Games", "C++", "Design", "Entrepreneurship"];

export default function OnboardingPage() {
  const { user, setUser, refresh } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  
  const [formData, setFormData] = useState({
    age: "",
    nationalId: "",
    schoolName: "",
    gradeLevel: "",
    experienceLevel: "Beginner",
    preferredTrack: "",
    goals: "",
    interests: [] as string[]
  });

  if (!user) {
    return (
      <main className="page-shell">
        <div className="section-pad text-center">
          <h1>Please Sign In</h1>
          <p>You must be signed in to access onboarding.</p>
        </div>
      </main>
    );
  }

  if (user.profileCompleted) {
    router.push("/dashboard");
    return null;
  }

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const nextStep = () => {
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
  };

  const submitOnboarding = async () => {
    setBusy(true);
    try {
      const result = await apiPost("/api/auth/onboarding", {
        age: Number(formData.age || 0),
        nationalId: formData.nationalId || null,
        schoolName: formData.schoolName || null,
        gradeLevel: formData.gradeLevel,
        experienceLevel: formData.experienceLevel,
        goals: formData.goals || null,
        preferredTrack: formData.preferredTrack || null,
        interestsJson: JSON.stringify(formData.interests),
        skip: false,
      });
      setUser(result as any);
      await refresh();
      toast("Profile completed! You earned 100 XP.", "success");
      router.push("/dashboard");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to save profile.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page-shell" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--paper-soft)" }}>
      <div className="ops-card" style={{ maxWidth: 600, width: "100%", padding: 48, background: "var(--paper-strong)" }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--ink)", color: "var(--paper-strong)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Sparkle size={32} weight="duotone" />
          </div>
          <h1 style={{ fontSize: "2rem" }}>Welcome to the Academy</h1>
          <p style={{ color: "var(--muted)" }}>Let's personalize your learning experience.</p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
          {STEPS.map((step, idx) => (
            <div key={step} style={{ flex: 1, height: 6, borderRadius: 3, background: idx <= stepIndex ? "var(--brand)" : "rgba(0,0,0,0.05)" }} />
          ))}
        </div>

        {STEPS[stepIndex] === "basics" && (
          <div className="stacked-form animate-fade">
            <h2 style={{ marginBottom: 24 }}>The Basics</h2>
            <div className="two-fields">
              <label>
                Age
                <input type="number" required value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} placeholder="15" />
              </label>
              <label>
                Grade Level
                <input required value={formData.gradeLevel} onChange={e => setFormData({ ...formData, gradeLevel: e.target.value })} placeholder="e.g. Grade 10" />
              </label>
            </div>
            <label>
              School Name
              <input value={formData.schoolName} onChange={e => setFormData({ ...formData, schoolName: e.target.value })} placeholder="Your school" />
            </label>
            <label>
              National ID (Optional)
              <input value={formData.nationalId} onChange={e => setFormData({ ...formData, nationalId: e.target.value })} placeholder="National ID" />
            </label>
            
            <button className="button button-dark" onClick={nextStep} disabled={!formData.age || !formData.gradeLevel} style={{ width: "100%", marginTop: 24, justifyContent: "center" }}>
              Continue <CaretRight size={20} />
            </button>
          </div>
        )}

        {STEPS[stepIndex] === "interests" && (
          <div className="stacked-form animate-fade">
            <h2 style={{ marginBottom: 24 }}>What excites you?</h2>
            <div className="interest-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {INTEREST_OPTIONS.map(interest => (
                <label key={interest} className="check-pill" style={{ 
                  background: formData.interests.includes(interest) ? "var(--ink)" : "transparent",
                  color: formData.interests.includes(interest) ? "var(--paper-strong)" : "var(--ink)",
                  border: `1px solid ${formData.interests.includes(interest) ? "var(--ink)" : "var(--line)"}`,
                  padding: "16px", borderRadius: "12px", cursor: "pointer", textAlign: "center", fontWeight: 700
                }}>
                  <input type="checkbox" style={{ display: "none" }} checked={formData.interests.includes(interest)} onChange={() => toggleInterest(interest)} />
                  {interest}
                </label>
              ))}
            </div>
            
            <button className="button button-dark" onClick={nextStep} style={{ width: "100%", marginTop: 32, justifyContent: "center" }}>
              Continue <CaretRight size={20} />
            </button>
          </div>
        )}

        {STEPS[stepIndex] === "goals" && (
          <div className="stacked-form animate-fade">
            <h2 style={{ marginBottom: 24 }}>Your Experience & Goals</h2>
            <label>
              Experience Level
              <select value={formData.experienceLevel} onChange={e => setFormData({ ...formData, experienceLevel: e.target.value })}>
                <option>New</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>
            <label>
              What are your main goals?
              <textarea value={formData.goals} onChange={e => setFormData({ ...formData, goals: e.target.value })} placeholder="I want to learn..." rows={4} />
            </label>
            
            <button className="button button-dark" onClick={submitOnboarding} disabled={busy} style={{ width: "100%", marginTop: 24, justifyContent: "center" }}>
              {busy ? "Saving..." : "Finish Setup"} <Sparkle size={20} />
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
