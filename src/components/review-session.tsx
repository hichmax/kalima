"use client";

import { Eye } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { lexicon } from "@/content/lexicon";
import { ExerciseRunner, type ExerciseResult } from "@/components/exercise-runner";
import { FlashcardSession } from "@/components/flashcards";
import { Phonetic, QuranText } from "@/components/quran";
import { localDayKey } from "@/lib/dates";
import { lemmaExercises, seededRandom, shuffle, type Exercise } from "@/lib/exercises";
import type { ReviewBank } from "@/lib/learning-data";
import { recordGrades, recordResults, scoreOf } from "@/lib/progress";
import { dueCardIds, type Grade } from "@/lib/srs";
import { parseDeckCard } from "@/lib/study-types";
import { getState, updateState, useHydrated } from "@/lib/storage";

let bankPromise: Promise<ReviewBank> | null = null;
function loadBank() {
  bankPromise ??= fetch("/api/review-bank").then((r) => {
    if (!r.ok) throw new Error("banque indisponible");
    return r.json() as Promise<ReviewBank>;
  });
  return bankPromise;
}

const POOL = Object.entries(lexicon).map(([key, gloss]) => ({ key, lemma: key.split("|")[0], fr: gloss.fr }));

function exerciseFor(card: string, bank: ReviewBank, rand: () => number): Exercise | null {
  if (card.startsWith("lemma:")) {
    const key = card.slice("lemma:".length);
    const entry = bank.lemmas.find((l) => l.key === key) ?? POOL.find((p) => p.key === key);
    if (!entry) return null;
    const list = lemmaExercises([{ key, lemma: entry.lemma, fr: lexicon[key]?.fr ?? "" }], POOL, rand, true);
    return list[Math.floor(rand() * list.length)] ?? null;
  }
  const candidates = bank.byCard[card];
  if (!candidates?.length) return null;
  const picked = candidates[Math.floor(rand() * candidates.length)];
  // Options re-mélangées pour éviter de mémoriser une position.
  const order = shuffle(picked.options.map((_, i) => i), rand);
  return {
    ...picked,
    id: `${picked.id}:review`,
    options: order.map((i) => picked.options[i]),
    answer: order.indexOf(picked.answer),
  };
}

/** `decks` : inclure les cartes des paquets de l'apprenant (page Réviser ; pas dans la séance du jour). */
export type ReviewMode = { kind: "due"; limit: number; decks?: boolean } | { kind: "challenge"; size: number };

const isDeck = (id: string) => parseDeckCard(id) !== null;

