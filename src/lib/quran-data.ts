import "server-only";
import index from "@/generated/surahs/index.json";
import type { ResolvedRef, SurahMeta, SurahMorph, SurahText } from "@/lib/quran-types";
import { parseRef, resolveInSurah } from "@/lib/quran-types";

/** Données Tanzil et QAC générées par scripts/build-content.mjs. Serveur uniquement. */

export const surahIndex = index.surahs as SurahMeta[];
export const tanzilNotice = index.notice;
export const juzStarts = index.juz;

export function getSurahMeta(n: number): SurahMeta {
  const meta = surahIndex[n - 1];
  if (!meta) throw new Error(`Sourate inconnue : ${n}`);
  return meta;
}

export async function loadSurah(n: number): Promise<SurahText> {
  getSurahMeta(n);
  const mod = await import(`@/generated/surahs/${n}.json`);
  return mod.default as SurahText;
}

export async function loadMorph(n: number): Promise<SurahMorph> {
  getSurahMeta(n);
  const mod = await import(`@/generated/morph/${n}.json`);
  return mod.default as SurahMorph;
}

export async function resolveRef(ref: string): Promise<ResolvedRef> {
  const { s } = parseRef(ref);
  return resolveInSurah(await loadSurah(s), ref);
}

export async function resolveRefs(refs: string[]): Promise<Record<string, ResolvedRef>> {
  const unique = [...new Set(refs)];
  const entries = await Promise.all(unique.map(async (ref) => [ref, await resolveRef(ref)] as const));
  return Object.fromEntries(entries);
}
