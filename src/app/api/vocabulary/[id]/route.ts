import { NextResponse } from "next/server";
import { getVocabularyUnitWithFamily } from "@/lib/vocabulary";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const detail = getVocabularyUnitWithFamily(id);
  if (!detail) {
    return NextResponse.json({ error: "Mot introuvable." }, { status: 404 });
  }
  return NextResponse.json(detail, {
    headers: { "Cache-Control": "private, max-age=60" },
  });
}
