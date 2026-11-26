"use client";

import { ArrowRight, CheckCircle, XCircle } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Exercise } from "@/lib/exercises";

export interface ExerciseResult {
  id: string;
  card?: string;
  correctFirstTry: boolean;
  fast: boolean;
}

/**
 * Enchaîne des questions à choix. Une erreur n'est pas une fin : la question revient en
 * fin de série jusqu'à ce qu'elle soit réussie (pratique de récupération). Seul le premier
 * essai compte pour la répétition espacée.
 */
export function ExerciseRunner({
  exercises,
  onComplete,
  title,
  onAdvance,
}: {
  exercises: Exercise[];
  onComplete: (results: ExerciseResult[]) => void;
  title?: string;
  /** Appelé à chaque nouvelle question affichée (identifiant de l'exercice). */
  onAdvance?: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const [queue, setQueue] = useState(() => exercises.map((e) => e.id));
  const [picked, setPicked] = useState<number | null>(null);
  const [missed, setMissed] = useState<ReadonlySet<string>>(() => new Set());
  const results = useRef(new Map<string, ExerciseResult>());
  const shownAt = useRef(0);
  const byId = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  const current = byId.get(queue[0] ?? "");
  const done = exercises.length - new Set(queue).size;
  const progress = exercises.length ? done / exercises.length : 1;

  useEffect(() => {
    shownAt.current = performance.now();
    if (queue[0]) onAdvance?.(queue[0]);
  }, [queue, onAdvance]);

  const answer = useCallback(
    (index: number) => {
      if (!current || picked !== null) return;
      setPicked(index);
      const correct = index === current.answer;
      if (!correct) setMissed((prev) => new Set(prev).add(current.id));
      if (!results.current.has(current.id)) {
        results.current.set(current.id, {
          id: current.id,
          card: current.card,
          correctFirstTry: correct,
          fast: performance.now() - shownAt.current < 4000,
        });
      }
    },
    [current, picked],
  );

  const next = useCallback(() => {
    if (!current || picked === null) return;
    const correct = picked === current.answer;
    const [, ...rest] = queue;
    const nextQueue = correct ? rest : [...rest, current.id];
    setPicked(null);
    if (nextQueue.length === 0) {
      onComplete([...results.current.values()]);
    }
    setQueue(nextQueue);
  }, [current, picked, queue, onComplete]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!current) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const n = Number(event.key);
      if (picked === null && n >= 1 && n <= current.options.length) answer(n - 1);
      if (picked !== null && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, current, next, picked]);

  if (!current) return null;
  const correct = picked !== null && picked === current.answer;
  const retry = missed.has(current.id) && picked === null;
  const spring = reduce ? { duration: 0.15 } : { type: "spring" as const, bounce: 0, duration: 0.42 };

  return (
    <section className="stack" style={{ "--gap": "18px" } as React.CSSProperties} aria-live="polite">
      <div className="row between">
        <span className="faint">{title ?? "Exercices"}</span>
        <span className="faint num">
          {Math.min(done + 1, exercises.length)} / {exercises.length}
        </span>
      </div>
      <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
        <motion.span initial={false} animate={{ width: `${progress * 100}%` }} transition={spring} />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${current.id}-${queue.length}`}
          className="glass card stack exercise-card"
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 36, scale: 0.98, filter: "blur(6px)" }}
          animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -36, scale: 0.98, filter: "blur(6px)" }}
          transition={spring}
          style={{ "--gap": "20px" } as React.CSSProperties}
        >
          {retry ? <span className="chip draft">On la retente</span> : null}
          <h2 className="exercise-prompt">{current.prompt}</h2>

          {current.display?.kind === "arabic" ? (
            <p className={`ar ${current.display.size === "lg" ? "ar-lg" : "ar-xl"} exercise-display`} lang="ar" dir="rtl">
              {current.display.text}
            </p>
          ) : null}
          {current.display?.kind === "quran" ? (
            <div className="exercise-display">
              <p className="quran" lang="ar" dir="rtl">
                {current.display.text}
              </p>
              <span className="faint">Coran {current.display.ref}</span>
            </div>
          ) : null}
          {current.display?.kind === "latin" ? <p className="exercise-display latin-display">{current.display.text}</p> : null}

          <div className={`options ${current.options.length > 3 ? "two-cols" : ""}`}>
            {current.options.map((option, index) => {
              const state =
                picked === null ? undefined : index === current.answer ? "correct" : index === picked ? "wrong" : "dim";
              return (
                <motion.button
                  key={`${option.label}-${index}`}
                  type="button"
                  className={`option${option.arabic ? " ar-option" : ""}`}
                  data-state={state}
                  disabled={picked !== null}
                  onClick={() => answer(index)}
                  lang={option.arabic ? "ar" : undefined}
                  dir={option.arabic ? "rtl" : undefined}
                  animate={state === "wrong" && !reduce ? { x: [0, -7, 7, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.38 }}
                >
                  <span className="option-key" aria-hidden="true">
                    {index + 1}
                  </span>
                  {option.label}
                  {state === "correct" ? <CheckCircle className="option-icon" weight="fill" aria-hidden="true" /> : null}
                  {state === "wrong" ? <XCircle className="option-icon" weight="fill" aria-hidden="true" /> : null}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {picked !== null ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={spring}
                className="stack"
                style={{ "--gap": "12px" } as React.CSSProperties}
              >
                <div className={`feedback ${correct ? "good" : "bad"}`} role="status">
                  <strong>{correct ? "Juste." : "Pas tout à fait."}</strong>{" "}
                  {current.explain ?? (correct ? "" : `La bonne réponse : ${current.options[current.answer].label}.`)}
                  {!correct ? <span className="faint"> Elle reviendra à la fin de la série.</span> : null}
                </div>
                <button type="button" className="btn primary block" onClick={next} autoFocus>
                  Continuer <ArrowRight aria-hidden="true" />
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
