import { NextResponse } from "next/server";
import { getChapterMedia, isQuranFoundationConfigured, PRELIVE_CHAPTERS, quranFoundationEnvironment, type Reciter } from "@/lib/quran-foundation";

const RECITERS: Record<Reciter, string> = {
  afasy: "Mishary Rāshid al-ʿAfāsī — Ḥafṣ ʿan ʿĀṣim",
  dossari: "Yāsir ad-Dawsarī — Ḥafṣ ʿan ʿĀṣim",
};

/**
 * Traduction des sens et récitation d'une sourate, relayées depuis Quran.Foundation.
 * Réponse privée au navigateur (pas de cache public partagé), données jamais stockées.
 */
export async function GET(request: Request, context: { params: Promise<{ surah: string }> }) {
  const { surah } = await context.params;
  const reciter: Reciter = new URL(request.url).searchParams.get("r") === "dossari" ? "dossari" : "afasy";
  const n = Number(surah);
  if (!Number.isInteger(n) || n < 1 || n > 114) {
    return NextResponse.json({ available: false, reason: "invalid" }, { status: 400 });
  }
  if (!isQuranFoundationConfigured()) {
    return NextResponse.json({ available: false, reason: "not-configured" });
  }
  if (quranFoundationEnvironment() === "prelive" && !PRELIVE_CHAPTERS.includes(n)) {
    return NextResponse.json({ available: false, reason: "prelive-limited" });
  }
  try {
    const verses = await getChapterMedia(n, reciter);
    return NextResponse.json(
      {
        available: true,
        credits: {
          translation: "Muhammad Hamidullah (révision du Complexe du Roi Fahd)",
          reciter: RECITERS[reciter],
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
