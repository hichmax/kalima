"use client";

import { useSyncExternalStore } from "react";
import { emptyState, stateSchema, type KalimaState } from "@/lib/progress-schema";

/**
 * Progression locale, versionnée, tolérante aux pannes.
 *
 * - Tout accès à localStorage est protégé (navigation privée Safari, quota plein,
 *   stockage désactivé) : l'application continue en mémoire.
 * - Le format est validé par Zod à la lecture et à l'import.
 * - Conçu pour une future synchronisation de compte : un seul document JSON,
 *   horodaté (`updatedAt`), facile à fusionner côté serveur.
 */

export const STORAGE_KEY = "kalima:v2";

export { emptyState, stateSchema, type Deck, type KalimaState, type Settings, type StoredCard } from "@/lib/progress-schema";

function safeRead(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeWrite(value: string): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
    return true;
  } catch {
    return false;
  }
}

export function parseState(raw: string | null): KalimaState | null {
  if (!raw) return null;
  try {
    const parsed = stateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

let cache: KalimaState | null = null;
let persistent = true;
const listeners = new Set<() => void>();
const SERVER_SNAPSHOT = emptyState(new Date(0));

function load(): KalimaState {
  if (cache) return cache;
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  cache = parseState(safeRead()) ?? emptyState();
  return cache;
}

function emit() {
  for (const listener of listeners) listener();
}

export function getState(): KalimaState {
  return load();
}

/** Applique une mise à jour immuable, persiste, notifie. Renvoie false si la persistance a échoué. */
export function updateState(updater: (state: KalimaState) => KalimaState): boolean {
  const next = { ...updater(load()), updatedAt: new Date().toISOString() };
  cache = next;
  persistent = safeWrite(JSON.stringify(next));
  emit();
  return persistent;
}

export function isPersistent() {
  return persistent;
}

export function exportState(): string {
  return JSON.stringify(load(), null, 2);
}

export function importState(raw: string): { ok: true } | { ok: false; error: string } {
  const parsed = parseState(raw);
  if (!parsed) return { ok: false, error: "Fichier illisible ou d'un autre format." };
  cache = parsed;
  persistent = safeWrite(JSON.stringify(parsed));
  emit();
  return { ok: true };
}

/** Remplace l'état sans le re-dater (synchronisation de compte : évite une boucle d'envois). */
export function replaceState(next: KalimaState) {
  cache = next;
  persistent = safeWrite(JSON.stringify(next));
  emit();
}

/** Écoute les changements de progression hors React (synchronisation). */
export function onStateChange(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetState() {
  cache = emptyState();
  persistent = safeWrite(JSON.stringify(cache));
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cache = parseState(event.newValue) ?? cache;
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Hook React : état complet, sûr à l'hydratation (le serveur voit un état vide). */
export function useKalima(): KalimaState {
  return useSyncExternalStore(subscribe, load, () => SERVER_SNAPSHOT);
}

/** Vrai une fois monté côté client (évite d'afficher la progression vide du serveur). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}
function subscribeNoop() {
  return () => {};
}

/** Réservé aux tests. */
export function __resetCacheForTests() {
  cache = null;
  persistent = true;
}
