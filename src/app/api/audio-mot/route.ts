import { NextResponse } from "next/server";
import { getVerseWordAudio, isQuranFoundationConfigured, PRELIVE_CHAPTERS, quranFoundationEnvironment } from "@/lib/quran-foundation";

/**
 * Audio d'un mot du Coran (récitation mot à mot via Quran.Foundation).
 * GET /api/audio-mot?ref=s:v:w → { url } ; jamais stocké, cache navigateur privé.
 */
export async function GET(request: Request) {
  const ref = new URL(request.url).searchParams.get("ref") ?? "";
  const match = /^(\d{1,3}):(\d{1,3}):(\d{1,3})$/u.exec(ref);
  if (!match) return NextResponse.json({ url: null, reason: "invalid" }, { status: 400 });
  if (!isQuranFoundationConfigured()) return NextResponse.json({ url: null, reason: "not-configured" });
  const [s, v, w] = match.slice(1).map(Number);
  if (quranFoundationEnvironment() === "prelive" && !PRELIVE_CHAPTERS.includes(s)) {
    return NextResponse.json({ url: null, reason: "prelive-limited" });
  }
  try {
    const words = await getVerseWordAudio(s, v);
    return NextResponse.json({ url: words[w - 1] ?? null }, { headers: { "Cache-Control": "private, max-age=3600" } });
  } catch {
    return NextResponse.json({ url: null, reason: "upstream" }, { status: 502 });
  }
}
