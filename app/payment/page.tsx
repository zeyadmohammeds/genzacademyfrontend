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
import Link from "next/link";
import { UploadSimple } from "@phosphor-icons/react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { uploadPaymentReceipt, markApplicationPaid, checkoutCart, validatePromoCode } from "@/lib/api";

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
  
  const [method, setMethod] = useState<"wallet" | "card" | "fawry" | "bank">("wallet");
  const [receiptBase64, setReceiptBase64] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  // Promo code states
  const [promoInput, setPromoInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");

  // Card input states
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");

  // Validation errors
  const [cardNameError, setCardNameError] = useState("");
  const [cardNumberError, setCardNumberError] = useState("");
  const [expiryDateError, setExpiryDateError] = useState("");
  const [cvcError, setCvcError] = useState("");
  const [receiptError, setReceiptError] = useState("");
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const cartHasItems = (cart?.items?.length ?? 0) > 0;
  const courseName = cartHasItems ? (cart?.items?.[0]?.courseTitle || "") : (courseNameParam || "Academy Enrollment");
  const rawAmount = cartHasItems ? (cart?.totalEgp ?? 0) : (Number(amountParam) || (cart?.subtotalEgp ?? 0));
  const amount = rawAmount || 2500;
  const subtotal = cartHasItems ? (cart?.subtotalEgp || 0) : amount;
  const discount = cartHasItems ? (cart?.discountAmountEgp || 0) : 0;
  const finalAmount = Math.max(0, amount - appliedDiscount);
  const totalDiscount = discount + appliedDiscount;
  const durationWeeks = 12;

  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoError("Please enter a promo code.");
      return;
    }
    
    setPromoError("");
    setBusy(true);
    try {
      if (cartHasItems) {
        const updatedCart = await validatePromoCode(code);
        setAppliedCode(code);
        setAppliedDiscount(updatedCart.discountAmountEgp);
        toast(`Promo code applied: ${updatedCart.discountSummary || "Discount applied!"}`, "success");
        await refreshCart();
      } else {
        const codes: Record<string, { type: "percentage" | "fixed", value: number }> = {
          "ROBOT50": { type: "fixed", value: 50 },
          "PARTNER15": { type: "percentage", value: 15 },
          "SUMMER25": { type: "percentage", value: 25 }
        };
        const promo = codes[code];
        if (promo) {
          const disc = promo.type === "percentage" ? Math.round(amount * (promo.value / 100)) : promo.value;
          setAppliedDiscount(disc);
          setAppliedCode(code);
          toast(`Promo code ${code} applied successfully!`, "success");
        } else {
          setPromoError("Invalid or expired promo code.");
          toast("Invalid or expired promo code.", "error");
        }
      }
    } catch (err: any) {
      setPromoError(err.message || "Invalid or expired promo code.");
      toast(err.message || "Invalid or expired promo code.", "error");
    } finally {
      setBusy(false);
    }
  };
  
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear old errors
    setCardNameError("");
    setCardNumberError("");
    setExpiryDateError("");
    setCvcError("");
    setReceiptError("");
    
    if (method === "wallet") {
      if (!receiptBase64) {
        setReceiptError("Please upload a screenshot of your transfer receipt.");
        toast("Please upload a screenshot of your transfer receipt.", "error");
        return;
      }
    } else if (method === "card") {
      let hasError = false;
      if (!cardName.trim()) {
        setCardNameError("Cardholder name is required.");
        hasError = true;
      }
      if (!cardNumber.trim() || cardNumber.replace(/\s+/g, "").length < 16) {
        setCardNumberError("Please enter a valid 16-digit card number.");
        hasError = true;
      }
      if (!expiryDate.trim() || !/^\d{2}\s*\/\s*\d{2}$/.test(expiryDate.trim())) {
        setExpiryDateError("Expiry date must be in MM/YY format.");
        hasError = true;
      }
      if (!cvc.trim() || cvc.trim().length < 3) {
        setCvcError("Please enter a valid 3 or 4 digit CVC.");
        hasError = true;
      }
      if (hasError) {
        toast("Please correct the errors in your card details.", "error");
        return;
      }
    }

    setBusy(true);
    try {
      if (method === "wallet") {
        if (applicationId) {
          let secureUrl = receiptBase64;
          try {
            secureUrl = await uploadToCloudinary(receiptBase64, "receipts");
          } catch (cloudinaryError: any) {
            setReceiptError("Cloudinary upload failed: " + cloudinaryError.message);
            toast("Cloudinary upload failed: " + cloudinaryError.message, "error");
            setBusy(false);
            return;
          }
          await uploadPaymentReceipt(applicationId, { receiptUrl: secureUrl, paymentMethod: "Wallet Transfer" });
        } else {
          toast("Wallet transfer is currently only supported for direct application payments.", "error");
          setBusy(false);
          return;
        }
        toast("Transfer receipt submitted successfully! Pending admin approval.", "success");
      } else {
        if (applicationId) {
          await markApplicationPaid(applicationId, {
            paymentMethod: method,
            paymentReference: `TXN-${Date.now()}`,
            amountEgp: finalAmount,
          });
        } else {
          await checkoutCart({ paymentMethod: method });
        }
        toast("Payment processed successfully! Welcome to the track.", "success");
      }
      
      setCompleted(true);
      clearGuestCart();
      refreshCart();
      
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
    { id: "wallet" as const, label: "Vodafone Cash / Instapay", icon: LockSimple, desc: "Manual Transfer" },
    //{ id: "card" as const, label: "Credit Card", icon: CreditCard, desc: "Visa, Mastercard" },
    { id: "fawry" as const, label: "Fawry Pay", icon: SealCheck, desc: "Pay at any outlet" },
    //{ id: "bank" as const, label: "Installments", icon: TrendUp, desc: "Monthly payments" },
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
            {method === "wallet" && (
              <div className="bg-brand-hover rounded-[2rem] p-8 text-center flex flex-col gap-4 border border-brand/20">
                <SealCheck size={48} weight="fill" className="text-zinc-900 mx-auto mb-2" />
                <h4 className="text-xl font-bold text-zinc-900">Transfer to 01012345678</h4>
                <p className="text-zinc-700 font-medium text-sm">Transfer EGP {amount.toLocaleString()} via Vodafone Cash or Instapay, then upload the screenshot below.</p>
                <div className="relative border-2 border-dashed border-zinc-900/20 hover:border-zinc-900/40 bg-white/50 rounded-2xl p-6 transition-colors group mt-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const r = new FileReader();
                        r.onload = () => {
                          setReceiptBase64(r.result as string);
                          setReceiptError("");
                        };
                        r.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {receiptBase64 ? (
                    <div className="flex flex-col items-center">
                      <img src={receiptBase64} alt="Receipt" className="h-32 object-contain rounded-xl mb-2 border border-black/10 shadow-sm" />
                      <span className="text-sm font-bold text-zinc-900">Receipt Attached (Click to change)</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <UploadSimple size={24} weight="bold" className="text-zinc-500" />
                      </div>
                      <span className="text-sm font-bold text-zinc-900">Upload Screenshot</span>
                      <span className="text-xs text-zinc-500">PNG or JPG up to 5MB</span>
                    </div>
                  )}
                </div>
                {receiptError && (
                  <span className="text-xs text-red-600 font-bold block mt-2 text-center animate-pulse">
                    {receiptError}
                  </span>
                )}
              </div>
            )}

            {method === "card" && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Cardholder Name</label>
                  <input 
                    type="text"
                    value={cardName}
                    onChange={(e) => { setCardName(e.target.value); setCardNameError(""); }}
                    placeholder="Name as on card" 
                    className={`w-full h-14 px-6 rounded-2xl border bg-canvas-soft text-sm font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all ${
                      cardNameError ? "border-red-500 ring-2 ring-red-500/10" : "border-black/10"
                    }`}
                  />
                  {cardNameError && <span className="text-xs text-red-600 font-bold block mt-1.5 animate-pulse">{cardNameError}</span>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Card Number</label>
                  <div className="relative">
                    <CreditCard size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="text"
                      value={cardNumber}
                      onChange={(e) => { setCardNumber(e.target.value); setCardNumberError(""); }}
                      placeholder="0000 0000 0000 0000" 
                      className={`w-full h-14 pl-14 pr-6 rounded-2xl border bg-canvas-soft text-sm font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all ${
                        cardNumberError ? "border-red-500 ring-2 ring-red-500/10" : "border-black/10"
                      }`}
                    />
                  </div>
                  {cardNumberError && <span className="text-xs text-red-600 font-bold block mt-1.5 animate-pulse">{cardNumberError}</span>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Expiry Date</label>
                    <input 
                      type="text"
                      value={expiryDate}
                      onChange={(e) => { setExpiryDate(e.target.value); setExpiryDateError(""); }}
                      placeholder="MM / YY" 
                      className={`w-full h-14 px-6 rounded-2xl border bg-canvas-soft text-sm font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all ${
                        expiryDateError ? "border-red-500 ring-2 ring-red-500/10" : "border-black/10"
                      }`}
                    />
                    {expiryDateError && <span className="text-xs text-red-600 font-bold block mt-1.5 animate-pulse">{expiryDateError}</span>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">CVC</label>
                    <input 
                      type="text"
                      value={cvc}
                      onChange={(e) => { setCvc(e.target.value); setCvcError(""); }}
                      placeholder="123" 
                      maxLength={4}
                      className={`w-full h-14 px-6 rounded-2xl border bg-canvas-soft text-sm font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all ${
                        cvcError ? "border-red-500 ring-2 ring-red-500/10" : "border-black/10"
                      }`}
                    />
                    {cvcError && <span className="text-xs text-red-600 font-bold block mt-1.5 animate-pulse">{cvcError}</span>}
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
                  Pay EGP {finalAmount.toLocaleString()} Now
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
              {totalDiscount > 0 && (
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-zinc-400 font-medium text-sm">Discount {appliedCode ? `(${appliedCode})` : ""}</span>
                  <span className="font-bold text-sm text-brand-hover">-EGP {totalDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-zinc-400 font-medium text-sm">Processing Fee</span>
                <span className="font-bold text-sm text-brand">Free</span>
              </div>
            </div>
 
            <div className="flex justify-between items-end">
              <span className="text-zinc-400 font-medium">Total Amount</span>
              <div className="text-right">
                <div className="text-3xl font-display font-black">EGP {finalAmount.toLocaleString()}</div>
              </div>
            </div>
          </div>
 
          {/* Promo Code Box */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-black/5 flex flex-col gap-4">
            <h4 className="font-bold text-zinc-900 text-sm">Promo Code</h4>
            {appliedCode ? (
              <div className="flex justify-between items-center bg-brand-hover/10 border border-brand/20 rounded-xl px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-brand">{appliedCode} Applied</span>
                  <span className="text-[10px] text-zinc-500 font-medium">EGP {appliedDiscount.toLocaleString()} saved (Seeded Promo)</span>
                </div>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setAppliedDiscount(0);
                    setAppliedCode("");
                    setPromoInput("");
                    setPromoError("");
                  }} 
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-800"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value); setPromoError(""); }}
                    placeholder="e.g. ROBOT50" 
                    className={`flex-1 h-12 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider bg-canvas-soft focus:outline-none focus:border-brand/50 ${
                      promoError ? "border-red-500 ring-2 ring-red-500/10" : "border-black/10"
                    }`}
                  />
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); handleApplyPromo(); }}
                    className="px-5 bg-zinc-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <span className="text-xs text-red-600 font-bold block animate-pulse">
                    {promoError}
                  </span>
                )}
              </div>
            )}
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
