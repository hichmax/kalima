import { NextResponse } from "next/server";
import { lexicon } from "@/content/lexicon";
import { lexiconKey } from "@/lib/morphology";
import { autoPhonetic, prefixSegments } from "@/lib/phonetic-auto";
import { surahPhonetics } from "@/lib/phonetics";
import { loadMorph, loadSurah, surahIndex } from "@/lib/quran-data";
import type { StudySurah } from "@/lib/study-types";

// Texte Tanzil + phonétique + lemmes (QAC) + sens du lexique Kalima, générés une fois au build.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return surahIndex.map((s) => ({ n: String(s.n) }));
}

export async function GET(_request: Request, context: { params: Promise<{ n: string }> }) {
  const { n } = await context.params;
  const number = Number(n);
  const [surah, morph, phonetics] = await Promise.all([loadSurah(number), loadMorph(number), surahPhonetics(number)]);
  const body: StudySurah = {
    n: surah.n,
    verses: surah.verses.map((verse, i) => ({
      v: verse.v,
      ph: phonetics[i]?.text ?? "",
      phAuto: phonetics[i]?.auto ?? true,
      w: verse.w.map((word, j) => {
        const segments = morph.verses[i]?.[j] ?? [];
        const stem = segments.find((segment) => segment.k === "stem");
        const key = stem ? lexiconKey(stem) : undefined;
        return {
          ar: word.ar,
          ...(word.stop ? { stop: word.stop } : {}),
          ph: autoPhonetic([{ ar: word.ar }], [prefixSegments(segments)]),
          g: key && lexicon[key] ? lexicon[key].fr : null,
          l: stem?.l ?? null,
          r: stem?.r ?? null,
        };
      }),
    })),
  };
  return NextResponse.json(body);
}
