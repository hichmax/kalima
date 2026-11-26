/**
 * Prononciation des lettres isolées.
 *
 * Ordre de priorité à l'écoute :
 *   1. un ENREGISTREMENT HUMAIN (public/audio/lettres/<slug>-nom.mp3 / -son.mp3),
 *      déclaré dans `letterRecordings` avec le nom de la personne et la licence ;
 *   2. à défaut, la voix arabe de l'appareil (synthèse), signalée comme indicative.
 *
 * Quran.Foundation ne fournit pas l'audio des lettres isolées (vérifié le 26/11/2026).
 * En complément, `muqattaat` donne la vraie récitation (Mishary al-ʿAfāsī) des lettres
 * isolées qui ouvrent certaines sourates.
 *
 * STATUT : noms vocalisés et syllabes rédigés par Kalima, relecture requise.
 */

export interface LetterSpeech {
  /** Identifiant de fichier (sans accents) : alif, ba, ta… */
  slug: string;
  /** Nom de la lettre, vocalisé, tel qu'on l'épelle en arabe. */
  nameAr: string;
  /** La lettre avec une fatḥa : le son de base à faire entendre. */
  soundAr: string;
  /** Transcription du son (convention Kalima). */
  soundPh: string;
}

export const letterSpeech: Record<string, LetterSpeech> = {
  "ا": { slug: "alif", nameAr: "أَلِف", soundAr: "أَ", soundPh: "a" },
  "ب": { slug: "ba", nameAr: "بَاء", soundAr: "بَ", soundPh: "ba" },
  "ت": { slug: "ta", nameAr: "تَاء", soundAr: "تَ", soundPh: "ta" },
  "ث": { slug: "tha", nameAr: "ثَاء", soundAr: "ثَ", soundPh: "tha" },
  "ج": { slug: "jim", nameAr: "جِيم", soundAr: "جَ", soundPh: "dja" },
  "ح": { slug: "ha-gorge", nameAr: "حَاء", soundAr: "حَ", soundPh: "ḥa" },
  "خ": { slug: "kha", nameAr: "خَاء", soundAr: "خَ", soundPh: "kha" },
  "د": { slug: "dal", nameAr: "دَال", soundAr: "دَ", soundPh: "da" },
  "ذ": { slug: "dhal", nameAr: "ذَال", soundAr: "ذَ", soundPh: "dha" },
  "ر": { slug: "ra", nameAr: "رَاء", soundAr: "رَ", soundPh: "ra" },
  "ز": { slug: "zay", nameAr: "زَاي", soundAr: "زَ", soundPh: "za" },
  "س": { slug: "sin", nameAr: "سِين", soundAr: "سَ", soundPh: "sa" },
  "ش": { slug: "shin", nameAr: "شِين", soundAr: "شَ", soundPh: "cha" },
  "ص": { slug: "sad", nameAr: "صَاد", soundAr: "صَ", soundPh: "ṣa" },
  "ض": { slug: "dad", nameAr: "ضَاد", soundAr: "ضَ", soundPh: "ḍa" },
  "ط": { slug: "ta-epais", nameAr: "طَاء", soundAr: "طَ", soundPh: "ṭa" },
  "ظ": { slug: "za-epais", nameAr: "ظَاء", soundAr: "ظَ", soundPh: "ẓa" },
  "ع": { slug: "ayn", nameAr: "عَيْن", soundAr: "عَ", soundPh: "ʿa" },
  "غ": { slug: "ghayn", nameAr: "غَيْن", soundAr: "غَ", soundPh: "gha" },
  "ف": { slug: "fa", nameAr: "فَاء", soundAr: "فَ", soundPh: "fa" },
  "ق": { slug: "qaf", nameAr: "قَاف", soundAr: "قَ", soundPh: "qa" },
  "ك": { slug: "kaf", nameAr: "كَاف", soundAr: "كَ", soundPh: "ka" },
  "ل": { slug: "lam", nameAr: "لَام", soundAr: "لَ", soundPh: "la" },
  "م": { slug: "mim", nameAr: "مِيم", soundAr: "مَ", soundPh: "ma" },
  "ن": { slug: "nun", nameAr: "نُون", soundAr: "نَ", soundPh: "na" },
  "ه": { slug: "ha", nameAr: "هَاء", soundAr: "هَ", soundPh: "ha" },
  "و": { slug: "waw", nameAr: "وَاو", soundAr: "وَ", soundPh: "wa" },
  "ي": { slug: "ya", nameAr: "يَاء", soundAr: "يَ", soundPh: "ya" },
  "ء": { slug: "hamza", nameAr: "هَمْزَة", soundAr: "أَ", soundPh: "'a" },
};

export interface LetterRecording {
  /** Chemins publics des fichiers (ex. /audio/lettres/ba-nom.mp3). */
  name?: string;
  sound?: string;
  /** Personne qui a enregistré (nom réel, avec son accord). */
  recordedBy: string;
  licence: string;
}

/**
 * Enregistrements humains disponibles. Vide pour l'instant : à remplir quand un enseignant
 * aura enregistré les lettres (mode /alphabet?enregistrement=1).
 */
export const letterRecordings: Record<string, LetterRecording> = {};

/** Lettres isolées récitées par Mishary al-ʿAfāsī en tête de sourate (Ḥafṣ ʿan ʿĀṣim). */
export interface Muqattaa {
  /** Mot coranique (sourate:verset:mot). */
  ref: string;
  /** Comment le récitant le prononce. */
  ph: string;
  /** La lettre y est-elle prononcée seule ? */
  alone: boolean;
}

const M = {
  alm: { ref: "2:1:1", ph: "alif lââââm mîîîîm", alone: false },
  alr: { ref: "10:1:1", ph: "alif lââââm râ", alone: false },
  khyas: { ref: "19:1:1", ph: "kââââf hâ yâ ʿaaayn ṣââââd", alone: false },
  taha: { ref: "20:1:1", ph: "ṭâ hâ", alone: false },
  yasin: { ref: "36:1:1", ph: "yâ sîîîîn", alone: false },
  sad: { ref: "38:1:1", ph: "ṣââââd", alone: true },
  hamim: { ref: "40:1:1", ph: "ḥâ mîîîîm", alone: false },
  qaf: { ref: "50:1:1", ph: "qââââf", alone: true },
  nun: { ref: "68:1:1", ph: "noûûûûn", alone: true },
} satisfies Record<string, Muqattaa>;

export const muqattaat: Record<string, Muqattaa> = {
  "ا": M.alm,
  "ل": M.alm,
  "م": M.alm,
  "ر": M.alr,
  "ك": M.khyas,
  "ه": M.khyas,
  "ي": M.khyas,
  "ع": M.khyas,
  "ص": M.sad,
  "ط": M.taha,
  "س": M.yasin,
  "ح": M.hamim,
  "ق": M.qaf,
  "ن": M.nun,
};
