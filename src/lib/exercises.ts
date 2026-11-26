import { alphabet, CONFUSABLE_SOUNDS, type ArabicLetter } from "@/content/alphabet";
import { ruleById } from "@/content/tajwid";
import type { ChoiceItem, Lesson, Practice, SyllableVowel } from "@/content/types";
import type { ResolvedRef } from "@/lib/quran-types";

/** Un exercice prêt à afficher. Toujours une seule bonne réponse. */
export interface Exercise {
  id: string;
  prompt: string;
  display?:
    | { kind: "arabic"; text: string; size?: "xl" | "lg" }
    | { kind: "quran"; text: string; ref: string }
    | { kind: "latin"; text: string };
  options: Array<{ label: string; arabic?: boolean }>;
  answer: number;
  explain?: string;
  card?: string;
}

// ---------------------------------------------------------------- hasard reproductible
export function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let state = h >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Construit des options mélangées, sans doublon, avec la bonne réponse incluse. */
function makeOptions(correct: string, distractors: string[], rand: () => number, count = 4) {
  const pool = [...new Set(distractors.filter((d) => d !== correct))];
  const chosen = shuffle(pool, rand).slice(0, count - 1);
  const options = shuffle([correct, ...chosen], rand);
  return { options, answer: options.indexOf(correct) };
}

const letter = (char: string): ArabicLetter => {
  const found = alphabet.find((l) => l.char === char);
  if (!found) throw new Error(`Lettre inconnue : ${char}`);
  return found;
};

/** Consonne de base de la transcription (« w / oû » → « w »). */
const consonantPh = (l: ArabicLetter) => l.ph.split(" / ")[0];

function familyDistractors(target: ArabicLetter) {
  const sameFamily = alphabet.filter((l) => l.family === target.family && l.char !== target.char);
  const confusable = CONFUSABLE_SOUNDS.flatMap(([a, b]) => (a === target.char ? [b] : b === target.char ? [a] : [])).map(letter);
  const others = alphabet.filter((l) => l.char !== target.char);
  return [...sameFamily, ...confusable, ...others];
}

// ---------------------------------------------------------------- formes liées (ZWJ)
const ZWJ = "‍";
export function letterForms(char: string) {
  const l = letter(char);
  return {
    isolated: char,
    initial: l.joinsNext ? `${char}${ZWJ}` : char,
    medial: l.joinsNext ? `${ZWJ}${char}${ZWJ}` : `${ZWJ}${char}`,
    final: `${ZWJ}${char}`,
  };
}

// ---------------------------------------------------------------- syllabes
const FATHA = "َ";
const KASRA = "ِ";
const DAMMA = "ُ";
const SUKUN = "ْ";
const SHADDA = "ّ";
const FATHATAN = "ً";
const KASRATAN = "ٍ";
const DAMMATAN = "ٌ";
const ALIF_HAMZA = "أ";

export function buildSyllable(char: string, vowel: SyllableVowel): { ar: string; ph: string } {
  const c = consonantPh(letter(char));
  switch (vowel) {
    case "a": return { ar: char + FATHA, ph: `${c}a` };
    case "i": return { ar: char + KASRA, ph: `${c}i` };
    case "u": return { ar: char + DAMMA, ph: `${c}ou` };
    case "aa": return { ar: `${char}${FATHA}ا`, ph: `${c}â` };
    case "ii": return { ar: `${char}${KASRA}ي`, ph: `${c}î` };
    case "uu": return { ar: `${char}${DAMMA}و`, ph: `${c}oû` };
    case "an": return { ar: `${char}${FATHATAN}ا`, ph: `${c}an` };
    case "in": return { ar: char + KASRATAN, ph: `${c}in` };
    case "un": return { ar: char + DAMMATAN, ph: `${c}oun` };
    case "sukun": return { ar: `${ALIF_HAMZA}${FATHA}${char}${SUKUN}`, ph: `a${c}` };
    case "shadda": return { ar: `${ALIF_HAMZA}${FATHA}${char}${SHADDA}${FATHA}`, ph: `a${c}${c}a` };
  }
}

const VOWEL_CARD: Record<SyllableVowel, string> = {
  a: "sign:fatha", i: "sign:kasra", u: "sign:damma",
  aa: "rule:madd-tabii", ii: "rule:madd-tabii", uu: "rule:madd-tabii",
  an: "sign:tanwin", in: "sign:tanwin", un: "sign:tanwin",
  sukun: "sign:sukun", shadda: "sign:shadda",
};

