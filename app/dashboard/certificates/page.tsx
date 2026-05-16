"use client";

import { useEffect, useState } from "react";
import { Certificate, DownloadSimple, ShareNetwork, LockKey } from "@phosphor-icons/react";
import { getMyCertificates } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function StudentCertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getMyCertificates().then(setCertificates).finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="w-full px-6 lg:px-12 pt-6 pb-24">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight mb-2">My Certificates</h1>
        <p className="text-zinc-500 font-medium">View, download, and verify your completed course certificates.</p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm border border-black/5">
          <Certificate size={48} weight="duotone" className="text-zinc-300 mx-auto mb-4" />
          <h3 className="font-display text-2xl font-bold text-zinc-900 mb-2">No certificates yet</h3>
          <p className="text-zinc-500 mb-6">Complete courses to earn your certificates.</p>
          <Link href="/my-courses" className="inline-block px-6 py-3 bg-brand text-brand-fg font-bold rounded-xl hover:bg-brand-hover transition-colors">
            View My Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand rounded-full blur-[60px] opacity-10"></div>
              
              <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 bg-ink text-brand rounded-2xl flex items-center justify-center shadow-lg">
                  <Certificate size={32} weight="fill" />
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-lg tracking-wider uppercase">Issued</span>
              </div>
              
              <h3 className="font-display text-2xl font-black text-zinc-900 mb-2">{cert.courseTitle}</h3>
              <p className="text-sm font-medium text-zinc-500 mb-6">Issued on {new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 py-3 bg-brand hover:bg-brand-hover text-brand-fg rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <DownloadSimple size={18} weight="bold" /> Download PDF
                </button>
                <button className="py-3 px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <ShareNetwork size={18} weight="bold" /> Share
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-black/5 text-xs text-zinc-400 font-medium">
                Credential ID: {cert.certificateNumber}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
