// ─── Core Domain Types ───────────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: "student" | "parent" | "engineer" | "cta" | "school_admin" | "academy_admin" | string;
  emailConfirmed: boolean;
  profileCompleted: boolean;
  referralCode?: string | null;
  totalXp: number;
  level: number;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  shortDescription: string;
  outcome: string;
  minimumAge: number;
  maximumAge?: number;
  priceEgp: number;
  coreSessions: number;
  supportSessions: number;
  level: string;
  phase?: number;
  colorHex?: string;
  iconName?: string;
  coverImageUrl?: string;
  skillsTaughtJson?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  modules?: CourseModule[];
};

export type CourseModule = {
  sortOrder: number;
  title: string;
  projectOutcome: string;
};

export type CourseRound = {
  id: string;
  courseId: string;
  courseTitle: string;
  name: string;
  slug: string;
  status: string;
  startDate: string;
  endDate?: string;
  maxStudents: number;
  currentStudents: number;
  isEnrollmentOpen: boolean;
  autoAcceptPaidApplications: boolean;
  requireEngineerApproval: boolean;
};

export type ApplicationQuestion = {
  id: string;
  courseId: string;
  courseRoundId?: string | null;
  questionType: "Mcq" | "TrueFalse" | "ShortAnswer" | string;
  questionText: string;
  helpText?: string | null;
  optionsJson: string;
  isRequired: boolean;
  autoGrade: boolean;
  sortOrder: number;
};

export type CourseApplication = {
  id: string;
  courseId: string;
  courseTitle?: string;
  courseRoundId?: string | null;
  roundName?: string;
  studentName?: string;
  studentEmail?: string;
  status: string;
  questionsPassed: boolean;
  paymentUnlocked: boolean;
  paymentCompleted: boolean;
  reviewDecision: string;
  applicationScore: number;
  submittedAt?: string;
};

export type CartItem = {
  id: string;
  courseId: string;
  courseTitle: string;
  courseRoundId?: string | null;
  unitPriceEgp: number;
  discountAmountEgp: number;
  finalPriceEgp: number;
  isBundleItem: boolean;
};

export type Cart = {
  id: string;
  subtotalEgp: number;
  discountAmountEgp: number;
  totalEgp: number;
  discountSummary?: string | null;
  items: CartItem[];
};

export type ReferralSummary = {
  referralCode: string;
  totalReferrals: number;
  paidConversions: number;
  xpEarned: number;
  discountCreditsEgp: number;
};

export type LeaderboardEntry = {
  studentUserId: string;
  studentName: string;
  xpTotal: number;
  rank: number;
  avatarInitial?: string;
};

export type CourseRoom = {
  courseId: string;
  courseRoundId: string;
  courseTitle: string;
  roundName: string;
  accessStatus: string;
  instructorName?: string;
  instructorBio?: string;
  instructorAvatar?: string;
  courseDescription?: string;
  weeks: SessionWeek[];
  materials: CourseMaterial[];
  tasks: LearningTask[];
  progress: CourseProgress;
  zoomMeetingId?: string;
  zoomJoinUrl?: string;
  zoomMeetingPassword?: string;
};

export type SessionWeek = {
  sessionInstanceId: string;
  weekNumber: number;
  weekTitle: string;
  sessionType: "Core" | "TechnicalSupport" | string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
};

export type CourseMaterial = {
  id: string;
  title: string;
  materialType: string;
  url: string;
  isDownloadable: boolean;
};

export type CourseProgress = {
  xpTotal: number;
  attendanceCount: number;
  submittedTasks: number;
  completedQuizzes: number;
  completionPercent: number;
};

export type AdminDashboard = {
  totalCourses: number;
  activeCourses: number;
  totalSchools: number;
  partnerSchools: number;
  totalEnrollments: number;
  paidOrders: number;
  revenueEgp: number;
  upcomingSessions: number;
  pendingSubmissions: number;
  openStudentQuestions: number;
  courseDemand: CourseDemand[];
  atRiskStudents: AtRiskStudent[];
};

export type CourseDemand = {
  courseId: string;
  courseTitle: string;
  enrollmentCount: number;
  revenueEgp: number;
};

export type AtRiskStudent = {
  studentUserId: string;
  studentName: string;
  email: string;
  missedSessions: number;
  pendingTasks: number;
};

export type AdminCourse = Course & {
  id: string;
  description: string;
  maximumAge?: number;
  skillsTaughtJson: string;
  phase: number;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  channel: string;
  createdAt: string;
};

export type StudentProgress = {
  xpTotal: number;
  xpThisWeek: number;
  rankGlobal: number;
  streakCurrent: number;
  streakLongest: number;
  attendanceCount: number;
  submittedTasks: number;
  completedQuizzes: number;
  badges: Badge[];
};

export type Badge = {
  id: string;
  slug: string;
  name: string;
  description: string;
  colorHex: string;
  earnedAt?: string;
};

export type LearningTask = {
  id: string;
  title: string;
  description: string;
  taskType: string;
  submissionType: string;
  maxScore: number;
  xpReward: number;
  dueAt: string;
  isRequired: boolean;
  status: "pending" | "submitted" | "graded" | string;
  score?: number;
  feedback?: string;
};

// ─── Paginated Response ─────────────────────────────

export type PaginatedResponse<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
