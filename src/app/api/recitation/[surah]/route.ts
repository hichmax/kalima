import { NextResponse } from "next/server";
import { getChapterMedia, isQuranFoundationConfigured } from "@/lib/quran-foundation";

/**
 * Traduction des sens et récitation d'une sourate, relayées depuis Quran.Foundation.
 * Réponse privée au navigateur (pas de cache public partagé), données jamais stockées.
 */
export async function GET(_request: Request, context: { params: Promise<{ surah: string }> }) {
  const { surah } = await context.params;
  const n = Number(surah);
  if (!Number.isInteger(n) || n < 1 || n > 114) {
    return NextResponse.json({ available: false, reason: "invalid" }, { status: 400 });
  }
  if (!isQuranFoundationConfigured()) {
    return NextResponse.json({ available: false, reason: "not-configured" });
  }
  try {
    const verses = await getChapterMedia(n);
    return NextResponse.json(
      {
        available: true,
        credits: {
          translation: "Muhammad Hamidullah (révision du Complexe du Roi Fahd)",
          reciter: "Mishary Rāshid al-ʿAfāsī — Ḥafṣ ʿan ʿĀṣim",
          provider: "Quran.Foundation",
        },
        verses,
      },
      { headers: { "Cache-Control": "private, max-age=3600" } },
    );
  } catch {
    return NextResponse.json({ available: false, reason: "upstream" }, { status: 502 });
  }
}
