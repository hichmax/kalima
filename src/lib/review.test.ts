import { describe, expect, it } from "vitest";
import {
  createReviewCard,
  scheduleReview,
  selectRandomReviewUnits,
} from "@/lib/review";
import type { VocabularyUnit } from "@/lib/types";

describe("FSRS review scheduling", () => {
  it("schedules an easy answer after an again answer", () => {
    const now = new Date("2026-07-25T08:00:00Z");
    const card = createReviewCard(now);
    const again = scheduleReview(card, "again", now);
    const easy = scheduleReview(card, "easy", now);

    expect(easy.card.due.getTime()).toBeGreaterThan(again.card.due.getTime());
    expect(easy.card.reps).toBe(1);
  });

  it("selects unique random words from the whole eligible vocabulary", () => {
    const units = Array.from({ length: 12 }, (_, index) => ({
      id: `word-${index}`,
    })) as VocabularyUnit[];
    const selected = selectRandomReviewUnits(
      units,
      5,
      ["word-1", "word-8"],
      () => 0,
    );

    expect(selected).toHaveLength(5);
    expect(new Set(selected.map((unit) => unit.id)).size).toBe(5);
    expect(selected.map((unit) => unit.id)).not.toContain("word-1");
    expect(selected.map((unit) => unit.id)).not.toContain("word-8");
    expect(selected.map((unit) => unit.id)).not.toEqual(
      units.slice(0, 5).map((unit) => unit.id),
    );
  });
});
