import { beforeEach, describe, expect, it } from "vitest";
import { addDays, computeStreak, daysBetween, localDayKey } from "@/lib/dates";
import { buildSyllable, letterForms, seededRandom, shuffle } from "@/lib/exercises";
import { decomposeWord } from "@/lib/morphology";
import { applyReviews, dueCardIds, GRADE } from "@/lib/srs";
import { __resetCacheForTests, emptyState, exportState, getState, importState, parseState, STORAGE_KEY, updateState } from "@/lib/storage";

describe("dates et série", () => {
  it("calcule les jours civils locaux", () => {
    expect(localDayKey(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
    expect(daysBetween("2026-01-01", "2026-01-31")).toBe(30);
  });

  it("compte une série et tolère un jour de repos", () => {
    const today = "2026-03-10";
    const active = new Set(["2026-03-10", "2026-03-09", "2026-03-08"]);
    expect(computeStreak(active, today)).toEqual({ current: 3, restUsed: false });
    const withGap = new Set(["2026-03-10", "2026-03-08", "2026-03-07"]);
    expect(computeStreak(withGap, today)).toEqual({ current: 3, restUsed: true });
    const broken = new Set(["2026-03-10", "2026-03-07"]);
    expect(computeStreak(broken, today).current).toBe(1);
  });

  it("ne casse pas la série si la séance du jour n'est pas encore faite", () => {
    expect(computeStreak(new Set(["2026-03-09"]), "2026-03-10").current).toBe(1);
  });
});

describe("FSRS", () => {
  it("programme une carte réussie dans le futur et une carte ratée bientôt", async () => {
    const now = new Date("2026-05-01T10:00:00Z");
    const state = await applyReviews(emptyState(now), [
      { id: "letter:ب", grade: GRADE.good },
      { id: "letter:ت", grade: GRADE.again },
    ], now);
    const good = new Date(String(state.cards["letter:ب"].fsrs.dueAt));
    const again = new Date(String(state.cards["letter:ت"].fsrs.dueAt));
    expect(good.getTime()).toBeGreaterThan(now.getTime() + 86_400_000);
    expect(again.getTime()).toBeLessThan(now.getTime() + 3_600_000);
    expect(state.activity["2026-05-01"]).toMatchObject({ reviews: 2, correct: 1 });
  });

  it("relit une carte sérialisée et la fait progresser", async () => {
    const now = new Date("2026-05-01T10:00:00Z");
    const first = await applyReviews(emptyState(now), [{ id: "lemma:رَبّ|N", grade: GRADE.good }], now);
    const revived = parseState(JSON.stringify(first))!;
    const later = new Date(String(revived.cards["lemma:رَبّ|N"].fsrs.dueAt));
    const second = await applyReviews(revived, [{ id: "lemma:رَبّ|N", grade: GRADE.good }], later);
    expect(new Date(String(second.cards["lemma:رَبّ|N"].fsrs.dueAt)).getTime()).toBeGreaterThan(later.getTime() + 2 * 86_400_000);
  });

  it("liste les cartes dues, les plus en retard d'abord", async () => {
    const now = new Date("2026-05-01T10:00:00Z");
    const state = await applyReviews(emptyState(now), [{ id: "letter:ب", grade: GRADE.again }, { id: "letter:ت", grade: GRADE.good }], now);
    expect(dueCardIds(state, new Date("2026-05-01T12:00:00Z"))).toEqual(["letter:ب"]);
  });
});

describe("stockage local", () => {
  beforeEach(() => {
    window.localStorage.clear();
    __resetCacheForTests();
  });

  it("persiste, exporte et réimporte", () => {
    updateState((s) => ({ ...s, settings: { ...s.settings, theme: "papier" } }));
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!).settings.theme).toBe("papier");
    const exported = exportState();
    window.localStorage.clear();
    __resetCacheForTests();
    expect(getState().settings.theme).toBe("nuit");
    expect(importState(exported)).toEqual({ ok: true });
    expect(getState().settings.theme).toBe("papier");
  });

  it("refuse un fichier invalide sans rien casser", () => {
    expect(importState("{pas du json").ok).toBe(false);
    expect(importState(JSON.stringify({ version: 1 })).ok).toBe(false);
    expect(getState().version).toBe(2);
  });

  it("repart d'un état vide si la donnée locale est corrompue", () => {
    window.localStorage.setItem(STORAGE_KEY, "corrompu");
    __resetCacheForTests();
    expect(getState().cards).toEqual({});
  });
});

describe("générateurs", () => {
  it("construit les syllabes et leur transcription", () => {
    expect(buildSyllable("ب", "a")).toEqual({ ar: "بَ", ph: "ba" });
    expect(buildSyllable("ب", "u").ph).toBe("bou");
    expect(buildSyllable("ش", "ii")).toEqual({ ar: "شِي", ph: "chî" });
    expect(buildSyllable("ب", "sukun").ph).toBe("ab");
    expect(buildSyllable("ر", "shadda").ph).toBe("arra");
  });

  it("donne les formes liées sans lier les lettres non liantes à gauche", () => {
    expect(letterForms("ب").initial).toBe("ب‍");
    expect(letterForms("د").initial).toBe("د");
    expect(letterForms("د").medial).toBe("‍د");
  });

  it("mélange de façon reproductible", () => {
    const a = shuffle([1, 2, 3, 4, 5], seededRandom("x"));
    const b = shuffle([1, 2, 3, 4, 5], seededRandom("x"));
    expect(a).toEqual(b);
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("décompose un mot en préfixe, tige et suffixe", () => {
    const parts = decomposeWord([
      { ar: "وَ", k: "pre", p: "P", f: "CONJ", l: "و" },
      { ar: "إِيَّا", k: "stem", p: "N", f: "PRON", l: "إِيّا" },
      { ar: "كَ", k: "suf", p: "N", f: "PRON|2MS" },
    ]);
    expect(parts.map((p) => p.role)).toEqual(["préfixe", "mot", "suffixe"]);
    expect(parts[0].fr).toBe("et");
    expect(parts[2].fr).toContain("toi");
  });
});

describe("environnement Quran.Foundation", () => {
  it("reconnaît les variantes saisies dans Vercel", async () => {
    const { parseQfEnvironment } = await import("@/lib/quran-foundation");
    expect(parseQfEnvironment("production")).toBe("production");
    expect(parseQfEnvironment(" https://oauth2.quran.foundation ")).toBe("production");
    expect(parseQfEnvironment(undefined)).toBe("production");
    expect(parseQfEnvironment("prelive")).toBe("prelive");
    expect(parseQfEnvironment("https://prelive-oauth2.quran.foundation")).toBe("prelive");
  });
});
