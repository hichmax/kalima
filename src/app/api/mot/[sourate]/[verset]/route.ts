import { NextResponse } from "next/server";
import { lexicon } from "@/content/lexicon";
import { decomposeWord } from "@/lib/morphology";
import { loadMorph, loadSurah } from "@/lib/quran-data";

/** Mots d'un verset (Tanzil) et leur décomposition (Quranic Arabic Corpus + lexique Kalima). */
export async function GET(_request: Request, context: { params: Promise<{ sourate: string; verset: string }> }) {
  const { sourate, verset } = await context.params;
  const s = Number(sourate);
  const v = Number(verset);
  if (!Number.isInteger(s) || s < 1 || s > 114 || !Number.isInteger(v) || v < 1) {
    return NextResponse.json({ error: "référence invalide" }, { status: 400 });
  }
  const [text, morph] = await Promise.all([loadSurah(s), loadMorph(s)]);
  const verse = text.verses[v - 1];
  const segments = morph.verses[v - 1];
  if (!verse || !segments) return NextResponse.json({ error: "verset introuvable" }, { status: 404 });
  const words = verse.w.map((word, i) => ({
    ar: word.ar,
    parts: decomposeWord(segments[i] ?? []).map((part) => ({ ...part, note: part.key ? lexicon[part.key]?.note : undefined })),
  }));
  return NextResponse.json({ words }, { headers: { "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable" } });
}
