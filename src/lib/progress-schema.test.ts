import { describe, expect, it } from "vitest";
import { emptyState, mergeStates, stateSchema, type KalimaState } from "./progress-schema";

function state(updatedAt: string, patch: Partial<KalimaState> = {}): KalimaState {
  return { ...emptyState(new Date("2026-01-01T00:00:00Z")), updatedAt, ...patch };
}

const card = (lastReviewAt: string, grade: number) => ({
  kind: "letter" as const,
  addedAt: "2026-01-01T00:00:00Z",
  fsrs: { lastReviewAt, dueAt: lastReviewAt },
  lastGrade: grade,
});

describe("mergeStates", () => {
  it("ne perd aucune carte et garde la révision la plus récente", () => {
    const a = state("2026-02-01T00:00:00Z", { cards: { "letter:ب": card("2026-01-10T00:00:00Z", 2), "letter:ت": card("2026-01-05T00:00:00Z", 3) } });
    const b = state("2026-01-20T00:00:00Z", { cards: { "letter:ب": card("2026-01-15T00:00:00Z", 4), "letter:ث": card("2026-01-02T00:00:00Z", 3) } });
    const merged = mergeStates(a, b);
    expect(Object.keys(merged.cards).sort()).toEqual(["letter:ب", "letter:ت", "letter:ث"].sort());
    expect(merged.cards["letter:ب"].lastGrade).toBe(4);
  });

  it("unit les étapes, garde les meilleurs scores et la première validation", () => {
    const a = state("2026-02-01T00:00:00Z", { days: { "3": { steps: { lesson: true }, lessonScores: { l1: 0.6 }, completedAt: "2026-01-12T00:00:00Z" } } });
    const b = state("2026-01-01T00:00:00Z", { days: { "3": { steps: { review: true }, lessonScores: { l1: 0.9 }, completedAt: "2026-01-10T00:00:00Z" } } });
    const day = mergeStates(a, b).days["3"];
    expect(day.steps).toEqual({ lesson: true, review: true });
    expect(day.lessonScores.l1).toBe(0.9);
    expect(day.completedAt).toBe("2026-01-10T00:00:00Z");
  });

  it("ne compte jamais deux fois la même activité", () => {
    const activity = { "2026-01-10": { reviews: 12, correct: 10, sessions: 1 } };
    const merged = mergeStates(state("2026-02-01T00:00:00Z", { activity }), state("2026-02-01T00:00:00Z", { activity }));
    expect(merged.activity["2026-01-10"]).toEqual({ reviews: 12, correct: 10, sessions: 1 });
  });

  it("prend les réglages du document le plus récent et reste valide", () => {
    const a = state("2026-01-01T00:00:00Z");
    const b = state("2026-03-01T00:00:00Z", { settings: { ...a.settings, theme: "papier" } });
    const merged = mergeStates(a, b);
    expect(merged.settings.theme).toBe("papier");
    expect(merged.updatedAt).toBe("2026-03-01T00:00:00Z");
    expect(stateSchema.safeParse(merged).success).toBe(true);
  });

  it("est commutatif sur le contenu", () => {
    const a = state("2026-02-01T00:00:00Z", { cards: { x: card("2026-01-10T00:00:00Z", 3) }, challenges: { d: { score: 3, total: 5 } } });
    const b = state("2026-02-02T00:00:00Z", { cards: { y: card("2026-01-11T00:00:00Z", 3) }, challenges: { d: { score: 4, total: 5 } } });
    const ab = mergeStates(a, b);
    const ba = mergeStates(b, a);
    expect(ab.cards).toEqual(ba.cards);
    expect(ab.challenges).toEqual(ba.challenges);
  });
});
