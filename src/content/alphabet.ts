/**
 * Les 28 lettres et la hamza, pour un public francophone.
 *
 * - `sound` : repère de prononciation en français, toujours approximatif. La
 *   prononciation correcte s'apprend à l'oreille, auprès d'un récitant qualifié.
 * - `example` : référence d'un mot réel du Coran (sourate:verset:mot) contenant la
 *   lettre, résolue depuis Tanzil et récité par un humain (audio QF).
 * - `zone` : grande zone d'articulation (cadre d'Ibn al-Jazarī : 5 zones, 17 points).
 *
 * STATUT : rédaction Kalima, relecture requise par un enseignant de tajwīd.
 */

export type MakhrajZone = "jawf" | "halq" | "lisan" | "shafatan" | "khayshum";

export interface ArabicLetter {
  char: string;
  name: string;
  /** Transcription utilisée dans toute l'application (voir PHONETIC_LEGEND). */
  ph: string;
  sound: string;
  /** La lettre se lie-t-elle à la lettre suivante (à sa gauche) ? */
  joinsNext: boolean;
  /** Famille de forme : même squelette, points différents. */
  family: string;
  zone: MakhrajZone;
  /** Lettre emphatique (isti'lāʾ) : خ ص ض غ ط ق ظ */
  heavy?: boolean;
  /** Lettre solaire : le lām de ال s'assimile devant elle. */
  sun?: boolean;
  example: string;
}

export const alphabet: ArabicLetter[] = [
  { char: "ا", name: "alif", ph: "â", sound: "support ; « a » long quand il suit une fatḥa", joinsNext: false, family: "alif", zone: "jawf", example: "1:5:1" },
  { char: "ب", name: "bâʾ", ph: "b", sound: "b, comme dans « bon »", joinsNext: true, family: "ba", zone: "shafatan", example: "1:1:1" },
  { char: "ت", name: "tâʾ", ph: "t", sound: "t, comme dans « tapis »", joinsNext: true, family: "ba", zone: "lisan", sun: true, example: "105:1:2" },
  { char: "ث", name: "thâʾ", ph: "th", sound: "th anglais de « think » : la langue entre les dents", joinsNext: true, family: "ba", zone: "lisan", sun: true, example: "101:6:3" },
  { char: "ج", name: "djîm", ph: "dj", sound: "dj, comme dans « djinn »", joinsNext: true, family: "jim", zone: "lisan", example: "105:2:2" },
  { char: "ح", name: "ḥâʾ", ph: "ḥ", sound: "h soufflé du milieu de la gorge, sans raclement", joinsNext: true, family: "jim", zone: "halq", example: "1:2:1" },
  { char: "خ", name: "khâʾ", ph: "kh", sound: "kh, comme la jota espagnole ou le « ch » allemand de « Bach »", joinsNext: true, family: "jim", zone: "halq", heavy: true, example: "113:2:4" },
  { char: "د", name: "dâl", ph: "d", sound: "d, comme dans « don »", joinsNext: false, family: "dal", zone: "lisan", sun: true, example: "1:4:3" },
  { char: "ذ", name: "dhâl", ph: "dh", sound: "th anglais de « this » : langue entre les dents, voisé", joinsNext: false, family: "dal", zone: "lisan", sun: true, example: "1:7:2" },
  { char: "ر", name: "râʾ", ph: "r", sound: "r roulé du bout de la langue, comme en espagnol", joinsNext: false, family: "ra", zone: "lisan", sun: true, example: "1:2:3" },
  { char: "ز", name: "zây", ph: "z", sound: "z, comme dans « zèbre »", joinsNext: false, family: "ra", zone: "lisan", sun: true, example: "97:1:2" },
  { char: "س", name: "sîn", ph: "s", sound: "s, toujours [s], jamais [z]", joinsNext: true, family: "sin", zone: "lisan", sun: true, example: "1:1:1" },
  { char: "ش", name: "chîn", ph: "ch", sound: "ch, comme dans « chat »", joinsNext: true, family: "sin", zone: "lisan", sun: true, example: "113:2:2" },
  { char: "ص", name: "ṣâd", ph: "ṣ", sound: "s épais : langue basse, son plein et grave", joinsNext: true, family: "sad", zone: "lisan", heavy: true, sun: true, example: "1:6:2" },
  { char: "ض", name: "ḍâd", ph: "ḍ", sound: "d épais, avec le bord de la langue contre les molaires", joinsNext: true, family: "sad", zone: "lisan", heavy: true, sun: true, example: "1:7:9" },
  { char: "ط", name: "ṭâʾ", ph: "ṭ", sound: "t épais et grave", joinsNext: true, family: "ta", zone: "lisan", heavy: true, sun: true, example: "106:4:2" },
  { char: "ظ", name: "ẓâʾ", ph: "ẓ", sound: "dh épais : langue entre les dents, son grave", joinsNext: true, family: "ta", zone: "lisan", heavy: true, sun: true, example: "84:14:2" },
  { char: "ع", name: "ʿayn", ph: "ʿ", sound: "son serré du milieu de la gorge, sans équivalent en français", joinsNext: true, family: "ayn", zone: "halq", example: "1:5:2" },
  { char: "غ", name: "ghayn", ph: "gh", sound: "r grasseyé, comme dans « Paris »", joinsNext: true, family: "ayn", zone: "halq", heavy: true, example: "1:7:6" },
  { char: "ف", name: "fâʾ", ph: "f", sound: "f, comme dans « fil »", joinsNext: true, family: "fa", zone: "shafatan", example: "105:1:4" },
  { char: "ق", name: "qâf", ph: "q", sound: "k très profond, au niveau de la luette", joinsNext: true, family: "fa", zone: "lisan", heavy: true, example: "112:1:1" },
  { char: "ك", name: "kâf", ph: "k", sound: "k, comme dans « kilo »", joinsNext: true, family: "kaf", zone: "lisan", example: "108:1:3" },
  { char: "ل", name: "lâm", ph: "l", sound: "l, comme dans « lune »", joinsNext: true, family: "lam", zone: "lisan", sun: true, example: "1:2:2" },
  { char: "م", name: "mîm", ph: "m", sound: "m, comme dans « mer »", joinsNext: true, family: "mim", zone: "shafatan", example: "1:4:1" },
  { char: "ن", name: "noûn", ph: "n", sound: "n, comme dans « nid »", joinsNext: true, family: "ba", zone: "lisan", sun: true, example: "114:1:4" },
  { char: "ه", name: "hâʾ", ph: "h", sound: "h expiré, comme dans l'anglais « hello »", joinsNext: true, family: "ha", zone: "halq", example: "1:6:1" },
  { char: "و", name: "wâw", ph: "w / oû", sound: "w de « oui » ; « ou » long après une ḍamma", joinsNext: false, family: "waw", zone: "lisan", example: "1:4:2" },
  { char: "ي", name: "yâʾ", ph: "y / î", sound: "y de « yeux » ; « i » long après une kasra", joinsNext: true, family: "ba", zone: "lisan", example: "1:4:2" },
  { char: "ء", name: "hamza", ph: "'", sound: "coup de glotte : le petit arrêt au milieu de « oh-oh »", joinsNext: false, family: "hamza", zone: "halq", example: "110:1:2" },
];

