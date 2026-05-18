"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlass, Funnel, Student, X, Check, Users } from "@phosphor-icons/react";
import { getEngineerStudents, getApplicationDetails } from "@/lib/api";

export default function EngineerStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [appDetails, setAppDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    getEngineerStudents()
      .then(data => setStudents(data || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedAppId) {
      setAppDetails(null);
      return;
    }
    setDetailsLoading(true);
    getApplicationDetails(selectedAppId)
      .then(res => setAppDetails(res))
      .catch(() => {})
      .finally(() => setDetailsLoading(false));
  }, [selectedAppId]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.course.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24 relative">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">Student Directory</h1>
        <p className="text-zinc-500 font-medium">Browse and search all students across your active courses.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
         
         {/* Toolbar */}
         <div className="flex flex-col md:flex-row gap-4 mb-8">
           <div className="relative flex-1">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <MagnifyingGlass size={20} className="text-zinc-400" />
             </div>
             <input 
               type="text" 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search students by name, ID or course..." 
               className="w-full bg-zinc-50 border border-black/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40" 
             />
           </div>
         </div>

         {/* Table */}
         <div className="overflow-x-auto">
            {loading ? (
              <div className="text-zinc-500 font-bold py-10">Loading student directory...</div>
            ) : filteredStudents.length > 0 ? (
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-black/5">
                    <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Student</th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Course & Group</th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Attendance</th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Current Grade</th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((stu, idx) => (
                    <tr key={idx} className="border-b border-black/5 hover:bg-zinc-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-zinc-200 flex items-center justify-center text-zinc-500">
                             <Student size={20} weight="fill" />
                           </div>
                           <div>
                             <div className="font-bold text-zinc-900">{stu.name}</div>
                             <div className="text-xs font-medium text-zinc-500 font-mono">{stu.id}</div>
                           </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-zinc-700">{stu.course}</div>
                        <div className="text-xs font-bold text-zinc-400 uppercase">{stu.group}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-zinc-900">{stu.attendance}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-700 font-bold text-xs">
                          {stu.grade}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {stu.applicationId ? (
                          <button 
                            onClick={() => setSelectedAppId(stu.applicationId)}
                            className="px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors"
                          >
                             View Screening Answers
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-400 font-medium">Direct Enrollment</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-zinc-500 font-medium py-10">No students found.</div>
            )}
         </div>
      </div>

      {/* Slide-over Answers Panel */}
      {selectedAppId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedAppId(null)}
          />
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col z-10 animate-[slide-in_0.4s_ease-out]">
            {/* Header */}
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-zinc-50">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand">Candidate Evaluation View</span>
                <h2 className="text-xl font-display font-black text-zinc-900 mt-1">
                  {detailsLoading ? "Loading student details..." : appDetails?.studentName || "Student Profile"}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedAppId(null)}
                className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors bg-white hover:shadow-sm"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
                  <span className="text-sm text-zinc-400 font-bold">Retrieving evaluation answers...</span>
                </div>
              ) : appDetails ? (
                <>
                  {/* Student Metadata Card */}
                  <div className="bg-zinc-50 border border-black/5 rounded-[1.5rem] p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Student Name</span>
                        <span className="font-bold text-zinc-900 text-sm block mt-0.5">{appDetails.studentName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Email Address</span>
                        <span className="font-bold text-zinc-900 text-sm block mt-0.5 break-all">{appDetails.studentEmail}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Enrolled Course</span>
                        <span className="font-bold text-zinc-900 text-sm block mt-0.5">{appDetails.courseTitle}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Assigned Cohort</span>
                        <span className="font-bold text-zinc-900 text-sm block mt-0.5">{appDetails.roundName || "General Cohort"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Screening Score</span>
                        <span className="font-bold text-zinc-900 text-sm block mt-0.5">{appDetails.applicationScore != null ? `${appDetails.applicationScore}%` : "Not graded"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Submitted At</span>
                        <span className="font-bold text-zinc-900 text-sm block mt-0.5">{appDetails.submittedAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Student Answers Section */}
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-zinc-900 text-lg">Evaluation Answers</h3>
                    {appDetails.answers && appDetails.answers.length > 0 ? (
                      <div className="space-y-4">
                        {appDetails.answers.map((answer: any, idx: number) => (
                          <div key={idx} className="border border-black/5 rounded-2xl p-4 bg-white shadow-sm space-y-2.5">
                            <div className="flex items-start justify-between gap-3">
                              <span className="text-xs font-black text-brand bg-brand-hover px-2.5 py-1 rounded-lg">Q{idx + 1}</span>
                              {answer.isCorrect !== null && (
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${answer.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {answer.isCorrect ? "Correct" : "Incorrect / Pending"}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-zinc-900">{answer.questionText}</p>
                            
                            <div className="bg-zinc-50 border border-black/5 rounded-xl p-3">
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Student Answer:</span>
                              <p className="text-sm font-medium text-zinc-800 break-words">{answer.answerText || "No answer provided."}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-400 text-sm font-medium">No application questions were configured for this student's round.</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-zinc-500 text-center text-sm">Failed to retrieve candidate profile.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
