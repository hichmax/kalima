"use client";

import {
  ArrowRight,
  Check,
  CheckCircle,
  ListChecks,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";
import { AlphabetAudioGrid } from "@/components/alphabet-audio-grid";
import { QuranAudioPlayer } from "@/components/quran-audio-player";
import { SourceReference } from "@/components/source-reference";
import { useApp } from "@/components/providers";
import { type BeginnerLessonData } from "@/data/lessons";

export function BeginnerLesson({
  lesson,
  recommended,
  audioSrc,
  nextLessonId,
}: {
  lesson: BeginnerLessonData;
  recommended: boolean;
  audioSrc?: string;
  nextLessonId?: string;
}) {
  const { progress, updateProgress } = useApp();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const completed = progress.completedLessons.includes(lesson.id);
  const correct = answer === lesson.quiz.correctIndex;

  const openLesson = () => {
    if (mounted) {
      setOpen(true);
      return;
    }

    setMounted(true);
    window.requestAnimationFrame(() => setOpen(true));
  };

  return (
    <article
      className={`beginner-lesson-shell card ${open ? "open" : ""} ${
        completed ? "completed" : ""
      } ${recommended ? "recommended" : ""}`}
      id={lesson.id}
    >
      <button
        className="lesson-card"
        type="button"
        onClick={open ? () => setOpen(false) : openLesson}
        aria-expanded={open}
        aria-controls={`${lesson.id}-drawer`}
      >
        <span className="lesson-module">
          Leçon {String(lesson.order).padStart(2, "0")}
        </span>
        <span className="lesson-card-main">
          <strong>{lesson.title}</strong>
          <small>{lesson.summary}</small>
        </span>
        <span className="lesson-duration">
          {completed ? (
            <CheckCircle size={20} weight="fill" />
          ) : recommended ? (
            "Commencer ici"
          ) : (
            `${lesson.duration} min`
          )}
        </span>
      </button>

      <div
        className="beginner-lesson-drawer"
        id={`${lesson.id}-drawer`}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="beginner-lesson-drawer-inner">
          {mounted ? (
            <div className="beginner-lesson-open">
              <div className="beginner-lesson-head">
                <div>
                  <p className="eyebrow">
                    Leçon {lesson.order} · {lesson.duration} minutes
                  </p>
                  <h2 className="section-title">{lesson.title}</h2>
                  <p className="lead">{lesson.summary}</p>
                </div>
                <button
                  className="btn btn-ghost btn-icon"
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer la leçon"
                >
                  <X size={20} />
                </button>
              </div>

      <div className="lesson-objectives">
        <div>
          <ListChecks size={22} />
          <strong>À la fin de cette leçon</strong>
        </div>
        <ul>
          {lesson.objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </div>

      <div className="lesson-explanation">
        {lesson.explanation.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {lesson.visual === "alphabet" ? (
        <AlphabetAudioGrid />
      ) : null}

      {lesson.visual === "joining" ? (
        <div className="joining-visual" aria-label="Formes liées de la lettre bāʾ">
          {[
            ["ب", "isolée"],
            ["بـ", "initiale"],
            ["ـبـ", "médiane"],
            ["ـب", "finale"],
          ].map(([arabic, label]) => (
            <span key={label}>
              <strong className="quran-text" lang="ar" dir="rtl">
                {arabic}
              </strong>
              <small>{label}</small>
            </span>
          ))}
        </div>
      ) : null}

      {lesson.visual === "tajweed-map" ? (
        <div className="tajweed-map">
          {[
            ["01", "Lettre", "point d’articulation"],
            ["02", "Qualité", "légère, emphatique, résonante…"],
            ["03", "Durée", "voyelle courte ou prolongation"],
            ["04", "Liaison", "effet de la lettre suivante"],
          ].map(([number, title, detail]) => (
            <article key={number}>
              <span>{number}</span>
              <strong>{title}</strong>
              <small>{detail}</small>
            </article>
          ))}
        </div>
      ) : null}

      <section className="lesson-practice">
        <div className="lesson-practice-head">
          <div>
            <p className="eyebrow">Observer, lire, vérifier</p>
            <h3>Exemples de pratique</h3>
          </div>
          <QuranAudioPlayer
            src={audioSrc}
            compact
            label="Écouter l’exemple coranique"
          />
        </div>
        <div className="lesson-example-grid">
          {lesson.examples.map((example) => (
            <article key={`${example.arabic}-${example.phonetic}`}>
              <p className="quran-text" lang="ar" dir="rtl">
                {example.arabic}
              </p>
              <strong lang="fr-Latn" dir="ltr">
                {example.phonetic}
              </strong>
              {example.translation ? (
                <small lang="fr" dir="ltr">
                  {example.translation}
                </small>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="mini-exercise">
        <p className="eyebrow">Vérification rapide</p>
        <h3>{lesson.quiz.question}</h3>
        <div className="lesson-quiz-options">
          {lesson.quiz.options.map((option, index) => (
            <button
              className={`exercise-choice ${
                answer === index ? "selected" : ""
              }`}
              type="button"
              key={option}
              onClick={() => setAnswer(index)}
              aria-pressed={answer === index}
            >
              <span
                className={
                  /[\u0600-\u06ff]/u.test(option)
                    ? "quran-text lesson-quiz-arabic"
                    : undefined
                }
                lang={/[\u0600-\u06ff]/u.test(option) ? "ar" : undefined}
                dir={/[\u0600-\u06ff]/u.test(option) ? "rtl" : undefined}
              >
                {option}
              </span>
              {answer === index ? <Check size={18} weight="bold" /> : null}
            </button>
          ))}
        </div>
        {answer !== null ? (
          <div
            className={`exercise-feedback ${
              correct ? "correct" : "incorrect"
            }`}
            role="status"
          >
            {correct ? lesson.quiz.success : lesson.quiz.retry}
          </div>
        ) : null}
      </section>

      <SourceReference sourceIds={lesson.sourceIds} />

      <div className="lesson-completion">
        <p className="muted">
          {completed
            ? "Cette leçon est déjà enregistrée comme terminée."
            : "Réponds correctement avant de terminer la leçon."}
        </p>
        <button
          className="btn btn-primary"
          type="button"
          disabled={!correct && !completed}
          onClick={() => {
            if (!completed) {
              updateProgress({
                completedLessons: [
                  ...progress.completedLessons,
                  lesson.id,
                ],
                learningProfile: {
                  ...progress.learningProfile,
                  recommendedLessonId: nextLessonId || lesson.id,
                },
              });
            }
            setOpen(false);
          }}
        >
          {completed ? "Fermer" : "Terminer et continuer"}{" "}
          <ArrowRight size={18} />
        </button>
      </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
