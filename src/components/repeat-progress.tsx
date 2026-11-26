"use client";

import { animate } from "animejs";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { player } from "@/lib/recitation-client";

/**
 * Barre de répétition : un segment par verset, un marqueur à la fin de chaque verset,
 * de petits repères à la fin de chaque répétition. Le remplissage suit la récitation en
 * temps réel (position audio lue à chaque image, sans re-rendu React) ; quand il atteint
 * un marqueur, celui-ci « rebondit » (anime.js, élastique) et une onde s'en échappe.
 *
 * Longues plages (ex. al-Baqara, 286 versets) : la barre n'affiche que 10 versets à la fois.
 * Au bout du 10e, la fenêtre glisse vers les 10 suivants (motion), et une fine barre globale
 * montre où l'on en est dans toute la plage.
 */
const WINDOW = 10;

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
  const reduceMotion = useReducedMotion();
  const total = to - from + 1;
  const page = position ? Math.floor((Math.min(Math.max(position.v, from), to) - from) / WINDOW) : 0;
  const wFrom = from + page * WINDOW;
  const wTo = Math.min(to, wFrom + WINDOW - 1);
  const count = wTo - wFrom + 1;
  const pages = Math.ceil(total / WINDOW);

  // Nouvelle plage ou nouveau réglage : on repart d'une barre vide.
  useEffect(() => {
    fired.current.clear();
    lastFraction.current = 0;
    if (fillRef.current) fillRef.current.style.transform = "scaleX(0)";
    if (headRef.current) headRef.current.style.left = "0%";
  }, [from, to, verseRepeat, page]);

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
      const idx = position.v - wFrom;
      const raw = player.progress();
      const p = raw && raw.src === currentSrc ? raw : null;
      const within = p && p.d > 0 ? Math.min(1, p.t / p.d) : 0;
      const fraction = Math.min(1, Math.max(0, (idx + (position.k + within) / verseRepeat) / count));
      // Retour en arrière (nouveau tour) : on laisse filer, sinon on ne recule jamais d'un poil.
      if (fraction + 0.02 < lastFraction.current && !(position.v === wFrom && position.k === 0)) return;
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
  }, [running, position, wFrom, count, verseRepeat, currentSrc]);

  // Changement de tour : nouvelle série de rebonds, barre ramenée au début.
  const round = position?.r ?? 0;
  useEffect(() => {
    if (round === 0) return;
    fired.current = new Set([...fired.current].filter((key) => key.startsWith(`${round}:`)));
    lastFraction.current = 0;
  }, [round]);

  const verses = Array.from({ length: count }, (_, i) => wFrom + i);
  const slide = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : {
        initial: { opacity: 0, x: 48, filter: "blur(6px)" },
        animate: { opacity: 1, x: 0, filter: "blur(0px)" },
        exit: { opacity: 0, x: -48, filter: "blur(6px)" },
        transition: { type: "spring" as const, bounce: 0.18, duration: 0.6 },
      };
  const overall = position ? (position.v - from + (position.k + 1) / verseRepeat) / total : 0;
  return (
    <div className="rp" aria-hidden="true">
      <div className="rp-track" ref={trackRef}>
        <span className="rp-fill" ref={fillRef} />
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={page} className="rp-layer" {...slide}>
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
          </motion.span>
        </AnimatePresence>
        <span className="rp-head" ref={headRef} />
      </div>
      <div className="rp-labels">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={page} className="rp-layer" {...slide}>
            {verses.map((v, i) => (
              <span key={v} className="rp-label" style={{ left: `${((i + 0.5) / count) * 100}%` }} data-active={position?.v === v || undefined}>
                {v}
              </span>
            ))}
          </motion.span>
        </AnimatePresence>
      </div>
      {pages > 1 ? (
        <div className="rp-window">
          <span className="faint num">
            Versets {wFrom}–{wTo} · {total} au total
          </span>
          <span className="rp-overall">
            <motion.span animate={{ width: `${Math.min(100, overall * 100)}%` }} transition={{ type: "spring", bounce: 0, duration: 0.6 }} />
          </span>
        </div>
      ) : null}
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
