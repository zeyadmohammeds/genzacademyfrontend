// API integration for ElSewedy GenZ Academy Platform
import type {
  AdminDashboard,
  AdminCourse,
  ApplicationQuestion,
  AuthUser,
  Cart,
  Course,
  CourseApplication,
  CourseRoom,
  CourseRound,
  LeaderboardEntry,
  LearningTask,
  Notification,
  ReferralSummary,
  StudentProgress,
} from "./types";

import { env } from "./env-config";
import * as Sentry from "@sentry/nextjs";

export const API_BASE = env.apiBaseUrl;

// ─── Brochure Paths ───────────────────────────────────────────────────────────
export const BROCHURE_MAP: Record<string, string> = {
  "scratch":       "/brochures/Scratch_course brochure.pdf",
  "intro-cpp":     "/brochures/Intro_to_C++_course brochure.pdf",
  "advanced-cpp":  "/brochures/Advanced_C++_course brochure.pdf",
  "robot-build":   "/brochures/Robot_Build_course brochure.pdf",
  "web-app-ai":    "/brochures/Web_App_AI_course brochure.pdf",
};

// ─── Fallback Data ────────────────────────────────────────────────────────────
const FALLBACK_COURSES: Course[] = [
  {
    id: "scratch",
    slug: "scratch",
    title: "Scratch Creative Coding",
    subtitle: "Ages 10–13 · Beginner",
    shortDescription: "Animations, games, logic, and creative confidence with Scratch.",
    outcome: "A fully interactive animated story or mini game.",
    minimumAge: 10,
    maximumAge: 13,
    priceEgp: 500,
    coreSessions: 8,
    supportSessions: 4,
    level: "Beginner",
    colorHex: "#7C3AED",
    iconName: "🎮",
    skillsTaughtJson: '["Events","Loops","Conditionals","Sprites","Animation","Game Logic"]',
    phase: 1,
  },
  {
    id: "intro-cpp",
    slug: "intro-cpp",
    title: "Intro to C++",
    subtitle: "Ages 13–16 · Intermediate",
    shortDescription: "Variables, functions, logic, and your first console programs.",
    outcome: "A working console calculator or text adventure game.",
    minimumAge: 13,
    maximumAge: 16,
    priceEgp: 600,
    coreSessions: 8,
    supportSessions: 4,
    level: "Intermediate",
    colorHex: "#0EA5E9",
    iconName: "💻",
    skillsTaughtJson: '["Variables","Functions","Loops","Arrays","Pointers","Logic"]',
    phase: 1,
  },
  {
    id: "advanced-cpp",
    slug: "advanced-cpp",
    title: "Advanced C++",
    subtitle: "Ages 15+ · Advanced",
    shortDescription: "OOP, data structures, and game development with SFML.",
    outcome: "A polished 2D game prototype with collision and scoring.",
    minimumAge: 15,
    priceEgp: 700,
    coreSessions: 8,
    supportSessions: 4,
    level: "Advanced",
    colorHex: "#EF4444",
    iconName: "⚡",
    skillsTaughtJson: '["OOP","Classes","Inheritance","SFML","Data Structures","Game Physics"]',
    phase: 1,
  },
  {
    id: "robot-build",
    slug: "robot-build",
    title: "Robot Build",
    subtitle: "Ages 12–17 · Maker",
    shortDescription: "Design and program a real Arduino-powered robot from scratch.",
    outcome: "A working robot that detects obstacles and follows lines.",
    minimumAge: 12,
    maximumAge: 17,
    priceEgp: 750,
    coreSessions: 8,
    supportSessions: 4,
    level: "Maker",
    colorHex: "#F59E0B",
    iconName: "🤖",
    skillsTaughtJson: '["Arduino","Sensors","Motors","Circuit Design","Programming","Debugging"]',
    phase: 1,
  },
  {
    id: "web-app-ai",
    slug: "web-app-ai",
    title: "Build Web App with AI",
    subtitle: "Ages 13+ · Creator",
    shortDescription: "Ship a live web app using AI-assisted product workflows.",
    outcome: "A deployed web app with a public showcase link.",
    minimumAge: 13,
    priceEgp: 650,
    coreSessions: 8,
    supportSessions: 4,
    level: "Creator",
    colorHex: "#10B981",
    iconName: "🌐",
    skillsTaughtJson: '["HTML","CSS","JavaScript","APIs","AI Tools","Deployment","Git"]',
    phase: 1,
  },
];

