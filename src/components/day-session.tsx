"use client";

import { ArrowRight, Check, Confetti } from "@phosphor-icons/react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { phoneticPhase, WEEKS } from "@/content/program";
import { LessonView } from "@/components/lesson-view";
import { MemorizeStep } from "@/components/memorize-step";
import { ReviewSession } from "@/components/review-session";
import { Soffit } from "@/components/soffit";
import { WordsStep } from "@/components/words-step";
import { celebrate } from "@/lib/anime";
import type { DayPayload } from "@/lib/learning-data";
import { completeDay, isStepDone, markStep, saveLessonScore, type StepId } from "@/lib/progress";
import { useHydrated, useKalima } from "@/lib/storage";

const STEPS: Array<{ id: StepId; label: string; minutes: string }> = [
  { id: "revision", label: "Révision", minutes: "5 min" },
  { id: "lecon", label: "Leçon", minutes: "10 min" },
  { id: "memoriser", label: "Mémoriser", minutes: "15 min" },
  { id: "mots", label: "Mots", minutes: "5 min" },
  { id: "defi", label: "Défi", minutes: "2 min" },
];
const REQUIRED: StepId[] = ["lecon", "memoriser", "mots"];

export function DaySession({ payload, surahNames }: { payload: DayPayload; surahNames: Record<number, string> }) {
  const { day, lessons, verses, words } = payload;
  const state = useKalima();
  const hydrated = useHydrated();
  const reduce = useReducedMotion();
  const [active, setActive] = useState<StepId | "fin">("revision");
  const [lessonIndex, setLessonIndex] = useState(0);
  const celebrated = useRef(false);
  const celebrationRef = useCallback((el: HTMLElement | null) => {
    if (el && !celebrated.current) {
      celebrated.current = true;
      celebrate(el);
    }
  }, []);

  const phonetic = state.settings.phonetic === "auto" ? phoneticPhase(day.day) : state.settings.phonetic;
  const done = (step: StepId) => hydrated && isStepDone(state, day.day, step);
  const complete = hydrated && Boolean(state.days[String(day.day)]?.completedAt);
  const ready = REQUIRED.every(done);

  const finishStep = (step: StepId) => {
    markStep(day.day, step);
    const order = STEPS.map((s) => s.id);
    const next = order[order.indexOf(step) + 1];
    setActive(next ?? "fin");
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const spring = reduce ? { duration: 0.12 } : { type: "spring" as const, bounce: 0, duration: 0.45 };
  const week = WEEKS.find((w) => w.week === day.week);

  return (
    <div className="stack" style={{ "--gap": "22px" } as React.CSSProperties}>
      <header className="day-hero glass">
        <Soffit />
        <div className="day-hero-content stack" style={{ "--gap": "8px" } as React.CSSProperties}>
          <span className="eyebrow plain">Semaine {day.week} · {week?.title}</span>
          <h1>
            Jour <span className="num">{day.day}</span>
          </h1>
          <p className="lead day-title">{day.title}</p>
          {day.bonus ? <span className="chip">Sourate bonus : facultative si tu débutes</span> : null}
        </div>
      </header>

      <LayoutGroup id="day-steps">
        <nav className="steps" aria-label="Étapes de la séance">
          {STEPS.map((step, i) => {
            const isActive = active === step.id;
            return (
              <button key={step.id} type="button" className="step" aria-current={isActive ? "step" : undefined} onClick={() => setActive(step.id)}>
                {isActive ? <motion.span layoutId="step-pill" className="nav-pill" transition={spring} /> : null}
                <span className={`step-dot${done(step.id) ? " done" : ""}`}>{done(step.id) ? <Check weight="bold" aria-hidden="true" /> : i + 1}</span>
                <span className="step-label">{step.label}</span>
                <span className="step-min">{step.minutes}</span>
              </button>
            );
          })}
        </nav>
      </LayoutGroup>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active === "lecon" ? `lecon-${lessonIndex}` : active}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={spring}
        >
          {active === "revision" ? (
            <section className="stack" style={{ "--gap": "14px" } as React.CSSProperties}>
              <h2>Réviser d&apos;abord</h2>
              <p className="muted">Les éléments que tu risques d&apos;oublier aujourd&apos;hui, choisis par l&apos;algorithme FSRS.</p>
              <ReviewSession mode={{ kind: "due", limit: 15 }} onDone={() => finishStep("revision")} />
            </section>
          ) : null}

          {active === "lecon" && lessons[lessonIndex] ? (
            <section className="stack" style={{ "--gap": "14px" } as React.CSSProperties}>
              {lessons.length > 1 ? (
                <span className="faint">Leçon {lessonIndex + 1} sur {lessons.length}</span>
              ) : null}
              <LessonView
                key={lessons[lessonIndex].lesson.id}
                lesson={lessons[lessonIndex].lesson}
                sourceLessons={lessons[lessonIndex].sourceLessons}
                refs={lessons[lessonIndex].refs}
                onDone={(score) => saveLessonScore(day.day, lessons[lessonIndex].lesson.id, score)}
              />
              {hydrated && state.days[String(day.day)]?.lessonScores[lessons[lessonIndex].lesson.id] !== undefined ? (
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => {
                    if (lessonIndex + 1 < lessons.length) {
                      setLessonIndex(lessonIndex + 1);
                      window.scrollTo({ top: 0 });
                    } else finishStep("lecon");
                  }}
                >
                  {lessonIndex + 1 < lessons.length ? "Leçon suivante" : "Passer à la mémorisation"} <ArrowRight aria-hidden="true" />
                </button>
              ) : null}
            </section>
          ) : null}

          {active === "memoriser" ? (
            <section className="stack" style={{ "--gap": "14px" } as React.CSSProperties}>
              <h2>Mémoriser</h2>
              <MemorizeStep verses={verses} phoneticMode={phonetic} surahNames={surahNames} onDone={() => finishStep("memoriser")} />
            </section>
          ) : null}

          {active === "mots" ? (
            <section className="stack" style={{ "--gap": "14px" } as React.CSSProperties}>
              <h2>Les mots du jour</h2>
              <WordsStep words={words} onDone={() => finishStep("mots")} />
            </section>
          ) : null}

          {active === "defi" ? (
            <section className="stack" style={{ "--gap": "14px" } as React.CSSProperties}>
              <h2>Défi express</h2>
              <p className="muted">Cinq questions tirées de tout ce que tu as déjà appris. Deux minutes, pas plus.</p>
              <ReviewSession mode={{ kind: "challenge", size: 5 }} onDone={() => finishStep("defi")} />
              {day.challenge ? (
                <div className="glass card stack challenge" style={{ "--gap": "10px" } as React.CSSProperties}>
                  <span className="eyebrow plain">{day.challenge.title}</span>
                  <ul className="checklist">
                    {day.challenge.tasks.map((task) => (
                      <li key={task}>{task}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

          {active === "fin" ? (
            <section className="glass card stack finish" ref={celebrationRef} style={{ "--gap": "14px" } as React.CSSProperties}>
              <Confetti size={40} weight="duotone" aria-hidden="true" className="finish-icon" />
              <h2>{ready ? "Belle séance." : "Encore un effort."}</h2>
              <p className="muted">
                {ready
                  ? "Tout ce que tu as vu aujourd'hui reviendra dans tes révisions, au bon moment."
                  : "Termine la leçon, la mémorisation et les mots pour valider la journée."}
              </p>
              <div className="row">
                {ready && !complete ? (
                  <button type="button" className="btn primary" onClick={() => completeDay(day.day)}>
                    Valider le jour {day.day}
                  </button>
                ) : null}
                {complete ? (
                  <Link href={day.day < 30 ? `/programme/${day.day + 1}` : "/programme"} className="btn primary">
                    {day.day < 30 ? `Jour ${day.day + 1}` : "Voir le parcours"} <ArrowRight aria-hidden="true" />
                  </Link>
                ) : null}
                <Link href="/aujourdhui" className="btn">Retour</Link>
              </div>
            </section>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
