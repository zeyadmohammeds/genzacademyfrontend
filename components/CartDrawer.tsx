"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart, X, Trash, ArrowRight, CreditCard } from "@phosphor-icons/react";
import { useCart } from "@/lib/cart-context";
import { useCartUi } from "@/lib/cart-ui-context";
import { useToast } from "@/lib/toast-context";

export function CartDrawer() {
  const { drawerOpen, closeDrawer } = useCartUi();
  const { cart, guestItems, removeItem, refreshCart } = useCart();
  const { toast } = useToast();

  const items =
    cart?.items?.map((i) => ({
      id: i.id,
      title: i.courseTitle,
      price: i.finalPriceEgp,
      rawPrice: i.unitPriceEgp,
      imageUrl: i.courseImageUrl,
    })) ??
    guestItems.map((g) => ({
      id: g.courseId,
      title: g.courseTitle,
      price: g.priceEgp,
      rawPrice: g.priceEgp,
      imageUrl: g.courseImageUrl,
    }));

  const subtotal = cart?.subtotalEgp ?? guestItems.reduce((s, g) => s + g.priceEgp, 0);
  const total = cart?.totalEgp ?? subtotal - (cart?.discountAmountEgp ?? 0);

  async function handleRemove(id: string, title: string) {
    await removeItem(id);
    toast(`${title} removed`, "info");
    await refreshCart();
  }

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close cart"
            className="fixed inset-0 z-[200] bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            className="fixed top-0 right-0 z-[201] h-full w-full max-w-md bg-canvas shadow-2xl border-l border-ink/10 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10 bg-canvas-soft/80">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand/20 flex items-center justify-center text-ink">
                  <ShoppingCart size={22} weight="duotone" />
                </div>
                <div>
                  <h2 id="cart-drawer-title" className="font-display text-lg font-black text-ink">
                    Your cart
                  </h2>
                  <p className="text-xs font-medium text-mute">
                    {items.length} {items.length === 1 ? "track" : "tracks"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="w-10 h-10 rounded-xl border border-ink/10 flex items-center justify-center hover:bg-canvas-soft transition-colors"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-ink/15 p-10 text-center">
                  <p className="text-mute font-medium mb-4">No courses yet — add a track from the catalog.</p>
                  <Link
                    href="/courses"
                    onClick={closeDrawer}
                    className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:underline"
                  >
                    Browse courses <ArrowRight size={16} weight="bold" />
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1.5rem] border border-ink/10 bg-canvas-soft/80 p-4 flex gap-4 items-center group hover:border-[#ff1a1a]/30 hover:shadow-lg hover:shadow-[#ff1a1a]/5 transition-all duration-300"
                  >
                    {/* Miniature Cover / Icon Placeholder */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-zinc-950 relative border border-ink/5">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1c0000] to-[#3a0000] flex flex-col items-center justify-center p-2 text-center overflow-hidden">
                          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,26,26,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,26,26,0.02)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
                          <ShoppingCart size={16} weight="fill" className="text-[#ff1a1a] drop-shadow-[0_0_6px_#ff1a1a] relative z-10" />
                          <span className="text-[5px] font-black uppercase tracking-wider text-[#ff1a1a]/80 mt-1 relative z-10">GENZ</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-ink leading-snug group-hover:text-brand transition-colors truncate">{item.title}</p>
                      <p className="text-xs font-black text-ink mt-1 flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff1a1a]" />
                        {item.price} EGP
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id, item.title)}
                      className="shrink-0 w-9 h-9 rounded-xl text-negative border border-transparent hover:border-negative/20 hover:bg-negative/5 flex items-center justify-center transition-all active:scale-90"
                      aria-label="Remove from cart"
                    >
                      <Trash size={18} weight="bold" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-ink/10 p-6 space-y-4 bg-canvas-soft/50">
              <div className="flex justify-between text-sm">
                <span className="text-mute font-medium">Subtotal</span>
                <span className="font-bold text-ink">{subtotal} EGP</span>
              </div>
              {cart && cart.discountAmountEgp > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-mute font-medium">Discounts</span>
                  <span className="font-bold text-positive">−{cart.discountAmountEgp} EGP</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-ink/10">
                <span className="text-xs font-bold uppercase tracking-widest text-mute">Total</span>
                <span className="font-display text-2xl font-black text-ink">{total} EGP</span>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="w-full py-3.5 rounded-xl bg-ink text-canvas font-bold text-sm text-center hover:bg-ink/90 transition-colors flex items-center justify-center gap-2"
                >
                  Open full cart <ArrowRight size={18} weight="bold" />
                </Link>
                <Link
                  href="/payment"
                  onClick={closeDrawer}
                  className="w-full py-3.5 rounded-xl bg-brand text-brand-fg font-bold text-sm text-center hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard size={18} weight="bold" />
                  Checkout
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
