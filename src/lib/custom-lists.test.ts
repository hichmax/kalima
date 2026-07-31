import { describe, expect, it } from "vitest";
import { fatihaAyahs } from "@/data/quran-fixtures";
import {
  mergePracticeWords,
  practiceWordsFromAyahs,
} from "@/lib/custom-lists";
import type { PracticeWord } from "@/lib/types";

describe("custom word lists", () => {
  it("deduplicates repeated contextual words across selected verses", () => {
    const words = practiceWordsFromAyahs(fatihaAyahs);
    const forms = words.map(
      (word) => `${word.simpleArabic}:${word.primaryMeaningFr}`,
    );

    expect(new Set(forms).size).toBe(forms.length);
    expect(words.length).toBeGreaterThan(15);
    expect(words.every((word) => word.examples.length > 0)).toBe(true);
  });

  it("merges provenance and examples for the same learning card", () => {
    const first = {
      id: "1:1:1",
      arabic: "رَبِّ",
      simpleArabic: "رب",
      beginnerPhonetic: "rabbi",
      transliteration: "rabbi",
      primaryMeaningFr: "Seigneur",
      lemma: "رب",
      occurrences: 1,
      examples: ["1:2"],
      sourceIds: ["source-a"],
    } satisfies PracticeWord;
    const merged = mergePracticeWords(
      [first],
      [
        {
          ...first,
          id: "2:1:1",
          examples: ["2:1"],
          sourceIds: ["source-b"],
        },
      ],
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].examples).toEqual(["1:2", "2:1"]);
    expect(merged[0].sourceIds).toEqual(["source-a", "source-b"]);
  });
});
