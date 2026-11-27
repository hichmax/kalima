import { describe, expect, it } from "vitest";
import { buildDeckQuiz } from "@/lib/deck-quiz";
import { seededRandom } from "@/lib/exercises";
import { emptyState, mergeStates, type KalimaState } from "@/lib/progress-schema";
import { dueCardIds, newDeckCardIds, NEW_DECK_CARDS_PER_DAY } from "@/lib/srs";
import { parseDeckCard, type StudySurah } from "@/lib/study-types";

const study: StudySurah = {
  n: 112,
  verses: [
    { v: 1, ph: "Qoul houwa l-lâhou aḥad", phAuto: false, w: ["قُلْ", "هُوَ", "ٱللَّهُ", "أَحَدٌ"].map((ar) => ({ ar, ph: ar, g: null, l: null, r: null })) },
    { v: 2, ph: "Allâhou ṣ-ṣamad", phAuto: false, w: ["ٱللَّهُ", "ٱلصَّمَدُ"].map((ar) => ({ ar, ph: ar, g: null, l: null, r: null })) },
    { v: 3, ph: "Lam yalid wa lam yoûlad", phAuto: false, w: ["لَمْ", "يَلِدْ", "وَلَمْ", "يُولَدْ"].map((ar) => ({ ar, ph: ar, g: null, l: null, r: null })) },
    { v: 4, ph: "Wa lam yakoul lahoû koufouwan aḥad", phAuto: false, w: ["وَلَمْ", "يَكُن", "لَّهُۥ", "كُفُوًا", "أَحَدٌۢ"].map((ar) => ({ ar, ph: ar, g: null, l: null, r: null })) },
  ],
};

// Chargé dynamiquement : decks.ts est un module client (React), ses fonctions pures suffisent ici.
const { deckCards } = await import("@/lib/decks");

const withDeck = (state: KalimaState, cards: string[], createdAt = "2026-11-27T10:00:00.000Z", removedAt?: string): KalimaState => ({
  ...state,
  decks: { d1: { id: "d1", s: 112, from: 1, to: 4, createdAt, cards, ...(removedAt ? { removedAt } : {}) } },
});

describe("paquets de cartes", () => {
  it("crée une carte par mot différent et une par verset", () => {
    const cards = deckCards(study, 1, 4, { words: true, verses: true });
    // ٱللَّهُ (v1 et v2) et وَلَمْ (v3 et v4) ne comptent qu'une fois
    expect(cards.filter((c) => c.startsWith("word:"))).toHaveLength(13);
    expect(cards.filter((c) => c.startsWith("reading:"))).toEqual(["reading:112:1", "reading:112:2", "reading:112:3", "reading:112:4"]);
    expect(cards).not.toContain("word:112:2:1");
    expect(deckCards(study, 2, 3, { words: false, verses: true })).toEqual(["reading:112:2", "reading:112:3"]);
  });

  it("reconnaît les identifiants de cartes", () => {
    expect(parseDeckCard("word:18:1:3")).toEqual({ kind: "word", s: 18, v: 1, w: 3 });
    expect(parseDeckCard("reading:18:10")).toEqual({ kind: "reading", s: 18, v: 10 });
    expect(parseDeckCard("verse:18:10")).toBeNull();
  });

  it("présente au plus 20 nouvelles cartes par jour, et aucune d'un paquet supprimé", () => {
    const ids = Array.from({ length: 30 }, (_, i) => `word:112:1:${i + 1}`);
    const state = withDeck(emptyState(), ids);
    const now = new Date("2026-11-27T12:00:00");
    expect(newDeckCardIds(state, now)).toHaveLength(NEW_DECK_CARDS_PER_DAY);
    expect(dueCardIds(state, now)).toHaveLength(NEW_DECK_CARDS_PER_DAY);
    const removed = withDeck(emptyState(), ids, "2026-11-27T10:00:00.000Z", "2026-11-27T11:00:00.000Z");
    expect(dueCardIds(removed, now)).toHaveLength(0);
  });

  it("la synchronisation garde la suppression la plus récente", () => {
    const a = withDeck(emptyState(), ["reading:112:1"]);
    const b = withDeck(emptyState(), ["reading:112:1"], "2026-11-27T10:00:00.000Z", "2026-11-27T12:00:00.000Z");
    expect(mergeStates(a, b).decks.d1.removedAt).toBe("2026-11-27T12:00:00.000Z");
    expect(mergeStates(b, a).decks.d1.removedAt).toBe("2026-11-27T12:00:00.000Z");
  });

  it("construit un quiz à une seule bonne réponse, sans doublon d'options", () => {
    const cards = deckCards(study, 1, 4, { words: true, verses: true });
    const fr: Record<string, string> = { "1": "dis|lui|Allah|unique", "2": "Allah|le Seul", "3": "pas|il engendre|et pas|il est engendré", "4": "et pas|il est|à lui|égal|un seul" };
    const quiz = buildDeckQuiz(cards, { 112: study }, { wordsFr: (_s, v) => fr[String(v)].split("|") }, seededRandom("t"), 50);
    expect(quiz.length).toBeGreaterThan(8);
    for (const q of quiz) {
      const labels = q.options.map((o) => o.label);
      expect(new Set(labels).size).toBe(labels.length);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.card && parseDeckCard(q.card)).toBeTruthy();
    }
    expect(quiz.some((q) => q.prompt.includes("bonne lecture"))).toBe(true);
  });
});
