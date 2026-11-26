import { NextResponse } from "next/server";
import { surahPhonetics } from "@/lib/phonetics";
import { loadSurah, surahIndex } from "@/lib/quran-data";

// Texte Tanzil d'une sourate (données du dépôt) + phonétique, générés une fois au build.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return surahIndex.map((s) => ({ n: String(s.n) }));
}

export async function GET(_request: Request, context: { params: Promise<{ n: string }> }) {
  const { n } = await context.params;
  const [surah, phonetics] = await Promise.all([loadSurah(Number(n)), surahPhonetics(Number(n))]);
  return NextResponse.json({
    n: surah.n,
    notice: surah.notice,
    verses: surah.verses.map((v, i) => ({ v: v.v, w: v.w, ph: phonetics[i]?.text ?? null, phAuto: phonetics[i]?.auto ?? false })),
  });
}
