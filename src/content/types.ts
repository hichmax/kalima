/** Statut éditorial d'un contenu. Rien n'est « approuvé » sans relecteur nommé. */
export type ContentStatus = "draft" | "reviewed" | "approved";

export type LessonTrack = "lecture" | "tajwid" | "arabe" | "bilan";

/** Identifiants des références citées (voir src/content/sources.ts). */
export type SourceId =
  | "tanzil"
  | "qac"
  | "qf"
  | "hamidullah"
  | "alafasy"
  | "tuhfa"
  | "jazariyya"
  | "mushaf-madina"
  | "nuraniyya"
  | "marsafi"
  | "roediger-2006"
  | "cepeda-2006"
  | "dunlosky-2013"
  | "fsrs"
  | "kornell-2008"
  | "ehri-2014"
  | "abu-rabia-2001"
  | "amiri";

export type Block =
  | { kind: "text"; title?: string; body: string }
  | { kind: "letters"; title?: string; chars: string[]; showForms?: boolean }
  | { kind: "table"; title?: string; head: string[]; rows: string[][]; arabicCols?: number[] }
  /** Exemple coranique : `ref` = verset (s:v) ; `focus` = mots mis en valeur (1-based). */
  | { kind: "quran"; ref: string; focus?: [number, number]; label?: string; note?: string }
  | { kind: "syllables"; title?: string; items: Array<{ ar: string; ph: string }> }
  | { kind: "tip"; tone: "info" | "warn" | "review"; body: string };

export interface ChoiceItem {
  q: string;
  /** Texte arabe NON coranique (lettre, syllabe). Pour un mot du Coran, utiliser `ref`. */
  ar?: string;
  /** Mot(s) ou verset du Coran affiché(s) dans la question (s:v ou s:v:w ou s:v:w-w). */
  ref?: string;
  options: string[];
  answer: number;
  explain?: string;
  /** Carte FSRS alimentée par cette question. */
  card?: string;
}

export type Practice =
  | { gen: "letter-name"; chars: string[] }
  | { gen: "name-letter"; chars: string[] }
  | { gen: "letter-sound"; chars: string[] }
  | { gen: "letter-forms"; chars: string[] }
  | { gen: "syllable"; chars: string[]; vowels: SyllableVowel[] }
  | { gen: "choice"; items: ChoiceItem[] }
  | {
      gen: "rule";
      prompt?: string;
      /** Identifiants de règles (src/content/tajwid.ts) proposés comme réponses. */
      options: string[];
      items: Array<{ ref: string; answer: string; explain?: string }>;
    };

export type SyllableVowel = "a" | "i" | "u" | "aa" | "ii" | "uu" | "an" | "in" | "un" | "sukun" | "shadda";

export interface Lesson {
  id: string;
  track: LessonTrack;
  title: string;
  subtitle: string;
  minutes: number;
  status: ContentStatus;
  sources: SourceId[];
  blocks: Block[];
  practice: Practice[];
  /** Pour un bilan : leçons dont on tire des questions de révision. */
  reviewOf?: string[];
}
