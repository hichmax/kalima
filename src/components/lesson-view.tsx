"use client";

import { ArrowRight, Info, Lightbulb, Warning } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { alphabet } from "@/content/alphabet";
import type { Block, Lesson } from "@/content/types";
import { ExerciseRunner, type ExerciseResult } from "@/components/exercise-runner";
import { PlayButton, QuranText } from "@/components/quran";
import { ReviewBanner } from "@/components/review-banner";
import { revealStagger } from "@/lib/anime";
import { buildLessonExercises, letterForms } from "@/lib/exercises";
import { recordResults, scoreOf } from "@/lib/progress";
import type { ResolvedRef } from "@/lib/quran-types";
import { useRecitation } from "@/lib/recitation-client";
import { useHydrated } from "@/lib/storage";

export function LessonView({
  lesson,
  sourceLessons,
  refs,
  onDone,
  compact = false,
}: {
  lesson: Lesson;
  /** Leçons dont un bilan tire ses questions (vide sinon). */
  sourceLessons: Lesson[];
  refs: Record<string, ResolvedRef>;
  onDone?: (score: number) => void;
  compact?: boolean;
}) {
  const hydrated = useHydrated();
  const [phase, setPhase] = useState<"learn" | "practice" | "done">(lesson.blocks.length ? "learn" : "practice");
  const [score, setScore] = useState(0);
  const [seed] = useState(() => `${lesson.id}:${Math.random().toString(36).slice(2)}`);

  const exercises = useMemo(
    () => (hydrated ? buildLessonExercises(lesson, [lesson, ...sourceLessons], refs, seed, lesson.track === "bilan" ? 25 : 30) : []),
    [hydrated, lesson, sourceLessons, refs, seed],
  );

  const finish = async (results: ExerciseResult[]) => {
    const value = scoreOf(results);
    setScore(value);
    setPhase("done");
    await recordResults(results);
    onDone?.(value);
  };

  return (
    <article className="stack lesson" style={{ "--gap": "18px" } as React.CSSProperties}>
      {!compact ? (
        <header className="stack" style={{ "--gap": "10px" } as React.CSSProperties}>
          <span className="eyebrow plain">{trackLabel(lesson.track)} · {lesson.minutes} min</span>
          <h1 className="lesson-title">{lesson.title}</h1>
          <p className="lead">{lesson.subtitle}</p>
        </header>
      ) : null}

      {phase === "learn" ? (
        <>
          {lesson.status === "draft" ? <ReviewBanner /> : null}
          {lesson.blocks.map((block, i) => (
            <BlockView key={i} block={block} refs={refs} index={i} />
          ))}
          <button type="button" className="btn primary block" onClick={() => setPhase("practice")}>
            S&apos;entraîner ({exercises.length || "…"} questions) <ArrowRight aria-hidden="true" />
          </button>
        </>
      ) : null}

      {phase === "practice" && exercises.length ? (
        <ExerciseRunner exercises={exercises} onComplete={finish} title={lesson.title} />
      ) : null}

      {phase === "done" ? (
        <div className="glass card stack" style={{ "--gap": "12px" } as React.CSSProperties}>
          <span className="eyebrow plain">Terminé</span>
          <p className="score num">{score} %</p>
          <p className="muted">
            {score >= 80
              ? "Très bien. Ces éléments reviendront dans tes révisions, au bon moment."
              : "Les erreurs font partie de l'apprentissage : ces éléments reviendront plus souvent dans tes révisions."}
          </p>
          <button type="button" className="btn small" onClick={() => setPhase("practice")}>
            Refaire les exercices
          </button>
        </div>
      ) : null}
    </article>
  );
}

const trackLabel = (track: Lesson["track"]) =>
  ({ lecture: "Lecture", tajwid: "Tajwīd", arabe: "Comprendre", bilan: "Bilan" })[track];

