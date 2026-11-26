"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

export interface RecitationData {
  available: boolean;
  reason?: string;
  credits?: { translation: string; reciter: string; provider: string };
  verses?: Array<{ v: number; translation: string | null; audio: string | null; words: Array<string | null> }>;
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

const cache = new Map<number, Promise<RecitationData>>();

export function fetchRecitation(surah: number): Promise<RecitationData> {
  if (!cache.has(surah)) {
    cache.set(
      surah,
      fetch(`/api/recitation/${surah}`)
        .then((r) => r.json() as Promise<RecitationData>)
        .catch(() => ({ available: false, reason: "network" })),
    );
  }
  return cache.get(surah)!;
}

/** Traduction et audio d'une sourate (Quran.Foundation), ou null pendant le chargement. */
export function useRecitation(surah: number | null): RecitationData | null {
  const [data, setData] = useState<{ surah: number; value: RecitationData } | null>(null);
  useEffect(() => {
    if (surah === null) return;
    let alive = true;
    void fetchRecitation(surah).then((value) => {
      if (alive) setData({ surah, value });
    });
    return () => {
      alive = false;
    };
  }, [surah]);
  return data && data.surah === surah ? data.value : null;
}

/** Plusieurs sourates à la fois (séances de révision). Renvoie une table sourate → données. */
export function useRecitations(surahs: number[]): Record<number, RecitationData> {
  const key = surahs.join(",");
  const [data, setData] = useState<{ key: string; value: Record<number, RecitationData> }>({ key: "", value: {} });
  useEffect(() => {
    let alive = true;
    const list = key ? key.split(",").map(Number) : [];
    void Promise.all(list.map(async (s) => [s, await fetchRecitation(s)] as const)).then((entries) => {
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

function setState(patch: Partial<PlayerState>) {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

function element() {
  if (!audio) {
    audio = new Audio();
    audio.preload = "auto";
    audio.addEventListener("play", () => setState({ playing: true }));
    audio.addEventListener("pause", () => setState({ playing: false }));
    audio.addEventListener("ended", () => {
      setState({ playing: false });
      onEnded?.();
    });
  }
  return audio;
}

export const player = {
  play(src: string, options: { loop?: boolean; rate?: number; onEnd?: () => void } = {}) {
    const el = element();
    if (el.src !== src) el.src = src;
    el.loop = options.loop ?? false;
    el.playbackRate = options.rate ?? state.rate;
    onEnded = options.onEnd ?? null;
    el.currentTime = 0;
    setState({ src, loop: el.loop, rate: el.playbackRate });
    return el.play().catch(() => setState({ playing: false }));
  },
  stop() {
    onEnded = null;
    cancelPending?.();
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
      const finish = (ended: boolean) => {
        el.removeEventListener("playing", onPlaying);
        el.removeEventListener("ended", onEnd);
        el.removeEventListener("pause", onPause);
        el.removeEventListener("error", onError);
        if (cancelPending === cancel) cancelPending = null;
        resolve({ ended, duration: Number.isFinite(el.duration) ? el.duration : 0 });
      };
      const cancel = () => finish(false);
      const onPlaying = () => {
        started = true;
      };
      const onEnd = () => finish(true);
      const onPause = () => {
        if (started && !el.ended) finish(false);
      };
      const onError = () => finish(false);
      cancelPending = cancel;
      el.addEventListener("playing", onPlaying);
      el.addEventListener("ended", onEnd);
      el.addEventListener("pause", onPause);
      el.addEventListener("error", onError);
      void player.play(src, { rate });
    });
  },
  /** Position de lecture instantanée (à lire dans une boucle requestAnimationFrame). */
  progress(): { t: number; d: number; ended: boolean; paused: boolean; src: string | null } | null {
    if (!audio) return null;
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
    if (audio) audio.loop = loop;
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
