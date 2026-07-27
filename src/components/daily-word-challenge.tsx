"use client";

import {
  ArrowCounterClockwise,
  ArrowRight,
  CheckCircle,
  Fire,
  Sparkle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { QuranAudioPlayer } from "@/components/quran-audio-player";
import { SourceReference } from "@/components/source-reference";
import { useApp } from "@/components/providers";
import { isPreviousDay } from "@/lib/daily-challenge";
import { getWordPhonetic } from "@/lib/phonetics";
import type {
  LearningRating,
  VocabularyUnit,
} from "@/lib/types";

const ratings: {
  value: LearningRating;
  label: string;
  description: string;
}[] = [
  { value: "again", label: "À revoir", description: "Je ne le savais pas" },
  { value: "hard", label: "Difficile", description: "J’ai hésité" },
  { value: "good", label: "Correct", description: "Je l’ai retrouvé" },
  { value: "easy", label: "Facile", description: "Je le connaissais" },
];

const ratingLabel = Object.fromEntries(
  ratings.map((rating) => [rating.value, rating.label]),
) as Record<LearningRating, string>;

export function DailyWordChallenge({
  date,
  words,
}: {
  date: string;
  words: VocabularyUnit[];
}) {
  const { progress, updateProgress } = useApp();
  const [revealed, setRevealed] = useState(false);
  const challenge = progress.dailyChallenge;
  const isTodayState = challenge.date === date;
  const completedWordIds = useMemo(
    () => (isTodayState ? challenge.completedWordIds : []),
    [challenge.completedWordIds, isTodayState],
  );
  const savedRatings = isTodayState ? challenge.ratings : {};
  const completedCount = words.filter((word) =>
    completedWordIds.includes(word.id),
  ).length;
  const currentWord = words.find(
    (word) => !completedWordIds.includes(word.id),
  );
  const currentIndex = currentWord
    ? words.findIndex((word) => word.id === currentWord.id)
    : words.length;
  const isComplete = completedCount === words.length && words.length > 0;

  const gradeWord = (wordId: string, rating: LearningRating) => {
    if (completedWordIds.includes(wordId)) return;
    const nextCompleted = [...completedWordIds, wordId];
    const nowComplete = nextCompleted.length === words.length;
    const nextStreak = nowComplete
      ? challenge.lastCompletedDate === date
        ? challenge.streak
        : isPreviousDay(challenge.lastCompletedDate, date)
          ? challenge.streak + 1
          : 1
      : challenge.streak;

    updateProgress({
      learnedWordIds: Array.from(
        new Set([...progress.learnedWordIds, wordId]),
      ),
      dailyChallenge: {
        date,
        completedWordIds: nextCompleted,
        ratings: { ...savedRatings, [wordId]: rating },
        streak: nextStreak,
        lastCompletedDate: nowComplete
          ? date
          : challenge.lastCompletedDate,
      },
    });
    setRevealed(false);
  };

  const restartChallenge = () => {
    updateProgress({
      dailyChallenge: {
        date,
        completedWordIds: [],
        ratings: {},
        streak: challenge.streak,
        lastCompletedDate: challenge.lastCompletedDate,
      },
    });
    setRevealed(false);
  };

  return (
    <div className="daily-challenge-layout">
      <section className="challenge-hero">
        <div className="stack" style={{ gap: 18 }}>
          <p className="eyebrow">
            Défi du jour · {date.split("-").reverse().join(".")}
          </p>
          <h1 className="page-title">
            {isComplete
              ? "Tes cinq mots sont terminés pour aujourd’hui."
              : "Écoute, prononce, puis révèle le sens."}
          </h1>
          <p>
            Le mot français reste caché jusqu’à ta réponse. Après l’avoir
            révélé, indique ton niveau de facilité pour passer au mot suivant.
          </p>
        </div>
        <div
          className="challenge-score"
          aria-label={`${completedCount} mots sur 5 terminés`}
        >
          <span>
            {completedCount}
            <small>/5</small>
          </span>
          <div className="progress-track" aria-hidden="true">
            <div
              className="progress-fill"
              style={{
                width: `${(completedCount / Math.max(words.length, 1)) * 100}%`,
              }}
            />
          </div>
          <p>
            <Fire size={18} /> {challenge.streak} jour
            {challenge.streak === 1 ? "" : "s"} de suite
          </p>
        </div>
      </section>

      {!isComplete && currentWord ? (
        <section
          className={`challenge-chain-card card ${revealed ? "revealed" : ""}`}
          aria-live="polite"
        >
          <div className="challenge-chain-top">
            <span className="eyebrow">
              Mot {currentIndex + 1} sur {words.length}
            </span>
            <QuranAudioPlayer
              src={currentWord.audioUrl}
              compact
              label={`Écouter ${currentWord.arabic}`}
            />
          </div>

          <div className="challenge-chain-prompt">
            <p className="quran-text" lang="ar" dir="rtl" translate="no">
              {currentWord.arabic}
            </p>
            <p className="challenge-phonetic" lang="fr-Latn" dir="ltr">
              {getWordPhonetic(currentWord)}
            </p>
            <p className="muted">
              Prononce le mot à voix haute. Quel est son sens ici ?
            </p>
          </div>

          {revealed ? (
            <div className="challenge-revealed">
              <span className="eyebrow">Réponse</span>
              <h2 lang="fr" dir="ltr">{currentWord.primaryMeaningFr}</h2>
              <p className="muted">
                Première occurrence étudiée :{" "}
                {currentWord.examples[0]?.replaceAll(":", " : ")}
              </p>
              <div
                className="challenge-rating-controls"
                aria-label="Évaluer la réponse"
              >
                {ratings.map((rating) => (
                  <button
                    type="button"
                    key={rating.value}
                    onClick={() => gradeWord(currentWord.id, rating.value)}
                  >
                    <strong>{rating.label}</strong>
                    <small>{rating.description}</small>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              className="btn btn-primary challenge-reveal-button"
              type="button"
              onClick={() => setRevealed(true)}
            >
              Révéler la réponse <Sparkle size={18} />
            </button>
          )}
          <SourceReference sourceIds={currentWord.sourceIds} />
        </section>
      ) : null}

      {isComplete ? (
        <section className="challenge-summary" aria-label="Résumé des cinq mots">
          {words.map((word) => (
            <article className="challenge-summary-card card" key={word.id}>
              <CheckCircle size={20} weight="fill" />
              <p className="quran-text" lang="ar" dir="rtl">{word.arabic}</p>
              <span className="challenge-phonetic" lang="fr-Latn" dir="ltr">
                {getWordPhonetic(word)}
              </span>
              <strong lang="fr" dir="ltr">{word.primaryMeaningFr}</strong>
              <small>
                {ratingLabel[savedRatings[word.id]] || "Terminé"}
              </small>
              <QuranAudioPlayer
                src={word.audioUrl}
                compact
                label={`Écouter ${word.arabic}`}
              />
            </article>
          ))}
        </section>
      ) : null}

      <section
        className={`challenge-finish card card-pad ${
          isComplete ? "visible" : ""
        }`}
      >
        <div>
          <p className="eyebrow">Progression locale</p>
          <h2>
            {isComplete
              ? "Bravo — retrouve maintenant ces mots dans les versets."
              : `Encore ${words.length - completedCount} mot${words.length - completedCount === 1 ? "" : "s"} aujourd’hui.`}
          </h2>
        </div>
        <div className="cluster">
          {isComplete ? (
            <button
              className="btn btn-primary"
              type="button"
              onClick={restartChallenge}
            >
              <ArrowCounterClockwise size={18} /> Refaire les 5 mots
            </button>
          ) : null}
          <Link className="btn btn-secondary" href="/coran">
            Ouvrir le Coran <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
