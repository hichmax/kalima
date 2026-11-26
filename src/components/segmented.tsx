"use client";

import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useId, type ReactNode } from "react";

/**
 * Contrôle segmenté : une pastille de verre glisse d'une option à l'autre (ressort
 * interruptible). Les libellés ne passent jamais à la ligne ; s'ils sont trop nombreux
 * pour la largeur, la rangée défile horizontalement au lieu de déborder de sa carte.
 */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  size = "md",
  role = "radiogroup",
}: {
  options: Array<{ value: T; label: ReactNode }>;
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: "sm" | "md";
  role?: "radiogroup" | "tablist";
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, bounce: 0.18, duration: 0.42 };
  return (
    <LayoutGroup id={id}>
      <div className={`segmented seg ${size === "sm" ? "small" : ""}`} role={role} aria-label={label}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role={role === "tablist" ? "tab" : "radio"}
              aria-checked={role === "radiogroup" ? active : undefined}
              aria-selected={role === "tablist" ? active : undefined}
              className={active ? "is-active" : undefined}
              onClick={() => onChange(option.value)}
            >
              {active ? <motion.span layoutId="seg-pill" className="seg-pill" transition={spring} /> : null}
              <span className="seg-label">{option.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
