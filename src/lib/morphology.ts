import { lexicon } from "@/content/lexicon";
import type { MorphSegment } from "@/lib/quran-types";

/**
 * Décomposition pédagogique d'un mot : préfixes, tige, suffixes.
 * Le découpage vient du Quranic Arabic Corpus ; les sens des affixes sont fixes,
 * celui de la tige vient du lexique Kalima (sens général, pas sens en contexte).
 */

export interface WordPart {
  ar: string;
  role: "préfixe" | "mot" | "suffixe";
  fr: string;
  /** Clé lexique (lemme|catégorie) pour la tige. */
  key?: string;
  root?: string;
}

const PREFIX_GLOSS: Record<string, string> = {
  "DET|ال": "le, la, les (article)",
  "CONJ|و": "et",
  "CONJ|ف": "et, puis",
  "REM|ف": "alors, et",
  "REM|و": "et",
  "CIRC|و": "alors que",
  "SUP|و": "et (serment ou ajout)",
  "COM|و": "avec",
  "P|و": "par (serment)",
  "P|ت": "par (serment)",
  "P|ب": "par, avec, en",
  "P|ل": "pour, à",
  "P|ك": "comme",
  "EMPH|ل": "certes (insistance)",
  "PRP|ل": "pour que",
  "IMPV|ل": "que… (ordre)",
  "RSLT|ف": "alors, donc",
  "CAUS|ف": "afin que",
  "SUP|ف": "alors",
  "FUT|س": "(futur) va…",
  "INTG|أ": "est-ce que ?",
  "EQ|أ": "que… (ou)",
  "VOC|ي": "ô",
  "ATT|ه": "(attention) voici",
};

const PRONOUN_GLOSS: Record<string, string> = {
  "1S": "moi, mon, ma",
  "1P": "nous, notre",
  "2MS": "toi, ton, ta",
  "2FS": "toi (fém.), ton",
  "2MP": "vous, votre",
  "2FP": "vous (fém.), votre",
  "2D": "vous deux",
  "3MS": "lui, son, sa",
  "3FS": "elle, son, sa",
  "3MP": "eux, ils, leur",
  "3FP": "elles, leur",
  "3D": "eux deux",
  "3MD": "eux deux",
  "3FD": "elles deux",
};

function affixGloss(segment: MorphSegment): string {
  const parts = segment.f.split("|");
  const tag = parts[0] ?? "";
  if (tag === "PRON") {
    const person = parts.find((p) => /^[123]/u.test(p)) ?? "";
    return PRONOUN_GLOSS[person] ?? "pronom";
  }
  if (tag === "ADDR") return "(marque d'adresse)";
  if (tag === "DIST") return "(éloignement : cela)";
  if (tag === "EMPH") return "(insistance)";
  if (tag === "ATT") return "(attention)";
  if (tag === "VOC") return "ô (appel)";
  return PREFIX_GLOSS[`${tag}|${segment.l ?? ""}`] ?? "particule";
}

export function lexiconKey(segment: MorphSegment) {
  return segment.l ? `${segment.l}|${segment.p}` : undefined;
}

export function decomposeWord(segments: MorphSegment[]): WordPart[] {
  return segments.map((segment) => {
    if (segment.k === "stem") {
      const key = lexiconKey(segment);
      const gloss = key ? lexicon[key] : undefined;
      const isPronoun = segment.f.startsWith("PRON");
      return {
        ar: segment.ar,
        role: "mot",
        fr: gloss?.fr ?? (isPronoun ? affixGloss(segment) : "—"),
        key,
        root: segment.r,
      };
    }
    return {
      ar: segment.ar,
      role: segment.k === "pre" ? "préfixe" : "suffixe",
      fr: affixGloss(segment),
    };
  });
}

/** Racine affichée lettre par lettre : « ر ح م ». */
export const spellRoot = (root?: string) => (root ? [...root].join(" ") : "");
