"use client";

import { CheckCircle, Info } from "@phosphor-icons/react";
import Link from "next/link";

export default function PricingPage() {
  const plans = [
    {
      name: "Beginner Track",
      price: "500 EGP",
      desc: "Perfect for ages 10-13 starting their journey.",
      color: "bg-brand-hover",
      textColor: "text-zinc-900",
      btnClass: "bg-zinc-900 text-white hover:bg-black",
      features: ["8 Core Live Sessions", "4 Technical Support Weeks", "Scratch & Basic Logic", "Academy Certificate", "Parent Dashboard Access"],
    },
    {
      name: "Intermediate Track",
      price: "600 EGP",
      desc: "For ages 13-16 ready to code in text.",
      color: "bg-ink",
      textColor: "text-white",
      btnClass: "bg-brand text-brand-fg hover:bg-brand-hover",
      popular: true,
      features: ["8 Core Live Sessions", "4 Technical Support Weeks", "Intro to C++ & Python", "Build Console Apps", "Academy Certificate", "Parent Dashboard Access"],
    },
    {
      name: "Maker & Advanced",
      price: "700+ EGP",
      desc: "Hardware and advanced software engineering.",
      color: "bg-white",
      textColor: "text-zinc-900",
      btnClass: "bg-zinc-900 text-white hover:bg-black",
      features: ["8 Core Live Sessions", "4 Technical Support Weeks", "Robotics or Advanced OOP", "Physical Kits (Optional Add-on)", "Academy Certificate", "Parent Dashboard Access"],
    }
  ];

  return (
    <div className="w-full bg-canvas-soft min-h-screen font-body selection:bg-brand selection:text-brand-fg pb-32 pt-12 px-6 lg:px-12">
      
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="font-display text-5xl font-black tracking-tight text-zinc-900 mb-6">
          Simple, transparent <span className="text-brand">pricing</span>.
        </h1>
        <p className="text-zinc-500 text-lg font-medium">
          Invest in your child's future. All courses include live sessions, technical support, and full platform access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1200px] mx-auto mb-24">
        {plans.map((plan, idx) => (
          <div key={idx} className={`${plan.color} rounded-[2.5rem] p-8 shadow-sm border ${plan.color === 'bg-white' ? 'border-black/5' : 'border-transparent'} flex flex-col relative`}>
            {plan.popular && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-brand text-brand-fg text-xs font-bold rounded-full shadow-md uppercase tracking-wider">
                Most Popular
              </span>
            )}
            <h3 className={`font-display text-2xl font-bold mb-2 ${plan.textColor}`}>{plan.name}</h3>
            <p className={`text-sm mb-8 ${plan.textColor === 'text-white' ? 'text-zinc-400' : 'text-zinc-500'}`}>{plan.desc}</p>
            
            <div className={`text-4xl font-black mb-8 ${plan.textColor}`}>
              {plan.price} <span className="text-lg font-bold opacity-50">/course</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, fIdx) => (
                <li key={fIdx} className={`flex items-start gap-3 text-sm font-medium ${plan.textColor === 'text-white' ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  <CheckCircle size={20} weight="fill" className={plan.textColor === 'text-white' ? 'text-brand' : 'text-[#20a07a]'} />
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/courses" className={`w-full py-4 rounded-xl font-bold text-center transition-all active:scale-[0.98] ${plan.btnClass}`}>
              Explore Tracks
            </Link>
          </div>
        ))}
      </div>

      {/* Discounts section */}
      <div className="max-w-[1000px] mx-auto bg-white rounded-[2.5rem] p-10 shadow-sm border border-black/5 flex flex-col md:flex-row items-center gap-8">
         <div className="w-16 h-16 bg-[#e4d3ff] text-[#7c3aed] rounded-2xl flex items-center justify-center shrink-0">
            <Info size={32} weight="duotone" />
         </div>
         <div>
            <h3 className="font-display text-2xl font-bold text-zinc-900 mb-2">Available Discounts & Aid</h3>
            <p className="text-zinc-600 font-medium mb-4">
              We offer a 10% sibling discount automatically applied at checkout when enrolling multiple children. Financial aid is also available for qualifying families through our community partners.
            </p>
            <Link href="/faq" className="text-[#7c3aed] font-bold text-sm hover:underline">Read more in our FAQ</Link>
         </div>
      </div>

    </div>
  );
}
