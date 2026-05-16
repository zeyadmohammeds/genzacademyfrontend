"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  CreditCard, ShieldCheck, CheckCircle, ArrowRight, ArrowLeft,
  LockSimple, SealCheck, TrendUp, Sparkle, Receipt
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { useCart } from "@/lib/cart-context";
import { checkoutCart, markApplicationPaid } from "@/lib/api";
import Link from "next/link";

export default function PaymentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { cart, refreshCart, clearGuestCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  const applicationId = searchParams.get("applicationId");
  const courseId = searchParams.get("courseId");
  const courseNameParam = searchParams.get("courseName");
  const amountParam = searchParams.get("amount");
  
  const [method, setMethod] = useState<"card" | "fawry" | "bank">("card");
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const cartHasItems = (cart?.items?.length ?? 0) > 0;
  const courseName = cartHasItems ? (cart?.items?.[0]?.courseTitle || "") : (courseNameParam || "Academy Enrollment");
  const rawAmount = cartHasItems ? (cart?.totalEgp ?? 0) : (Number(amountParam) || (cart?.subtotalEgp ?? 0));
  const amount = rawAmount || 2500;
  const subtotal = cartHasItems ? (cart?.subtotalEgp || 0) : amount;
  const discount = cartHasItems ? (cart?.discountAmountEgp || 0) : 0;
  const durationWeeks = 12;
  
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    
    try {
      if (applicationId) {
        await markApplicationPaid(applicationId, {
          paymentMethod: method,
          paymentReference: `TXN-${Date.now()}`,
          amountEgp: amount,
        });
      } else {
        await checkoutCart({ paymentMethod: method });
      }
      setCompleted(true);
      clearGuestCart();
      refreshCart();
      toast("Payment processed successfully! Welcome to the track.", "success");
      
      setTimeout(() => {
        router.push("/my-courses");
      }, 4000);
    } catch (err: any) {
      setBusy(false);
      toast(err.message || "Payment failed. Please try again.", "error");
    }
  };

  if (completed) {
    return (
      <div className="w-full px-10 py-8 flex items-center justify-center min-h-[70vh]">
        <div className="bg-white rounded-[3rem] p-16 shadow-sm border border-black/5 text-center max-w-lg w-full">
          <div className="w-28 h-28 bg-[#c2f0ff] rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={64} weight="fill" className="text-[#0284c7]" />
          </div>
          <h1 className="font-display text-4xl font-black text-zinc-900 mb-4">Payment Complete</h1>
          <p className="text-zinc-500 font-medium mb-8 text-lg leading-relaxed">
            Your enrollment in <strong className="text-zinc-900">{courseName}</strong> is confirmed. Get ready for your first session.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => router.push("/my-courses")} 
              className="w-full py-4 bg-brand hover:bg-brand-hover text-brand-fg rounded-2xl font-bold text-lg shadow-[0_8px_20px_-6px_rgba(159,232,112,0.45)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight size={20} weight="bold" />
            </button>
            <p className="text-zinc-400 text-xs font-medium mt-2">Redirecting in 4 seconds...</p>
          </div>
        </div>
      </div>
    );
  }

  const methods = [
    { id: "card" as const, label: "Credit Card", icon: CreditCard, desc: "Visa, Mastercard" },
    { id: "fawry" as const, label: "Fawry Pay", icon: SealCheck, desc: "Pay at any outlet" },
    { id: "bank" as const, label: "Installments", icon: TrendUp, desc: "Monthly payments" },
  ];

  return (
    <div className="w-full px-10 py-8">
      {/* Header */}
      <div className="flex flex-col mb-8">
        <Link href="/cart" className="text-brand text-sm font-bold hover:underline mb-4 flex items-center gap-2">
          <ArrowLeft weight="bold" /> Back to Cart
        </Link>
        <h1 className="text-4xl font-display font-black tracking-tight text-zinc-900 mb-2">
          Secure Checkout
        </h1>
        <p className="text-zinc-500 font-medium">Complete your enrollment in {courseName}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 items-start">
        
        {/* Payment Form */}
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-black/5">
          
          {/* Payment Methods */}
          <h3 className="text-lg font-bold text-zinc-900 mb-6">Payment Method</h3>
          <div className="grid grid-cols-3 gap-3 mb-10">
            {methods.map(m => (
              <button 
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-300 ${
                  method === m.id 
                    ? "border-brand bg-brand/5 shadow-sm" 
                    : "border-black/5 bg-canvas-soft hover:border-black/20"
                }`}
              >
                <m.icon size={28} weight={method === m.id ? "fill" : "regular"} className={method === m.id ? "text-brand" : "text-zinc-500"} />
                <span className={`text-sm font-bold ${method === m.id ? "text-brand" : "text-zinc-700"}`}>{m.label}</span>
                <span className="text-[10px] font-medium text-zinc-400">{m.desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handlePay}>
            {method === "card" && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Cardholder Name</label>
                  <input 
                    required 
                    placeholder="Name as on card" 
                    className="w-full h-14 px-6 rounded-2xl border border-black/10 bg-canvas-soft text-sm font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Card Number</label>
                  <div className="relative">
                    <CreditCard size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      required 
                      placeholder="0000 0000 0000 0000" 
                      className="w-full h-14 pl-14 pr-6 rounded-2xl border border-black/10 bg-canvas-soft text-sm font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Expiry Date</label>
                    <input 
                      required 
                      placeholder="MM / YY" 
                      className="w-full h-14 px-6 rounded-2xl border border-black/10 bg-canvas-soft text-sm font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">CVC</label>
                    <input 
                      required 
                      placeholder="123" 
                      maxLength={4}
                      className="w-full h-14 px-6 rounded-2xl border border-black/10 bg-canvas-soft text-sm font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === "fawry" && (
              <div className="bg-brand-hover rounded-[2rem] p-8 text-center">
                <SealCheck size={48} weight="fill" className="text-zinc-900 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-zinc-900 mb-2">Fawry Reference Code</h4>
                <p className="text-zinc-700 font-medium text-sm mb-6">A unique reference code will be generated for you to pay at any Fawry outlet or online.</p>
                <div className="bg-white/60 rounded-2xl px-8 py-4 font-mono text-3xl font-black text-zinc-900 tracking-widest">
                  FWY-{Math.random().toString(36).substring(2, 8).toUpperCase()}
                </div>
              </div>
            )}

            {method === "bank" && (
              <div className="bg-[#e4d3ff] rounded-[2rem] p-8 text-center">
                <TrendUp size={48} weight="fill" className="text-[#7c3aed] mx-auto mb-4" />
                <h4 className="text-xl font-bold text-zinc-900 mb-2">Bank Installment Plan</h4>
                <p className="text-zinc-700 font-medium text-sm mb-4">Split your payment over 3, 6, or 12 months with 0% interest on select banks.</p>
                <div className="grid grid-cols-3 gap-3">
                  {[3, 6, 12].map(m => (
                    <button key={m} type="button" className="bg-white/60 hover:bg-white rounded-2xl py-4 font-bold text-zinc-900 transition-colors border border-[#7c3aed]/10">
                      {m} months
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={busy || (!cartHasItems && !applicationId)}
              className="w-full mt-8 py-5 bg-brand hover:bg-brand-hover text-brand-fg rounded-2xl font-bold text-lg shadow-[0_8px_20px_-6px_rgba(159,232,112,0.45)] transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {busy ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Securing Transaction...
                </>
              ) : (
                <>
                  <ShieldCheck size={22} weight="bold" />
                  Pay EGP {amount.toLocaleString()} Now
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 mt-6 text-zinc-400 text-xs font-medium">
              <LockSimple size={14} weight="bold" />
              256-bit SSL encrypted by ElSewedy Secure Gateway
            </div>
          </form>
        </div>

        {/* Order Receipt Sidebar */}
        <div className="sticky top-28 flex flex-col gap-6">
          <div className="bg-ink rounded-[2.5rem] p-8 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <Receipt size={24} weight="fill" className="text-brand" />
              <h3 className="text-lg font-bold">Order Receipt</h3>
            </div>
            
            <div className="flex flex-col gap-4 mb-8">
              {cartHasItems ? cart!.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-zinc-400 font-medium text-sm">Course {idx + 1}</span>
                  <span className="font-bold text-sm text-right max-w-[200px] line-clamp-2">{item.courseTitle}</span>
                </div>
              )) : (
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-zinc-400 font-medium text-sm">Course</span>
                  <span className="font-bold text-sm text-right max-w-[200px] line-clamp-2">{courseName}</span>
                </div>
              )}
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-zinc-400 font-medium text-sm">Duration</span>
                <span className="font-bold text-sm">{durationWeeks} Weeks</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-zinc-400 font-medium text-sm">Discount</span>
                  <span className="font-bold text-sm text-[#c2f0ff]">-EGP {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-zinc-400 font-medium text-sm">Processing Fee</span>
                <span className="font-bold text-sm text-[#0284c7]">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <span className="text-zinc-400 font-medium">Total Amount</span>
              <div className="text-right">
                <div className="text-3xl font-display font-black">EGP {amount.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-[#c2f0ff] rounded-[2rem] p-6 shadow-sm border border-[#0284c7]/10">
            <h4 className="font-bold text-zinc-900 mb-4">What you get</h4>
            <div className="flex flex-col gap-3">
              {[
                "Lifetime resource access",
                "Official academy certificate", 
                "500 welcome XP bonus",
                "Full refund within first week"
              ].map(b => (
                <div key={b} className="flex items-center gap-3 text-sm font-medium text-zinc-800">
                  <CheckCircle size={18} weight="fill" className="text-[#0284c7] shrink-0" />
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
