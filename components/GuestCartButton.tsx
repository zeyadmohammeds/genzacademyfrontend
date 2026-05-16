"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart } from "@phosphor-icons/react";
import { apiPost } from "@/lib/api";
import type { Course } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

type GuestCartItem = {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  priceEgp: number;
};
import { useCartUi } from "@/lib/cart-ui-context";

export function GuestCartButton({ course }: { course: Course }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { openDrawer } = useCartUi();
  const [loading, setLoading] = useState(false);

  async function add() {
    setLoading(true);
    const item: GuestCartItem = {
      courseId: course.id,
      courseTitle: course.title,
      courseSlug: course.slug,
      priceEgp: course.priceEgp
    };

    const existing = JSON.parse(window.localStorage.getItem("genz_guest_cart") ?? "[]") as GuestCartItem[];
    const next = existing.some((cartItem) => cartItem.courseId === course.id) ? existing : [...existing, item];
    window.localStorage.setItem("genz_guest_cart", JSON.stringify(next));

    try {
      if (user) {
        await apiPost("/api/cart/items", { courseId: course.id, courseRoundId: null });
        toast(`${course.title} is now in your cart.`, "success");
        openDrawer();
      } else {
        toast("Saved locally. Sign in to complete your checkout.", "info");
        openDrawer();
      }
    } catch {
      toast("Could not add to cart at this time.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="guest-cart-action">
      <button className="button button-dark" onClick={add} disabled={loading} type="button">
        <ShoppingCart size={18} weight="bold" />
        {loading ? "Adding..." : "Add to cart"}
      </button>
      {!user && (
        <Link href="/auth" className="text-link">
          Sign in to pay
        </Link>
      )}
    </div>
  );
}
