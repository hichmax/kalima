import { NextResponse } from "next/server";
import { recitationPhonetics } from "@/content/recitation";
import { loadSurah, surahIndex } from "@/lib/quran-data";

// Texte Tanzil d'une sourate (données du dépôt), généré une fois au build.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return surahIndex.map((s) => ({ n: String(s.n) }));
}

export async function GET(_request: Request, context: { params: Promise<{ n: string }> }) {
  const { n } = await context.params;
  const surah = await loadSurah(Number(n));
  return NextResponse.json({
    n: surah.n,
    notice: surah.notice,
    verses: surah.verses.map((v) => ({ v: v.v, w: v.w, ph: recitationPhonetics[`${surah.n}:${v.v}`] ?? null })),
  });
}
