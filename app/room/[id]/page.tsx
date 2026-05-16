"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCourseRoom } from "@/lib/api";
import { CourseRoomExperience } from "@/components/CourseRoomExperience";
import type { CourseRoom } from "@/lib/types";

export default function RoomPage() {
  const params = useParams();
  const id = params.id as string;
  const [room, setRoom] = useState<CourseRoom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getCourseRoom(id);
      if (!cancelled) setRoom(data);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!room) return <div className="p-12 text-center text-zinc-500 font-medium">Course room not available.</div>;

  return <CourseRoomExperience room={room} />;
}
