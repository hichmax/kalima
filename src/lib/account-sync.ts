"use client";

import { useSyncExternalStore } from "react";
import { mergeStates, stateSchema, type KalimaState } from "@/lib/progress-schema";
import { getState, onStateChange, replaceState } from "@/lib/storage";

/**
 * Synchronisation de la progression avec le compte.
 * Principe « local d'abord » : l'appareil reste la source immédiate ; à la connexion on
 * récupère la copie du compte, on fusionne (sans rien perdre), puis chaque changement est
 * envoyé après 2,5 s de calme. Le serveur fusionne aussi : deux appareils ne s'écrasent pas.
 */

export type SyncStatus = { state: "off" | "syncing" | "ok" | "error"; at: string | null };

let status: SyncStatus = { state: "off", at: null };
const statusListeners = new Set<() => void>();
function setStatus(next: SyncStatus) {
  status = next;
  for (const l of statusListeners) l();
}

export function useSyncStatus() {
  return useSyncExternalStore(
    (l) => {
      statusListeners.add(l);
      return () => statusListeners.delete(l);
    },
    () => status,
    () => status,
  );
}

const ENDPOINT = "/api/compte/progression";
let lastSynced: string | null = null;

async function push(state: KalimaState, keepalive = false): Promise<KalimaState | null> {
  const response = await fetch(ENDPOINT, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
    keepalive,
    credentials: "same-origin",
  });
  if (!response.ok) throw new Error(String(response.status));
  const parsed = stateSchema.safeParse((await response.json()).data);
  return parsed.success ? parsed.data : null;
}

function adopt(merged: KalimaState) {
  lastSynced = merged.updatedAt;
  if (JSON.stringify(merged) !== JSON.stringify(getState())) replaceState(merged);
  setStatus({ state: "ok", at: new Date().toISOString() });
}

/** Démarre la synchronisation pour l'utilisateur connecté. Renvoie la fonction d'arrêt. */
export function startSync(): () => void {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const flush = async () => {
    const local = getState();
    if (local.updatedAt === lastSynced) return;
    setStatus({ state: "syncing", at: status.at });
    try {
      const merged = await push(local);
      if (!stopped && merged) adopt(merged);
    } catch {
      if (!stopped) setStatus({ state: "error", at: status.at });
    }
  };

  (async () => {
    setStatus({ state: "syncing", at: null });
    try {
      const response = await fetch(ENDPOINT, { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      const remote = stateSchema.safeParse((await response.json()).data);
      const local = getState();
      const merged = remote.success ? mergeStates(local, remote.data) : local;
      const saved = await push(merged);
      if (!stopped) adopt(saved ?? merged);
    } catch {
      if (!stopped) setStatus({ state: "error", at: null });
    }
  })();

  const off = onStateChange(() => {
    if (getState().updatedAt === lastSynced) return;
    clearTimeout(timer);
    timer = setTimeout(flush, 2500);
  });
  const onHide = () => {
    if (document.visibilityState !== "hidden") return;
    const local = getState();
    if (local.updatedAt === lastSynced) return;
    clearTimeout(timer);
    void push(local, true).catch(() => undefined);
    lastSynced = local.updatedAt;
  };
  document.addEventListener("visibilitychange", onHide);

  return () => {
    stopped = true;
    clearTimeout(timer);
    off();
    document.removeEventListener("visibilitychange", onHide);
    setStatus({ state: "off", at: null });
    lastSynced = null;
  };
}

/** Force un envoi immédiat (bouton « Synchroniser maintenant »). */
export async function syncNow() {
  setStatus({ state: "syncing", at: status.at });
  try {
    const merged = await push(getState());
    if (merged) adopt(merged);
  } catch {
    setStatus({ state: "error", at: status.at });
  }
}
