import "server-only";
import { recitationPhonetics } from "@/content/recitation";
import { autoPhonetic, prefixSegments } from "@/lib/phonetic-auto";
import { loadMorph, loadSurah } from "@/lib/quran-data";

export interface VersePhonetic {
  text: string;
  /** true : transcription automatique ; false : écrite et relue à la main */
  auto: boolean;
}

/** Phonétique de chaque verset d'une sourate : la version manuelle si elle existe, sinon l'automatique. */
export async function surahPhonetics(n: number): Promise<VersePhonetic[]> {
  const [surah, morph] = await Promise.all([loadSurah(n), loadMorph(n)]);
  return surah.verses.map((verse) => {
    const manual = recitationPhonetics[`${n}:${verse.v}`];
    if (manual) return { text: manual, auto: false };
    return { text: autoPhonetic(verse.w, (morph.verses[verse.v - 1] ?? []).map(prefixSegments)), auto: true };
  });
}
