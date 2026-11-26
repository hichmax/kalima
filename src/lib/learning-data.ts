import "server-only";
import lexiconStats from "@/generated/lexicon-stats.json";
import { lexicon } from "@/content/lexicon";
import { allLessons, getDay, getLesson, program, PROGRAM_SURAHS } from "@/content/program";
import { recitationPhonetics } from "@/content/recitation";
import type { Lesson } from "@/content/types";
import { buildLessonExercises, lessonRefsDeep, type Exercise } from "@/lib/exercises";
import { decomposeWord, lexiconKey, type WordPart } from "@/lib/morphology";
import { loadMorph, loadSurah, resolveRef, resolveRefs } from "@/lib/quran-data";
import type { QuranWord, ResolvedRef } from "@/lib/quran-types";

/** Données préparées côté serveur (au build) pour les écrans d'apprentissage. */

export interface LemmaEntry {
  key: string;
  lemma: string;
  pos: string;
  root: string | null;
  fr: string;
  note?: string;
  count: number;
  rank: number;
  coverage: number;
  example: { ref: string; verse: QuranWord[]; focus: [number, number] } | null;
}

export interface StudyVerse {
  s: number;
  v: number;
  words: QuranWord[];
  phonetic: string | null;
  parts: WordPart[][];
}

type StatLemma = (typeof lexiconStats.lemmas)[number];
const statsByKey = new Map<string, StatLemma>(lexiconStats.lemmas.map((l) => [l.key, l]));

export const lexiconSummary = {
  totalStems: lexiconStats.totalStems,
  distinctLemmas: lexiconStats.distinctLemmas,
  hapax: lexiconStats.hapax,
};

async function verseLemmaKeys(s: number, v: number): Promise<string[]> {
  const morph = await loadMorph(s);
  const keys: string[] = [];
  for (const segments of morph.verses[v - 1] ?? []) {
    for (const segment of segments) {
      const key = segment.k === "stem" ? lexiconKey(segment) : undefined;
      if (key && lexicon[key] && !keys.includes(key)) keys.push(key);
    }
  }
  return keys;
}

let planCache: Promise<Map<number, string[]>> | null = null;

/** Répartition des lemmes sur les 30 jours : ceux des versets du jour d'abord, puis par fréquence. */
export function wordPlan(): Promise<Map<number, string[]>> {
  planCache ??= (async () => {
    const assigned = new Set<string>();
    const byFrequency = [...lexiconStats.lemmas].sort((a, b) => a.rank - b.rank).map((l) => l.key);
    const plan = new Map<number, string[]>();
    for (const day of program) {
      const picked: string[] = [];
      for (const segment of day.memorize) {
        for (let v = segment.from; v <= segment.to && picked.length < day.newWords; v += 1) {
          for (const key of await verseLemmaKeys(segment.s, v)) {
            if (picked.length >= day.newWords) break;
            if (!assigned.has(key)) {
              assigned.add(key);
              picked.push(key);
            }
          }
        }
      }
      for (const key of byFrequency) {
        if (picked.length >= day.newWords) break;
        if (!assigned.has(key) && lexicon[key]) {
          assigned.add(key);
          picked.push(key);
        }
      }
      plan.set(day.day, picked);
    }
    return plan;
  })();
  return planCache;
}

export async function lemmaEntry(key: string, withExample = true): Promise<LemmaEntry> {
  const stat = statsByKey.get(key);
  const gloss = lexicon[key];
  if (!stat || !gloss) throw new Error(`Lemme inconnu : ${key}`);
  let example: LemmaEntry["example"] = null;
  if (withExample && stat.refs[0]) {
    const [s, v, w] = stat.refs[0].split(":").map(Number);
    const verse = await resolveRef(`${s}:${v}`);
    example = { ref: stat.refs[0], verse: verse.words, focus: [w, w] };
  }
  return {
    key,
    lemma: stat.lemma,
    pos: stat.pos,
    root: stat.root,
    fr: gloss.fr,
    note: gloss.note,
    count: stat.count,
    rank: stat.rank,
    coverage: stat.coverage,
    example,
  };
}

export async function allLemmaEntries(withExample = false): Promise<LemmaEntry[]> {
  return Promise.all(lexiconStats.lemmas.map((l) => lemmaEntry(l.key, withExample)));
}

export async function studyVerse(s: number, v: number): Promise<StudyVerse> {
  const [text, morph] = await Promise.all([loadSurah(s), loadMorph(s)]);
  const verse = text.verses[v - 1];
  if (!verse) throw new Error(`Verset introuvable ${s}:${v}`);
  return {
    s,
    v,
    words: verse.w,
    phonetic: recitationPhonetics[`${s}:${v}`] ?? null,
    parts: (morph.verses[v - 1] ?? []).map((segments) => decomposeWord(segments)),
  };
}

export interface LessonBundle {
  lesson: Lesson;
  sourceLessons: Lesson[];
  refs: Record<string, ResolvedRef>;
}

export async function lessonBundle(id: string): Promise<LessonBundle> {
  const lesson = getLesson(id);
  const sourceLessons = (lesson.reviewOf ?? []).map(getLesson);
  const refs = await resolveRefs(lessonRefsDeep(lesson, allLessons));
  return { lesson, sourceLessons, refs };
}

export async function dayPayload(dayNumber: number) {
  const day = getDay(dayNumber);
  const plan = await wordPlan();
  const [lessons, verses, words] = await Promise.all([
    Promise.all(day.lessons.map(lessonBundle)),
    Promise.all(
      day.memorize.flatMap((segment) =>
        Array.from({ length: segment.to - segment.from + 1 }, (_, i) => studyVerse(segment.s, segment.from + i)),
      ),
    ),
    Promise.all((plan.get(dayNumber) ?? []).map((key) => lemmaEntry(key))),
  ]);
  return { day, lessons, verses, words };
}

export type DayPayload = Awaited<ReturnType<typeof dayPayload>>;

/** Banque de questions de révision, indexée par carte FSRS. */
export async function reviewBank() {
  const byCard: Record<string, Exercise[]> = {};
  for (const lesson of allLessons) {
    if (lesson.track === "bilan") continue;
    const refs = await resolveRefs(lessonRefsDeep(lesson, allLessons));
    for (const exercise of buildLessonExercises(lesson, allLessons, refs, `bank:${lesson.id}`, 500)) {
      if (!exercise.card) continue;
      (byCard[exercise.card] ??= []).push(exercise);
    }
  }
  const verses: Record<string, { words: QuranWord[]; phonetic: string | null; surah: number }> = {};
  for (const s of PROGRAM_SURAHS) {
    const text = await loadSurah(s);
    for (const verse of text.verses) {
      verses[`${s}:${verse.v}`] = { words: verse.w, phonetic: recitationPhonetics[`${s}:${verse.v}`] ?? null, surah: s };
    }
  }
  const lemmas = await allLemmaEntries(false);
  return { byCard, verses, lemmas };
}

export type ReviewBank = Awaited<ReturnType<typeof reviewBank>>;