const FALLBACK_ROUNDS: CourseRound[] = FALLBACK_COURSES.map((c) => ({
  id: `${c.id}-round`,
  courseId: c.id,
  courseTitle: c.title,
  name: `${c.title} — June 2026`,
  slug: `${c.slug}-june-2026`,
  status: "Upcoming",
  startDate: "2026-06-08",
  endDate: "2026-08-31",
  maxStudents: 20,
  currentStudents: 0,
  isEnrollmentOpen: true,
  autoAcceptPaidApplications: false,
  requireEngineerApproval: true,
}));

// ─── Base HTTP Helpers ────────────────────────────────────────────────────────

export async function apiGet<T>(path: string, fallback: T): Promise<T> {
  Sentry.addBreadcrumb({
    category: "api",
    message: `GET ${path}`,
    level: "info",
  });

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) {
      if (res.status >= 500) {
        Sentry.captureMessage(`API Error ${res.status}: GET ${path}`, "error");
      }
      return fallback;
    }
    return (await res.json()) as T;
  } catch (error) {
    Sentry.captureException(error, { extra: { path, method: "GET" } });
    return fallback;
  }
}

export async function apiPost<T>(path: string, body?: unknown, fallback?: T): Promise<T> {
  Sentry.addBreadcrumb({
    category: "api",
    message: `POST ${path}`,
    data: { body: body ? JSON.stringify(body).substring(0, 200) : undefined },
    level: "info",
  });

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      Sentry.captureMessage(`API Error ${res.status}: POST ${path}`, {
        level: "error",
        extra: { errorBody: text }
      });
      if (fallback !== undefined) return fallback;
      throw new Error(text || `Request failed: ${res.status}`);
    }

    const text = await res.text();
    if (!text) return {} as T;
    return JSON.parse(text) as T;
  } catch (error) {
    Sentry.captureException(error, { extra: { path, method: "POST", body } });
    throw error;
  }
}

export async function apiPut<T>(path: string, body?: unknown, fallback?: T): Promise<T> {
  Sentry.addBreadcrumb({
    category: "api",
    message: `PUT ${path}`,
    data: { body: body ? JSON.stringify(body).substring(0, 200) : undefined },
    level: "info",
  });

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      cache: "no-store",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      Sentry.captureMessage(`API Error ${res.status}: PUT ${path}`, {
        level: "error",
        extra: { errorBody: text }
      });
      if (fallback !== undefined) return fallback;
      throw new Error(text || `Request failed: ${res.status}`);
    }

    const text = await res.text();
    if (!text) return {} as T;
    return JSON.parse(text) as T;
  } catch (error) {
    Sentry.captureException(error, { extra: { path, method: "PUT", body } });
    throw error;
  }
}

