import { describe, expect, it } from "vitest";
import vocabulary from "@/data/vocabulary.generated.json";
import {
  isPreviousDay,
  selectDailyWords,
} from "@/lib/daily-challenge";
import type { VocabularyUnit } from "@/lib/types";

const units = vocabulary.units as VocabularyUnit[];

describe("daily five-word challenge", () => {
  it("selects five stable, translated words for a date", () => {
    const first = selectDailyWords(units, "2026-07-27");
    const second = selectDailyWords(units, "2026-07-27");

    expect(first).toHaveLength(5);
    expect(first.map((word) => word.id)).toEqual(second.map((word) => word.id));
    expect(first.every((word) => word.primaryMeaningFr.length > 0)).toBe(true);
  });

  it("recognizes only the immediately previous calendar day", () => {
    expect(isPreviousDay("2026-07-26", "2026-07-27")).toBe(true);
    expect(isPreviousDay("2026-07-25", "2026-07-27")).toBe(false);
    expect(isPreviousDay(null, "2026-07-27")).toBe(false);
  });
});
