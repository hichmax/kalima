import type {
  VocabularyFilter,
  VocabularyPageResult,
  VocabularySort,
  VocabularyUnit,
} from "@/lib/types";
import { getWordPhonetic } from "@/lib/phonetics";

export const vocabularyPageSize = 48;

export const normalizeVocabularySearch = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u064B-\u065F\u0670\u06D6-\u06ED]/gu, "")
    .replace(/[ٱأإآ]/gu, "ا")
    .toLocaleLowerCase("fr");

export function queryVocabularyUnits(
  units: VocabularyUnit[],
  {
    query = "",
    filter = "all",
    sort = "occurrences-desc",
    page = 1,
    pageSize = vocabularyPageSize,
  }: {
    query?: string;
    filter?: VocabularyFilter;
    sort?: VocabularySort;
    page?: number;
    pageSize?: number;
  } = {},
): VocabularyPageResult {
  const search = normalizeVocabularySearch(query.trim());
  const safePageSize = Math.min(100, Math.max(1, Math.trunc(pageSize)));
  const filtered = units
    .filter((unit) => filter === "all" || unit.partOfSpeech === filter)
    .filter((unit) => {
      if (!search) return true;
      return normalizeVocabularySearch(
        `${unit.arabic} ${unit.simpleArabic} ${getWordPhonetic(unit)} ${unit.primaryMeaningFr} ${unit.root || ""} ${unit.lemma}`,
      ).includes(search);
    })
    .sort((left, right) => {
      if (sort === "occurrences-asc") {
        return left.occurrences - right.occurrences;
      }
      if (sort === "french") {
        return left.primaryMeaningFr.localeCompare(
          right.primaryMeaningFr,
          "fr",
        );
      }
      if (sort === "arabic") {
        return left.simpleArabic.localeCompare(right.simpleArabic, "ar");
      }
      return right.occurrences - left.occurrences;
    });
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(totalPages, Math.max(1, Math.trunc(page)));
  const start = (safePage - 1) * safePageSize;

  return {
    items: filtered.slice(start, start + safePageSize),
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages,
  };
}

export function getPaginationPages(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  return Array.from(
    new Set([1, current - 1, current, current + 1, total]),
  )
    .filter((page) => page >= 1 && page <= total)
    .sort((left, right) => left - right);
}
