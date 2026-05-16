"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { validatePromoCode } from "@/lib/api";
import { ShoppingCart, Trash, CreditCard, ArrowRight, ArrowLeft, Sparkle, ShieldCheck, Tag } from "@phosphor-icons/react";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";

export default function CartPage() {
  const { user } = useAuth();
  const { cart, guestItems, removeItem, loading, refreshCart } = useCart();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  // Unified items list: prefer server cart, fallback to guest items
  const items = cart?.items?.map(i => ({
    id: i.id,
    courseId: i.courseId,
    title: i.courseTitle,
    price: i.unitPriceEgp,
    finalPrice: i.finalPriceEgp,
    discount: i.discountAmountEgp,
  })) ?? guestItems.map(g => ({
    id: g.courseId,
    courseId: g.courseId,
    title: g.courseTitle,
    price: g.priceEgp,
    finalPrice: g.priceEgp,
    discount: 0,
  }));

  const subtotal = cart?.subtotalEgp ?? items.reduce((s, i) => s + i.price, 0);
  const discount = cart?.discountAmountEgp ?? 0;
  const total = cart?.totalEgp ?? subtotal - discount;

  const handleRemove = async (id: string) => {
    await removeItem(id);
    toast("Item removed from cart", "info");
  };

  const handlePromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await validatePromoCode(promoCode);
      setPromoApplied(true);
      toast(`Promo code applied: ${res.description}`, "success");
      refreshCart();
    } catch (err: any) {
      toast(err.message || "Invalid promo code", "error");
    }
  };

  const colors = [
    { bg: "bg-brand-hover", border: "border-brand-hover", tag: "bg-ink text-white" },
    { bg: "bg-[#e4d3ff]", border: "border-[#7c3aed]/20", tag: "bg-white/60 text-[#7c3aed] border border-[#7c3aed]/20" },
    { bg: "bg-[#c2f0ff]", border: "border-[#0284c7]/20", tag: "bg-white/60 text-[#0284c7] border border-[#0284c7]/20" },
    { bg: "bg-[#ffd5dc]", border: "border-[#e11d48]/20", tag: "bg-white/60 text-[#e11d48] border border-[#e11d48]/20" },
  ];

  return (
    <div className="w-full px-10 py-8">
      {/* Header */}
      <div className="flex flex-col mb-8">
        <Link href="/courses" className="text-brand text-sm font-bold hover:underline mb-4 flex items-center gap-2">
          <ArrowLeft weight="bold" /> Continue Shopping
        </Link>
        <h1 className="text-4xl font-display font-black tracking-tight text-zinc-900 mb-2">
          Shopping Cart
        </h1>
        <p className="text-zinc-500 font-medium">{items.length} {items.length === 1 ? "track" : "tracks"} in your cart</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] py-24 flex flex-col items-center justify-center text-center border border-black/5 shadow-sm">
          <div className="w-28 h-28 bg-canvas-soft rounded-full flex items-center justify-center mb-8 shadow-sm">
            <ShoppingCart size={56} weight="fill" className="text-zinc-300" />
          </div>
          <h3 className="font-display text-3xl font-bold text-zinc-900 mb-4">Your cart is empty</h3>
          <p className="text-zinc-500 font-medium mb-10 max-w-md">
            Explore our engineering tracks and add courses to start your learning journey.
          </p>
          <Link href="/courses" className="bg-brand text-brand-fg px-10 py-4 rounded-full font-bold text-lg shadow-[0_8px_20px_-6px_rgba(159,232,112,0.45)] hover:bg-brand-hover transition-all active:scale-[0.98] flex items-center gap-2">
            Explore Tracks <ArrowRight size={20} weight="bold" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 items-start">
          
          {/* Cart Items */}
          <div className="flex flex-col gap-5">
            {items.map((item, idx) => {
              const theme = colors[idx % colors.length];
              return (
                <div key={item.id} className={`${theme.bg} rounded-[2rem] p-6 lg:p-8 shadow-sm border border-black/5 flex flex-col sm:flex-row justify-between sm:items-center gap-6 group hover:-translate-y-0.5 transition-transform duration-300`}>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-white/50 flex items-center justify-center shrink-0 text-3xl shadow-sm border border-black/5">
                      📘
                    </div>
                    <div>
                      <span className={`px-3 py-1 ${theme.tag} text-[10px] font-bold rounded-lg uppercase tracking-wider inline-block mb-2`}>
                        Track
                      </span>
                      <h3 className="font-display text-xl font-bold text-zinc-900 leading-tight">{item.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-black text-zinc-900">{item.finalPrice} EGP</div>
                      {item.discount > 0 && (
                        <div className="text-sm text-zinc-500 line-through">{item.price} EGP</div>
                      )}
                    </div>
                    <button 
                      onClick={() => handleRemove(item.id)} 
                      className="w-12 h-12 rounded-full bg-white/60 hover:bg-white flex items-center justify-center text-[#e11d48] transition-colors shadow-sm border border-black/5"
                      title="Remove from cart"
                    >
                      <Trash size={20} weight="bold" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5 sticky top-28">
            <h2 className="text-2xl font-display font-bold text-zinc-900 mb-8">Order Summary</h2>
            
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Subtotal ({items.length} items)</span>
                <span className="font-bold text-zinc-900">{subtotal} EGP</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between items-center text-[#0284c7]">
                  <span className="font-medium flex items-center gap-2">
                    <Tag size={16} weight="fill" /> Discounts
                  </span>
                  <span className="font-bold">-{discount} EGP</span>
                </div>
              )}
            </div>

            {/* Promo Code */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  placeholder="Enter promo code" 
                  className="flex-1 h-12 px-5 rounded-full border border-black/10 bg-canvas-soft text-sm font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                />
                <button 
                  onClick={handlePromo}
                  className="h-12 px-6 rounded-full bg-ink text-white font-bold text-sm hover:bg-black transition-colors active:scale-95"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <div className="mt-2 text-[#0284c7] text-xs font-bold flex items-center gap-1">
                  <Sparkle size={12} weight="fill" /> Promo code applied successfully
                </div>
              )}
            </div>
            
            <div className="h-px bg-black/5 mb-6"></div>
            
            <div className="flex justify-between items-end mb-8">
              <span className="text-lg font-bold text-zinc-900">Total</span>
              <div className="text-right">
                <div className="text-3xl font-display font-black text-zinc-900">{total} EGP</div>
                <span className="text-xs text-zinc-400 font-medium">Incl. all fees</span>
              </div>
            </div>
            
            <Link 
              href={`/payment?amount=${total}&courseName=${encodeURIComponent(items.map(i => i.title).join(", "))}`}
              className="w-full py-4 bg-brand hover:bg-brand-hover text-brand-fg rounded-2xl font-bold text-lg shadow-[0_8px_20px_-6px_rgba(159,232,112,0.45)] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <CreditCard size={22} weight="bold" />
              Proceed to Payment
            </Link>

            <div className="flex items-center justify-center gap-2 mt-6 text-zinc-400 text-xs font-medium">
              <ShieldCheck size={16} weight="fill" />
              Secure payment powered by ElSewedy
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
