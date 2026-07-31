import { describe, expect, it } from "vitest";
import vocabulary from "@/data/vocabulary.generated.json";
import type { VocabularyUnit } from "@/lib/types";
import {
  getPaginationPages,
  queryVocabularyUnits,
  vocabularyPageSize,
} from "@/lib/vocabulary-search";

const units = vocabulary.units as VocabularyUnit[];

describe("complete Quran vocabulary catalog", () => {
  it("contains every generated lemma with Quran Foundation learning data", () => {
    expect(vocabulary.metadata.count).toBe(4771);
    expect(units).toHaveLength(4771);
    expect(vocabulary.metadata.enrichedCount).toBe(4771);
    expect(vocabulary.metadata.unresolvedCount).toBe(0);
    expect(
      units.every(
        (unit) =>
          unit.audioUrl &&
          unit.transliteration &&
          unit.primaryMeaningFr &&
          !/(?:à valider|à vérifier|sens français)/iu.test(
            `${unit.transliteration} ${unit.primaryMeaningFr}`,
          ),
      ),
    ).toBe(true);
  });

  it("paginates the complete catalog without losing results", () => {
    const first = queryVocabularyUnits(units);
    const last = queryVocabularyUnits(units, { page: first.totalPages });

    expect(first.items).toHaveLength(vocabularyPageSize);
    expect(first.total).toBe(4771);
    expect(first.totalPages).toBe(100);
    expect(last.items).toHaveLength(19);
    expect(last.items.at(-1)?.id).toBe("qac-lemma-4771");
  });

  it("keeps pagination controls compact around the current page", () => {
    expect(getPaginationPages(50, 100)).toEqual([1, 49, 50, 51, 100]);
  });
});
