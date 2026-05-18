"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminStudents } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast-context";
import { Student, Funnel, MagnifyingGlass, UserPlus, ArrowLeft, DownloadSimple, FileCsv } from "@phosphor-icons/react";
import { Table, type Column } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { exportToCsv } from "@/lib/csv-export";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const fetchStudents = useCallback(() => {
    setLoading(true);
    getAdminStudents(search || undefined)
      .then(data => setStudents(data?.items ?? []))
      .catch(err => toast(err?.message || "Failed to load students", "error"))
      .finally(() => setLoading(false));
  }, [search, toast]);

  useEffect(() => {
    const timer = setTimeout(() => fetchStudents(), 350);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  const columns: Column<any>[] = [
    {
      key: "studentName",
      label: "Student Info",
      sortable: true,
      render: (stu) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
            <Student size={20} weight="fill" />
          </div>
          <div>
            <div className="font-bold text-zinc-900">{stu.studentName}</div>
            <div className="text-xs font-medium text-zinc-500 font-mono">{stu.studentEmail}</div>
          </div>
        </div>
      ),
    },
    { key: "courseName", label: "Course", sortable: true, render: (stu) => <span className="font-bold text-zinc-700">{stu.courseName}</span> },
    { key: "studentXp", label: "XP", sortable: true, render: (stu) => <span className="font-bold text-brand">{stu.studentXp || 0}</span> },
    {
      key: "enrollmentStatus",
      label: "Status",
      sortable: true,
      render: (stu) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${stu.enrollmentStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
          {stu.enrollmentStatus || 'Active'}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      sortable: true,
      render: (stu) => <span className="text-zinc-500 text-sm">{stu.createdAt ? new Date(stu.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</span>,
    },
    {
      key: "id",
      label: "Actions",
      width: "100px",
      render: (stu) => (
        <button
          onClick={(e) => { e.stopPropagation(); router.push(`/admin/students/${stu.id}`); }}
          className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors"
        >
          Profile
        </button>
      ),
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-24">
      <div className="mb-6 sm:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 hover:underline">
            <ArrowLeft size={14} weight="bold" /> Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-2">Students Registry</h1>
          <p className="text-zinc-500 font-medium">Complete database of all academy students.</p>
        </div>
        <div className="flex items-center gap-3">
          {students.length > 0 && (
            <button
              onClick={() => exportToCsv(students.map((s: any) => ({ Name: s.studentName, Email: s.studentEmail, Course: s.courseName, XP: s.studentXp, Status: s.enrollmentStatus, Joined: s.createdAt })), "students")}
              className="px-5 py-3 bg-zinc-50 border border-black/10 rounded-2xl font-bold text-sm text-zinc-700 flex items-center gap-2 hover:bg-zinc-100 transition-colors micro-hover"
            >
              <FileCsv size={18} weight="bold" /> Export CSV
            </button>
          )}
          <Link
            href="/admin/applications"
            className="w-full sm:w-fit bg-ink text-canvas px-6 py-3 rounded-full font-bold text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 btn-micro"
          >
            <UserPlus size={18} weight="bold" /> Add Student
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm border border-black/5">
         <div className="flex flex-col md:flex-row gap-4 mb-8">
           <div className="relative flex-1">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <MagnifyingGlass size={20} className="text-zinc-400" />
             </div>
             <input
               type="text"
               placeholder="Search by name, email, or course..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-zinc-50 border border-black/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
             />
           </div>
           <button
             onClick={() => toast("Filter options coming soon", "info")}
             className="px-6 py-3 bg-zinc-50 border border-black/10 rounded-2xl font-bold text-sm text-zinc-700 flex items-center gap-2 hover:bg-zinc-100 transition-colors micro-hover"
           >
             <Funnel size={18} weight="bold" /> Filters
           </button>
         </div>

        {loading ? (
          <SkeletonTable rows={6} cols={6} />
        ) : students.length === 0 ? (
          <EmptyState
            icon={<Student size={32} className="text-zinc-300" />}
            title="No students found"
            description={search ? "Try a different search term." : "No students are enrolled yet."}
            action={!search ? (
              <Link href="/admin/applications" className="px-5 py-2.5 bg-ink text-white rounded-full text-sm font-bold hover:bg-zinc-800 transition-colors">
                Review Applications
              </Link>
            ) : undefined}
          />
        ) : (
          <Table
            columns={columns}
            data={students}
            keyExtractor={(s: any) => s.id || Math.random().toString()}
            onRowClick={(s: any) => router.push(`/admin/students/${s.id}`)}
          />
        )}
      </div>
    </div>
  );
}
