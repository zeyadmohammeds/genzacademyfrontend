"use client";

import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { useRef } from "react";

type MagneticButtonProps = {
  href: string;
  label: string;
};

export function MagneticButton({ href, label }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-24, 24], [-3, 3]);

  return (
    <motion.a
      ref={ref}
      href={href}
      className="button button-dark magnetic-cta"
      onPointerMove={(event) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const deltaX = event.clientX - (rect.left + rect.width / 2);
        const deltaY = event.clientY - (rect.top + rect.height / 2);
        x.set(deltaX * 0.16);
        y.set(deltaY * 0.12);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ translateX: x, translateY: y, rotate }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 140, damping: 18 }}
    >
      <span>{label}</span>
      <ArrowRight size={18} weight="bold" />
    </motion.a>
  );
}
