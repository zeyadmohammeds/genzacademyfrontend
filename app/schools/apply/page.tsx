"use client";

import { useState } from "react";
import { ArrowRight, Buildings, CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";

export default function SchoolApplicationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="w-full bg-canvas-soft min-h-screen font-body flex items-center justify-center p-6">
        <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full shadow-xl border border-black/5 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-8">
            <CheckCircle size={48} weight="fill" />
          </div>
          <h2 className="font-display text-3xl font-black text-zinc-900 mb-4">Application Received</h2>
          <p className="text-zinc-500 font-medium mb-8">
            Thank you for your interest in partnering with ElSewedy GenZ Coders. Our B2B team will contact you within 2-3 business days.
          </p>
          <Link href="/" className="px-8 py-4 bg-zinc-900 text-white rounded-full font-bold text-sm inline-block hover:bg-black transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-canvas-soft min-h-screen font-body py-20 px-6 lg:px-12 flex justify-center">
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-black/5 w-full max-w-3xl">
        <div className="flex items-center gap-4 mb-8 border-b border-black/5 pb-8">
          <div className="w-16 h-16 bg-[#0284c7]/10 rounded-2xl flex items-center justify-center text-[#0284c7]">
            <Buildings size={32} weight="duotone" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black text-zinc-900">Partner Application</h1>
            <p className="text-zinc-500 font-medium">Apply to become an official ElSewedy Academy partner school.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-900">School Name *</label>
              <input required type="text" className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] outline-none transition-all" placeholder="e.g. International School of Cairo" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-900">Website</label>
              <input type="url" className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] outline-none transition-all" placeholder="https://" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-900">Contact Person Name *</label>
              <input required type="text" className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] outline-none transition-all" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-900">Role/Title *</label>
              <input required type="text" className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] outline-none transition-all" placeholder="Principal / IT Director" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-900">Email Address *</label>
              <input required type="email" className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] outline-none transition-all" placeholder="email@school.edu" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-900">Phone Number *</label>
              <input required type="tel" className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] outline-none transition-all" placeholder="+20 100 000 0000" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-900">Estimated number of interested students</label>
            <select className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] outline-none transition-all text-zinc-900">
              <option>Less than 50</option>
              <option>50 - 100</option>
              <option>100 - 200</option>
              <option>200+</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-900">Additional Information</label>
            <textarea rows={4} className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] outline-none transition-all resize-none" placeholder="Tell us more about your school and goals..." />
          </div>

          <div className="pt-4">
            <button disabled={loading} type="submit" className="w-full bg-[#0284c7] hover:bg-[#026b9e] text-white py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg">
              {loading ? "Submitting..." : "Submit Application"} <ArrowRight size={20} weight="bold" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
