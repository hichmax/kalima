"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useKalima } from "@/lib/storage";

export type Reciter = "afasy" | "dossari";

export interface RecitationData {
  available: boolean;
  reason?: string;
  credits?: { translation: string; reciter: string; provider: string };
  verses?: Array<{ v: number; translation: string | null; audio: string | null; words: Array<string | null>; wordsFr?: Array<string | null> }>;
}

/** Explication lisible de l'indisponibilité de l'audio et de la traduction. */
export function unavailableMessage(data: RecitationData | null): string | null {
  if (!data || data.available) return null;
  switch (data.reason) {
    case "not-configured":
      return "Récitation et traduction indisponibles ici : les identifiants Quran.Foundation ne sont pas configurés pour cet environnement. Le texte reste consultable.";
    case "prelive-limited":
      return "Les identifiants Quran.Foundation de test (prelive) ne donnent accès qu'aux sourates 1 et 2. Il faut des identifiants de production pour les autres.";
    case "network":
      return "Impossible de joindre le serveur : vérifie ta connexion.";
    default:
      return "Récitation et traduction momentanément indisponibles (Quran.Foundation ne répond pas). Réessaie plus tard.";
  }
}

const cache = new Map<string, Promise<RecitationData>>();

export function fetchRecitation(surah: number, reciter: Reciter = "afasy"): Promise<RecitationData> {
  const key = `${surah}:${reciter}`;
  if (!cache.has(key)) {
    const promise = fetch(`/api/recitation/${surah}${reciter === "afasy" ? "" : `?r=${reciter}`}`)
      .then((r) => r.json() as Promise<RecitationData>)
      .catch(() => ({ available: false, reason: "network" }) as RecitationData);
    // Une panne passagère ne reste pas en cache : on retentera au prochain appel.
    void promise.then((value) => {
      if (!value.available) cache.delete(key);
    });
    cache.set(key, promise);
  }
  return cache.get(key)!;
}

/** Récitant choisi dans les réglages (ou imposé : les lettres isolées restent celles d'al-ʿAfāsī). */
export function useReciter(forced?: Reciter): Reciter {
  const chosen = useKalima().settings.reciter;
  return forced ?? chosen;
}

/** Traduction et audio d'une sourate (Quran.Foundation), ou null pendant le chargement. */
export function useRecitation(surah: number | null, forced?: Reciter): RecitationData | null {
  const reciter = useReciter(forced);
  const key = `${surah}:${reciter}`;
  const [data, setData] = useState<{ key: string; value: RecitationData } | null>(null);
  useEffect(() => {
    if (surah === null) return;
    let alive = true;
    void fetchRecitation(surah, reciter).then((value) => {
      if (alive) setData({ key: `${surah}:${reciter}`, value });
    });
    return () => {
      alive = false;
    };
  }, [surah, reciter]);
  return data && data.key === key ? data.value : null;
}

/** Plusieurs sourates à la fois (séances de révision). Renvoie une table sourate → données. */
export function useRecitations(surahs: number[], forced?: Reciter): Record<number, RecitationData> {
  const reciter = useReciter(forced);
  const key = `${surahs.join(",")}|${reciter}`;
  const [data, setData] = useState<{ key: string; value: Record<number, RecitationData> }>({ key: "", value: {} });
  useEffect(() => {
    let alive = true;
    const [list, who] = key.split("|");
    const numbers = list ? list.split(",").map(Number) : [];
    void Promise.all(numbers.map(async (s) => [s, await fetchRecitation(s, who as Reciter)] as const)).then((entries) => {
      if (alive) setData({ key, value: Object.fromEntries(entries) });
    });
    return () => {
      alive = false;
    };
  }, [key]);
  return data.key === key ? data.value : {};
}

// ---------------------------------------------------------------- lecteur audio partagé
type PlayerState = { src: string | null; playing: boolean; loop: boolean; rate: number };
let state: PlayerState = { src: null, playing: false, loop: false, rate: 1 };
let audio: HTMLAudioElement | null = null;
const listeners = new Set<() => void>();
let onEnded: (() => void) | null = null;
let cancelPending: (() => void) | null = null;

/**
 * Passage d'un fichier plus long (récitant « de sourate ») : « fichier.mp3#t=12.3,20.5 ».
 * Le lecteur commence à `start`, s'arrête à `end` et traite cet arrêt comme une fin de piste.
 */
