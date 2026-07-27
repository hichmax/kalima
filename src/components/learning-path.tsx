"use client";

import {
  ArrowRight,
  Compass,
  GraduationCap,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { BeginnerLesson } from "@/components/beginner-lesson";
import { useApp } from "@/components/providers";
import {
  beginnerLessons,
  learningTracks,
  lessonById,
  type LearningTrackId,
} from "@/data/lessons";

const stageLabels: Record<LearningTrackId, string> = {
  alphabet: "Alphabet et sons",
  decoding: "Former et lire",
  reading: "Lire le muṣḥaf",
  tajweed: "Fondations du tajwīd",
};

export function LearningPath({
  audioByReference,
}: {
  audioByReference: Record<string, string>;
}) {
  const { progress } = useApp();
  const [selectedTrack, setSelectedTrack] =
    useState<LearningTrackId | null>(null);
  const recommended =
    lessonById.get(progress.learningProfile.recommendedLessonId) ||
    beginnerLessons[0];
  const activeTrack = selectedTrack || recommended.track;
  const trackLessons = beginnerLessons.filter(
    (lesson) => lesson.track === activeTrack,
  );
  const completedInTrack = trackLessons.filter((lesson) =>
    progress.completedLessons.includes(lesson.id),
  ).length;
  const totalCompleted = beginnerLessons.filter((lesson) =>
    progress.completedLessons.includes(lesson.id),
  ).length;

  return (
    <div className="learning-path">
      <section className="learning-path-hero card card-pad">
        <div>
          <p className="eyebrow">
            {progress.learningProfile.completed
              ? "Parcours recommandé"
              : "Évaluation non terminée"}
          </p>
          <h2>
            {progress.learningProfile.completed
              ? `Commence par « ${recommended.title} »`
              : "Réponds au questionnaire pour trouver ton vrai point de départ."}
          </h2>
          <p className="muted">
            {progress.learningProfile.completed
              ? `Niveau détecté : ${stageLabels[recommended.track]}. Les autres étapes restent accessibles librement.`
              : "Tes réponses choisiront un niveau, une première leçon, la phonétique et des exemples adaptés."}
          </p>
          <div className="cluster">
            {progress.learningProfile.completed ? (
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  setSelectedTrack(recommended.track);
                  document
                    .getElementById(recommended.id)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                Aller à ma leçon <ArrowRight size={18} />
              </button>
            ) : (
              <Link className="btn btn-primary" href="/onboarding">
                Faire l’évaluation <Compass size={18} />
              </Link>
            )}
            <Link className="btn btn-secondary" href="/onboarding">
              Refaire le questionnaire
            </Link>
          </div>
        </div>
        <div className="learning-total-progress">
          <GraduationCap size={30} />
          <strong>
            {totalCompleted}
            <small>/{beginnerLessons.length}</small>
          </strong>
          <span>leçons terminées</span>
        </div>
      </section>

      <nav className="learning-track-nav" aria-label="Étapes du parcours">
        {learningTracks.map((track) => {
          const count = beginnerLessons.filter(
            (lesson) => lesson.track === track.id,
          ).length;
          const done = beginnerLessons.filter(
            (lesson) =>
              lesson.track === track.id &&
              progress.completedLessons.includes(lesson.id),
          ).length;
          return (
            <button
              className={activeTrack === track.id ? "active" : ""}
              type="button"
              key={track.id}
              onClick={() => setSelectedTrack(track.id)}
              aria-pressed={activeTrack === track.id}
            >
              <span>{track.label}</span>
              <strong>{track.title}</strong>
              <small>
                {done}/{count} leçons
              </small>
            </button>
          );
        })}
      </nav>

      <section className="learning-track-intro card card-pad">
        <div>
          <p className="eyebrow">Étape {learningTracks.findIndex((track) => track.id === activeTrack) + 1}</p>
          <h2>{learningTracks.find((track) => track.id === activeTrack)?.title}</h2>
          <p className="muted">
            {learningTracks.find((track) => track.id === activeTrack)?.description}
          </p>
        </div>
        <div>
          <span>
            {completedInTrack}/{trackLessons.length}
          </span>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${(completedInTrack / Math.max(trackLessons.length, 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="lesson-list" aria-label="Leçons de cette étape">
        {trackLessons.map((lesson) => {
          const globalIndex = beginnerLessons.findIndex(
            (item) => item.id === lesson.id,
          );
          return (
            <BeginnerLesson
              lesson={lesson}
              key={lesson.id}
              recommended={recommended.id === lesson.id}
              audioSrc={
                lesson.audioReference
                  ? audioByReference[lesson.audioReference]
                  : undefined
              }
              nextLessonId={beginnerLessons[globalIndex + 1]?.id}
            />
          );
        })}
      </section>

      <aside className="learning-safety-note card card-pad">
        <strong>À propos du tajwīd</strong>
        <p>
          Kalima peut montrer une règle, fournir un exemple et faire écouter une
          récitation. La correction précise des points d’articulation et de la
          récitation doit être faite par une personne qualifiée qui t’écoute.
        </p>
      </aside>
    </div>
  );
}
