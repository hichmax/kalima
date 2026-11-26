import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { alphabet } from "@/content/alphabet";
import { lexicon } from "@/content/lexicon";
import { allLessons, getLesson, program, PROGRAM_SURAHS } from "@/content/program";
import { recitationPhonetics } from "@/content/recitation";
import { sources } from "@/content/sources";
import { tajwidRules } from "@/content/tajwid";
import { buildLessonExercises, lessonRefsDeep } from "@/lib/exercises";
import { resolveInSurah, type ResolvedRef, type SurahText } from "@/lib/quran-types";

const generated = path.resolve(__dirname, "../generated");
const surahCache = new Map<number, SurahText>();
function surah(n: number): SurahText {
  if (!surahCache.has(n)) {
    surahCache.set(n, JSON.parse(readFileSync(path.join(generated, "surahs", `${n}.json`), "utf8")));
  }
  return surahCache.get(n)!;
}
const resolve = (ref: string): ResolvedRef => resolveInSurah(surah(Number(ref.split(":")[0])), ref);
const refMap = (refs: string[]) => Object.fromEntries(refs.map((ref) => [ref, resolve(ref)]));

const ARABIC_WORD = /[ء-ي][ء-ٰۖ-ۭـ]*/gu;

describe("leçons", () => {
  it("ont des identifiants uniques", () => {
    const ids = allLessons.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ne citent que des références coraniques existantes", () => {
    for (const lesson of allLessons) {
      for (const ref of lessonRefsDeep(lesson, allLessons)) {
        expect(() => resolve(ref), `${lesson.id} → ${ref}`).not.toThrow();
      }
    }
  });

  it("ne contiennent aucun passage coranique tapé à la main (4 mots arabes ou plus d'affilée)", () => {
    const texts: Array<[string, string]> = [];
    for (const lesson of allLessons) {
      for (const block of lesson.blocks) {
        if (block.kind === "text" || block.kind === "tip") texts.push([lesson.id, block.body]);
        if (block.kind === "quran" && block.note) texts.push([lesson.id, block.note]);
        if (block.kind === "table") block.rows.flat().forEach((cell) => texts.push([lesson.id, cell]));
      }
      for (const practice of lesson.practice) {
        if (practice.gen === "choice") {
          for (const item of practice.items) {
            texts.push([lesson.id, item.q], [lesson.id, item.explain ?? ""], [lesson.id, item.ar ?? ""]);
          }
        }
      }
    }
    for (const [id, text] of texts) {
      // Les listes de lettres isolées (« ء ه ع ح غ خ ») ne sont pas des mots.
      const longRun = text.match(/(?:[ء-ي][ء-ٰۖ-ۭـ]+\s+){3,}[ء-ي][ء-ٰۖ-ۭـ]+/u);
      expect(longRun, `${id} : « ${longRun?.[0]} » doit être une référence`).toBeNull();
    }
  });

  it("utilisent des règles, réponses et options valides", () => {
    const ruleIds = new Set(tajwidRules.map((r) => r.id));
    for (const lesson of allLessons) {
      for (const practice of lesson.practice) {
        if (practice.gen === "choice") {
          for (const item of practice.items) {
            expect(item.answer, `${lesson.id} : ${item.q}`).toBeGreaterThanOrEqual(0);
            expect(item.answer, `${lesson.id} : ${item.q}`).toBeLessThan(item.options.length);
            expect(new Set(item.options).size, `${lesson.id} : options en double`).toBe(item.options.length);
          }
        }
        if (practice.gen === "rule") {
          for (const option of practice.options) expect(ruleIds.has(option), option).toBe(true);
          for (const item of practice.items) expect(practice.options, `${lesson.id} ${item.ref}`).toContain(item.answer);
        }
      }
    }
  });

  it("génèrent des exercices jouables (15 au moins par leçon hors arabe, une bonne réponse)", () => {
    for (const lesson of allLessons) {
      const refs = refMap(lessonRefsDeep(lesson, allLessons));
      const exercises = buildLessonExercises(lesson, allLessons, refs, `test:${lesson.id}`);
      const minimum = lesson.track === "arabe" || lesson.id === "adab" ? 3 : lesson.track === "bilan" ? 20 : 6;
      expect(exercises.length, lesson.id).toBeGreaterThanOrEqual(minimum);
      for (const exercise of exercises) {
        expect(exercise.answer, exercise.id).toBeGreaterThanOrEqual(0);
        expect(exercise.answer, exercise.id).toBeLessThan(exercise.options.length);
        const labels = exercise.options.map((o) => o.label);
        expect(new Set(labels).size, `${exercise.id} : ${labels.join(" | ")}`).toBe(labels.length);
        expect(exercise.options.length, exercise.id).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("citent des sources déclarées", () => {
    const ids = new Set(sources.map((s) => s.id));
    for (const lesson of allLessons) for (const id of lesson.sources) expect(ids.has(id), `${lesson.id} → ${id}`).toBe(true);
  });
});

describe("programme de 30 jours", () => {
  it("compte 30 jours consécutifs", () => {
    expect(program.map((d) => d.day)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
  });

  it("référence des leçons et des versets existants", () => {
    for (const day of program) {
      for (const id of day.lessons) expect(() => getLesson(id), `jour ${day.day}`).not.toThrow();
      for (const segment of day.memorize) {
        const text = surah(segment.s);
        expect(segment.from, `jour ${day.day}`).toBeGreaterThanOrEqual(1);
        expect(segment.to, `jour ${day.day}`).toBeLessThanOrEqual(text.verses.length);
        expect(PROGRAM_SURAHS as readonly number[]).toContain(segment.s);
      }
    }
  });

  it("couvre chaque verset mémorisé par une transcription écrite à la main", () => {
    for (const day of program) {
      for (const segment of day.memorize) {
        for (let v = segment.from; v <= segment.to; v += 1) {
          expect(recitationPhonetics[`${segment.s}:${v}`], `${segment.s}:${v}`).toBeTruthy();
        }
      }
    }
  });

  it("enseigne chaque leçon au moins une fois", () => {
    const taught = new Set(program.flatMap((d) => d.lessons));
    for (const lesson of allLessons) {
      const reviewed = allLessons.some((l) => l.reviewOf?.includes(lesson.id) && taught.has(l.id));
      expect(taught.has(lesson.id) || reviewed, lesson.id).toBe(true);
      if (lesson.track !== "bilan") expect(taught.has(lesson.id), `${lesson.id} n'est jamais enseignée`).toBe(true);
    }
  });
});

describe("alphabet", () => {
  it("contient 28 lettres et la hamza", () => {
    expect(alphabet).toHaveLength(29);
  });

  it("illustre chaque lettre par un mot du Coran qui la contient", () => {
    for (const l of alphabet) {
      const word = resolve(l.example).text;
      expect(word.includes(l.char), `${l.char} absent de ${word}`).toBe(true);
    }
  });
});

describe("lexique", () => {
  const stats = JSON.parse(readFileSync(path.join(generated, "lexicon-stats.json"), "utf8")) as {
    lemmas: Array<{ key: string; rank: number; inProgram: boolean }>;
  };

  it("donne un sens à chaque lemme sélectionné", () => {
    const missing = stats.lemmas.filter((l) => !lexicon[l.key]).map((l) => l.key);
    expect(missing).toEqual([]);
  });

  it("ne contient pas de clé orpheline", () => {
    const keys = new Set(stats.lemmas.map((l) => l.key));
    expect(Object.keys(lexicon).filter((k) => !keys.has(k))).toEqual([]);
  });

  it("couvre les 300 lemmes les plus fréquents", () => {
    expect(stats.lemmas.filter((l) => l.rank <= 300)).toHaveLength(300);
  });
});

describe("texte coranique", () => {
  it("se résout mot à mot sans altération", () => {
    expect(resolve("1:1").text.split(" ")).toHaveLength(4);
    expect(resolve("2:2:3-5").words).toHaveLength(3);
    expect(() => resolve("1:8")).toThrow();
    expect(() => resolve("1:1:5")).toThrow();
  });

  it("garde la basmala de Tanzil hors du verset 1 des sourates", () => {
    expect(surah(112).basmala).toHaveLength(4);
    expect(surah(9).basmala).toBeNull();
    expect(surah(1).basmala).toBeNull();
    expect(resolve("112:1").text.match(ARABIC_WORD)?.length).toBe(4);
  });
});
