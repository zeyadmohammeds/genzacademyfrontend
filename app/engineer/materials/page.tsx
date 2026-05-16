"use client";

import { UploadSimple, FilePdf, PresentationChart, FileZip } from "@phosphor-icons/react";

export default function EngineerMaterialsPage() {
  const materials = [
    { name: "Session 4 Slides", course: "Intro to C++", type: "ppt", size: "4.2 MB", date: "Today" },
    { name: "Lab 2 Starter Code", course: "Robotics Basics", type: "zip", size: "12.5 MB", date: "Yesterday" },
    { name: "C++ Cheatsheet", course: "Intro to C++", type: "pdf", size: "1.1 MB", date: "Last Week" },
  ];

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">Manage Materials</h1>
          <p className="text-zinc-500 font-medium">Upload slides, code snippets, and resources for your students.</p>
        </div>
        <button className="bg-brand hover:bg-brand-hover text-brand-fg px-6 py-3 rounded-full font-bold text-sm transition-colors shadow-md shadow-brand/30 flex items-center gap-2">
          <UploadSimple size={18} weight="bold" /> Upload New File
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
         <h2 className="text-2xl font-display font-bold text-zinc-900 mb-6">Recent Uploads</h2>
         
         <div className="space-y-4">
           {materials.map((file, idx) => (
             <div key={idx} className="flex items-center justify-between p-4 bg-zinc-50 border border-black/5 rounded-2xl hover:bg-zinc-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${file.type === 'ppt' ? 'bg-orange-100 text-orange-600' : file.type === 'zip' ? 'bg-zinc-200 text-zinc-600' : 'bg-red-100 text-red-600'}`}>
                    {file.type === 'ppt' ? <PresentationChart size={24} weight="fill" /> : file.type === 'zip' ? <FileZip size={24} weight="fill" /> : <FilePdf size={24} weight="fill" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900">{file.name}</h4>
                    <p className="text-xs text-zinc-500 font-medium">{file.course} • {file.size} • Uploaded {file.date}</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white border border-black/10 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-bold transition-colors">
                  Edit Access
                </button>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
}