/** Les six lettres qui ne se lient jamais à la lettre suivante. */
export const NON_JOINING = ["ا", "د", "ذ", "ر", "ز", "و"] as const;

/** Paires faciles à confondre, entraînées à l'écoute. */
export const CONFUSABLE_SOUNDS: Array<[string, string]> = [
  ["ح", "ه"],
  ["ع", "ء"],
  ["س", "ص"],
  ["ت", "ط"],
  ["د", "ض"],
  ["ك", "ق"],
  ["ذ", "ز"],
  ["ذ", "ظ"],
  ["خ", "غ"],
];

export const MAKHRAJ_ZONES: Record<MakhrajZone, { label: string; ar: string; detail: string }> = {
  jawf: { label: "La cavité (bouche et gorge)", ar: "ٱلْجَوْف", detail: "Les trois voyelles longues : ا après fatḥa, و après ḍamma, ي après kasra." },
  halq: { label: "La gorge", ar: "ٱلْحَلْق", detail: "Six lettres : ء ه (bas), ع ح (milieu), غ خ (haut)." },
  lisan: { label: "La langue", ar: "ٱللِّسَان", detail: "La majorité des lettres, de la racine (ق ك) à la pointe (ت د ط…)." },
  shafatan: { label: "Les lèvres", ar: "ٱلشَّفَتَان", detail: "ف (lèvre inférieure et incisives), ب م و (les deux lèvres)." },
  khayshum: { label: "Le nez", ar: "ٱلْخَيْشُوم", detail: "Lieu de la ghunna, le son nasal de ن et م." },
};

export const PHONETIC_LEGEND: Array<{ ph: string; ar: string; hint: string }> = [
  { ph: "a · i · ou", ar: "ـَ ـِ ـُ", hint: "voyelles brèves. « ou » se lit toujours [u], comme dans « tout »." },
  { ph: "â · î · oû", ar: "ـَا ـِي ـُو", hint: "voyelles longues : tiens-les deux fois plus longtemps." },
  { ph: "an · in · oun", ar: "ـً ـٍ ـٌ", hint: "le n se prononce toujours : « an » comme dans « Anne », jamais nasal." },
  { ph: "s", ar: "س", hint: "toujours [s], même entre deux voyelles." },
  { ph: "ch · dj", ar: "ش ج", hint: "« chat » et « djinn »." },
  { ph: "th · dh", ar: "ث ذ", hint: "« think » et « this » en anglais : la langue entre les dents." },
  { ph: "kh · gh", ar: "خ غ", hint: "jota espagnole ; r grasseyé de « Paris »." },
  { ph: "r", ar: "ر", hint: "r roulé du bout de la langue." },
  { ph: "ḥ · h", ar: "ح ه", hint: "ḥ soufflé du milieu de la gorge ; h simplement expiré." },
  { ph: "ʿ · '", ar: "ع ء", hint: "ʿayn, serré dans la gorge ; hamza, simple coup de glotte." },
  { ph: "ṣ ḍ ṭ ẓ · q", ar: "ص ض ط ظ ق", hint: "le point dessous signale une lettre épaisse (emphatique)." },
  { ph: "bb, ll…", ar: "ـّ", hint: "une consonne doublée correspond à la shadda : on appuie dessus." },
  { ph: "l-lâh, r-raḥmân", ar: "ٱل", hint: "le trait d'union montre l'article qui se lie au mot." },
];