export async function apiDelete<T>(path: string, fallback?: T): Promise<T> {
  Sentry.addBreadcrumb({
    category: "api",
    message: `DELETE ${path}`,
    level: "info",
  });

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) {
      Sentry.captureMessage(`API Error ${res.status}: DELETE ${path}`, "error");
      if (fallback !== undefined) return fallback;
      throw new Error(`Delete failed: ${res.status}`);
    }

    const text = await res.text();
    if (!text) return {} as T;
    return JSON.parse(text) as T;
  } catch (error) {
    Sentry.captureException(error, { extra: { path, method: "DELETE" } });
    throw error;
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const getCurrentUser = () =>
  apiGet<AuthUser | null>("/api/auth/me", null);

export const updateProfile = (data: { firstName?: string; lastName?: string; bio?: string; phoneNumber?: string; interestsJson?: string }) =>
  apiPut<any>("/api/profiles/me", data);

export const getGoogleAuthUrl = () => `${API_BASE}/api/auth/google`;

// ─── Courses ──────────────────────────────────────────────────────────────────
export const getCourses = () =>
  apiGet<Course[]>("/api/courses", FALLBACK_COURSES);

export const getCourseBySlug = (slug: string) =>
  apiGet<Course>(
    `/api/courses/${slug}`,
    FALLBACK_COURSES.find((c) => c.slug === slug) ?? FALLBACK_COURSES[0]
  );

// ─── Course Rounds ────────────────────────────────────────────────────────────
export const getCourseRounds = () =>
  apiGet<CourseRound[]>("/api/course-rounds", FALLBACK_ROUNDS);

// ─── Application Questions ────────────────────────────────────────────────────
export function getApplicationQuestions(courseId: string, courseRoundId?: string | null) {
  const q = new URLSearchParams({ courseId });
  if (courseRoundId) q.set("courseRoundId", courseRoundId);
  return apiGet<ApplicationQuestion[]>(`/api/applications/questions?${q}`, [
    {
      id: "demo-q1",
      courseId,
      courseRoundId,
      questionType: "Mcq",
      questionText: "What do you want to build first?",
      helpText: "Choose the answer closest to your goal.",
      optionsJson: JSON.stringify(["A game", "A robot", "A website", "An AI helper"]),
      isRequired: true,
      autoGrade: false,
      sortOrder: 1,
    },
    {
      id: "demo-q2",
      courseId,
      courseRoundId,
      questionType: "TrueFalse",
      questionText: "I can attend the live sessions and technical support weeks.",
      helpText: null,
      optionsJson: JSON.stringify(["True", "False"]),
      isRequired: true,
      autoGrade: false,
      sortOrder: 2,
    },
    {
      id: "demo-q3",
      courseId,
      courseRoundId,
      questionType: "ShortAnswer",
      questionText: "Tell us about a project you would love to build.",
      helpText: "Short answer is fine.",
      optionsJson: "[]",
      isRequired: true,
      autoGrade: false,
      sortOrder: 3,
    },
  ]);
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const getCart = () => apiGet<Cart | null>("/api/cart", null);
export const addToCart = (courseId: string) => apiPost<Cart>("/api/cart/items", { courseId });
export const removeFromCart = (itemId: string) => apiDelete<void>(`/api/cart/items/${itemId}`);
export const checkoutCart = (data: any) => apiPost<void>("/api/cart/checkout", data);

export const validatePromoCode = (code: string) => 
  apiPost<{ discountAmount: number; description: string }>("/api/cart/promo", { code });

// ─── Referrals ────────────────────────────────────────────────────────────────
export const getReferralSummary = () =>
  apiGet<ReferralSummary | null>("/api/referrals/me", null);

// ─── Applications ─────────────────────────────────────────────────────────────
export const getPendingApplications = () =>
  apiGet<CourseApplication[]>("/api/applications/pending", []);

export const getUserApplications = () =>
  apiGet<CourseApplication[]>("/api/applications/my", []);

export const submitCourseApplication = (data: any) =>
  apiPost<void>("/api/applications", data);

export const updateApplicationStatus = (id: string, status: string) =>
  apiPut<void>(`/api/admin/applications/${id}/status`, { status });

export type NotificationSettings = {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  whatsAppEnabled: boolean;
  smsEnabled: boolean;
  whatsAppNumber: string | null;
  emailOverride: string | null;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  inAppEnabled: true,
  emailEnabled: true,
  whatsAppEnabled: true,
  smsEnabled: false,
  whatsAppNumber: null,
  emailOverride: null,
};

export const getNotifications = (page = 1, pageSize = 20) =>
  apiGet<{ items: Notification[]; totalCount: number; page: number; pageSize: number; totalPages: number }>(`/api/notifications?page=${page}&pageSize=${pageSize}`, { items: [], totalCount: 0, page, pageSize, totalPages: 0 });

export const getNotificationSettings = () =>
  apiGet<NotificationSettings>("/api/notifications/settings", DEFAULT_NOTIFICATION_SETTINGS);

export const updateNotificationSettings = (data: NotificationSettings) =>
  apiPut<void>("/api/notifications/settings", data);

export const markNotificationRead = (id: string) =>
  apiPost<void>(`/api/notifications/${id}/read`, {});

export const markAllNotificationsRead = () =>
  apiPost<void>("/api/notifications/read-all", {});

// ─── Leaderboard ─────────────────────────────────────────────────────────────
export const getLeaderboard = () =>
  apiGet<LeaderboardEntry[]>("/api/course-rooms/leaderboard", [
    { studentUserId: "1", studentName: "Youssef K.", xpTotal: 1480, rank: 1, avatarInitial: "Y" },
    { studentUserId: "2", studentName: "Nour A.", xpTotal: 1320, rank: 2, avatarInitial: "N" },
    { studentUserId: "3", studentName: "Mariam S.", xpTotal: 1180, rank: 3, avatarInitial: "M" },
    { studentUserId: "4", studentName: "Omar H.", xpTotal: 940, rank: 4, avatarInitial: "O" },
    { studentUserId: "5", studentName: "Sara M.", xpTotal: 860, rank: 5, avatarInitial: "S" },
  ]);

// ─── Course Room ──────────────────────────────────────────────────────────────
export const getCourseRoom = async (id: string): Promise<CourseRoom> => {
  const fallback = makeDemoCourseRoom(id);
  try {
    const res = await fetch(`${API_BASE}/api/course-rooms/${id}`, {
      cache: "no-store", credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.weeks) return data as CourseRoom;
    }
  } catch { /* fall through */ }
  try {
    const res = await fetch(`${API_BASE}/api/learning/room/${id}`, {
      cache: "no-store", credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.weeks) return data as CourseRoom;
    }
  } catch { /* fall through */ }
  return fallback;
};

function makeDemoCourseRoom(id: string): CourseRoom {
  const course = FALLBACK_COURSES.find((c) => c.id === id || c.slug === id);
  return {
    courseId: course?.id ?? id,
    courseRoundId: id,
    courseTitle: course?.title ?? "Electronics & Build Your Robot",
    roundName: course ? `${course.title} — Current Round` : "Active Cohort — June 2026",
    accessStatus: "Open",
    instructorName: "Eng. Ahmed El-Sherif",
    instructorBio: "Senior Robotics Engineer with 8+ years of experience in embedded systems, IoT, and STEM education.",
    instructorAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Ahmed&backgroundColor=f0f0f0",
    courseDescription: course?.shortDescription ?? "Build, program, and deploy your own intelligent robot from scratch using Arduino, sensors, and actuators.",
    weeks: Array.from({ length: 12 }, (_, i) => ({
      sessionInstanceId: `week-${i + 1}-${Date.now()}`,
      weekNumber: i + 1,
      weekTitle: i === 0 ? "Introduction & Setup" 
        : i % 3 === 2 ? `CTA Lab ${Math.ceil((i + 1) / 3)}` 
        : `Core Build ${i + 1}`,
      sessionType: i === 0 || i % 3 !== 2 ? "Core" : "TechnicalSupport",
      scheduledAt: new Date(Date.now() + i * 7 * 86400000).toISOString(),
      durationMinutes: i % 3 === 2 ? 240 : 90,
      status: i === 0 ? "Live" : i < 2 ? "Completed" : "Scheduled",
    })),
    materials: [
      { id: "m1", title: "Session Playbook PDF", materialType: "Pdf", url: "#", isDownloadable: true },
      { id: "m2", title: `${course?.title ?? "Course"} Checklist`, materialType: "PowerPoint", url: "#", isDownloadable: true },
      { id: "m3", title: "Project Demo Video", materialType: "Video", url: "#", isDownloadable: false },
    ],
    tasks: [
      { id: "t1", title: "Final Product Architecture", description: "Design the core logic for your prototype.", taskType: "Design", submissionType: "File", maxScore: 100, xpReward: 500, dueAt: "2026-06-15", isRequired: true, status: "pending" },
      { id: "t2", title: "Logic Flow Diagram", description: "Map out the decision trees for your AI helper.", taskType: "Logic", submissionType: "Link", maxScore: 50, xpReward: 250, dueAt: "2026-06-20", isRequired: false, status: "submitted" },
    ],
    progress: { xpTotal: 940, attendanceCount: 5, submittedTasks: 4, completedQuizzes: 3, completionPercent: 42 },
    zoomMeetingId: "123456789",
    zoomJoinUrl: undefined,
    zoomMeetingPassword: "1234",
  };
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const getMyTasks = () =>
  apiGet<LearningTask[]>("/api/learning/tasks", []);

export const submitTask = (taskId: string, userId: string, submissionData: { submissionUrl?: string; repositoryUrl?: string; submissionText?: string }) =>
  apiPost<void>("/api/learning/tasks/submissions", { learningTaskId: taskId, studentUserId: userId, ...submissionData });

export const gradeTask = (submissionId: string, score: number, feedback?: string) =>
  apiPost<void>(`/api/learning/tasks/submissions/${submissionId}/grade`, { score, feedback, rubricScoresJson: "{}" });

// ─── Progress ─────────────────────────────────────────────────────────────────
export const getMyProgress = () =>
  apiGet<StudentProgress>("/api/learning/progress", { xpTotal: 0, xpThisWeek: 0, rankGlobal: 0, streakCurrent: 0, streakLongest: 0, attendanceCount: 0, submittedTasks: 0, completedQuizzes: 0, badges: [] });

export const getMyEnrollments = () =>
  apiGet<any[]>("/api/learning/enrollments", []);

export const getMyMaterials = (courseId?: string) =>
  apiGet<any[]>(`/api/learning/materials${courseId ? `?courseId=${courseId}` : ""}`, []);

export const getMyCertificates = () =>
  apiGet<any[]>("/api/learning/certificates", []);

export const getMySessions = () =>
  apiGet<any[]>("/api/learning/sessions", []);

// ─── Admin APIs ───────────────────────────────────────────────────────────────
export const getAdminDashboard = () =>
  apiGet<AdminDashboard>("/api/admin/dashboard", {
    totalCourses: 5,
    activeCourses: 5,
    totalSchools: 12,
    partnerSchools: 5,
    totalEnrollments: 0,
    paidOrders: 0,
    revenueEgp: 0,
    upcomingSessions: 0,
    pendingSubmissions: 0,
    openStudentQuestions: 0,
    courseDemand: [],
    atRiskStudents: [],
  });

export const getAdminCourses = () =>
  apiGet<AdminCourse[]>("/api/admin/courses", FALLBACK_COURSES as AdminCourse[]);

export const createAdminCourse = (data: Partial<AdminCourse>) =>
  apiPost<{ id: string; slug: string }>("/api/admin/courses", data);

export const updateAdminCourse = (id: string, data: Partial<AdminCourse>) =>
  apiPut<{ id: string }>(`/api/admin/courses/${id}`, data);

export const deleteAdminCourse = (id: string) =>
  apiDelete<{ archived: boolean }>(`/api/admin/courses/${id}`);

export const getAdminRounds = (courseId?: string) =>
  apiGet<CourseRound[]>(`/api/admin/rounds${courseId ? `?courseId=${courseId}` : ""}`, FALLBACK_ROUNDS);

export const getAdminRound = (id: string) =>
  apiGet<any>(`/api/admin/rounds/${id}`, null);

export const createAdminRound = (data: Partial<CourseRound>) =>
  apiPost<{ id: string }>("/api/admin/rounds", data);

export const getAdminQuestions = (courseId?: string) =>
  apiGet<ApplicationQuestion[]>(
    `/api/admin/questions${courseId ? `?courseId=${courseId}` : ""}`,
    []
  );

export const deleteAdminQuestion = (id: string) =>
  apiDelete<{ archived: boolean }>(`/api/admin/questions/${id}`);

export const getAdminPendingApplications = () =>
  apiGet<CourseApplication[]>("/api/admin/applications/pending", []);

export const broadcastNotification = (title: string, message: string, type = "info") =>
  apiPost<{ queued: number }>("/api/notifications/broadcast", { title, message, type });

export const getAdminUsers = (role?: string) =>
  apiGet<{ id: string; email: string; firstName: string; lastName: string; displayName: string; createdAt: string; isActive: boolean }[]>(
    `/api/admin/users${role ? `?role=${role}` : ""}`,
    []
  );

export const toggleUserActive = (id: string) =>
  apiPut<{ id: string; isActive: boolean }>(`/api/admin/users/${id}/toggle-active`, {});

export const updateUserRole = (id: string, role: string) =>
  apiPut<{ id: string; role: string }>(`/api/admin/users/${id}/role`, { role });

export const getAdminStudents = (search?: string, page = 1, pageSize = 50) =>
  apiGet<any>(`/api/admin/students?page=${page}&pageSize=${pageSize}${search ? `&search=${encodeURIComponent(search)}` : ""}`, { items: [], totalCount: 0, page: 1, pageSize: 50, totalPages: 0 });

export const getAdminEnrollments = (page = 1, pageSize = 50) =>
  apiGet<any>(`/api/admin/enrollments?page=${page}&pageSize=${pageSize}`, { items: [], totalCount: 0, page: 1, pageSize: 50, totalPages: 0 });

export const getAdminAnalytics = () =>
  apiGet<any>("/api/admin/analytics", {
    monthlyRevenue: 0,
    monthlyEnrollments: 0,
    totalRevenue: 0,
    activeStudents: 0,
    totalCourses: 0,
    totalApplications: 0,
    pendingApplications: 0
  });

export const getAdminSessions = () =>
  apiGet<any[]>("/api/admin/sessions", []);

export const getAllApplications = (status?: string, page = 1, pageSize = 50) =>
  apiGet<any>(`/api/admin/applications?page=${page}&pageSize=${pageSize}${status && status !== "all" ? `&status=${status}` : ""}`, { items: [], totalCount: 0, page: 1, pageSize: 50, totalPages: 0 });

export const getCourseSessions = (courseId: string) =>
  apiGet<any[]>(`/api/admin/course-sessions/${courseId}`, []);

export const createCourseSession = (data: any) =>
  apiPost<{ id: string }>("/api/admin/course-sessions", data);

export const updateCourseSession = (id: string, data: any) =>
  apiPut<{ updated: boolean }>(`/api/admin/course-sessions/${id}`, data);

export const deleteCourseSession = (id: string) =>
  apiDelete<{ deleted: boolean }>(`/api/admin/course-sessions/${id}`);

export const updateRound = (id: string, data: any) =>
  apiPut<{ updated: boolean }>(`/api/admin/rounds/${id}`, data);

export const deleteAdminRound = (id: string) =>
  apiDelete<{ deleted: boolean }>(`/api/admin/rounds/${id}`);

export const uploadCourseMaterial = (courseId: string, data: { title: string; materialType: string; url: string; isDownloadable: boolean }) =>
  apiPost<void>(`/api/admin/courses/${courseId}/materials`, data);

export const updateRoundZoom = (id: string, data: { zoomMeetingId?: string; zoomJoinUrl?: string; zoomStartUrl?: string }) =>
  apiPut<{ updated: boolean }>(`/api/admin/rounds/${id}/zoom`, data);

export const updateCourseStep = (sessionInstanceId: string, data: any) =>
  apiPut<void>(`/api/admin/sessions/${sessionInstanceId}`, data);

export const markApplicationPaid = (applicationId: string, data: { paymentMethod: string; paymentReference: string; amountEgp: number }) =>
  apiPost<void>(`/api/applications/${applicationId}/payment`, data);

export const getApplicationCheckout = (applicationId: string) =>
  apiGet<any>(`/api/payments/application/${applicationId}/checkout`, null);

// ─── Live sessions (Zoom) ─────────────────────────────────────────────────────
export const requestZoomSignature = (meetingNumber: string, role: number) =>
  apiPost<{ signature: string; sdkKey: string; expiresIn: number }>("/api/live-sessions/zoom-signature", {
    meetingNumber,
    role,
  });

// ─── Parent Dashboard APIs ───────────────────────────────────────────────────
export const getParentDashboard = () =>
  apiGet<any>("/api/profiles/parent/dashboard", {
    children: [
      { id: "STU-1", name: "Omar Yasser", age: 14, xp: 1250, nextSession: "Intro to C++: Pointers (Tomorrow, 18:00 EET)" },
      { id: "STU-2", name: "Lina Tarek", age: 11, xp: 840, nextSession: "Scratch: Animation (Friday, 16:00 EET)" }
    ],
    pendingInvoices: [
      { id: "INV-992", amount: "600 EGP", dueDate: "June 25, 2026", status: "Unpaid" }
    ]
  });

export const getParentChildren = () =>
  apiGet<any[]>("/api/profiles/parent/children", []);

export const getParentInvoices = () =>
  apiGet<any[]>("/api/payments/parent/invoices", [
    { id: "INV-991", child: "Omar Yasser", course: "Intro to C++", amount: "600 EGP", date: "May 28, 2026", status: "Paid" },
    { id: "INV-992", child: "Lina Tarek", course: "Scratch Basics", amount: "500 EGP", date: "June 05, 2026", status: "Unpaid" },
  ]);

// ─── Engineer Dashboard APIs ──────────────────────────────────────────────────
export const getEngineerDashboard = () =>
  apiGet<any>("/api/profiles/engineer/dashboard", {
    upcomingSessions: [
      { id: "S-101", title: "Intro to C++: Pointers", group: "Group A", time: "Today, 18:00 EET" }
    ],
    pendingEvaluations: 12,
    activeStudents: 145
  });

export const getEngineerSessions = () =>
  apiGet<any[]>("/api/learning/engineer/sessions", [
    { id: "S-101", title: "Intro to C++: Pointers", group: "Group A", date: "June 15, 2026", time: "18:00 - 19:30 EET" },
  ]);

export const getEngineerStudents = () =>
  apiGet<any[]>("/api/learning/engineer/students", [
    { name: "Omar Yasser", course: "Intro to C++", group: "Group A", xp: 1250, attendance: "92%" },
  ]);

export const getEngineerProgressTasks = () =>
  apiGet<any[]>("/api/learning/engineer/pending-tasks", [
    { title: "C++ Memory Assignment", course: "Intro to C++", group: "Group A", submissions: 12 },
  ]);

// ─── CTA Dashboard APIs ───────────────────────────────────────────────────────
export const getCTADashboard = () =>
  apiGet<any>("/api/profiles/cta/dashboard", {
    sessionsToSupport: 5,
    studentsMentored: 12,
    pendingNotes: 8,
    upcomingSupport: [
      { title: "Intro to C++: Group A", time: "Today, 18:00 EET", lead: "Eng. Ahmed" }
    ]
  });

export const getCTASessions = () =>
  apiGet<any[]>("/api/learning/cta/sessions", [
    { id: "S-101", title: "Intro to C++: Pointers", group: "Group A", date: "June 15, 2026", time: "18:00 - 19:30 EET", lead: "Ahmed El-Sherif" },
  ]);

export const getCTAStudents = () =>
  apiGet<any[]>("/api/learning/cta/students", [
    { name: "Omar Yasser", course: "Intro to C++", group: "Group A", notesCount: 4, status: "Needs Help" },
  ]);

// ─── Extended Admin APIs ──────────────────────────────────────────────────────
export const getAdminPayments = () =>
  apiGet<any[]>("/api/admin/payments", [
    { id: "TXN-001", student: "Omar Yasser", amount: "600 EGP", date: "May 28, 2026", method: "Paymob", status: "Completed" },
  ]);

export const getAdminSchools = () =>
  apiGet<any[]>("/api/admin/schools", [
    { id: "SCH-001", name: "International School of Cairo", activeStudents: 150, status: "Active" },
  ]);

export const getAdminAnnouncements = () =>
  apiGet<any[]>("/api/admin/announcements", [
    { title: "Eid Holiday Schedule", audience: "All Users", date: "2 days ago" },
  ]);
