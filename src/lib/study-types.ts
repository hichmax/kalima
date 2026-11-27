/** Données d'étude d'une sourate pour les cartes (texte Tanzil, phonétique, sens du lexique Kalima). */

export interface StudyWord {
  /** Jeton Tanzil, verbatim. */
  ar: string;
  stop?: string;
  /** Phonétique automatique du mot lu seul (indice). */
  ph: string;
  /** Sens général du lemme (lexique Kalima), null si le lemme n'y est pas encore. */
  g: string | null;
  /** Lemme (mot de dictionnaire) et racine, d'après le Quranic Arabic Corpus. */
  l: string | null;
  r: string | null;
}

export interface StudyVerseData {
  v: number;
  /** Phonétique du verset : écrite à la main si elle existe, sinon automatique. */
  ph: string;
  phAuto: boolean;
  w: StudyWord[];
}

export interface StudySurah {
  n: number;
  verses: StudyVerseData[];
}

/** Identifiants des cartes de paquet. */
export const wordCardId = (s: number, v: number, w: number) => `word:${s}:${v}:${w}`;
export const readingCardId = (s: number, v: number) => `reading:${s}:${v}`;

export function parseDeckCard(id: string): { kind: "word"; s: number; v: number; w: number } | { kind: "reading"; s: number; v: number } | null {
  const word = /^word:(\d{1,3}):(\d{1,3}):(\d{1,3})$/u.exec(id);
  if (word) return { kind: "word", s: Number(word[1]), v: Number(word[2]), w: Number(word[3]) };
  const reading = /^reading:(\d{1,3}):(\d{1,3})$/u.exec(id);
  if (reading) return { kind: "reading", s: Number(reading[1]), v: Number(reading[2]) };
  return null;
}
