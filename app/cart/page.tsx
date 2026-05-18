"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { validatePromoCode } from "@/lib/api";
import { ShoppingCart, Trash, CreditCard, ArrowRight, ArrowLeft, Sparkle, ShieldCheck, Tag, CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import { CourseIcon } from "@/components/IconMapper";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, x: -40, scale: 0.96 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring" as const, damping: 24, stiffness: 260 },
  },
  exit: {
    opacity: 0,
    x: 80,
    scale: 0.92,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
} as const;

const summaryVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, type: "spring" as const, damping: 22, stiffness: 240 },
  }),
} as const;

export default function CartPage() {
  const { user } = useAuth();
  const { cart, guestItems, removeItem, loading, refreshCart } = useCart();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoValidating, setPromoValidating] = useState(false);
  const [animCount, setAnimCount] = useState(0);
  const fetched = useRef(false);
  const prevCount = useRef(0);

  useEffect(() => {
    if (!fetched.current) {
      fetched.current = true;
      refreshCart();
    }
  }, [refreshCart]);

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

  useEffect(() => {
    if (items.length !== prevCount.current) {
      setAnimCount(prev => prev + 1);
      prevCount.current = items.length;
    }
  }, [items.length]);

  const handleRemove = async (id: string) => {
    await removeItem(id);
    toast("Item removed from cart", "info");
  };

  const handlePromo = async () => {
    if (!promoCode.trim() || promoValidating) return;
    setPromoValidating(true);
    try {
      const res = await validatePromoCode(promoCode);
      setPromoApplied(true);
      toast(`Promo code applied: ${res.discountSummary || "Discount applied!"}`, "success");
      refreshCart();
    } catch (err: any) {
      toast(err.message || "Invalid promo code", "error");
    } finally {
      setPromoValidating(false);
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
      <div className="flex flex-col mb-8">
        <Link href="/courses" className="text-brand text-sm font-bold hover:underline mb-4 flex items-center gap-2">
          <ArrowLeft weight="bold" /> Continue Shopping
        </Link>
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-display font-black tracking-tight text-zinc-900 mb-2">
            Shopping Cart
          </h1>
          <motion.div
            key={animCount}
            animate={{ scale: [1, 1.18, 1], transition: { duration: 0.4, ease: "easeInOut" as const } }}
            className="w-9 h-9 rounded-full bg-brand flex items-center justify-center"
          >
            <span className="text-brand-fg text-sm font-black tabular-nums">{items.length}</span>
          </motion.div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={items.length}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="text-zinc-500 font-medium"
          >
            {items.length} {items.length === 1 ? "track" : "tracks"} in your cart
          </motion.p>
        </AnimatePresence>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex flex-col gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/60 rounded-[2rem] p-8 shadow-sm border border-black/5 flex items-center gap-6 animate-pulse"
            >
              <div className="w-16 h-16 rounded-[1.25rem] bg-zinc-200 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-16 bg-zinc-200 rounded-lg" />
                <div className="h-6 w-64 bg-zinc-200 rounded-lg" />
              </div>
              <div className="flex items-center gap-6">
                <div className="space-y-2 text-right">
                  <div className="h-7 w-24 bg-zinc-200 rounded-lg ml-auto" />
                </div>
                <div className="w-12 h-12 rounded-full bg-zinc-200" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-[2.5rem] py-24 flex flex-col items-center justify-center text-center border border-black/5 shadow-sm"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", damping: 16 }}
            className="w-28 h-28 bg-canvas-soft rounded-full flex items-center justify-center mb-8 shadow-sm"
          >
            <ShoppingCart size={56} weight="fill" className="text-zinc-300" />
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="font-display text-3xl font-bold text-zinc-900 mb-4"
          >
            Your cart is empty
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.38 }}
            className="text-zinc-500 font-medium mb-10 max-w-md"
          >
            Explore our engineering tracks and add courses to start your learning journey.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48 }}
          >
            <Link href="/courses" className="bg-brand text-brand-fg px-10 py-4 rounded-full font-bold text-lg shadow-[0_8px_20px_-6px_rgba(159,232,112,0.45)] hover:bg-brand-hover transition-all active:scale-[0.98] flex items-center gap-2">
              Explore Tracks <ArrowRight size={20} weight="bold" />
            </Link>
          </motion.div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 items-start">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-5"
          >
            <AnimatePresence mode="popLayout">
              {items.map((item, idx) => {
                const theme = colors[idx % colors.length];
                return (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    layout
                    exit="exit"
                    className={`${theme.bg} rounded-[2rem] p-6 lg:p-8 shadow-sm border border-black/5 flex flex-col sm:flex-row justify-between sm:items-center gap-6 group hover:-translate-y-0.5 transition-transform duration-300`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-white/50 flex items-center justify-center shrink-0 shadow-sm border border-black/5">
                        <CourseIcon iconName={item.title.replace(/\s+/g, '')} className="w-7 h-7 text-zinc-900" size={28} />
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
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5 sticky top-28"
          >
            <h2 className="text-2xl font-display font-bold text-zinc-900 mb-8">Order Summary</h2>

            <div className="flex flex-col gap-4 mb-6">
              {[
                { label: `Subtotal (${items.length} items)`, value: `${subtotal} EGP`, color: "text-zinc-900" },
                ...(discount > 0 ? [{ label: "Discounts", value: `-${discount} EGP`, color: "text-[#0284c7]", icon: Tag }] : []),
              ].map((row, i) => (
                <motion.div
                  key={row.label}
                  custom={i}
                  variants={summaryVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex justify-between items-center"
                >
                  <span className="text-zinc-500 font-medium flex items-center gap-2">
                    {row.icon && <row.icon size={16} weight="fill" />}
                    {row.label}
                  </span>
                  <motion.span
                    key={row.value}
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`font-bold ${row.color}`}
                  >
                    {row.value}
                  </motion.span>
                </motion.div>
              ))}
            </div>

            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="flex-1 h-12 px-5 rounded-full border border-black/10 bg-canvas-soft text-sm font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  onKeyDown={e => { if (e.key === "Enter") handlePromo(); }}
                />
                <button
                  onClick={handlePromo}
                  disabled={promoValidating}
                  className="h-12 px-6 rounded-full bg-ink text-white font-bold text-sm hover:bg-black transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {promoValidating ? "..." : "Apply"}
                </button>
              </div>
              <AnimatePresence>
                {promoApplied && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      initial={{ x: -8, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="mt-2 text-[#0284c7] text-xs font-bold flex items-center gap-1"
                    >
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10, stiffness: 200 }}
                      >
                        <CheckCircle size={14} weight="fill" />
                      </motion.span>
                      Promo code applied successfully
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-px bg-black/5 mb-6"></div>

            <div className="flex justify-between items-end mb-8">
              <span className="text-lg font-bold text-zinc-900">Total</span>
              <div className="text-right">
                <motion.div
                  key={total}
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 18, stiffness: 220 }}
                  className="text-3xl font-display font-black text-zinc-900"
                >
                  {total} EGP
                </motion.div>
                <span className="text-xs text-zinc-400 font-medium">Incl. all fees</span>
              </div>
            </div>

            <Link
              href={items.length > 0 ? `/payment?amount=${total}&courseName=${encodeURIComponent(items.map(i => i.title).join(", "))}` : "#"}
              className={`w-full py-4 bg-brand hover:bg-brand-hover text-brand-fg rounded-2xl font-bold text-lg shadow-[0_8px_20px_-6px_rgba(159,232,112,0.45)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${items.length === 0 ? "pointer-events-none opacity-50" : ""}`}
            >
              <CreditCard size={22} weight="bold" />
              Proceed to Payment
            </Link>

            <div className="flex items-center justify-center gap-2 mt-6 text-zinc-400 text-xs font-medium">
              <ShieldCheck size={16} weight="fill" />
              Secure payment powered by ElSewedy
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
