"use client";

import { Eye, Pause, Play, SpeakerSimpleHigh } from "@phosphor-icons/react";
import { useState } from "react";
import type { QuranWord } from "@/lib/quran-types";
import { player, usePlayer } from "@/lib/recitation-client";

/** Affiche des mots du Coran (Tanzil, verbatim). `focus` = mots mis en valeur (1-based). */
export function QuranText({
  words,
  verse,
  focus,
  hidden,
  size,
  onWord,
  className = "",
}: {
  words: QuranWord[];
  verse?: number;
  focus?: [number, number];
  /** Masquage pour la mémorisation : "none" | "hint" (premières lettres) | "all". */
  hidden?: "none" | "hint" | "all";
  size?: string;
  onWord?: (index: number) => void;
  className?: string;
}) {
  return (
    <p className={`quran ${className}`} lang="ar" dir="rtl" style={size ? { fontSize: size } : undefined}>
      {words.map((word, i) => {
        const index = i + 1;
        const inFocus = focus ? index >= focus[0] && index <= focus[1] : false;
        const text = hidden === "all" ? maskWord(word.ar, 0) : hidden === "hint" ? maskWord(word.ar, 1) : word.ar;
        const content = (
          <>
            {text}
            {word.stop && hidden !== "all" ? <span className="stop">{` ${word.stop}`}</span> : null}
          </>
        );
        return (
          <span key={i}>
            {onWord ? (
              <button type="button" className={`w word-btn${inFocus ? " focus" : ""}`} onClick={() => onWord(index)}>
                {content}
              </button>
            ) : (
              <span className={`w${inFocus ? " focus" : ""}`}>{content}</span>
            )}{" "}
          </span>
        );
      })}
      {verse ? (
        <span className="ayah-no" aria-label={`verset ${verse}`}>
          {verse}
        </span>
      ) : null}
    </p>
  );
}

/** Garde les `keep` premières lettres (avec leurs signes) et remplace le reste par des points. */
function maskWord(word: string, keep: number): string {
  const letters = word.match(/[\u0621-\u063F\u0641-\u064A\u0671][^\u0621-\u063F\u0641-\u064A\u0671]*/gu) ?? [word];
  if (keep === 0) return "ـ".repeat(Math.max(2, Math.min(letters.length, 5)));
  return letters.slice(0, keep).join("") + "ـ".repeat(Math.max(1, Math.min(letters.length - keep, 4)));
}

export function PlayButton({ src, label = "Écouter", loop = false, small = false }: { src: string | null | undefined; label?: string; loop?: boolean; small?: boolean }) {
  const state = usePlayer();
  const active = Boolean(src) && state.src === src && state.playing;
  if (!src) return null;
  return (
    <button
      type="button"
      className={`btn ${small ? "small" : ""}`}
      aria-pressed={active}
      onClick={() => (active ? player.stop() : void player.play(src, { loop }))}
    >
      {active ? <Pause weight="fill" aria-hidden="true" /> : small ? <SpeakerSimpleHigh weight="fill" aria-hidden="true" /> : <Play weight="fill" aria-hidden="true" />}
      {active ? "Pause" : label}
    </button>
  );
}

/** Phonétique : toujours visible, à la demande, ou seulement après une tentative de lecture. */
export function Phonetic({ text, mode }: { text: string | undefined; mode: "always" | "tap" | "after" | "never" }) {
  const [shown, setShown] = useState(false);
  if (!text || mode === "never") return null;
  if (mode === "always" || shown) {
    return (
      <p className="phonetic" lang="fr">
        {text}
      </p>
    );
  }
  return (
    <button type="button" className="btn small ghost" onClick={() => setShown(true)}>
      <Eye aria-hidden="true" />
      {mode === "after" ? "J'ai lu — voir la phonétique" : "Voir la phonétique"}
    </button>
  );
}
