import type {
  Ayah,
  CustomWordList,
  PracticeWord,
  QuranWord,
  VocabularyUnit,
} from "@/lib/types";

const normalize = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u064B-\u065F\u0670\u06D6-\u06ED]/gu, "")
    .replace(/[ٱأإآ]/gu, "ا")
    .replace(/\s+/gu, " ")
    .trim()
    .toLocaleLowerCase("fr");

export const practiceWordKey = (word: PracticeWord) =>
  `${normalize(word.simpleArabic || word.arabic)}|${normalize(word.primaryMeaningFr)}`;

export function toPracticeWord(unit: VocabularyUnit): PracticeWord {
  return {
    id: unit.id,
    arabic: unit.arabic,
    simpleArabic: unit.simpleArabic,
    beginnerPhonetic: unit.beginnerPhonetic,
    transliteration: unit.transliteration,
    primaryMeaningFr: unit.primaryMeaningFr,
    lemma: unit.lemma,
    occurrences: unit.occurrences,
    examples: unit.examples.slice(0, 5),
    sourceIds: unit.sourceIds,
    audioUrl: unit.audioUrl,
  };
}

export function quranWordToPracticeWord(
  word: QuranWord,
  ayah: Ayah,
): PracticeWord {
  return {
    id: word.id,
    arabic: word.arabic,
    simpleArabic: word.simpleArabic,
    beginnerPhonetic: word.beginnerPhonetic,
    transliteration: word.transliteration,
    primaryMeaningFr: word.contextualMeaning,
    lemma: word.lemma || word.simpleArabic,
    occurrences: 1,
    examples: [ayah.id],
    sourceIds: word.sourceIds,
    audioUrl: word.audioUrl,
  };
}

export function mergePracticeWords(
  ...groups: PracticeWord[][]
): PracticeWord[] {
  const merged = new Map<string, PracticeWord>();
  for (const word of groups.flat()) {
    const key = practiceWordKey(word);
    const current = merged.get(key);
    if (!current) {
      merged.set(key, word);
      continue;
    }
    merged.set(key, {
      ...current,
      occurrences: Math.max(current.occurrences, word.occurrences),
      examples: Array.from(
        new Set([...current.examples, ...word.examples]),
      ).slice(0, 10),
      sourceIds: Array.from(
        new Set([...current.sourceIds, ...word.sourceIds]),
      ),
      audioUrl: current.audioUrl || word.audioUrl,
    });
  }
  return [...merged.values()];
}

export function practiceWordsFromAyahs(ayahs: Ayah[]): PracticeWord[] {
  return mergePracticeWords(
    ayahs.flatMap((ayah) =>
      ayah.words.map((word) => quranWordToPracticeWord(word, ayah)),
    ),
  );
}

export function updateCustomList(
  lists: CustomWordList[],
  list: CustomWordList,
): CustomWordList[] {
  const index = lists.findIndex((item) => item.id === list.id);
  if (index < 0) return [list, ...lists];
  return lists.map((item) => (item.id === list.id ? list : item));
}