function BlockView({ block, refs, index }: { block: Block; refs: Record<string, ResolvedRef>; index: number }) {
  const reduce = useReducedMotion();
  const appear = reduce
    ? {}
    : { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-40px" }, transition: { type: "spring" as const, bounce: 0, duration: 0.6, delay: Math.min(index, 3) * 0.04 } };

  switch (block.kind) {
    case "text":
      return (
        <motion.section className="glass card stack" style={{ "--gap": "8px" } as React.CSSProperties} {...appear}>
          {block.title ? <h3>{block.title}</h3> : null}
          <p className="muted body-text">{block.body}</p>
        </motion.section>
      );
    case "tip": {
      const Icon = block.tone === "warn" ? Warning : block.tone === "review" ? Lightbulb : Info;
      return (
        <motion.aside className={`tip tip-${block.tone}`} {...appear}>
          <Icon size={22} weight="duotone" aria-hidden="true" />
          <p>{block.body}</p>
        </motion.aside>
      );
    }
    case "letters":
      return <LettersBlock chars={block.chars} title={block.title} showForms={block.showForms} />;
    case "table":
      return (
        <motion.section className="glass card stack" style={{ "--gap": "10px" } as React.CSSProperties} {...appear}>
          {block.title ? <h3>{block.title}</h3> : null}
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  {block.head.map((h) => (
                    <th key={h} scope="col">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c} className={block.arabicCols?.includes(c) ? "ar table-ar" : undefined} lang={block.arabicCols?.includes(c) ? "ar" : undefined} dir={block.arabicCols?.includes(c) ? "rtl" : undefined}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      );
    case "syllables":
      return <SyllablesBlock items={block.items} title={block.title} />;
    case "quran":
      return <QuranBlock refData={refs[block.ref]} focus={block.focus} label={block.label} note={block.note} />;
  }
}

function LettersBlock({ chars, title, showForms }: { chars: string[]; title?: string; showForms?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && ref.current) {
        revealStagger(ref.current.querySelectorAll(".letter-tile"), { from: "first" });
        io.disconnect();
      }
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section className="glass card stack" style={{ "--gap": "14px" } as React.CSSProperties}>
      {title ? <h3>{title}</h3> : null}
      <div ref={ref} className="letter-grid" dir="rtl">
        {chars.map((char) => {
          const letter = alphabet.find((l) => l.char === char);
          const forms = letterForms(char);
          return (
            <div key={char} className="letter-tile" style={{ opacity: 0 }}>
              <span className="ar letter-glyph" lang="ar">{char}</span>
              {showForms ? (
                <span className="ar letter-forms" lang="ar" aria-label="formes : début, milieu, fin">
                  {forms.initial} · {forms.medial} · {forms.final}
                </span>
              ) : null}
              <span className="letter-name" dir="ltr">{letter?.name}</span>
              <span className="letter-ph" dir="ltr">{letter?.ph}</span>
            </div>
          );
        })}
      </div>
      {!showForms ? (
        <ul className="letter-sounds">
          {chars.map((char) => {
            const letter = alphabet.find((l) => l.char === char);
            return letter ? (
              <li key={char}>
                <span className="ar" lang="ar">{char}</span> <span className="muted">{letter.sound}</span>
              </li>
            ) : null;
          })}
        </ul>
      ) : null}
    </section>
  );
}

function SyllablesBlock({ items, title }: { items: Array<{ ar: string; ph: string }>; title?: string }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  return (
    <section className="glass card stack" style={{ "--gap": "12px" } as React.CSSProperties}>
      {title ? <h3>{title}</h3> : null}
      <p className="faint">Lis chaque syllabe à voix haute, puis touche-la pour vérifier.</p>
      <div className="syllable-grid" dir="rtl">
        {items.map((item, i) => (
          <button
            key={item.ar}
            type="button"
            className="syllable"
            onClick={() => setRevealed((prev) => new Set(prev).add(i))}
            aria-label={revealed.has(i) ? `${item.ar} : ${item.ph}` : `Syllabe ${i + 1}, toucher pour vérifier`}
          >
            <span className="ar" lang="ar">{item.ar}</span>
            <span className="syllable-ph" dir="ltr" data-shown={revealed.has(i)}>{revealed.has(i) ? item.ph : "?"}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function QuranBlock({ refData, focus, label, note }: { refData?: ResolvedRef; focus?: [number, number]; label?: string; note?: string }) {
  const recitation = useRecitation(refData?.s ?? null);
  if (!refData) return null;
  const media = recitation?.verses?.find((v) => v.v === refData.v);
  const wordAudio = focus && focus[0] === focus[1] ? media?.words[focus[0] - 1] : null;
  return (
    <section className="glass card stack quran-block" style={{ "--gap": "10px" } as React.CSSProperties}>
      {label ? <h3>{label}</h3> : null}
      <QuranText words={refData.words} focus={focus} verse={refData.range ? undefined : refData.v} />
      <div className="row between">
        <span className="faint">Coran {refData.s}:{refData.v} · texte Tanzil</span>
        <div className="row" style={{ "--gap": "8px" } as React.CSSProperties}>
          {wordAudio ? <PlayButton src={wordAudio} label="Le mot" small /> : null}
          {media?.audio ? <PlayButton src={media.audio} label="Le verset" small /> : null}
        </div>
      </div>
      {note ? <p className="muted">{note}</p> : null}
    </section>
  );
}
