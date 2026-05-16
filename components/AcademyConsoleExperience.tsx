"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  BellRinging,
  Books,
  CalendarPlus,
  CheckCircle,
  CreditCard,
  Exam,
  Files,
  Lightning,
  ListChecks,
  Megaphone,
  ShoppingCart,
  Student,
  Trophy,
  UsersThree,
  VideoCamera
} from "@phosphor-icons/react";
import {
  apiPost,
  apiPut,
  getApplicationQuestions,
  getCart,
  getPendingApplications,
  getReferralSummary
} from "@/lib/api";
import type {
  ApplicationQuestion,
  Cart,
  Course,
  CourseApplication,
  CourseRoom,
  CourseRound,
  LeaderboardEntry,
  ReferralSummary
} from "@/lib/types";

type ConsoleTab = "student" | "commerce" | "room" | "staff" | "admin";

type ConsoleProps = {
  courses: Course[];
  rounds: CourseRound[];
  room: CourseRoom;
  leaderboard: LeaderboardEntry[];
};

export function AcademyConsoleExperience({ courses, rounds, room, leaderboard }: ConsoleProps) {
  const [tab, setTab] = useState<ConsoleTab>("student");
  const [status, setStatus] = useState("Console ready. Use real IDs from backend data when submitting staff operations.");
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? "");
  const [selectedRoundId, setSelectedRoundId] = useState(rounds[0]?.id ?? "");
  const [questions, setQuestions] = useState<ApplicationQuestion[]>([]);
  const [application, setApplication] = useState<CourseApplication | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [referral, setReferral] = useState<ReferralSummary | null>(null);
  const [pending, setPending] = useState<CourseApplication[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getApplicationQuestions(selectedCourseId, selectedRoundId).then(setQuestions).catch(() => setQuestions([]));
  }, [selectedCourseId, selectedRoundId]);

  useEffect(() => {
    getCart().then(setCart).catch(() => setCart(null));
    getReferralSummary().then(setReferral).catch(() => setReferral(null));
    getPendingApplications().then(setPending).catch(() => setPending([]));
  }, []);

  async function run<T>(message: string, action: () => Promise<T>) {
    setBusy(true);
    try {
      const result = await action();
      setStatus(message);
      return result;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Request failed.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await run("Application submitted. If questions pass, payment opens.", () =>
      apiPost<CourseApplication>("/api/applications", {
        courseId: selectedCourseId,
        courseRoundId: selectedRoundId || null,
        studentEmail: String(form.get("studentEmail")),
        studentName: String(form.get("studentName")),
        answers: questions.map((question) => ({
          questionId: question.id,
          answerText: String(form.get(`question-${question.id}`) || "")
        }))
      })
    );

    if (result) setApplication(result);
  }

  async function markPaid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!application) return;
    const form = new FormData(event.currentTarget);
    const result = await run("Payment recorded. Application moved to academy review.", () =>
      apiPost<CourseApplication>(`/api/applications/${application.id}/payment`, {
        paymentMethod: String(form.get("paymentMethod")),
        paymentReference: String(form.get("paymentReference")),
        amountEgp: Number(form.get("amountEgp"))
      })
    );
    if (result) setApplication(result);
  }

  async function cartAction(path: string, body?: unknown, message = "Cart updated.") {
    const result = await run(message, () => apiPost<Cart | { orderId: string }>(path, body));
    const nextCart = await getCart().catch(() => null);
    setCart(nextCart);
    return result;
  }

  async function staffSubmit(event: FormEvent<HTMLFormElement>, path: string, message: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    await run(message, () => apiPost(path, coerceBody(body)));
  }

  return (
    <main className="page-shell inner-page">
      <section className="console-hero section-pad">
        <div>
          <p className="section-kicker">Academy operating system</p>
          <h1>Every backend workflow now has a frontend surface.</h1>
          <p>
            Student application, questions, payment, cart, referral, notifications, course room, Zoom config, content,
            quizzes, attendance, application review, and round operations live here.
          </p>
        </div>
        <div className="console-status">
          <Lightning size={24} weight="duotone" />
          <span>{status}</span>
        </div>
      </section>

      <section className="console-tabs">
        {[
          ["student", "Student flow", Student],
          ["commerce", "Cart and payment", ShoppingCart],
          ["room", "Course room", Books],
          ["staff", "Staff workspace", ListChecks],
          ["admin", "Roles and security", UsersThree]
        ].map(([value, label, Icon]) => {
          const TypedIcon = Icon as typeof Student;
          return (
            <button className={tab === value ? "active" : ""} key={String(value)} onClick={() => setTab(value as ConsoleTab)} type="button">
              <TypedIcon size={18} weight="duotone" />
              {String(label)}
            </button>
          );
        })}
      </section>

      {tab === "student" && (
        <section className="console-grid section-pad compact-pad">
          <form className="ops-card stacked-form" onSubmit={submitApplication}>
            <FormTitle icon={CheckCircle} title="Application with questions" />
            <div className="two-fields">
              <label>
                Course
                <select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)}>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Course round
                <select value={selectedRoundId} onChange={(event) => setSelectedRoundId(event.target.value)}>
                  {rounds.map((round) => (
                    <option key={round.id} value={round.id}>
                      {round.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="two-fields">
              <label>
                Student name
                <input name="studentName" required placeholder="Mariam Ahmed" />
              </label>
              <label>
                Student email
                <input name="studentEmail" required type="email" placeholder="mariam@example.com" />
              </label>
            </div>
            {questions.map((question) => (
              <QuestionField question={question} key={question.id} />
            ))}
            <button className="button button-dark" disabled={busy} type="submit">
              Submit application
              <ArrowRight size={18} weight="bold" />
            </button>
          </form>

          <form className="ops-card stacked-form" onSubmit={markPaid}>
            <FormTitle icon={CreditCard} title="Payment unlock" />
            <div className="application-receipt">
              <strong>{application ? application.status : "No application submitted yet"}</strong>
              <span>Questions passed: {application?.questionsPassed ? "Yes" : "Waiting"}</span>
              <span>Payment unlocked: {application?.paymentUnlocked ? "Yes" : "No"}</span>
              <span>Score: {application?.applicationScore ?? 0}%</span>
            </div>
            <label>
              Payment method
              <select name="paymentMethod" defaultValue="manual">
                <option>manual</option>
                <option>paymob</option>
                <option>fawry</option>
              </select>
            </label>
            <label>
              Payment reference
              <input name="paymentReference" placeholder="Receipt or gateway reference" />
            </label>
            <label>
              Amount EGP
              <input name="amountEgp" type="number" defaultValue={courses.find((x) => x.id === selectedCourseId)?.priceEgp ?? 0} />
            </label>
            <button className="button button-dark" disabled={!application?.paymentUnlocked || busy} type="submit">
              Mark application paid
              <ArrowRight size={18} weight="bold" />
            </button>
          </form>
        </section>
      )}

      {tab === "commerce" && (
        <section className="console-grid section-pad compact-pad">
          <div className="ops-card stacked-form">
            <FormTitle icon={ShoppingCart} title="Cart, bundle, promo, referral" />
            <button className="button button-dark" onClick={() => cartAction("/api/cart/items", { courseId: selectedCourseId, courseRoundId: selectedRoundId }, "Course added to cart.")} type="button">
              Add selected course
            </button>
            <button className="button button-light" onClick={() => cartAction("/api/cart/bundle", undefined, "Full bundle added with bundle discount.")} type="button">
              Add all-course bundle
            </button>
            <div className="two-fields">
              <InlineAction label="Promo code" placeholder="GENZ25" onSubmit={(code) => cartAction("/api/cart/promo", { code }, "Promo applied.")} />
              <InlineAction label="Referral code" placeholder="REF-ZIAD" onSubmit={(referralCode) => cartAction("/api/cart/referral", { referralCode }, "Referral applied.")} />
            </div>
            <button className="button button-dark" onClick={() => cartAction("/api/cart/checkout", { paymentMethod: "manual" }, "Checkout created.")} type="button">
              Checkout cart
              <CreditCard size={18} weight="bold" />
            </button>
          </div>

          <div className="ops-card">
            <FormTitle icon={Trophy} title="Cart and referral summary" />
            <div className="cart-total">
              <span>Subtotal</span>
              <strong>EGP {cart?.subtotalEgp ?? 0}</strong>
              <span>Discount</span>
              <strong>EGP {cart?.discountAmountEgp ?? 0}</strong>
              <span>Total</span>
              <strong>EGP {cart?.totalEgp ?? 0}</strong>
            </div>
            <p>{cart?.discountSummary ?? "No discount applied yet."}</p>
            <div className="cart-items">
              {cart?.items?.map((item) => (
                <div key={item.id}>
                  <strong>{item.courseTitle}</strong>
                  <span>EGP {item.finalPriceEgp}</span>
                </div>
              ))}
            </div>
            <div className="application-receipt">
              <strong>Referral: {referral?.referralCode ?? "Sign in to load"}</strong>
              <span>{referral?.totalReferrals ?? 0} registrations</span>
              <span>{referral?.paidConversions ?? 0} paid conversions</span>
              <span>{referral?.xpEarned ?? 0} XP earned</span>
            </div>
          </div>
        </section>
      )}

      {tab === "room" && (
        <section className="console-grid section-pad compact-pad">
          <div className="ops-card">
            <FormTitle icon={VideoCamera} title="Course room and embedded Zoom" />
            <div className="zoom-frame">
              <VideoCamera size={46} weight="duotone" />
              <strong>Zoom Meeting SDK container</strong>
              <span>Use `/api/live-sessions/{room.weeks[0]?.sessionInstanceId}/embed-config` for SDK config.</span>
            </div>
            <div className="room-weeks-mini">
              {room.weeks.slice(0, 6).map((week) => (
                <div key={week.sessionInstanceId}>
                  <strong>Week {week.weekNumber}: {week.weekTitle}</strong>
                  <span>{week.sessionType} | {week.status} | {week.durationMinutes} min</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ops-card stacked-form">
            <FormTitle icon={Exam} title="Student submissions and XP" />
            <form className="stacked-form" onSubmit={(event) => staffSubmit(event, "/api/learning/tasks/submissions", "Task submitted.")}>
              <label>
                Learning task ID
                <input name="learningTaskId" placeholder="GUID" />
              </label>
              <label>
                Student user ID
                <input name="studentUserId" placeholder="GUID" />
              </label>
              <label>
                Submission URL
                <input name="submissionUrl" placeholder="https://..." />
              </label>
              <label>
                Submission text
                <textarea name="submissionText" placeholder="My work..." />
              </label>
              <button className="button button-dark" type="submit">Submit task</button>
            </form>
            <div className="leader-mini">
              {leaderboard.slice(0, 5).map((entry) => (
                <span key={entry.studentUserId}>{entry.rank}. {entry.studentName} | {entry.xpTotal} XP</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === "staff" && (
        <section className="console-grid section-pad compact-pad">
          <StaffForms courses={courses} rounds={rounds} staffSubmit={staffSubmit} busy={busy} />
          <div className="ops-card stacked-form">
            <FormTitle icon={CheckCircle} title="Pending applications review" />
            {pending.map((item) => (
              <div className="pending-row" key={item.id}>
                <div>
                  <strong>{item.studentEmail}</strong>
                  <span>{item.status} | Score {item.applicationScore}%</span>
                </div>
                <button
                  className="button button-dark"
                  onClick={() => run("Application accepted and student notified.", () => apiPost(`/api/applications/${item.id}/review`, { accepted: true, notes: "Accepted from console." }))}
                  type="button"
                >
                  Accept
                </button>
                <button
                  className="button button-light"
                  onClick={() => run("Application rejected and student notified.", () => apiPost(`/api/applications/${item.id}/review`, { accepted: false, notes: "Rejected from console." }))}
                  type="button"
                >
                  Reject
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "admin" && (
        <section className="roles-grid section-pad compact-pad">
          {[
            ["Admin", "Create courses/rounds, review dashboards, send notifications, manage academy data."],
            ["Engineer", "Review/accept students, move students between rounds, monitor technical progress."],
            ["Instructor", "Create Zoom sessions, teach live, manage lessons, materials, tasks, and quizzes."],
            ["CAT", "Add quizzes, lessons, materials, support-week content, and assist course delivery."],
            ["Student", "Apply, pay, join course rooms, submit quizzes/tasks, earn XP, and receive notifications."]
          ].map(([role, text]) => (
            <article className="role-card" key={role}>
              <strong>{role}</strong>
              <p>{text}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

function StaffForms({
  courses,
  rounds,
  staffSubmit,
  busy
}: {
  courses: Course[];
  rounds: CourseRound[];
  staffSubmit: (event: FormEvent<HTMLFormElement>, path: string, message: string) => Promise<void>;
  busy: boolean;
}) {
  const firstCourse = courses[0]?.id ?? "";
  const firstRound = rounds[0]?.id ?? "";

  return (
    <div className="ops-card staff-stack">
      <FormTitle icon={CalendarPlus} title="Create and manage learning" />
      
      <form className="mini-op-form" onSubmit={(event) => staffSubmit(event, "/api/courses", "Course created.")}>
        <input name="slug" placeholder="course-slug" required />
        <input name="title" placeholder="Course Title" required />
        <input name="shortDescription" placeholder="Short Description" required />
        <input name="outcome" placeholder="Course Outcome" />
        <input name="minimumAge" type="number" defaultValue={10} />
        <input name="priceEgp" type="number" defaultValue={1000} />
        <input name="coreSessions" type="number" defaultValue={8} />
        <input name="supportSessions" type="number" defaultValue={4} />
        <select name="level" defaultValue="Beginner">
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
        <select name="isPublished" defaultValue="true">
          <option>true</option>
          <option>false</option>
        </select>
        <button className="button button-dark" disabled={busy} type="submit">Create course</button>
      </form>

      <form className="mini-op-form" onSubmit={(event) => staffSubmit(event, "/api/course-rounds", "Course round created.")}>
        <input name="courseId" defaultValue={firstCourse} placeholder="Course ID" />
        <input name="name" placeholder="Round name" />
        <input name="slug" placeholder="round-slug" />
        <input name="description" placeholder="Description" />
        <input name="startDate" type="date" />
        <input name="endDate" type="date" />
        <input name="maxStudents" type="number" defaultValue={20} />
        <input name="engineerUserId" placeholder="Engineer user ID" />
        <input name="ctaUserId" placeholder="CAT user ID" />
        <select name="mode" defaultValue="Online"><option>Online</option><option>Hybrid</option><option>InPerson</option></select>
        <select name="autoAcceptPaidApplications" defaultValue="false"><option>false</option><option>true</option></select>
        <select name="requireEngineerApproval" defaultValue="true"><option>true</option><option>false</option></select>
        <button className="button button-dark" disabled={busy} type="submit">Create round</button>
      </form>

      <form className="mini-op-form" onSubmit={(event) => staffSubmit(event, "/api/applications/questions", "Application question created.")}>
        <input name="courseId" defaultValue={firstCourse} placeholder="Course ID" />
        <input name="courseRoundId" defaultValue={firstRound} placeholder="Round ID optional" />
        <select name="questionType" defaultValue="Mcq"><option>Mcq</option><option>TrueFalse</option><option>ShortAnswer</option></select>
        <input name="questionText" placeholder="Question text" />
        <input name="helpText" placeholder="Help text" />
        <input name="optionsJson" defaultValue='["Yes","No"]' />
        <input name="correctAnswer" placeholder="Correct answer" />
        <select name="autoGrade" defaultValue="true"><option>true</option><option>false</option></select>
        <input name="sortOrder" type="number" defaultValue={1} />
        <button className="button button-dark" disabled={busy} type="submit">Add question</button>
      </form>

      <form className="mini-op-form" onSubmit={(event) => staffSubmit(event, "/api/learning/lessons", "Lesson created.")}>
        <input name="courseId" defaultValue={firstCourse} />
        <input name="courseRoundId" defaultValue={firstRound} />
        <input name="courseSessionId" placeholder="Session ID optional" />
        <input name="weekNumber" type="number" defaultValue={1} />
        <select name="sessionType" defaultValue="Core"><option>Core</option><option>TechnicalSupport</option><option>Workshop</option></select>
        <input name="title" placeholder="Lesson title" />
        <input name="summary" placeholder="Summary" />
        <textarea name="contentMarkdown" placeholder="Markdown lesson content" />
        <input name="sortOrder" type="number" defaultValue={1} />
        <select name="isPublished" defaultValue="true"><option>true</option><option>false</option></select>
        <button className="button button-dark" disabled={busy} type="submit">Add lesson</button>
      </form>

      <form className="mini-op-form" onSubmit={(event) => staffSubmit(event, "/api/learning/materials", "Material created.")}>
        <input name="courseId" defaultValue={firstCourse} />
        <input name="courseRoundId" defaultValue={firstRound} />
        <input name="courseLessonId" placeholder="Lesson ID optional" />
        <select name="materialType" defaultValue="Pdf"><option>Pdf</option><option>PowerPoint</option><option>Video</option><option>Link</option></select>
        <input name="title" placeholder="Material title" />
        <input name="url" placeholder="https://..." />
        <input name="description" placeholder="Description" />
        <select name="isDownloadable" defaultValue="true"><option>true</option><option>false</option></select>
        <select name="isPublished" defaultValue="true"><option>true</option><option>false</option></select>
        <button className="button button-dark" disabled={busy} type="submit">Add material</button>
      </form>

      <form className="mini-op-form" onSubmit={(event) => staffSubmit(event, "/api/quizzes", "Quiz created.")}>
        <input name="courseSessionId" placeholder="Session ID optional" />
        <input name="courseRoundId" defaultValue={firstRound} />
        <input name="title" placeholder="Quiz title" />
        <select name="quizType" defaultValue="Formative"><option>Formative</option><option>MidCourse</option><option>FinalExam</option><option>Bonus</option></select>
        <input name="timeLimitMinutes" type="number" defaultValue={30} />
        <input name="maxAttempts" type="number" defaultValue={2} />
        <input name="passScore" type="number" defaultValue={60} />
        <input name="xpReward" type="number" defaultValue={50} />
        <select name="isPublished" defaultValue="true"><option>true</option><option>false</option></select>
        <button className="button button-dark" disabled={busy} type="submit">Create quiz</button>
      </form>

      <form className="mini-op-form" onSubmit={(event) => staffSubmit(event, "/api/notifications/send", "Notification queued.")}>
        <input name="recipientUserId" placeholder="Recipient user ID" />
        <input name="templateKey" defaultValue="manual-console" />
        <input name="subject" placeholder="Subject" />
        <textarea name="body" placeholder="Notification body" />
        <input name="channels" defaultValue="InApp,Email,WhatsApp" />
        <button className="button button-dark" disabled={busy} type="submit">Send notification</button>
      </form>
    </div>
  );
}

function QuestionField({ question }: { question: ApplicationQuestion }) {
  let options: string[] = [];
  try {
    options = JSON.parse(question.optionsJson) as string[];
  } catch {
    options = [];
  }

  if (question.questionType === "ShortAnswer") {
    return (
      <label>
        {question.questionText}
        <textarea name={`question-${question.id}`} required={question.isRequired} placeholder={question.helpText ?? "Write your answer"} />
      </label>
    );
  }

  return (
    <label>
      {question.questionText}
      <select name={`question-${question.id}`} required={question.isRequired}>
        {(options.length ? options : question.questionType === "TrueFalse" ? ["True", "False"] : ["Yes", "No"]).map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function InlineAction({ label, placeholder, onSubmit }: { label: string; placeholder: string; onSubmit: (value: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <label>
      {label}
      <span className="inline-input">
        <input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} />
        <button className="button button-dark" onClick={() => onSubmit(value)} type="button">Apply</button>
      </span>
    </label>
  );
}

function FormTitle({ icon: Icon, title }: { icon: typeof CheckCircle; title: string }) {
  return (
    <div className="form-title">
      <Icon size={30} weight="duotone" />
      <h2>{title}</h2>
    </div>
  );
}

function coerceBody(entries: Record<string, FormDataEntryValue>) {
  const body: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(entries)) {
    const text = String(value);
    if (text === "") {
      body[key] = null;
    } else if (text === "true" || text === "false") {
      body[key] = text === "true";
    } else if (key === "channels") {
      body[key] = text.split(",").map((item) => item.trim()).filter(Boolean);
    } else if (key.toLowerCase().endsWith("id") || key.toLowerCase().includes("userid")) {
      body[key] = text || null;
    } else if (!Number.isNaN(Number(text)) && text.trim() !== "") {
      body[key] = Number(text);
    } else {
      body[key] = text;
    }
  }
  return body;
}
