import { NextResponse } from "next/server";
import { chapters } from "@/data/chapters";
import {
  isQuranFoundationConfigured,
  listQuranFoundationChapters,
} from "@/lib/quran-foundation";

export async function GET() {
  if (!isQuranFoundationConfigured()) {
    return NextResponse.json({
      source: "local-metadata",
      chapters,
      notice: "Quran Foundation credentials are not configured",
    });
  }
  try {
    return NextResponse.json({
      source: "quran-foundation-v4",
      chapters: await listQuranFoundationChapters(),
    });
  } catch {
    return NextResponse.json(
      { error: "Le contenu distant est temporairement indisponible." },
      { status: 503 },
    );
  }
}
