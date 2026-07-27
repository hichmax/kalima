import { NextResponse } from "next/server";
import { getFixtureAyahs } from "@/data/quran-fixtures";
import {
  getQuranFoundationChapterVerses,
  isQuranFoundationConfigured,
} from "@/lib/quran-foundation";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ chapter: string }> },
) {
  const { chapter: rawChapter } = await params;
  const chapter = Number(rawChapter);
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 114) {
    return NextResponse.json({ error: "Sourate invalide." }, { status: 400 });
  }

  if (!isQuranFoundationConfigured()) {
    const ayahs = getFixtureAyahs(chapter);
    return NextResponse.json(
      { source: "local-fixture", ayahs },
      { status: ayahs.length ? 200 : 503 },
    );
  }

  try {
    const ayahs = await getQuranFoundationChapterVerses(chapter);
    return NextResponse.json(
      { source: "quran-foundation-v4", ayahs },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=518400",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Les versets sont temporairement indisponibles." },
      { status: 503 },
    );
  }
}