export function ReviewSession({ mode, onDone }: { mode: ReviewMode; onDone?: (score: number | null) => void }) {
  const hydrated = useHydrated();
  const [bank, setBank] = useState<ReviewBank | null>(null);
  const [error, setError] = useState(false);
  const [phase, setPhase] = useState<"quiz" | "cards" | "verses" | "done">("quiz");
  const [score, setScore] = useState<number | null>(null);
  const [seed] = useState(() => Math.random().toString(36));
  // Les cartes sont figées au lancement de la séance.
  const [cards] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const state = getState();
    if (mode.kind === "due") return dueCardIds(state).filter((id) => mode.decks || !isDeck(id)).slice(0, mode.limit);
    const owned = Object.keys(state.cards).filter((id) => !id.startsWith("verse:") && !isDeck(id));
    return shuffle(owned, seededRandom(`${localDayKey()}:${owned.length}`)).slice(0, mode.size);
  });

  useEffect(() => {
    let alive = true;
    loadBank()
      .then((b) => alive && setBank(b))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  const exercises = useMemo(() => {
    if (!bank) return [];
    const rand = seededRandom(seed);
    return cards
      .filter((c) => !c.startsWith("verse:") && !isDeck(c))
      .map((c) => exerciseFor(c, bank, rand))
      .filter((e): e is Exercise => Boolean(e));
  }, [bank, cards, seed]);
  // Récitation de mémoire : seulement les versets connus de la banque (sourates du programme).
  const verseCards = bank ? cards.filter((c) => c.startsWith("verse:") && bank.verses[c.slice("verse:".length)]) : [];
  const deckCards = cards.filter(isDeck);

  if (!hydrated) return null;
  if (error) return <p className="tip tip-warn">La banque de révision n&apos;a pas pu être chargée. Vérifie ta connexion.</p>;
  if (!cards.length) {
    return (
      <div className="glass card stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <h3>{mode.kind === "due" ? "Rien à réviser pour l'instant" : "Le défi s'ouvre après ta première leçon"}</h3>
        <p className="muted">
          {mode.kind === "due"
            ? "Chaque élément revient juste avant que tu l'oublies. Reviens plus tard, ou avance dans le programme."
            : "Il pioche uniquement dans ce que tu as déjà appris."}
        </p>
        {onDone ? (
          <button type="button" className="btn primary" onClick={() => onDone(null)}>Continuer</button>
        ) : null}
      </div>
    );
  }
  if (!bank) return <p className="faint">Préparation des cartes…</p>;

  const finishQuiz = async (results: ExerciseResult[]) => {
    await recordResults(results);
    const value = scoreOf(results);
    setScore(value);
    if (mode.kind === "challenge") {
      updateState((state) => ({ ...state, challenges: { ...state.challenges, [localDayKey()]: { score: results.filter((r) => r.correctFirstTry).length, total: results.length } } }));
    }
    nextAfterQuiz(value);
  };

  /** Après le quiz : les cartes des paquets, puis la récitation de mémoire. */
  const nextAfterQuiz = (value: number | null) => {
    if (deckCards.length) setPhase("cards");
    else if (verseCards.length) setPhase("verses");
    else {
      setPhase("done");
      onDone?.(value);
    }
  };

  if (phase === "quiz" && exercises.length) {
    return <ExerciseRunner exercises={exercises} onComplete={finishQuiz} title={mode.kind === "challenge" ? "Défi express" : "Révision"} />;
  }
  if ((phase === "quiz" && !exercises.length && deckCards.length) || phase === "cards") {
    return (
      <FlashcardSession
        cards={deckCards}
        title="Mes cartes"
        onDone={() => {
          if (verseCards.length) setPhase("verses");
          else {
            setPhase("done");
            onDone?.(score);
          }
        }}
      />
    );
  }
  if ((phase === "quiz" && !exercises.length) || phase === "verses") {
    if (!verseCards.length) {
      return (
        <div className="glass card stack" style={{ "--gap": "8px" } as React.CSSProperties}>
          <h3>Révision terminée</h3>
          <p className="muted">Chaque carte reviendra au moment où tu risques de l&apos;oublier.</p>
          {onDone ? (
            <button type="button" className="btn primary" onClick={() => onDone(score)}>
              Continuer
            </button>
          ) : null}
        </div>
      );
    }
    return (
      <VerseRecall
        cards={verseCards}
        bank={bank}
        onDone={() => {
          setPhase("done");
          onDone?.(score);
        }}
      />
    );
  }
  return (
    <div className="glass card stack" style={{ "--gap": "8px" } as React.CSSProperties}>
      <h3>Révision terminée</h3>
      {score !== null ? <p className="score num">{score} %</p> : null}
      <p className="muted">Chaque carte reviendra au moment où tu risques de l&apos;oublier.</p>
    </div>
  );
}

const GRADES: Array<{ grade: Grade; label: string }> = [
  { grade: 1, label: "À revoir" },
  { grade: 2, label: "Difficile" },
  { grade: 3, label: "Bien" },
  { grade: 4, label: "Facile" },
];

/** Récitation de mémoire : indice (premières lettres), puis texte, puis auto-évaluation. */
function VerseRecall({ cards, bank, onDone }: { cards: string[]; bank: ReviewBank; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const card = cards[index];
  const key = card?.slice("verse:".length) ?? "";
  const verse = bank.verses[key];

  const grade = async (value: Grade) => {
    await recordGrades([{ id: card, grade: value }]);
    setRevealed(false);
    if (index + 1 >= cards.length) onDone();
    else setIndex(index + 1);
  };

  if (!verse) return null;
  return (
    <section className="glass card stack" style={{ "--gap": "14px" } as React.CSSProperties}>
      <div className="row between">
        <span className="faint">Récitation · {index + 1} / {cards.length}</span>
        <span className="chip">Coran {key}</span>
      </div>
      <h2 className="exercise-prompt">Récite ce verset de mémoire.</h2>
      <QuranText words={verse.words} hidden={revealed ? "none" : "hint"} verse={Number(key.split(":")[1])} />
      {revealed ? (
        <>
          <Phonetic text={verse.phonetic ?? undefined} mode="tap" />
          <div className="grade-row">
            {GRADES.map((g) => (
              <button key={g.grade} type="button" className="btn small" data-grade={g.grade} onClick={() => void grade(g.grade)}>
                {g.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <button type="button" className="btn primary" onClick={() => setRevealed(true)}>
          <Eye aria-hidden="true" /> Vérifier
        </button>
      )}
    </section>
  );
}
