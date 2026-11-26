"use client";

import { animate } from "animejs";
import { useEffect, useRef } from "react";
import { player } from "@/lib/recitation-client";

/**
 * Barre de répétition : un segment par verset, un marqueur à la fin de chaque verset,
 * de petits repères à la fin de chaque répétition. Le remplissage suit la récitation en
 * temps réel (position audio lue à chaque image, sans re-rendu React) ; quand il atteint
 * un marqueur, celui-ci « rebondit » (anime.js, élastique) et une onde s'en échappe.
 */
export function RepeatProgress({
  from,
  to,
  verseRepeat,
  position,
  running,
  rangeRepeat,
  currentSrc,
}: {
  from: number;
  to: number;
  verseRepeat: number;
  position: { v: number; k: number; r: number } | null;
  running: boolean;
  rangeRepeat: number;
  /** Audio du verset en cours : la position n'est lue que si c'est bien lui qui joue. */
  currentSrc: string | null;
}) {
  const fillRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fired = useRef(new Set<string>());
  const lastFraction = useRef(0);
  const count = to - from + 1;

  // Nouvelle plage ou nouveau réglage : on repart d'une barre vide.
  useEffect(() => {
    fired.current.clear();
    lastFraction.current = 0;
    if (fillRef.current) fillRef.current.style.transform = "scaleX(0)";
    if (headRef.current) headRef.current.style.left = "0%";
  }, [from, to, verseRepeat]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const pop = (selector: string, strong: boolean) => {
      const el = trackRef.current?.querySelector<HTMLElement>(selector);
      if (!el) return;
      if (reduce) return;
      animate(el, {
        scale: strong
          ? [{ to: 1.9, duration: 140, ease: "outQuad" }, { to: 1, duration: 900, ease: "outElastic(1, .4)" }]
          : [{ to: 1.6, duration: 110, ease: "outQuad" }, { to: 1, duration: 600, ease: "outElastic(1, .5)" }],
      });
      if (strong) {
        const ring = document.createElement("span");
        ring.className = "rp-ring";
        el.appendChild(ring);
        animate(ring, {
          scale: { from: 0.6, to: 3.2 },
          opacity: { from: 0.9, to: 0 },
          duration: 700,
          ease: "outCubic",
          onComplete: () => ring.remove(),
        });
      }
      if (headRef.current) {
        animate(headRef.current, {
          scale: [{ to: 1.5, duration: 120, ease: "outQuad" }, { to: 1, duration: 700, ease: "outElastic(1, .45)" }],
        });
      }
    };

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!position) return;
      const idx = position.v - from;
      const raw = player.progress();
      const p = raw && raw.src === currentSrc ? raw : null;
      const within = p && p.d > 0 ? Math.min(1, p.t / p.d) : 0;
      const fraction = Math.min(1, Math.max(0, (idx + (position.k + within) / verseRepeat) / count));
      // Retour en arrière (nouveau tour) : on laisse filer, sinon on ne recule jamais d'un poil.
      if (fraction + 0.02 < lastFraction.current && !(position.v === from && position.k === 0)) return;
      lastFraction.current = fraction;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${fraction})`;
      if (headRef.current) headRef.current.style.left = `${fraction * 100}%`;

      // Arrivée sur un repère : quand l'audio de cette répétition est terminé.
      if (p && p.d > 0 && (p.ended || p.t >= p.d - 0.04)) {
        const key = `${position.r}:${position.v}:${position.k}`;
        if (!fired.current.has(key)) {
          fired.current.add(key);
          const lastRepeat = position.k === verseRepeat - 1;
          if (lastRepeat) pop(`[data-marker="${position.v}"]`, true);
          else pop(`[data-tick="${position.v}-${position.k + 1}"]`, false);
        }
      }
    };

    if (running) frame = requestAnimationFrame(tick);
    else tick(); // position figée (pause) : une seule mise à jour
    return () => cancelAnimationFrame(frame);
  }, [running, position, from, count, verseRepeat, currentSrc]);

  // Changement de tour : nouvelle série de rebonds, barre ramenée au début.
  const round = position?.r ?? 0;
  useEffect(() => {
    if (round === 0) return;
    fired.current = new Set([...fired.current].filter((key) => key.startsWith(`${round}:`)));
    lastFraction.current = 0;
  }, [round]);

  const verses = Array.from({ length: count }, (_, i) => from + i);
  return (
    <div className="rp" aria-hidden="true">
      <div className="rp-track" ref={trackRef}>
        <span className="rp-fill" ref={fillRef} />
        {verses.map((v, i) => (
          <span key={`t-${v}`}>
            {Array.from({ length: verseRepeat - 1 }, (_, j) => (
              <span
                key={j}
                className="rp-tick"
                data-tick={`${v}-${j + 1}`}
                style={{ left: `${((i + (j + 1) / verseRepeat) / count) * 100}%` }}
              />
            ))}
            <span className="rp-marker" data-marker={v} style={{ left: `${((i + 1) / count) * 100}%` }}>
              <span className="rp-dot" />
            </span>
          </span>
        ))}
        <span className="rp-head" ref={headRef} />
      </div>
      <div className="rp-labels">
        {verses.map((v, i) => (
          <span key={v} className="rp-label" style={{ left: `${((i + 0.5) / count) * 100}%` }} data-active={position?.v === v || undefined}>
            {v}
          </span>
        ))}
      </div>
      <div className="rp-rounds">
        {rangeRepeat === 0 ? (
          <span className="chip">tour {round + 1} · sans fin</span>
        ) : (
          Array.from({ length: rangeRepeat }, (_, i) => (
            <span key={i} className="rp-round" data-state={i < round ? "done" : i === round && position ? "current" : undefined} />
          ))
        )}
      </div>
    </div>
  );
}
