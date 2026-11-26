export interface QuranWord {
  /** Jeton(s) Tanzil, verbatim. */
  ar: string;
  /** Signe de pause ou de prosternation qui suit le mot (ۖ ۗ ۘ ۙ ۚ ۛ ۜ ۩). */
  stop?: string;
}

export interface QuranVerse {
  v: number;
  w: QuranWord[];
}

export interface SurahText {
  notice: string;
  n: number;
  /** Basmala telle qu'écrite par Tanzil en tête du verset 1 (null pour 1 et 9). */
  basmala: string[] | null;
  verses: QuranVerse[];
}

export interface SurahMeta {
  n: number;
  ar: string;
  tr: string;
  fr: string;
  ayas: number;
  type: "mecquoise" | "médinoise";
  order: number;
}

export interface MorphSegment {
  ar: string;
  /** pre = préfixe, stem = tige, suf = suffixe */
  k: "pre" | "stem" | "suf";
  /** N, V ou P */
  p: string;
  f: string;
  l?: string;
  r?: string;
}

export interface SurahMorph {
  notice: string;
  n: number;
  verses: MorphSegment[][][];
}

export interface ResolvedRef {
  ref: string;
  s: number;
  v: number;
  /** Indices 1-based des mots sélectionnés, ou null pour le verset entier. */
  range: [number, number] | null;
  words: QuranWord[];
  /** Texte affichable : mots joints par des espaces, signes de pause conservés. */
  text: string;
}

export const wordsToText = (words: QuranWord[]) =>
  words.map((word) => word.ar + (word.stop ? ` ${word.stop}` : "")).join(" ");

const REF_PATTERN = /^(\d{1,3}):(\d{1,3})(?::(\d{1,3})(?:-(\d{1,3}))?)?$/u;

export function parseRef(ref: string) {
  const match = REF_PATTERN.exec(ref);
  if (!match) throw new Error(`Référence coranique invalide : ${ref}`);
  const s = Number(match[1]);
  const v = Number(match[2]);
  const from = match[3] ? Number(match[3]) : null;
  const to = match[4] ? Number(match[4]) : from;
  if (s < 1 || s > 114 || v < 1) throw new Error(`Référence hors limites : ${ref}`);
  if (from !== null && to !== null && to < from) throw new Error(`Plage inversée : ${ref}`);
  return { s, v, range: from !== null && to !== null ? ([from, to] as [number, number]) : null };
}

export function resolveInSurah(surah: SurahText, ref: string): ResolvedRef {
  const { s, v, range } = parseRef(ref);
  if (surah.n !== s) throw new Error(`Référence ${ref} résolue dans la sourate ${surah.n}`);
  const verse = surah.verses[v - 1];
  if (!verse) throw new Error(`Verset introuvable : ${ref}`);
  if (range && (range[0] < 1 || range[1] > verse.w.length)) throw new Error(`Mot introuvable : ${ref}`);
  const words = range ? verse.w.slice(range[0] - 1, range[1]) : verse.w;
  return { ref, s, v, range, words, text: wordsToText(words) };
}
