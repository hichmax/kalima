import { describe, expect, it } from "vitest";
import { createReviewCard, scheduleReview } from "@/lib/review";

describe("FSRS review scheduling", () => {
  it("schedules an easy answer after an again answer", () => {
    const now = new Date("2026-07-25T08:00:00Z");
    const card = createReviewCard(now);
    const again = scheduleReview(card, "again", now);
    const easy = scheduleReview(card, "easy", now);

    expect(easy.card.due.getTime()).toBeGreaterThan(again.card.due.getTime());
    expect(easy.card.reps).toBe(1);
  });
});
