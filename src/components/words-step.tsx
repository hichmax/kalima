"use client";

import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { lexicon } from "@/content/lexicon";
import { ExerciseRunner, type ExerciseResult } from "@/components/exercise-runner";
import { QuranText } from "@/components/quran";
import { lemmaExercises, seededRandom, shuffle } from "@/lib/exercises";
import type { LemmaEntry } from "@/lib/learning-data";
import { spellRoot } from "@/lib/morphology";
import { recordResults } from "@/lib/progress";

const POS_LABEL: Record<string, string> = { N: "nom", V: "verbe", P: "particule" };

/** Toutes les entrées du lexique, comme réservoir de distracteurs. */
const POOL = Object.entries(lexicon).map(([key, gloss]) => ({ key, lemma: key.split("|")[0], fr: gloss.fr }));

export function WordsStep({ words, onDone }: { words: LemmaEntry[]; onDone: () => void }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [phase, setPhase] = useState<"cards" | "quiz">("cards");
  const [seed] = useState(() => Math.random().toString(36));
  const exercises = useMemo(() => {
    const rand = seededRandom(seed);
    return shuffle(lemmaExercises(words, POOL, rand), rand);
  }, [words, seed]);

  if (!words.length) {
    return (
      <div className="glass card stack">
        <p className="muted">Pas de nouveaux mots aujourd&apos;hui : place à la révision.</p>
        <button type="button" className="btn primary" onClick={onDone}>Continuer</button>
      </div>
    );
  }

  if (phase === "quiz") {
    return (
      <ExerciseRunner
        exercises={exercises}
        title="Les mots du jour"
        onComplete={async (results: ExerciseResult[]) => {
          await recordResults(results);
          onDone();
        }}
      />
    );
  }

  const word = words[index];
  const go = (delta: number) => {
    setDirection(delta);
    setIndex((i) => Math.min(words.length - 1, Math.max(0, i + delta)));
  };
  const spring = reduce ? { duration: 0.12 } : { type: "spring" as const, bounce: 0, duration: 0.42 };

  return (
    <section className="stack" style={{ "--gap": "14px" } as React.CSSProperties}>
      <div className="row between">
        <span className="faint">Mot {index + 1} sur {words.length}</span>
        <button type="button" className="btn small ghost" onClick={() => setPhase("quiz")}>
          Passer au quiz
        </button>
      </div>
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.article
          key={word.key}
          className="glass card stack word-card"
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 * direction }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -40 * direction }}
          transition={spring}
          drag={reduce ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            const projected = info.offset.x + info.velocity.x * 0.2;
            if (projected < -80 && index < words.length - 1) go(1);
            if (projected > 80 && index > 0) go(-1);
          }}
          style={{ "--gap": "12px" } as React.CSSProperties}
        >
          <div className="row between">
            <span className="chip">{POS_LABEL[word.pos] ?? word.pos}</span>
            <span className="faint num">{word.count} fois · rang {word.rank}</span>
          </div>
          <p className="ar word-lemma" lang="ar" dir="rtl">{word.lemma}</p>
          <p className="word-fr">{word.fr}</p>
          {word.note ? <p className="muted">{word.note}</p> : null}
          {word.root ? (
            <p className="faint">
              Racine <span className="ar root" lang="ar" dir="rtl">{spellRoot(word.root)}</span>
            </p>
          ) : null}
          {word.example ? (
            <div className="example">
              <QuranText words={word.example.verse} focus={word.example.focus} size="1.55rem" />
              <span className="faint">Dans le Coran, {word.example.ref.split(":").slice(0, 2).join(":")} — sens en contexte à lire dans la traduction.</span>
            </div>
          ) : null}
        </motion.article>
      </AnimatePresence>
      <div className="row between">
        <button type="button" className="btn small" onClick={() => go(-1)} disabled={index === 0} aria-label="Mot précédent">
          <ArrowLeft aria-hidden="true" />
        </button>
        {index < words.length - 1 ? (
          <button type="button" className="btn" onClick={() => go(1)}>
            Suivant <ArrowRight aria-hidden="true" />
          </button>
        ) : (
          <button type="button" className="btn primary" onClick={() => setPhase("quiz")}>
            Je me teste <ArrowRight aria-hidden="true" />
          </button>
        )}
      </div>
      <p className="faint">Sens de dictionnaire rédigés par Kalima, en cours de relecture. Découpage et fréquences : Quranic Arabic Corpus.</p>
    </section>
  );
}
