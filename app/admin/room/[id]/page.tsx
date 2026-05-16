"use client";

import { useEffect, useState, use } from "react";
import { getCourseRoom } from "@/lib/api";
import type { CourseRoom } from "@/lib/types";
import { CourseRoomExperience } from "@/components/CourseRoomExperience";
import { ArrowLeft, Gear, ShieldCheck } from "@phosphor-icons/react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function AdminRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [room, setRoom] = useState<CourseRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "Admin")) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    getCourseRoom(id).then(setRoom).finally(() => setLoading(false));
  }, [id]);

  if (loading || authLoading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!room || !user) return <div className="p-20 text-center">Protocol Error: Room not found.</div>;

  return (
    <div className="min-h-screen bg-canvas-soft">
       {/* Admin Control Bar */}
       <div className="bg-ink text-canvas px-8 py-4 flex items-center justify-between border-b border-white/10 sticky top-0 z-[100]">
          <div className="flex items-center gap-6">
             <Link href="/admin/courses" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold">
                <ArrowLeft weight="bold" /> Back to Architect
             </Link>
             <div className="w-px h-6 bg-white/10" />
             <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-brand" weight="fill" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Administrative Override Active</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Session ID: {id}</span>
             <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Gear size={20} />
             </button>
          </div>
       </div>

       {/* Render the Room with isAdminView=true */}
       <CourseRoomExperience room={room} isAdminView={true} />
    </div>
  );
}
