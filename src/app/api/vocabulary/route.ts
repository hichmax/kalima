import { NextResponse } from "next/server";
import { z } from "zod";
import type { VocabularyFilter, VocabularySort } from "@/lib/types";
import {
  getVocabularyPage,
  getVocabularyUnitsByIds,
} from "@/lib/vocabulary";

export const runtime = "nodejs";

const querySchema = z.object({
  query: z.string().max(120).default(""),
  filter: z
    .enum(["all", "nom", "verbe", "particule", "adjectif", "autre"])
    .default("all"),
  sort: z
    .enum(["occurrences-desc", "occurrences-asc", "french", "arabic"])
    .default("occurrences-desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(48),
});

const idsSchema = z.object({
  ids: z.array(z.string().min(1).max(80)).max(5000),
});

export function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const parsed = querySchema.safeParse({
    query: searchParams.get("query") || undefined,
    filter: searchParams.get("filter") || undefined,
    sort: searchParams.get("sort") || undefined,
    page: searchParams.get("page") || undefined,
    pageSize: searchParams.get("pageSize") || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Paramètres de recherche invalides." },
      { status: 400 },
    );
  }
  const { query, filter, sort, page, pageSize } = parsed.data;
  return NextResponse.json(
    getVocabularyPage({
      query,
      filter: filter as VocabularyFilter,
      sort: sort as VocabularySort,
      page,
      pageSize,
    }),
    { headers: { "Cache-Control": "private, max-age=60" } },
  );
}

export async function POST(request: Request) {
  const parsed = idsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Liste d’identifiants invalide." },
      { status: 400 },
    );
  }
  return NextResponse.json({ items: getVocabularyUnitsByIds(parsed.data.ids) });
}
