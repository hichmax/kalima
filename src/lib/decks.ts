"use client";

import { useEffect, useState } from "react";
import { dueAt } from "@/lib/srs";
import { updateState, type Deck, type KalimaState } from "@/lib/storage";
import { readingCardId, wordCardId, type StudySurah } from "@/lib/study-types";

/**
 * Paquets de cartes choisis par l'apprenant : quelques versets d'une sourate deviennent des cartes
 * « mot » (un par mot différent) et « lire le verset ». Elles rejoignent la répétition espacée.
 */

export const MAX_DECK_VERSES = 30;

const studyCache = new Map<number, Promise<StudySurah>>();
export function loadStudy(n: number): Promise<StudySurah> {
  if (!studyCache.has(n)) {
    const promise = fetch(`/api/etude/${n}`).then((r) => {
      if (!r.ok) throw new Error("données indisponibles");
      return r.json() as Promise<StudySurah>;
    });
    promise.catch(() => studyCache.delete(n));
    studyCache.set(n, promise);
  }
  return studyCache.get(n)!;
}

/** Données d'étude de plusieurs sourates (null tant que tout n'est pas chargé, ou en cas d'échec). */
export function useStudy(surahs: number[]): { data: Record<number, StudySurah> | null; error: boolean } {
  const key = [...new Set(surahs)].sort((a, b) => a - b).join(",");
  const [result, setResult] = useState<{ key: string; data: Record<number, StudySurah> | null; error: boolean }>({ key: "", data: null, error: false });
  useEffect(() => {
    let alive = true;
    const list = key ? key.split(",").map(Number) : [];
    Promise.all(list.map(async (n) => [n, await loadStudy(n)] as const))
      .then((entries) => alive && setResult({ key, data: Object.fromEntries(entries), error: false }))
      .catch(() => alive && setResult({ key, data: null, error: true }));
    return () => {
      alive = false;
    };
  }, [key]);
  return result.key === key ? { data: result.data, error: result.error } : { data: null, error: false };
}

/** Cartes d'un paquet : chaque mot différent (première occurrence), puis la lecture de chaque verset. */
export function deckCards(study: StudySurah, from: number, to: number, include: { words: boolean; verses: boolean }): string[] {
  const cards: string[] = [];
  const seen = new Set<string>();
  for (let v = from; v <= to; v += 1) {
    const verse = study.verses[v - 1];
    if (!verse) continue;
    if (include.words) {
      verse.w.forEach((word, i) => {
        if (seen.has(word.ar)) return;
        seen.add(word.ar);
        cards.push(wordCardId(study.n, v, i + 1));
      });
    }
    if (include.verses) cards.push(readingCardId(study.n, v));
  }
  return cards;
}

export function createDeck(input: { s: number; from: number; to: number; cards: string[] }): string {
  const id = `${input.s}-${input.from}-${input.to}-${Date.now().toString(36)}`;
  const deck: Deck = { id, s: input.s, from: input.from, to: input.to, createdAt: new Date().toISOString(), cards: input.cards };
  updateState((state) => ({ ...state, decks: { ...state.decks, [id]: deck } }));
  return id;
}

/** Suppression : le paquet est marqué (pour la synchronisation) ; ses cartes ne sont plus proposées. */
export function removeDeck(id: string) {
  updateState((state) => {
    const deck = state.decks[id];
    if (!deck) return state;
    return { ...state, decks: { ...state.decks, [id]: { ...deck, removedAt: new Date().toISOString() } } };
  });
}

export const activeDecks = (state: KalimaState): Deck[] =>
  Object.values(state.decks)
    .filter((deck) => !deck.removedAt)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export interface DeckStats {
  total: number;
  words: number;
  verses: number;
  /** jamais vues */
  fresh: number;
  /** vues et à revoir maintenant */
  due: number;
  /** solides : intervalle d'au moins trois semaines */
  solid: number;
}

export function deckStats(state: KalimaState, deck: Deck, now = new Date()): DeckStats {
  let fresh = 0;
  let due = 0;
  let solid = 0;
  for (const id of deck.cards) {
    const card = state.cards[id];
    if (!card) {
      fresh += 1;
      continue;
    }
    if (dueAt(card) <= now) due += 1;
    if (Number(card.fsrs.stability ?? 0) >= 21) solid += 1;
  }
  const words = deck.cards.filter((id) => id.startsWith("word:")).length;
  return { total: deck.cards.length, words, verses: deck.cards.length - words, fresh, due, solid };
}
