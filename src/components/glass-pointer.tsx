"use client";

import { useEffect } from "react";

/**
 * Le verre réagit au pointeur : les cartes marquées `.tilt` s'inclinent légèrement vers
 * la souris et leur reflet suit le curseur. Un seul écouteur délégué pour toute la page,
 * mis à jour une fois par image. Désactivé au toucher et en mouvement réduit.
 */
export function GlassPointer() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let current: HTMLElement | null = null;
    let frame = 0;
    let last: PointerEvent | null = null;

    const reset = (el: HTMLElement) => {
      el.classList.remove("is-tilting");
      el.style.removeProperty("--rx");
      el.style.removeProperty("--ry");
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    };

    const apply = () => {
      frame = 0;
      if (!last) return;
      const target = (last.target as Element | null)?.closest<HTMLElement>(".tilt") ?? null;
      if (current && current !== target) reset(current);
      current = target;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const x = (last.clientX - rect.left) / rect.width;
      const y = (last.clientY - rect.top) / rect.height;
      // Inclinaison proportionnelle à la taille : les grandes cartes bougent moins.
      const strength = Math.min(6, 2600 / Math.max(rect.width, rect.height));
      target.classList.add("is-tilting");
      target.style.setProperty("--ry", `${((x - 0.5) * strength).toFixed(2)}deg`);
      target.style.setProperty("--rx", `${((0.5 - y) * strength).toFixed(2)}deg`);
      target.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
      target.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    };

    const onMove = (event: PointerEvent) => {
      if (!fine.matches || reduce.matches || event.pointerType !== "mouse") return;
      last = event;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      if (current) reset(current);
      current = null;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);
  return null;
}