type Segment = { start: number; end: number };
let segment: Segment | null = null;
let segmentEnded = false;
let segmentFrame = 0;
let loopSegment = false;
/** Adresse complète du passage en cours (avec « #t=… »). */
let segmentSrc = "";

export function parseSegment(src: string): { file: string; segment: Segment | null } {
  const match = /#t=([\d.]+),([\d.]+)$/u.exec(src);
  if (!match) return { file: src, segment: null };
  const start = Number(match[1]);
  const end = Number(match[2]);
  return { file: src.slice(0, match.index), segment: end > start ? { start, end } : null };
}

/** 50 ms de silence (WAV 8 kHz), jouées au premier toucher pour « débloquer » l'audio. */
function silentWav(): string {
  const samples = 400;
  const bytes = new Uint8Array(44 + samples);
  const view = new DataView(bytes.buffer);
  const text = (at: number, value: string) => [...value].forEach((c, i) => (bytes[at + i] = c.charCodeAt(0)));
  text(0, "RIFF");
  view.setUint32(4, 36 + samples, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, 8000, true);
  view.setUint32(28, 8000, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  text(36, "data");
  view.setUint32(40, samples, true);
  bytes.fill(0x80, 44); // silence en 8 bits
  // URL « blob: » (autorisée par la politique de sécurité du site, contrairement à « data: »)
  return URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
}
let unlocked = false;

/**
 * iPhone et iPad : un son lancé après une attente (le chargement de son adresse) est refusé si
 * le lecteur n'a jamais joué pendant un toucher. On le fait donc jouer une fois, en silence, au
 * premier toucher : ensuite, toutes les lectures de ce même lecteur sont autorisées.
 */
function unlockOnFirstGesture() {
  if (typeof window === "undefined") return;
  const unlock = () => {
    if (unlocked) return;
    unlocked = true;
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
    const el = element();
    if (el.src) return; // le lecteur a déjà servi pendant un geste
    el.muted = true;
    const silence = silentWav();
    el.src = silence;
    void el
      .play()
      .catch(() => {})
      .finally(() => {
        if (el.src === silence) el.pause();
        el.muted = false;
        URL.revokeObjectURL(silence);
      });
  };
  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);
}

function stopSegmentWatch() {
  cancelAnimationFrame(segmentFrame);
  segmentFrame = 0;
}

/** Surveille la fin du passage à chaque image (plus précis que « timeupdate »). */
function watchSegment() {
  stopSegmentWatch();
  const tick = () => {
    segmentFrame = 0;
    if (!audio || !segment) return;
    // Filet de sécurité : si le navigateur ne s'est pas arrêté de lui-même à la fin du passage.
    if (audio.currentTime >= segment.end + 0.05) {
      if (loopSegment) {
        audio.src = segmentSrc;
        void audio.play().catch(() => {});
      } else {
        segmentEnded = true;
        audio.pause();
        setState({ playing: false });
        const done = onEnded;
        onEnded = null;
        done?.();
        return;
      }
    }
    if (!audio.paused) segmentFrame = requestAnimationFrame(tick);
  };
  segmentFrame = requestAnimationFrame(tick);
}

