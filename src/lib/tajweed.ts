/**
 * Couleurs du tajwīd (« mushaf coloré »), calculées sur le texte Tanzil (graphie uthmanie).
 * Code couleur des mushafs de tajwīd (type Dār al-Maʿrifa), simplifié en six familles :
 *
 * - silent  (gris)        : lettre écrite mais non prononcée — alif de liaison dans le verset,
 *                            lām de l'article devant une lettre solaire, lettres marquées ۟ ۠,
 *                            nūn absorbé sans nasalisation (idghām devant ل ر).
 * - ghunna  (vert)        : nasalisation de 2 temps — نّ مّ, ikhfāʾ, iqlāb (ۢ), idghām avec ghunna.
 * - qalqala (bleu)        : ق ط ب ج د avec soukoun (ou en fin de verset, à l'arrêt).
 * - madd246 (orange)      : madd jāʾiz munfaṣil (prolongation en fin de mot devant une hamza).
 * - madd45  (rouge)       : madd wājib muttaṣil (hamza dans le même mot).
 * - madd6   (rouge foncé) : madd lāzim (devant chadda/soukoun, lettres isolées des sourates).
 *
 * La concaténation des segments redonne EXACTEMENT le mot Tanzil (testé sur les 6236 versets) :
 * on colore, on ne réécrit jamais le texte.
 */

export type TajweedRule = "silent" | "ghunna" | "qalqala" | "madd246" | "madd45" | "madd6";
export interface TajweedSegment {
  t: string;
  r?: TajweedRule;
}

