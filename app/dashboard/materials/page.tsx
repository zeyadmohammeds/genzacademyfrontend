"use client";

import { useEffect, useState } from "react";
import { getMyMaterials } from "@/lib/api";
import { FilePdf, FileZip, PresentationChart, DownloadSimple, Folders, Link as LinkIcon } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function StudentMaterialsPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  useEffect(() => {
    if (user) {
      getMyMaterials(selectedCourse || undefined)
        .then(setMaterials)
        .finally(() => setLoading(false));
    }
  }, [user, selectedCourse]);

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "pdf": return { icon: FilePdf, color: "text-red-500" };
      case "zip": case "archive": return { icon: FileZip, color: "text-zinc-500" };
      case "ppt": case "presentation": return { icon: PresentationChart, color: "text-orange-500" };
      case "link": return { icon: LinkIcon, color: "text-blue-500" };
      default: return { icon: FilePdf, color: "text-zinc-500" };
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const safeMaterials = materials || [];
  const folders = Array.from(new Set(safeMaterials.map((m: any) => (m.title || "").split(" ")[0]))).slice(0, 4);

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">Materials & Resources</h1>
        <p className="text-zinc-500 font-medium">Access your course slides, reading materials, and starter code.</p>
      </div>

      {materials.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-black/5">
          <Folders size={48} weight="duotone" className="text-zinc-300 mx-auto mb-4" />
          <h3 className="font-display text-2xl font-bold text-zinc-900 mb-2">No materials yet</h3>
          <p className="text-zinc-500">Materials will appear here once you're enrolled in courses.</p>
          <Link href="/courses" className="inline-block mt-6 px-6 py-3 bg-brand text-brand-fg font-bold rounded-xl hover:bg-brand-hover transition-colors">
            Browse Courses
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-12">
            <h2 className="text-xl font-display font-bold text-zinc-900 mb-6 flex items-center gap-2"><Folders size={24} weight="duotone" className="text-brand" /> Course Folders</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {folders.map((folder, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedCourse("")}
                  className="bg-blue-50 rounded-3xl p-6 shadow-sm border border-black/5 hover:-translate-y-1 transition-transform cursor-pointer group text-left"
                >
                   <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center mb-4 text-blue-600">
                     <Folders size={24} weight="fill" />
                   </div>
                   <h3 className="font-bold text-zinc-900 mb-1 truncate">{folder}</h3>
                   <p className="text-xs font-medium text-zinc-600">{materials.filter(m => m.title.startsWith(folder)).length} files</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-display font-bold text-zinc-900 mb-6">All Materials</h2>
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-black/5">
              <div className="space-y-3">
                {materials.map((file, idx) => {
                  const { icon: Icon, color } = getIcon(file.materialType);
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 border border-transparent hover:border-black/5 transition-all group cursor-pointer">
                       <div className="flex items-center gap-4">
                         <div className={`w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                            <Icon size={24} weight="duotone" />
                         </div>
                         <div>
                           <h4 className="font-bold text-zinc-900 text-sm sm:text-base group-hover:text-brand transition-colors">{file.title}</h4>
                           <p className="text-xs font-medium text-zinc-500 mt-1">{file.materialType} • {file.isDownloadable ? "Downloadable" : "View only"}</p>
                         </div>
                       </div>
                      {file.url ? (
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-brand hover:text-brand-fg transition-colors shrink-0"
                        >
                          <DownloadSimple size={18} weight="bold" />
                        </a>
                      ) : (
                        <button className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-brand hover:text-brand-fg transition-colors shrink-0">
                          <DownloadSimple size={18} weight="bold" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
