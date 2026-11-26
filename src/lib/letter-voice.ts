"use client";

import { useSyncExternalStore } from "react";
import { letterRecordings, letterSpeech } from "@/content/letter-audio";
import { player } from "@/lib/recitation-client";

/**
 * Faire entendre une lettre : enregistrement humain s'il existe, sinon voix arabe de
 * l'appareil (Web Speech API). La synthèse est toujours signalée comme indicative.
 */

function arabicVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("ar"));
}

/** Préfère une voix locale de qualité (Microsoft/Google/Apple), sinon la première voix arabe. */
function bestArabicVoice(): SpeechSynthesisVoice | null {
  const voices = arabicVoices();
  return (
    voices.find((v) => v.localService && /natural|neural|premium|enhanced/i.test(v.name)) ??
    voices.find((v) => /google|microsoft|apple|maged|laila|tarik|hoda|naayf|zariyah/i.test(v.name)) ??
    voices[0] ??
    null
  );
}

let voicesVersion = 0;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const onChange = () => {
      voicesVersion += 1;
      for (const l of listeners) l();
    };
    window.speechSynthesis.addEventListener("voiceschanged", onChange);
    // Certains navigateurs chargent les voix au premier appel.
    window.speechSynthesis.getVoices();
    return () => {
      listeners.delete(listener);
      window.speechSynthesis.removeEventListener("voiceschanged", onChange);
    };
  }
  return () => listeners.delete(listener);
}

/** « ready » : une voix arabe existe ; « none » : l'appareil n'en a pas ; « unsupported » : pas de synthèse. */
export function useArabicVoiceStatus(): "ready" | "none" | "unsupported" | "pending" {
  const version = useSyncExternalStore(subscribe, () => voicesVersion, () => -1);
  if (version === -1) return "pending";
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return "unsupported";
  return bestArabicVoice() ? "ready" : "none";
}

export function speakArabic(text: string, rate = 0.72): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const voice = bestArabicVoice();
  if (!voice) return false;
  player.stop();
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
  return true;
}

export type LetterPart = "name" | "sound";

/** Source qui sera utilisée pour cette lettre : « recording » (humain) ou « synthesis ». */
export function letterSource(char: string, part: LetterPart): "recording" | "synthesis" {
  const recording = letterRecordings[char];
  return (part === "name" ? recording?.name : recording?.sound) ? "recording" : "synthesis";
}

/** Joue le nom ou le son de la lettre. Renvoie false si rien n'a pu être joué. */
export function playLetter(char: string, part: LetterPart): boolean {
  const recording = letterRecordings[char];
  const file = part === "name" ? recording?.name : recording?.sound;
  if (file) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    void player.play(file);
    return true;
  }
  const speech = letterSpeech[char];
  return speech ? speakArabic(part === "name" ? speech.nameAr : speech.soundAr, part === "name" ? 0.72 : 0.6) : false;
}
