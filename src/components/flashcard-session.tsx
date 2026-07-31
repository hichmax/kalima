"use client";

import {
  ArrowRight,
  BookOpenText,
  CheckCircle,
  Play,
  Repeat,
  StopCircle,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { QuranAudioPlayer } from "@/components/quran-audio-player";
import { SourceReference } from "@/components/source-reference";
import { useApp } from "@/components/providers";
import { getWordPhonetic } from "@/lib/phonetics";
import {
  selectRandomReviewUnits,
  type ReviewChoice,
} from "@/lib/review";
import type { PracticeWord } from "@/lib/types";

const controls: { choice: ReviewChoice; label: string; hint: string }[] = [
  { choice: "again", label: "À revoir", hint: "Je ne l’avais pas" },
  { choice: "hard", label: "Difficile", hint: "J’ai beaucoup hésité" },
  { choice: "good", label: "Correct", hint: "Je l’ai retrouvé" },
  { choice: "easy", label: "Facile", hint: "Le mot est acquis" },
];

const countOptions = [5, 10, 20, 30, 50] as const;

type SessionState = "setup" | "active" | "summary";

export function FlashcardSession({
  units,
  masteredWordIds: controlledMasteredWordIds,
  onMasterWord,
  poolLabel = "toute la base",
}: {
  units: PracticeWord[];
  masteredWordIds?: string[];
  onMasterWord?: (wordId: string) => void;
  poolLabel?: string;
}) {
  const [selectedCount, setSelectedCount] = useState(10);
  const [sessionState, setSessionState] = useState<SessionState>("setup");
  const [queueIds, setQueueIds] = useState<string[]>([]);
  const [sessionUnitIds, setSessionUnitIds] = useState<string[]>([]);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [lastRatings, setLastRatings] = useState<
    Record<string, ReviewChoice>
  >({});
  const [revealed, setRevealed] = useState(false);
  const [stoppedEarly, setStoppedEarly] = useState(false);
  const { progress, updateProgress } = useApp();

  const unitById = useMemo(
    () => new Map(units.map((unit) => [unit.id, unit])),
    [units],
  );
  const currentUnit = unitById.get(queueIds[0]);
  const persistentMasteredWordIds =
    controlledMasteredWordIds ?? progress.reviewMasteredWordIds;
  const masteredWordIds = useMemo(
    () => new Set(persistentMasteredWordIds),
    [persistentMasteredWordIds],
  );
  const availableUnits = useMemo(
    () => units.filter((unit) => !masteredWordIds.has(unit.id)),
    [masteredWordIds, units],
  );
  const visibleCountOptions =
    availableUnits.length > 0 && availableUnits.length < 5
      ? [availableUnits.length]
      : countOptions;
  const sessionUnits = sessionUnitIds
    .map((id) => unitById.get(id))
    .filter((unit): unit is PracticeWord => Boolean(unit));

  const startSession = () => {
    const selected = selectRandomReviewUnits(
      units,
      selectedCount,
      persistentMasteredWordIds,
    );
    const ids = selected.map((unit) => unit.id);
    setSessionUnitIds(ids);
    setQueueIds(ids);
    setMasteredIds([]);
    setAttempts({});
    setLastRatings({});
    setRevealed(false);
    setStoppedEarly(false);
    setSessionState("active");
    updateProgress({ reviewCount: ids.length });
  };

  const grade = (choice: ReviewChoice) => {
    if (!currentUnit) return;
    const currentId = currentUnit.id;
    const nextAttempts = {
      ...attempts,
      [currentId]: (attempts[currentId] || 0) + 1,
    };
    const nextRatings = { ...lastRatings, [currentId]: choice };
    const nextMastered =
      choice === "easy"
        ? Array.from(new Set([...masteredIds, currentId]))
        : masteredIds;
    const nextQueue = queueIds.slice(1);
    if (choice !== "easy") nextQueue.push(currentId);

    setAttempts(nextAttempts);
    setLastRatings(nextRatings);
    setMasteredIds(nextMastered);
    setQueueIds(nextQueue);
    setRevealed(false);
    if (choice === "easy") {
      onMasterWord?.(currentId);
      updateProgress({
        reviewCount: nextQueue.length,
        ...(controlledMasteredWordIds === undefined
          ? {
              reviewMasteredWordIds: Array.from(
                new Set([...progress.reviewMasteredWordIds, currentId]),
              ),
            }
          : {}),
        learnedWordIds: Array.from(
          new Set([...progress.learnedWordIds, currentId]),
        ),
      });
    } else {
      updateProgress({ reviewCount: nextQueue.length });
    }

    if (!nextQueue.length) {
      setStoppedEarly(false);
      setSessionState("summary");
    }
  };

  const stopSession = () => {
    setStoppedEarly(true);
    setRevealed(false);
    setSessionState("summary");
    updateProgress({ reviewCount: queueIds.length });
  };

  if (sessionState === "setup") {
    return (
      <section className="review-setup card card-pad">
        <div>
          <p className="eyebrow">Préparer la séance</p>
          <h2>Combien de mots veux-tu réviser ?</h2>
          <p className="muted">
            Chaque séance tire au hasard dans les {availableUnits.length} mot
            {availableUnits.length === 1 ? "" : "s"} encore disponible
            {availableUnits.length === 1 ? "" : "s"} de {poolLabel}. Un mot classé{" "}
            <strong>Facile</strong> ne sera plus proposé dans les prochaines
            séances.
          </p>
        </div>
        <div className="review-count-options" aria-label="Nombre de mots">
          {visibleCountOptions.map((count) => (
            <button
              className={selectedCount === count ? "selected" : ""}
              type="button"
              key={count}
              onClick={() => setSelectedCount(count)}
              aria-pressed={selectedCount === count}
              disabled={count > availableUnits.length}
            >
              <strong>{count}</strong>
              <small>mots</small>
            </button>
          ))}
        </div>
        <div className="review-setup-note">
          <Repeat size={20} />
          <span>
            Un mot revient dans la file tant que tu ne l’as pas classé{" "}
            <strong>Facile</strong>. Tu peux arrêter quand tu veux et consulter
            ton résumé.
          </span>
        </div>
        <button
          className="btn btn-primary"
          type="button"
          onClick={startSession}
          disabled={availableUnits.length === 0}
        >
          {availableUnits.length
            ? `Commencer avec ${Math.min(selectedCount, availableUnits.length)} mot${Math.min(selectedCount, availableUnits.length) === 1 ? "" : "s"}`
            : "Tous les mots sont classés Facile"}{" "}
          <Play size={18} weight="fill" />
        </button>
      </section>
    );
  }

  if (sessionState === "summary") {
    return (
      <section className="review-summary card card-pad">
        <div className="review-summary-head">
          <div>
            <p className="eyebrow">
              {stoppedEarly ? "Séance interrompue" : "Séance terminée"}
            </p>
            <h2>
              {masteredIds.length} mot{masteredIds.length === 1 ? "" : "s"}{" "}
              facile{masteredIds.length === 1 ? "" : "s"} sur{" "}
              {sessionUnitIds.length}
            </h2>
            <p className="muted">
              {stoppedEarly
                ? `${queueIds.length} mot${queueIds.length === 1 ? "" : "s"} reste${queueIds.length === 1 ? "" : "nt"} dans la file.`
                : "Tous les mots sélectionnés ont finalement été classés Facile."}
            </p>
          </div>
          <CheckCircle
            size={42}
            weight={stoppedEarly ? "regular" : "fill"}
          />
        </div>

        <div className="review-summary-list">
          {sessionUnits.map((unit) => {
            const rating = controls.find(
              (control) => control.choice === lastRatings[unit.id],
            );
            return (
              <article key={unit.id}>
                <span className="quran-text" lang="ar" dir="rtl">
                  {unit.arabic}
                </span>
                <span>
                  <strong>{unit.primaryMeaningFr}</strong>
                  <small>{getWordPhonetic(unit)}</small>
                </span>
                <span>
                  <strong>{rating?.label || "Pas encore vu"}</strong>
                  <small>
                    {attempts[unit.id] || 0} tentative
                    {(attempts[unit.id] || 0) === 1 ? "" : "s"}
                  </small>
                </span>
              </article>
            );
          })}
        </div>

        <div className="review-summary-actions">
          {stoppedEarly && queueIds.length ? (
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => setSessionState("active")}
            >
              Reprendre les {queueIds.length} mots <ArrowRight size={18} />
            </button>
          ) : null}
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => setSessionState("setup")}
          >
            Choisir une nouvelle séance
          </button>
        </div>
      </section>
    );
  }

  if (!currentUnit) {
    return <p className="card card-pad">Aucun mot disponible.</p>;
  }

  return (
    <div className="flashcard-session">
      <div className="review-session-head">
        <span>
          {masteredIds.length} facile{masteredIds.length === 1 ? "" : "s"}
        </span>
        <div
          className="progress-track"
          aria-label={`${masteredIds.length} mots faciles sur ${sessionUnitIds.length}`}
        >
          <div
            className="progress-fill"
            style={{
              width: `${(masteredIds.length / Math.max(sessionUnitIds.length, 1)) * 100}%`,
            }}
          />
        </div>
        <span>{queueIds.length} dans la file</span>
      </div>

      <div className="review-active-actions">
        <span className="muted">
          Tentative {(attempts[currentUnit.id] || 0) + 1} pour ce mot
        </span>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={stopSession}
        >
          <StopCircle size={18} /> Arrêter et voir le résumé
        </button>
      </div>

      <article
        className={`flashcard card ${revealed ? "revealed" : ""}`}
        data-review-unit-id={currentUnit.id}
      >
        <div className="flashcard-top">
          <span className="chip">
            {currentUnit.occurrences} occurrences
          </span>
          <QuranAudioPlayer
            src={currentUnit.audioUrl}
            compact
            label={`Écouter ${currentUnit.arabic}`}
          />
        </div>
        <div className="flashcard-face">
          <p className="quran-text" lang="ar" dir="rtl">
            {currentUnit.arabic}
          </p>
          <p className="flashcard-phonetic" lang="fr-Latn" dir="ltr">
            {getWordPhonetic(currentUnit)}
          </p>
          <p className="muted">Que signifie ce mot dans cette occurrence ?</p>
        </div>
        {revealed ? (
          <div className="flashcard-answer" role="status">
            <span className="eyebrow">Réponse</span>
            <h2 lang="fr" dir="ltr">
              {currentUnit.primaryMeaningFr}
            </h2>
            <p>
              Forme de base :{" "}
              <span className="quran-text">{currentUnit.lemma}</span>
            </p>
            <div className="row">
              <BookOpenText size={18} />
              <span>
                Exemple : {currentUnit.examples[0]?.replaceAll(":", " : ") || "référence contextuelle"}
              </span>
            </div>
            <SourceReference sourceIds={currentUnit.sourceIds} />
          </div>
        ) : (
          <button
            className="btn btn-primary reveal-button"
            type="button"
            onClick={() => setRevealed(true)}
          >
            Révéler la réponse <ArrowRight size={18} />
          </button>
        )}
      </article>

      {revealed ? (
        <div className="flashcard-controls" aria-label="Évaluer la réponse">
          {controls.map((control) => (
            <button
              type="button"
              key={control.choice}
              onClick={() => grade(control.choice)}
            >
              <strong>{control.label}</strong>
              <small>{control.hint}</small>
            </button>
          ))}
        </div>
      ) : (
        <p className="review-shortcut">
          <Repeat size={16} /> Révèle d’abord la réponse, puis choisis ton niveau.
        </p>
      )}
    </div>
  );
}