const WASLA = "ٱ";
const LAM = "ل";
const NUN = "ن";
const MIM = "م";
const BA = "ب";
const SHADDA = "ّ";
const SUKUN = "ْ";
const SUKUN_UTHMANI = "ۡ";
const MADDA = "ٓ";
const TANWIN = ["ً", "ٌ", "ٍ"];
const VOWELS = ["َ", "ُ", "ِ"];
const SILENT_MARKS = ["۟", "۠"];
const IQLAB_MARKS = ["ۢ", "ۭ"];
const HAMZA_LETTERS = new Set(["ء", "أ", "إ", "ؤ", "ئ", "آ"]);
const HAMZA_ON_TATWEEL = ["ٔ", "ٕ"];
const QALQALA = new Set(["ق", "ط", BA, "ج", "د"]);
const SUN = new Set(["ت", "ث", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", LAM, NUN]);
const IDGHAM_GHUNNA = new Set(["ي", NUN, MIM, "و"]);
const IDGHAM_PLAIN = new Set([LAM, "ر"]);
const IKHFA = new Set(["ت", "ث", "ج", "د", "ذ", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ف", "ق", "ك"]);

interface Unit {
  l: string;
  text: string;
  marks: string;
}

const isLetter = (c: string) => (c >= "ء" && c <= "ي") || c === WASLA;

function units(word: string): Unit[] {
  const out: Unit[] = [];
  for (const c of word) {
    if (isLetter(c) || out.length === 0) out.push({ l: c, text: c, marks: "" });
    else {
      const last = out[out.length - 1];
      last.text += c;
      last.marks += c;
    }
  }
  return out;
}

const has = (u: Unit | undefined, marks: string[]) => Boolean(u && marks.some((m) => u.marks.includes(m)));
const sukun = (u: Unit | undefined) => has(u, [SUKUN, SUKUN_UTHMANI]);
const shadda = (u: Unit | undefined) => has(u, [SHADDA]);
const bare = (u: Unit | undefined) => Boolean(u && !has(u, [...VOWELS, ...TANWIN, SUKUN, SUKUN_UTHMANI, SHADDA]));
const isHamza = (u: Unit | undefined) => Boolean(u && (HAMZA_LETTERS.has(u.l) || has(u, HAMZA_ON_TATWEEL)));

/** Première lettre prononcée du mot suivant (l'alif de liaison ne compte pas). */
function nextLetter(word: Unit[] | undefined): Unit | undefined {
  if (!word) return undefined;
  if (word[0]?.l === WASLA) {
    // ٱلْ… : après l'alif de liaison vient le lām de l'article ou la consonne du verbe
    return word[1]?.l === LAM && (bare(word[1]) || sukun(word[1])) && shadda(word[2]) ? word[2] : word[1];
  }
  return word[0];
}

function classify(word: Unit[], i: number, next: Unit[] | undefined, opts: { firstOfVerse: boolean; lastOfVerse: boolean }): TajweedRule | undefined {
  const u = word[i];
  const after = word[i + 1];
  if (has(u, SILENT_MARKS)) return "silent";
  if (u.l === WASLA) return opts.firstOfVerse && i === 0 ? undefined : "silent";

  // lām de l'article devant une lettre solaire (ٱلرَّحْمَٰنِ, لِلنَّاسِ, ٱللَّهِ)
  if (u.l === LAM && bare(u) && shadda(after) && SUN.has(after!.l) && (word[i - 1]?.l === WASLA || (i === 1 && word[0].l === LAM))) return "silent";

  // madd (signe ٓ)
  if (u.marks.includes(MADDA)) {
    const pronounced = word.slice(i + 1).filter((w) => !has(w, SILENT_MARKS));
    const following = pronounced[0];
    const isolatedLetters = word.every((w) => !has(w, [...VOWELS, ...TANWIN, SHADDA, SUKUN, SUKUN_UTHMANI]));
    if (isolatedLetters || shadda(following) || sukun(following)) return "madd6";
    if (isHamza(following)) return "madd45";
    if (!following) return "madd246";
    return "madd45";
  }

  if ((u.l === NUN || u.l === MIM) && shadda(u)) return "ghunna";
  if (has(u, IQLAB_MARKS)) return "ghunna";
  if (QALQALA.has(u.l) && (sukun(u) || (opts.lastOfVerse && i === word.length - 1 && !has(u, SILENT_MARKS)))) return "qalqala";

  // nūn sākin (sans signe en graphie uthmanie) et tanwīn : ikhfāʾ / idghām
  const target = i === word.length - 1 ? nextLetter(next) : after;
  const tanwin = has(u, TANWIN) && i === word.length - 1;
  if ((u.l === NUN && bare(u)) || tanwin) {
    if (!target) return undefined;
    if (IDGHAM_GHUNNA.has(target.l) && (shadda(target) || tanwin || i === word.length - 1)) return "ghunna";
    if (IDGHAM_PLAIN.has(target.l)) return tanwin ? undefined : "silent";
    if (IKHFA.has(target.l)) return "ghunna";
    return undefined;
  }
  // mīm sākin devant bāʾ : ikhfāʾ shafawī
  if (u.l === MIM && bare(u) && target?.l === BA) return "ghunna";
  return undefined;
}

/** Segments colorés de chaque mot d'un verset (même ordre que `words`). */
export function tajweedVerse(words: string[]): TajweedSegment[][] {
  const all = words.map(units);
  return all.map((word, w) => {
    const segments: TajweedSegment[] = [];
    word.forEach((_, i) => {
      const rule = classify(word, i, all[w + 1], { firstOfVerse: w === 0, lastOfVerse: w === words.length - 1 });
      const text = word[i].text;
      const last = segments[segments.length - 1];
      if (last && last.r === rule) last.t += text;
      else segments.push(rule ? { t: text, r: rule } : { t: text });
    });
    return segments;
  });
}

export const TAJWEED_LEGEND: Array<{ rule: TajweedRule; label: string; detail: string }> = [
  { rule: "madd6", label: "Madd de 6 temps", detail: "prolongation obligatoire (lāzim)" },
  { rule: "madd45", label: "Madd de 4–5 temps", detail: "hamza dans le même mot (muttaṣil)" },
  { rule: "madd246", label: "Madd de 2, 4 ou 6 temps", detail: "hamza au mot suivant (munfaṣil)" },
  { rule: "ghunna", label: "Ghunna, 2 temps", detail: "nasalisation : نّ مّ, ikhfāʾ, iqlāb, idghām" },
  { rule: "qalqala", label: "Qalqala", detail: "léger rebond : ق ط ب ج د" },
  { rule: "silent", label: "Non prononcé", detail: "alif de liaison, lām solaire, lettres muettes" },
];
