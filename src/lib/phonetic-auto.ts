import type { QuranWord } from "@/lib/quran-types";

/**
 * Transcription phonétique française AUTOMATIQUE d'un verset, à partir du texte Tanzil (graphie
 * uthmanie, entièrement vocalisée) et, si fourni, du découpage morphologique du Quranic Arabic
 * Corpus (préfixes wa-, fa-, bi-, li-, ka-…). Même convention que les transcriptions écrites à la
 * main (src/content/recitation.ts) : ou = ُ, â/î/oû = voyelles longues, ââ / ââââ = prolongations
 * (madd), ch = ش, dj = ج, kh = خ, gh = غ, th = ث, dh = ذ, ʿ = ع, ' = hamza, lettres pointées
 * pour ح ص ض ط ظ.
 *
 * Règles : article (solaires/lunaires, ٱلَّذِى), alif de liaison (élidé dans le verset, prononcé
 * en tête), nom « Allâh » (lil-lâhi, l-lâhi), voyelles longues et alif suscrit, madd, tanwîn,
 * idghâm entre deux mots (yakoul lahoû), lettres muettes (۟ ۠), arrêt aux signes ۗ ۚ ۘ et en fin
 * de verset (voyelle finale tombée, ة → h, -an → -â), lettres isolées (Alif lââââm mîîîm).
 *
 * LIMITES (signalées à l'apprenant) : pas toutes les finesses du tajwīd (ikhfāʾ, ghunna, imāla
 * de 11:41, ishmām de 12:11…) ; longueurs de madd indicatives. Aide à la lecture, jamais une
 * référence : l'écoute de la récitation prime.
 */

const CONSONANTS: Record<string, string> = {
  "ب": "b", "ت": "t", "ث": "th", "ج": "dj", "ح": "ḥ", "خ": "kh",
  "د": "d", "ذ": "dh", "ر": "r", "ز": "z", "س": "s", "ش": "ch",
  "ص": "ṣ", "ض": "ḍ", "ط": "ṭ", "ظ": "ẓ", "ع": "ʿ", "غ": "gh",
  "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m", "ن": "n",
  "ه": "h", "و": "w", "ي": "y", "ة": "t", "ی": "y",
};
const HAMZAS = new Set(["ء", "أ", "إ", "ؤ", "ئ"]);
const ALIF = "ا";
const ALIF_MADDA = "آ";
const WASLA = "ٱ";
const ALIF_MAQSURA = "ى";
const WAW = "و";
const YA = "ي";
const LAM = "ل";
const HA = "ه";
const TA_MARBUTA = "ة";

const FATHA = "َ";
const DAMMA = "ُ";
const KASRA = "ِ";
const SHADDA = "ّ";
const SUKUN = "ْ";
const SUKUN_UTHMANI = "ۡ";
const TANWIN_A = "ً";
const TANWIN_U = "ٌ";
const TANWIN_I = "ٍ";
const SUP_ALIF = "ٰ";
const MADDA = "ٓ";
const SILENT = new Set(["۟", "۠"]);
const SMALL_WAW = "ۥ";
const SMALL_YA = "ۦ";
const TATWEEL = "ـ";
const HAMZA_ABOVE = "\u0654";
const HAMZA_BELOW = "\u0655";
/** Signes où l'on s'arrête dans cette transcription : ۗ (arrêt préférable), ۘ (obligatoire), ۚ (permis). */
const PAUSE_MARKS = new Set(["ۗ", "ۘ", "ۚ"]);

/** Noms des lettres isolées (fawātiḥ) : 2 : 1 « الٓمٓ » → Alif lââââm mîîîm. */
const LETTER_NAMES: Record<string, string> = {
  [ALIF]: "alif", [LAM]: "lââââm", "م": "mîîîm", "ص": "ṣââââd", "ر": "râ", "ك": "kââââf",
  [HA]: "hâ", [YA]: "yâ", "ع": "ʿaaayn", "ط": "ṭâ", "س": "sîîîn", "ح": "ḥâ", "ق": "qââââf",
  "ن": "noûûûn",
};

/** Lettres où le tanwîn / nūn sākina s'assimile complètement (idghâm sans nasalisation + m, n). */
const ASSIMILATING = new Set(["\u0644", "\u0631", "\u0645", "\u0646"]);

