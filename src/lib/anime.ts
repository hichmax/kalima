"use client";

import { animate, stagger } from "animejs";

/** Animations séquencées (anime.js v4). Toutes respectent « réduire les animations ». */

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Apparition échelonnée d'une série d'éléments (lettres, cartes). */
export function revealStagger(targets: Element[] | NodeListOf<Element>, options: { from?: "first" | "center" | "last"; step?: number } = {}) {
  const list = Array.from(targets);
  if (!list.length) return;
  if (reduced()) {
    list.forEach((el) => ((el as HTMLElement).style.opacity = "1"));
    return;
  }
  return animate(list, {
    opacity: { from: 0, to: 1 },
    y: { from: 18, to: 0 },
    scale: { from: 0.92, to: 1 },
    duration: 760,
    delay: stagger(options.step ?? 55, { from: options.from ?? "first" }),
    ease: "outExpo",
  });
}

/** Compteur qui monte jusqu'à `to`. */
export function countUp(el: HTMLElement, to: number, duration = 1100) {
  if (reduced() || to === 0) {
    el.textContent = String(to);
    return;
  }
  const state = { v: 0 };
  return animate(state, {
    v: to,
    duration,
    ease: "outQuart",
    onUpdate: () => {
      el.textContent = String(Math.round(state.v));
    },
  });
}

/** Petite célébration : des étoiles jaillissent d'un point, une seule fois. */
export function celebrate(host: HTMLElement) {
  if (reduced()) return;
  const glyphs = ["✦", "✳", "✧", "۞", "✦", "✧"];
  const pieces = Array.from({ length: 22 }, (_, i) => {
    const span = document.createElement("span");
    span.textContent = glyphs[i % glyphs.length];
    span.className = "spark";
    host.appendChild(span);
    return span;
  });
  return animate(pieces, {
    x: () => (Math.random() - 0.5) * 420,
    y: () => -80 - Math.random() * 260,
    rotate: () => (Math.random() - 0.5) * 360,
    scale: [{ from: 0.2, to: 1.2, duration: 380 }, { to: 0.6, duration: 900 }],
    opacity: [{ from: 0, to: 1, duration: 180 }, { to: 0, duration: 1000, delay: 300 }],
    delay: stagger(18),
    ease: "outCubic",
    onComplete: () => pieces.forEach((p) => p.remove()),
  });
}
