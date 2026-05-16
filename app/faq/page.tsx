"use client";

import { useState } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";

const faqs = [
  {
    category: "General",
    items: [
      { q: "Who can join the academy?", a: "ElSewedy GenZ Coders is designed for youth ages 10 to 18. Our courses are structured by age group and skill level." },
      { q: "Are the sessions online or offline?", a: "Currently, our core sessions are conducted live online via our integrated Course Room platform, allowing students from anywhere to join." },
      { q: "Do I need prior coding experience?", a: "Not for the beginner tracks! Courses like Scratch and Intro to C++ assume zero prior knowledge. Advanced courses have prerequisites." },
    ]
  },
  {
    category: "Enrollment & Payment",
    items: [
      { q: "How does the application process work?", a: "Students apply for a course and answer a few short questions. Once reviewed by our engineers, accepted students are invited to complete payment and secure their spot." },
      { q: "What payment methods are accepted?", a: "We accept all major credit cards and local mobile wallets (e.g. Vodafone Cash, Fawry) via our secure Paymob integration." },
      { q: "Is there a sibling discount?", a: "Yes, we offer an automatic 10% discount when you enroll two or more siblings." },
    ]
  },
  {
    category: "Learning Experience",
    items: [
      { q: "What is a CTA?", a: "A Certified Teaching Assistant (CTA) is a top graduate of our academy who provides technical support, helps grade tasks, and mentors current students." },
      { q: "How do parents track progress?", a: "Parents have a dedicated dashboard where they can see their child's attendance, completed tasks, XP earned, and upcoming sessions." },
      { q: "What happens if a student misses a session?", a: "All live sessions are recorded and uploaded to the Course Room materials section within 24 hours. However, live attendance is highly encouraged to earn maximum XP." },
    ]
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>("0-0");

  const toggle = (id: string) => {
    if (openIndex === id) setOpenIndex(null);
    else setOpenIndex(id);
  };

  return (
    <div className="w-full bg-canvas-soft min-h-screen font-body pb-32 pt-12 px-6 lg:px-12">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl font-black tracking-tight text-zinc-900 mb-6">
            Frequently Asked <span className="text-brand">Questions</span>
          </h1>
          <p className="text-zinc-500 text-lg font-medium">Everything you need to know about ElSewedy Academy.</p>
        </div>

        <div className="space-y-12">
          {faqs.map((group, gIdx) => (
            <div key={gIdx}>
              <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-4">
                {group.category}
                <div className="flex-1 h-px bg-black/10"></div>
              </h2>
              <div className="space-y-4">
                {group.items.map((item, iIdx) => {
                  const id = `${gIdx}-${iIdx}`;
                  const isOpen = openIndex === id;
                  return (
                    <div key={iIdx} className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden transition-all">
                      <button 
                        onClick={() => toggle(id)}
                        className="w-full px-6 py-5 flex items-center justify-between bg-white hover:bg-zinc-50 text-left"
                      >
                        <span className="font-bold text-zinc-900 pr-8">{item.q}</span>
                        {isOpen ? <CaretUp size={20} className="text-brand" weight="bold" /> : <CaretDown size={20} className="text-zinc-400" weight="bold" />}
                      </button>
                      <div 
                        className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <p className="text-zinc-600 font-medium text-sm leading-relaxed border-t border-black/5 pt-4">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