// ---------------------------------------------------------------- générateurs
type RefMap = Record<string, ResolvedRef>;

function choiceToExercise(item: ChoiceItem, id: string, refs: RefMap): Exercise {
  const display: Exercise["display"] = item.ref
    ? { kind: "quran", text: requireRef(refs, item.ref).text, ref: item.ref }
    : item.ar
      ? { kind: "arabic", text: item.ar, size: "xl" }
      : undefined;
  const arabicOptions = item.options.every((o) => /^[؀-ۿ\s]+$/u.test(o));
  return {
    id,
    prompt: item.q,
    display,
    options: item.options.map((label) => ({ label, arabic: arabicOptions })),
    answer: item.answer,
    explain: item.explain,
    card: item.card,
  };
}

function requireRef(refs: RefMap, ref: string): ResolvedRef {
  const resolved = refs[ref];
  if (!resolved) throw new Error(`Référence non résolue : ${ref}`);
  return resolved;
}

export function generatePractice(practice: Practice, lessonId: string, refs: RefMap, rand: () => number): Exercise[] {
  const out: Exercise[] = [];
  const key = (suffix: string) => `${lessonId}:${practice.gen}:${suffix}`;
  switch (practice.gen) {
    case "letter-name":
      for (const char of practice.chars) {
        const target = letter(char);
        const { options, answer } = makeOptions(target.name, familyDistractors(target).map((l) => l.name), rand);
        out.push({ id: key(char), prompt: "Comment s'appelle cette lettre ?", display: { kind: "arabic", text: char, size: "xl" }, options: options.map((label) => ({ label })), answer, card: `letter:${char}` });
      }
      break;
    case "name-letter":
      for (const char of practice.chars) {
        const target = letter(char);
        const { options, answer } = makeOptions(char, familyDistractors(target).map((l) => l.char), rand);
        out.push({ id: key(char), prompt: `Où est la lettre « ${target.name} » ?`, options: options.map((label) => ({ label, arabic: true })), answer, card: `letter:${char}` });
      }
      break;
    case "letter-sound":
      for (const char of practice.chars) {
        const target = letter(char);
        const { options, answer } = makeOptions(target.ph, familyDistractors(target).map((l) => l.ph), rand);
        out.push({ id: key(char), prompt: "Quel son fait cette lettre ?", display: { kind: "arabic", text: char, size: "xl" }, options: options.map((label) => ({ label })), answer, explain: target.sound, card: `letter:${char}` });
      }
      break;
    case "letter-forms": {
      const positions = ["initial", "medial", "final"] as const;
      const labels = { initial: "au début d'un mot", medial: "au milieu d'un mot", final: "à la fin d'un mot" };
      for (const char of practice.chars) {
        const position = positions[Math.floor(rand() * positions.length)];
        const form = letterForms(char)[position];
        const target = letter(char);
        const { options, answer } = makeOptions(char, familyDistractors(target).map((l) => l.char), rand);
        out.push({ id: key(char), prompt: `Cette lettre est écrite ${labels[position]}. Laquelle est-ce ?`, display: { kind: "arabic", text: form, size: "xl" }, options: options.map((label) => ({ label, arabic: true })), answer, card: `letter:${char}` });
      }
      break;
    }
    case "syllable":
      for (const char of practice.chars) {
        const vowel = practice.vowels[Math.floor(rand() * practice.vowels.length)];
        const target = buildSyllable(char, vowel);
        const sameConsonant = practice.vowels.filter((v) => v !== vowel).map((v) => buildSyllable(char, v));
        const confusable = familyDistractors(letter(char)).slice(0, 4).filter((l) => !["ا", "ء"].includes(l.char)).map((l) => buildSyllable(l.char, vowel));
        const reverse = rand() < 0.35;
        if (reverse) {
          const { options, answer } = makeOptions(target.ar, [...sameConsonant, ...confusable].map((s) => s.ar), rand);
          out.push({ id: key(`${char}-${vowel}-r`), prompt: "Quelle syllabe se lit ainsi ?", display: { kind: "latin", text: target.ph }, options: options.map((label) => ({ label, arabic: true })), answer, card: VOWEL_CARD[vowel] });
        } else {
          const { options, answer } = makeOptions(target.ph, [...sameConsonant, ...confusable].map((s) => s.ph), rand);
          out.push({ id: key(`${char}-${vowel}`), prompt: "Comment se lit cette syllabe ?", display: { kind: "arabic", text: target.ar, size: "xl" }, options: options.map((label) => ({ label })), answer, card: VOWEL_CARD[vowel] });
        }
      }
      break;
    case "choice":
      practice.items.forEach((item, index) => out.push(choiceToExercise(item, key(String(index)), refs)));
      break;
    case "rule":
      practice.items.forEach((item, index) => {
        const rule = ruleById(item.answer);
        const labels = practice.options.map((id) => ruleById(id).name);
        const shown = labels.length > 4 ? makeOptions(rule.name, labels, rand, 4) : { options: labels, answer: labels.indexOf(rule.name) };
        out.push({
          id: key(String(index)),
          prompt: practice.prompt ?? "Quelle règle s'applique ?",
          display: { kind: "quran", text: requireRef(refs, item.ref).text, ref: item.ref },
          options: shown.options.map((label) => ({ label })),
          answer: shown.answer,
          explain: item.explain ? `${item.explain} ${rule.short}` : rule.short,
          card: `rule:${item.answer}`,
        });
      });
      break;
  }
  return out;
}

