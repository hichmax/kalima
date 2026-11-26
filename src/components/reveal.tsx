"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

/** Apparition douce au premier affichage (ressort sans rebond, flou qui se dissipe). */
export function Reveal({ children, className, style, delay = 0 }: { children: ReactNode; className?: string; style?: CSSProperties; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={reduce ? { duration: 0.2 } : { type: "spring", bounce: 0, duration: 0.9, delay }}
    >
      {children}
    </motion.div>
  );
}
