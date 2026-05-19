"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCourseRoom, getUserApplications, getCourses } from "@/lib/api";
import { CourseRoomExperience } from "@/components/CourseRoomExperience";
import type { CourseRoom, CourseApplication, Course } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { LockKey, ArrowLeft, Bell, CalendarBlank, Warning, ArrowRight, CaretRight } from "@phosphor-icons/react";
import Link from "next/link";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();
  
  const [room, setRoom] = useState<CourseRoom | null>(null);
  const [applications, setApplications] = useState<CourseApplication[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [roomData, appsData, coursesData] = await Promise.all([
          getCourseRoom(id).catch(() => null),
          getUserApplications().catch(() => []),
          getCourses().catch(() => [])
        ]);

        if (!cancelled) {
          setRoom(roomData);
          setApplications(appsData);
          setCourses(coursesData);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-black/10 border-t-zinc-900 animate-spin" />
      </div>
    );
  }

  // Bypass checks for admin, engineer, or course assistant roles
  const userRole = user?.role?.toLowerCase() || "";
  const isStaff = userRole === "academy_admin" || userRole === "engineer" || userRole === "cta";

  if (!isStaff) {
    // 1. Verify Application exists and has been approved & paid
    const app = applications.find(a => a.courseId === id);
    const course = courses.find(c => c.id === id);

    const isAccepted = app ? (app.status.toLowerCase() === "accepted" || app.status.toLowerCase() === "approved" || app.status.toLowerCase() === "paid") : false;
    const isPaid = app ? (app.paymentCompleted || app.status.toLowerCase() === "paid") : false;

    if (!app || !isAccepted || !isPaid) {
      return (
        <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-white border border-black/5 rounded-[2.5rem] p-10 shadow-xl flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-500 mb-8 animate-[pulse_2s_infinite]">
              <LockKey size={36} weight="fill" />
            </div>
            
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff1a1a] mb-3 block">
              Access Restricted
            </span>
            <h2 className="font-display font-black text-3xl text-zinc-900 mb-4 tracking-tight leading-none">
              Enrollment Required
            </h2>
            <p className="text-zinc-500 font-medium text-sm leading-relaxed mb-8 max-w-md">
              To enter this private interactive course room, your track application must be accepted by our engineering board and enrollment fees fully processed.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Link 
                href="/dashboard/applications"
                className="px-8 py-4 bg-[#ff1a1a] text-white hover:bg-[#cc0000] rounded-2xl font-black text-xs uppercase tracking-widest shadow-md shadow-[#ff1a1a]/20 hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2"
              >
                My Applications <ArrowRight size={14} weight="bold" />
              </Link>
              <Link 
                href="/dashboard"
                className="px-8 py-4 bg-zinc-50 hover:bg-zinc-100 border border-black/5 text-zinc-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // 2. Verify Course is Active
    if (course && course.isActive === false) {
      return (
        <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-white border border-black/5 rounded-[2.5rem] p-10 shadow-xl flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-8 animate-bounce">
              <CalendarBlank size={36} weight="fill" />
            </div>
            
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-3 block">
              Preparation Stage
            </span>
            <h2 className="font-display font-black text-3xl text-zinc-900 mb-4 tracking-tight leading-none">
              Course Hasn&apos;t Started Yet
            </h2>
            <p className="text-zinc-500 font-medium text-sm leading-relaxed mb-8 max-w-md">
              Your enrollment is active and fully verified! We are currently assembling class materials and technical environments. We will notify you instantly via Email and Phone.
            </p>

            <div className="bg-zinc-50 border border-black/5 rounded-2xl p-5 mb-8 w-full text-left flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center text-zinc-400 shrink-0">
                <Bell size={20} weight="fill" className="text-[#ff1a1a]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-zinc-900 text-sm">Verify Broadcast Settings</h4>
                <p className="text-xs text-zinc-400 font-medium leading-normal">
                  Make sure your email notifications and SMS/WhatsApp communications preferences are properly enabled in your profile settings.
                </p>
                <Link 
                  href="/dashboard/profile"
                  className="text-[10px] font-black uppercase tracking-wider text-[#ff1a1a] hover:text-[#cc0000] inline-flex items-center gap-1 mt-1 transition-all"
                >
                  Configure Notifications <CaretRight size={10} weight="bold" />
                </Link>
              </div>
            </div>

            <div className="flex gap-3 w-full justify-center">
              <Link 
                href="/dashboard"
                className="px-8 py-4 bg-zinc-900 text-white hover:bg-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-md hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} weight="bold" /> Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-black/5 rounded-[2.5rem] p-8 shadow-lg text-center">
          <Warning size={48} className="text-zinc-300 mx-auto mb-6" />
          <h3 className="font-display font-bold text-xl text-zinc-900 mb-2">Room Setup Incomplete</h3>
          <p className="text-zinc-500 text-sm font-medium mb-6">This course round&apos;s virtual room environment has not been initialized by academy administrators yet.</p>
          <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold text-sm transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const course = courses.find(c => c.id === room.courseId);
  const enrichedRoom: CourseRoom = {
    ...room,
    courseSlug: course?.slug,
    courseImageUrl: course?.coverImageUrl || course?.imageUrl,
    difficulty: course?.level || "Advanced",
    durationHours: course?.coreSessions ? `${course.coreSessions * 1.5} Hours` : "12.5 Hours"
  };

  return <CourseRoomExperience room={enrichedRoom} />;
}