/** Références coraniques citées par une leçon (blocs + exercices), à résoudre côté serveur. */
export function lessonRefs(lesson: Lesson): string[] {
  const refs: string[] = [];
  for (const block of lesson.blocks) if (block.kind === "quran") refs.push(block.ref);
  for (const practice of lesson.practice) {
    if (practice.gen === "choice") for (const item of practice.items) if (item.ref) refs.push(item.ref);
    if (practice.gen === "rule") for (const item of practice.items) refs.push(item.ref);
  }
  return refs;
}

/**
 * Exercices d'une leçon : chaque générateur, puis mélange entrelacé.
 * Pour un bilan, tire jusqu'à `limit` questions dans les leçons révisées.
 */
export function buildLessonExercises(lesson: Lesson, all: Lesson[], refs: RefMap, seed: string, limit = 30): Exercise[] {
  const rand = seededRandom(seed);
  const sources = lesson.reviewOf ? lesson.reviewOf.map((id) => all.find((l) => l.id === id)).filter((l): l is Lesson => Boolean(l)) : [lesson];
  const exercises = sources.flatMap((source) => source.practice.flatMap((p) => generatePractice(p, source.id, refs, rand)));
  const unique = [...new Map(exercises.map((e) => [e.id, e])).values()];
  return shuffle(unique, rand).slice(0, limit);
}

/** Toutes les références d'une leçon, y compris celles des leçons révisées par un bilan. */
export function lessonRefsDeep(lesson: Lesson, all: Lesson[]): string[] {
  if (!lesson.reviewOf) return lessonRefs(lesson);
  return lesson.reviewOf.flatMap((id) => {
    const source = all.find((l) => l.id === id);
    return source ? lessonRefs(source) : [];
  });
}

// ---------------------------------------------------------------- vocabulaire
export interface LemmaLike {
  key: string;
  lemma: string;
  fr: string;
}

/** Deux sens de rappel : arabe → français, puis français → arabe (distracteurs pris au lexique). */
export function lemmaExercises(entries: LemmaLike[], pool: LemmaLike[], rand: () => number, both = true): Exercise[] {
  const out: Exercise[] = [];
  for (const entry of entries) {
    const others = pool.filter((p) => p.key !== entry.key && p.fr !== entry.fr);
    const toFr = makeOptions(entry.fr, shuffle(others, rand).slice(0, 8).map((p) => p.fr), rand);
    out.push({
      id: `lemma:${entry.key}:fr`,
      prompt: "Que signifie ce mot ?",
      display: { kind: "arabic", text: entry.lemma, size: "lg" },
      options: toFr.options.map((label) => ({ label })),
      answer: toFr.answer,
      card: `lemma:${entry.key}`,
    });
    if (both) {
      const toAr = makeOptions(entry.lemma, shuffle(others, rand).slice(0, 8).map((p) => p.lemma), rand);
      out.push({
        id: `lemma:${entry.key}:ar`,
        prompt: `Quel mot veut dire « ${entry.fr} » ?`,
        options: toAr.options.map((label) => ({ label, arabic: true })),
        answer: toAr.answer,
        card: `lemma:${entry.key}`,
      });
    }
  }
  return out;
}
