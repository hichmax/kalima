"use client";

import { useEffect } from "react";
import { tajweedVerse } from "@/lib/tajweed";

/** Signes de pause et de prosternation : jetons à part dans le texte (« mot ۖ mot »). */
const STOP = /^[ۖ-ۜ۩]$/u;

/**
 * Colore (tajwīd) les versets rendus par le serveur, au fur et à mesure qu'ils approchent de
 * l'écran. Le texte de chaque verset est redécoupé en mots (espaces) ; la concaténation des
 * morceaux colorés redonne exactement le texte Tanzil.
 */
export function TajweedPainter() {
  useEffect(() => {
    const paint = (el: HTMLElement) => {
      if (el.dataset.painted) return;
      el.dataset.painted = "1";
      const tokens = (el.textContent ?? "").split(" ").filter(Boolean);
      const words = tokens.filter((t) => !STOP.test(t));
      const colored = tajweedVerse(words);
      const fragment = document.createDocumentFragment();
      let w = 0;
      tokens.forEach((token, i) => {
        if (i > 0) fragment.append(" ");
        if (STOP.test(token)) {
          fragment.append(token);
          return;
        }
        for (const segment of colored[w] ?? [{ t: token }]) {
          if (segment.r) {
            const span = document.createElement("span");
            span.className = `tj tj-${segment.r}`;
            span.textContent = segment.t;
            fragment.append(span);
          } else fragment.append(segment.t);
        }
        w += 1;
      });
      el.replaceChildren(fragment);
    };

    const targets = Array.from(document.querySelectorAll<HTMLElement>(".study-verse .verse-text"));
    if (!("IntersectionObserver" in window)) {
      targets.forEach(paint);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          paint(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "800px 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}
