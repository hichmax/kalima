import { shuffle, type Exercise } from "@/lib/exercises";
import { wordsToText } from "@/lib/quran-types";
import { parseDeckCard, type StudySurah } from "@/lib/study-types";

/**
 * Quiz d'un paquet : chaque carte devient une question à choix, construite uniquement à partir du
 * texte Tanzil, de la phonétique et des sens (mot à mot Quran.Foundation, sinon lexique Kalima).
 *   - mot → sens ; sens → mot ; mot manquant dans le verset ;
 *   - verset → sa bonne lecture (phonétique), parmi celles d'autres versets.
 */

export interface DeckMedia {
  /** traduction française mot à mot de chaque verset : wordsFr[s][v] = sens de chaque mot */
  wordsFr: (s: number, v: number) => Array<string | null> | undefined;
}

interface WordItem {
  card: string;
  s: number;
  v: number;
  w: number;
  ar: string;
  fr: string | null;
}

const MISSING = "……";
/** Début de la phonétique, assez long pour distinguer deux versets. */
const reading = (text: string) => (text.length > 70 ? `${text.slice(0, 70).replace(/\s+\S*$/u, "")}…` : text);

export function buildDeckQuiz(cards: string[], study: Record<number, StudySurah>, media: DeckMedia, rand: () => number, size = 12): Exercise[] {
  const words: WordItem[] = [];
  const verses: Array<{ card: string; s: number; v: number }> = [];
  for (const id of cards) {
    const parsed = parseDeckCard(id);
    if (!parsed) continue;
    const verse = study[parsed.s]?.verses[parsed.v - 1];
    if (!verse) continue;
    if (parsed.kind === "reading") {
      verses.push({ card: id, s: parsed.s, v: parsed.v });
      continue;
    }
    const word = verse.w[parsed.w - 1];
    if (!word) continue;
    const fr = media.wordsFr(parsed.s, parsed.v)?.[parsed.w - 1] ?? word.g;
    words.push({ card: id, s: parsed.s, v: parsed.v, w: parsed.w, ar: word.ar, fr: fr?.trim() || null });
  }

  const meanings = [...new Set(words.map((w) => w.fr).filter((fr): fr is string => Boolean(fr)))];
  const arabic = [...new Set(words.map((w) => w.ar))];
  const out: Exercise[] = [];

  const options = (correct: string, pool: string[], arabicOptions: boolean) => {
    const distractors = shuffle(
      pool.filter((p) => p !== correct),
      rand,
    ).slice(0, 3);
    if (distractors.length < 2) return null;
    const list = shuffle([correct, ...distractors], rand);
    return { options: list.map((label) => ({ label, ...(arabicOptions ? { arabic: true } : {}) })), answer: list.indexOf(correct) };
  };

  for (const item of words) {
    const kinds: Array<"meaning" | "reverse" | "missing"> = [];
    if (item.fr && meanings.length >= 3) kinds.push("meaning", "reverse");
    const verse = study[item.s].verses[item.v - 1];
    if (verse.w.length >= 3 && arabic.length >= 3) kinds.push("missing");
    if (!kinds.length) continue;
    const kind = kinds[Math.floor(rand() * kinds.length)];
    const ref = `${item.s}:${item.v}`;
    if (kind === "meaning" && item.fr) {
      const built = options(item.fr, meanings, false);
      if (built) out.push({ id: `quiz:${item.card}:m`, card: item.card, prompt: "Que veut dire ce mot ?", display: { kind: "arabic", text: item.ar, size: "xl" }, ...built });
    } else if (kind === "reverse" && item.fr) {
      // jamais deux bonnes réponses : on écarte les mots qui ont le même sens
      const sameMeaning = new Set(words.filter((w) => w.fr === item.fr).map((w) => w.ar));
      const built = options(
        item.ar,
        arabic.filter((ar) => ar === item.ar || !sameMeaning.has(ar)),
        true,
      );
      if (built) out.push({ id: `quiz:${item.card}:r`, card: item.card, prompt: `Quel mot veut dire « ${item.fr} » ?`, ...built });
    } else if (kind === "missing") {
      const text = wordsToText(verse.w.map((w, i) => (i === item.w - 1 ? { ...w, ar: MISSING } : w)));
      const built = options(item.ar, arabic, true);
      if (built) out.push({ id: `quiz:${item.card}:x`, card: item.card, prompt: "Quel mot manque dans ce verset ?", display: { kind: "quran", text, ref }, ...built });
    }
  }

  for (const item of verses) {
    const surah = study[item.s];
    const verse = surah.verses[item.v - 1];
    const own = reading(verse.ph);
    // autres lectures : d'abord les versets du paquet, puis les voisins dans la sourate
    const others = [
      ...verses.filter((x) => x.card !== item.card).map((x) => study[x.s]?.verses[x.v - 1]?.ph ?? ""),
      ...surah.verses.filter((x) => Math.abs(x.v - item.v) <= 6 && x.v !== item.v).map((x) => x.ph),
    ]
      .map(reading)
      .filter((text) => text && text !== own);
    const built = options(own, [...new Set(others)], false);
    if (built) {
      out.push({
        id: `quiz:${item.card}:l`,
        card: item.card,
        prompt: "Quelle est la bonne lecture de ce verset ?",
        display: { kind: "quran", text: wordsToText(verse.w), ref: `${item.s}:${item.v}` },
        ...built,
      });
    }
  }

  return shuffle(out, rand).slice(0, size);
}