function setState(patch: Partial<PlayerState>) {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

function element() {
  if (!audio) {
    audio = new Audio();
    audio.preload = "auto";
    audio.addEventListener("play", () => setState({ playing: true }));
    audio.addEventListener("playing", () => {
      if (segment) watchSegment();
    });
    // Onglet en arrière-plan (images ralenties) : « timeupdate » prend le relais.
    audio.addEventListener("timeupdate", () => {
      if (segment && audio && !audio.paused && !segmentFrame) watchSegment();
    });
    // Fin d'un passage « #t=début,fin » : c'est le navigateur qui met en pause, au bon moment,
    // même écran éteint ou onglet en arrière-plan (les minuteries y sont ralenties).
    audio.addEventListener("pause", () => {
      if (segment && audio && !segmentEnded && audio.currentTime >= segment.end - 0.25) {
        stopSegmentWatch();
        if (loopSegment) {
          // recharger l'adresse à fragment : la fin du passage s'applique de nouveau
          audio.src = segmentSrc;
          void audio.play().catch(() => {});
          return;
        }
        segmentEnded = true;
        const done = onEnded;
        onEnded = null;
        done?.();
      }
    });
    audio.addEventListener("pause", () => setState({ playing: false }));
    audio.addEventListener("ended", () => {
      setState({ playing: false });
      onEnded?.();
    });
  }
  return audio;
}

if (typeof window !== "undefined") unlockOnFirstGesture();

export const player = {
  /** Lance une piste (ou un passage « #t=début,fin »). Renvoie false si le navigateur refuse la lecture. */
  play(src: string, options: { loop?: boolean; rate?: number; onEnd?: () => void } = {}): Promise<boolean> {
    const el = element();
    const parsed = parseSegment(src);
    stopSegmentWatch();
    segment = parsed.segment;
    segmentEnded = false;
    loopSegment = Boolean(segment && options.loop);
    el.muted = false;
    if (segment) {
      // Toujours réaffecter l'adresse à fragment (même passage répété) : le navigateur repart du
      // début du passage et s'arrête seul à sa fin. Le fichier vient du cache après la 1re fois.
      segmentSrc = src;
      el.src = src;
    } else if (el.src !== parsed.file) el.src = parsed.file;
    // Passage : la boucle est gérée ici (retour au début du passage, pas du fichier).
    el.loop = segment ? false : (options.loop ?? false);
    el.playbackRate = options.rate ?? state.rate;
    onEnded = options.onEnd ?? null;
    const start = segment ? segment.start : 0;
    if (el.readyState >= 1) el.currentTime = start;
    else el.addEventListener("loadedmetadata", () => (el.currentTime = start), { once: true });
    setState({ src, loop: options.loop ?? false, rate: el.playbackRate });
    return el.play().then(
      () => true,
      () => {
        setState({ playing: false });
        return false;
      },
    );
  },
  stop() {
    onEnded = null;
    cancelPending?.();
    stopSegmentWatch();
    audio?.pause();
  },
  /**
   * Joue une fois et attend la fin (ended = true) ou l'arrêt (ended = false).
   * Les événements « pause » antérieurs au démarrage de cette piste sont ignorés.
   */
  playOnce(src: string, rate?: number): Promise<{ ended: boolean; duration: number }> {
    cancelPending?.();
    return new Promise((resolve) => {
      const el = element();
      let started = false;
      let settled = false;
      const finish = (ended: boolean) => {
        if (settled) return;
        settled = true;
        el.removeEventListener("playing", onPlaying);
        el.removeEventListener("ended", onEnd);
        el.removeEventListener("pause", onPause);
        el.removeEventListener("error", onError);
        if (cancelPending === cancel) cancelPending = null;
        const length = segment ? segment.end - segment.start : Number.isFinite(el.duration) ? el.duration : 0;
        resolve({ ended, duration: length });
      };
      const cancel = () => finish(false);
      const onPlaying = () => {
        started = true;
      };
      const onEnd = () => finish(true);
      const onPause = () => {
        if (segmentEnded) finish(true); // fin du passage
        else if (started && !el.ended) finish(false);
      };
      const onError = () => finish(false);
      cancelPending = cancel;
      el.addEventListener("playing", onPlaying);
      el.addEventListener("ended", onEnd);
      el.addEventListener("pause", onPause);
      el.addEventListener("error", onError);
      // Lecture refusée (ex. iPhone sans toucher) : on ne reste jamais bloqué en « lecture… ».
      void player.play(src, { rate }).then((ok) => {
        if (!ok) finish(false);
      });
    });
  },
  /** Position de lecture instantanée (à lire dans une boucle requestAnimationFrame). */
  progress(): { t: number; d: number; ended: boolean; paused: boolean; src: string | null } | null {
    if (!audio) return null;
    if (segment) {
      const d = segment.end - segment.start;
      return { t: Math.min(d, Math.max(0, audio.currentTime - segment.start)), d, ended: segmentEnded, paused: audio.paused, src: state.src };
    }
    return {
      t: audio.currentTime,
      d: Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0,
      ended: audio.ended,
      paused: audio.paused,
      src: state.src,
    };
  },
  setRate(rate: number) {
    if (audio) audio.playbackRate = rate;
    setState({ rate });
  },
  setLoop(loop: boolean) {
    if (segment) loopSegment = loop;
    else if (audio) audio.loop = loop;
    setState({ loop });
  },
};

const SERVER_STATE: PlayerState = { src: null, playing: false, loop: false, rate: 1 };

export function usePlayer(): PlayerState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => SERVER_STATE,
  );
}

/** Arrête la lecture quand le composant disparaît. */
export function useStopOnUnmount() {
  const stopped = useRef(false);
  useEffect(
    () => () => {
      if (!stopped.current) player.stop();
      stopped.current = true;
    },
    [],
  );
}