const SUN = new Set(["ت", "ث", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", LAM, "ن"]);

interface Unit {
  l: string;
  marks: Set<string>;
}

const isLetter = (c: string) => (c >= "ء" && c <= "ي") || c === WASLA || c === ALIF_MADDA || c === "ی";

/** Découpe en lettres + signes. Pas de normalisation NFC : elle fusionnerait ا + ٓ en آ. */
export function toUnits(word: string): Unit[] {
  const out: Unit[] = [];
  for (const c of word) {
    if (c === TATWEEL) {
      out.push({ l: TATWEEL, marks: new Set() });
      continue;
    }
    if (c === ALIF_MADDA) {
      out.push({ l: ALIF, marks: new Set([MADDA]) });
      continue;
    }
    if (isLetter(c)) out.push({ l: c, marks: new Set() });
    else out.at(-1)?.marks.add(c);
  }
  // Tatweel : hamza s'il porte ٔ / ٕ, sinon ses signes (alif suscrit…) reviennent à la lettre précédente.
  const merged: Unit[] = [];
  for (const u of out) {
    if (u.l !== TATWEEL) merged.push(u);
    else if (u.marks.has(HAMZA_ABOVE) || u.marks.has(HAMZA_BELOW)) {
      merged.push({ l: "\u0621", marks: new Set([...u.marks].filter((m) => m !== HAMZA_ABOVE && m !== HAMZA_BELOW)) });
    } else if (merged.length) for (const m of u.marks) merged[merged.length - 1].marks.add(m);
  }
  return merged;
}

const vowelOf = (u: Unit | undefined): "a" | "i" | "ou" | null =>
  !u ? null : u.marks.has(FATHA) ? "a" : u.marks.has(KASRA) ? "i" : u.marks.has(DAMMA) ? "ou" : null;
const tanwinOf = (u: Unit | undefined): "an" | "in" | "oun" | null =>
  !u ? null : u.marks.has(TANWIN_A) ? "an" : u.marks.has(TANWIN_I) ? "in" : u.marks.has(TANWIN_U) ? "oun" : null;
const hasSukun = (u: Unit | undefined) => Boolean(u && (u.marks.has(SUKUN) || u.marks.has(SUKUN_UTHMANI)));
const bare = (u: Unit | undefined) => Boolean(u && !vowelOf(u) && !tanwinOf(u) && !hasSukun(u) && !u.marks.has(SHADDA));
const withoutShadda = (u: Unit): Unit => ({ l: u.l, marks: new Set([...u.marks].filter((m) => m !== SHADDA)) });

/** Remplace la voyelle brève finale par sa longue (a → â, i → î, ou → oû), plus un éventuel madd. */
function lengthen(out: string, extra = ""): string {
  if (out.endsWith("ou")) return out.slice(0, -2) + "oû" + extra;
  if (out.endsWith("a")) return out.slice(0, -1) + "â" + extra;
  if (out.endsWith("i")) return out.slice(0, -1) + "î" + extra;
  return out + "â" + extra;
}

/** Rend une suite de lettres vocalisées (l'alif de liaison est géré par l'appelant). */
function renderUnits(us: Unit[], wordStart: boolean): string {
  let out = "";
  for (let i = 0; i < us.length; i += 1) {
    const u = us[i];
    const prev = us[i - 1];
    const next = us[i + 1];
    if ([...u.marks].some((m) => SILENT.has(m))) continue;

    if (u.l === ALIF) {
      if (prev && tanwinOf(prev) === "an") continue; // ـًا : l'alif porte le tanwîn
      if (vowelOf(u) || tanwinOf(u)) {
        out += tanwinOf(u) ?? vowelOf(u) ?? "";
        continue;
      }
      if (!prev) continue;
      if (u.marks.has(MADDA)) {
        // madd : 4–5 temps (ââ), 6 temps devant chadda ou soukoun (ââââ)
        const lazim = next && (next.marks.has(SHADDA) || hasSukun(next));
        out = lengthen(out, lazim ? "âââ" : "â");
        continue;
      }
      if ((vowelOf(prev) === "a" || prev.marks.has(SUP_ALIF)) && !out.endsWith("â")) out = lengthen(out);
      continue;
    }

    if (u.l === ALIF_MAQSURA) {
      if (prev && tanwinOf(prev) === "an") continue;
      if (vowelOf(u) || tanwinOf(u)) {
        // ى porteur de voyelle = yāʾ consonne (ٱلْحَىُّ → l-ḥayyou)
        out += (u.marks.has(SHADDA) && !(i === 0 && wordStart) ? "yy" : "y") + (tanwinOf(u) ?? vowelOf(u));
        continue;
      }
      const extra = u.marks.has(MADDA) ? (vowelOf(prev) === "i" ? "î" : "â") : "";
      if (u.marks.has(SUP_ALIF) || vowelOf(prev) === "a") {
        if (!out.endsWith("â")) out = lengthen(out, extra);
      } else if (vowelOf(prev) === "i") out = lengthen(out, extra);
      continue;
    }

    // و / ي de prolongation (sans voyelle ni soukoun), ou porteurs de l'alif suscrit
    if ((u.l === WAW || u.l === YA) && bare(u)) {
      if (u.marks.has(SUP_ALIF)) {
        out = lengthen(out);
        continue;
      }
      if (prev && ((u.l === WAW && vowelOf(prev) === "ou") || (u.l === YA && vowelOf(prev) === "i"))) {
        out = lengthen(out, u.marks.has(MADDA) ? (u.l === WAW ? "û" : "î") : "");
        continue;
      }
    }

    // Idghâm dans le mot (عَبَدتُّمْ → ʿabattoum) : la consonne sans signe se fond dans la suivante.
    if (bare(u) && next?.marks.has(SHADDA) && CONSONANTS[u.l] && u.l !== WAW && u.l !== YA) continue;

    let c: string;
    if (HAMZAS.has(u.l)) c = i === 0 && wordStart ? "" : "'";
    else if (u.l === WASLA) continue;
    else c = CONSONANTS[u.l] ?? "";

    // Chadda en tête de mot : elle marque l'assimilation avec le mot précédent, pas un redoublement.
    const doubled = u.marks.has(SHADDA) && c && !(i === 0 && wordStart);
    out += doubled ? c + c : c;
    const v = vowelOf(u);
    const t = tanwinOf(u);
    if (t) out += t;
    else if (v) {
      if (v === "a" && u.marks.has(SUP_ALIF)) out += "â";
      else if (v === "ou" && u.marks.has(SMALL_WAW)) out += "oû";
      else if (v === "i" && u.marks.has(SMALL_YA)) out += "î";
      else out += v;
      if (u.marks.has(MADDA) && (u.marks.has(SMALL_WAW) || u.marks.has(SMALL_YA))) out += v === "ou" ? "û" : "î";
    } else if (u.marks.has(SUP_ALIF)) out += "â";
  }
  return out;
}

const isAllah = (us: Unit[]) => us.length === 3 && us[0].l === LAM && us[1].l === LAM && us[1].marks.has(SHADDA) && us[2].l === HA;

/**
 * Rend la partie « mot » (sans préfixe) : gère l'alif de liaison, l'article et « Allâh ».
 * `startOfVerse` : le mot ouvre le verset (alif de liaison prononcé).
 */
function renderStem(us: Unit[], startOfVerse: boolean): { text: string; wasla: boolean } {
  if (us.length === 0) return { text: "", wasla: false };

  // li + llâh / li + l-… (لِلَّهِ, لِلْمُتَّقِينَ, لِلنَّاسِ) : l'article sans alif après li-
  if (us[0].l === LAM && vowelOf(us[0]) === "i" && us[1]?.l === LAM) {
    if (us.length === 3 && us[1].marks.has(SHADDA) && us[2].l === HA) return { text: `lil-lâh${vowelOf(us[2]) ?? ""}`, wasla: false };
    if (hasSukun(us[1])) return { text: `lil-${renderUnits(us.slice(2), true)}`, wasla: false };
    if (bare(us[1]) && us[2]?.marks.has(SHADDA) && SUN.has(us[2].l)) {
      const cons = CONSONANTS[us[2].l];
      return { text: `li${cons}-${renderUnits([withoutShadda(us[2]), ...us.slice(3)], false)}`, wasla: false };
    }
  }

  if (us[0].l !== WASLA) return { text: renderUnits(us, true), wasla: false };

  const rest = us.slice(1);
  if (isAllah(rest)) {
    const end = vowelOf(rest[2]) ?? "";
    return { text: startOfVerse ? `Allâh${end}` : `l-lâh${end}`, wasla: !startOfVerse };
  }
  // ٱلَّذِى, ٱلَّتِى, ٱلَّذِينَ : article et lām fondus en une seule lettre chaddée
  if (rest[0]?.l === LAM && rest[0].marks.has(SHADDA)) {
    const body = renderUnits([withoutShadda(rest[0]), ...rest.slice(1)], false);
    return { text: `${startOfVerse ? "Al" : "l"}-${body}`, wasla: !startOfVerse };
  }
  if (rest[0]?.l === LAM && rest[1] && (hasSukun(rest[0]) || (bare(rest[0]) && rest[1].marks.has(SHADDA)))) {
    const sun = rest[1].marks.has(SHADDA) && SUN.has(rest[1].l) && !hasSukun(rest[0]);
    if (sun) {
      const cons = CONSONANTS[rest[1].l] ?? "";
      const body = renderUnits([withoutShadda(rest[1]), ...rest.slice(2)], false);
      return { text: `${startOfVerse ? "A" : ""}${cons}-${body}`, wasla: !startOfVerse };
    }
    const body = renderUnits(rest.slice(1), true);
    return { text: `${startOfVerse ? "Al" : "l"}-${body}`, wasla: !startOfVerse };
  }
  // Alif de liaison d'un verbe ou d'un nom (ٱهْدِنَا, ٱسْتَغْفِرْهُ, ٱبْن, ٱسْم…)
  const body = renderUnits(rest, false);
  if (!startOfVerse) return { text: body, wasla: true };
  const third = vowelOf(rest[1]);
  return { text: `${third === "ou" ? "Ou" : "I"}${body}`, wasla: false };
}

/** Voyelle longue finale abrégée devant un alif de liaison : fî l- → fi l-, lâ ḍ- → la ḍ-. */
function shortenEnd(text: string) {
  if (text.endsWith("oû")) return text.slice(0, -2) + "ou";
  if (/â+$/.test(text)) return text.replace(/â+$/, "a");
  if (/î+$/.test(text)) return text.replace(/î+$/, "i");
  return text;
}

/** Arrêt : la voyelle brève et le tanwîn tombent, -an devient -â, ة devient h. */
function pause(text: string, last: Unit | undefined): string {
  if (!last) return text;
  if (last.l === TA_MARBUTA) return text.replace(/t(an|in|oun|a|i|ou)$/, "h");
  const t = tanwinOf(last);
  if (t === "an") return text.replace(/an$/, "â");
  if (t) return text.replace(/(in|oun)$/, "");
  if (last.l === ALIF || last.l === ALIF_MAQSURA) return text.replace(/an$/, "â");
  const v = vowelOf(last);
  if (v && !last.marks.has(SMALL_WAW) && !last.marks.has(SMALL_YA) && !last.marks.has(SUP_ALIF)) {
    return text.replace(new RegExp(`${v}$`), "");
  }
  return text;
}

/**
 * @param words mots Tanzil du verset
 * @param prefixLetters pour chaque mot, nombre de lettres des préfixes (hors article) d'après le
 *   Quranic Arabic Corpus ; sans cette information, les préfixes restent collés au mot.
 */
export interface PrefixSegment {
  /** nombre de lettres du préfixe */
  n: number;
  /** étiquette du corpus (CONJ, P, INTG, VOC…) */
  f: string;
}

function renderPrefix(us: Unit[], segments: PrefixSegment[]): string {
  let out = "";
  let at = 0;
  segments.forEach((segment, index) => {
    const part = renderUnits(us.slice(at, at + segment.n), at === 0);
    at += segment.n;
    if (index === 0) out = part;
    else if (segments[index - 1].f === "INTG" || !/[aiouâîû]/.test(part)) out += part; // a-fa → afa, wa/fa + l → wal-/fal-
    else if (out === "wa" || out === "Wa") out += " " + part;
    else out += "-" + part;
  });
  return out;
}

export function autoPhonetic(words: QuranWord[], prefixes: Array<PrefixSegment[] | number> = []): string {
  const all = words.map((w) => toUnits(w.ar));
  const parts: string[] = [];
  let assimilated = false;

  for (let i = 0; i < words.length; i += 1) {
    let us = all[i];
    if (assimilated && us[0]) us = [withoutShadda(us[0]), ...us.slice(1)];
    assimilated = false;
    if (us.length === 0) continue;
    const first = parts.length === 0 || parts[parts.length - 1].endsWith(",");

    // Lettres isolées en tête de sourate : aucune voyelle, seulement des madd.
    if (first && us.length <= 5 && us.every((u) => !vowelOf(u) && !tanwinOf(u) && !hasSukun(u) && !u.marks.has(SHADDA) && LETTER_NAMES[u.l])) {
      parts.push(us.map((u) => LETTER_NAMES[u.l]).join(" "));
      continue;
    }

    const given = prefixes[i] ?? 0;
    let segments: PrefixSegment[] = typeof given === "number" ? (given ? [{ n: given, f: "?" }] : []) : [...given];
    let cut = Math.min(segments.reduce((sum, segment) => sum + segment.n, 0), us.length - 1);
    if (cut > 0 && us[cut - 1].l === LAM && vowelOf(us[cut - 1]) === "i" && us[cut]?.l === LAM) {
      // li- devant un lām : laissé au mot (lil-lâhi, lil-mouttaqîn)
      cut -= 1;
      const lastSegment = segments.at(-1);
      if (lastSegment && lastSegment.n > 1) segments = [...segments.slice(0, -1), { ...lastSegment, n: lastSegment.n - 1 }];
      else segments = segments.slice(0, -1);
    }
    let text: string;
    let wasla = false;
    if (cut > 0) {
      const prefix = renderPrefix(us, segments);
      const stemUnits = us.slice(cut);
      const stem = renderStem(stemUnits, false);
      const spaced = stemUnits[0]?.l === WASLA || /(^|\s)wa$/i.test(prefix) || /[âîû]$/.test(prefix);
      const glued = hasSukun(stemUnits[0]); // بِسْمِ : bi + smi → bismi
      text = `${prefix}${glued ? "" : spaced ? " " : "-"}${stem.text}`;

    } else {
      const stem = renderStem(us, first);
      text = stem.text;
      wasla = stem.wasla;
      if (first && parts.length) text = text.charAt(0).toLowerCase() + text.slice(1);
    }

    // Idghâm d'un mot à l'autre : consonne finale sans signe + première lettre chaddée du suivant.
    // (Jamais si l'on s'arrête sur ce mot.)
    const stopMark = words[i].stop;
    const stops = i === words.length - 1 || (stopMark !== undefined && PAUSE_MARKS.has(stopMark));
    const last = us.at(-1);
    const nextFirst = stops ? undefined : all[i + 1]?.[0];
    if (last && nextFirst && bare(last) && CONSONANTS[last.l] && last.l !== WAW && last.l !== YA && nextFirst.marks.has(SHADDA) && nextFirst.l !== WASLA) {
      const drop = CONSONANTS[last.l];
      if (text.endsWith(drop)) text = text.slice(0, -drop.length) + (CONSONANTS[nextFirst.l] ?? "");
      assimilated = true;
    }

    if (last && nextFirst && tanwinOf(last) && nextFirst.marks.has(SHADDA) && ASSIMILATING.has(nextFirst.l) && text.endsWith("n")) {
      text = text.slice(0, -1) + CONSONANTS[nextFirst.l];
      assimilated = true;
    }

    if (wasla && parts.length) parts[parts.length - 1] = shortenEnd(parts[parts.length - 1]);
    if (stops) text = pause(text, last);
    if (stops && i < words.length - 1) text += ",";
    parts.push(text);
  }

  const sentence = parts.join(" ").replace(/\s+/g, " ").trim();
  const at = sentence.search(/[a-zâîûḥṣḍṭẓ]/i);
  return at < 0 ? sentence : sentence.slice(0, at) + sentence.charAt(at).toUpperCase() + sentence.slice(at + 1);
}

/** Nombre de lettres des préfixes (hors article) d'un mot, à partir des segments du corpus. */
export function prefixSegments(segments: Array<{ ar: string; k: string; f?: string }> | undefined): PrefixSegment[] {
  if (!segments) return [];
  const out: PrefixSegment[] = [];
  const hasStem = segments.some((segment) => segment.k === "stem" && !(segment.f ?? "").startsWith("PRON"));
  for (const segment of segments) {
    if (segment.k !== "pre") break;
    if (segment.f === "DET" || segment.f === "ATT") break;
    if (!hasStem && (segment.f === "P" || segment.f === "EMPH" || segment.f === "PRP")) break;
    out.push({ n: [...segment.ar].filter((c) => isLetter(c) || c === TATWEEL).length, f: segment.f ?? "" });
  }
  return out;
}

export function prefixLetterCount(segments: Array<{ ar: string; k: string; f?: string }> | undefined): number {
  if (!segments) return 0;
  // Sans radical (لَكُمْ, لَهُۥ, لِىَ) : la préposition reste soudée au pronom ; seuls wa-/fa- se détachent.
  const hasStem = segments.some((segment) => segment.k === "stem" && !(segment.f ?? "").startsWith("PRON"));
  let count = 0;
  for (const segment of segments) {
    if (segment.k !== "pre") break;
    if (segment.f === "DET" || segment.f === "ATT") break; // article ; hâ de hâdhâ
    if (!hasStem && (segment.f === "P" || segment.f === "EMPH" || segment.f === "PRP")) break;
    count += [...segment.ar].filter(isLetter).length;
  }
  return count;
}
