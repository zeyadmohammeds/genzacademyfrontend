"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { getCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart } from "./api";
import type { Cart, Course } from "./types";
import { useAuth } from "./auth-context";

type GuestItem = {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  priceEgp: number;
};

type CartContextValue = {
  cart: Cart | null;
  guestItems: GuestItem[];
  itemCount: number;
  loading: boolean;
  addItem: (course: Course) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearGuestCart: () => void;
  isInCart: (courseId: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [guestItems, setGuestItems] = useState<GuestItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cart on mount
  const refreshCart = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const data = await getCart();
        setCart(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    } else {
      // Load from localStorage for guest users
      const stored = window.localStorage.getItem("genz_guest_cart");
      if (stored) {
        try {
          setGuestItems(JSON.parse(stored));
        } catch {
          setGuestItems([]);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(async (course: Course) => {
    if (user) {
      setLoading(true);
      try {
        const updatedCart = await apiAddToCart(course.id);
        setCart(updatedCart);
      } catch {
        // Fallback: also save to guest cart
        const item: GuestItem = {
          courseId: course.id,
          courseTitle: course.title,
          courseSlug: course.slug,
          priceEgp: course.priceEgp,
        };
        setGuestItems(prev => {
          const next = prev.some(g => g.courseId === course.id) ? prev : [...prev, item];
          window.localStorage.setItem("genz_guest_cart", JSON.stringify(next));
          return next;
        });
      } finally {
        setLoading(false);
      }
    } else {
      const item: GuestItem = {
        courseId: course.id,
        courseTitle: course.title,
        courseSlug: course.slug,
        priceEgp: course.priceEgp,
      };
      setGuestItems(prev => {
        const next = prev.some(g => g.courseId === course.id) ? prev : [...prev, item];
        window.localStorage.setItem("genz_guest_cart", JSON.stringify(next));
        return next;
      });
    }
  }, [user]);

  const removeItem = useCallback(async (itemId: string) => {
    if (user && cart) {
      setLoading(true);
      try {
        await apiRemoveFromCart(itemId);
        await refreshCart();
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    } else {
      setGuestItems(prev => {
        const next = prev.filter(g => g.courseId !== itemId);
        window.localStorage.setItem("genz_guest_cart", JSON.stringify(next));
        return next;
      });
    }
  }, [user, cart, refreshCart]);

  const clearGuestCart = useCallback(() => {
    window.localStorage.removeItem("genz_guest_cart");
    setGuestItems([]);
  }, []);

  const isInCart = useCallback((courseId: string) => {
    if (cart) return cart.items.some(i => i.courseId === courseId);
    return guestItems.some(g => g.courseId === courseId);
  }, [cart, guestItems]);

  const itemCount = cart ? cart.items.length : guestItems.length;

  return (
    <CartContext.Provider value={{ cart, guestItems, itemCount, loading, addItem, removeItem, refreshCart, clearGuestCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
