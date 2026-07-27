"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/providers";
import { lessonById } from "@/data/lessons";
import { buildLearningProfile } from "@/lib/learning-profile";

const steps = [
  {
    id: "letters",
    question: "Reconnais-tu déjà les lettres arabes isolées ?",
    helper:
      "Pense à une lettre montrée seule, sans essayer de lire un mot.",
    options: [
      "Aucune pour l’instant",
      "Quelques-unes",
      "La plupart",
      "Toutes",
    ],
  },
  {
    id: "reading",
    question: "Peux-tu lire un mot entièrement vocalisé ?",
    helper:
      "Exemple : lire كَتَبَ grâce aux signes, sans l’avoir appris par cœur.",
    options: [
      "Pas encore",
      "Très lentement",
      "Avec un peu d’aide",
      "Oui, seul",
    ],
  },
  {
    id: "vocabulary",
    question: "Combien de mots coraniques sais-tu traduire ?",
    helper:
      "Cette réponse ajuste la place du vocabulaire dans tes premières séances.",
    options: ["Aucun", "Moins de 20", "Entre 20 et 100", "Plus de 100"],
  },
  {
    id: "memorized",
    question: "Quelles sourates peux-tu réciter entièrement ?",
    helper:
      "Elles seront directement cochées dans ta page Progression.",
    options: [
      "Aucune",
      "Al-Fātiḥa seulement",
      "Al-Fātiḥa + Al-Ikhlāṣ, Al-Falaq et An-Nās",
      "Ces quatre sourates et d’autres",
    ],
  },
  {
    id: "goal",
    question: "Quel est ton objectif prioritaire maintenant ?",
    helper:
      "Il détermine la première leçon recommandée, pas l’accès au reste.",
    options: [
      "Apprendre l’alphabet",
      "Lire le Coran sans phonétique",
      "Améliorer mon tajwīd",
      "Apprendre les mots du Coran",
    ],
  },
] as const;

const durations = [5, 10, 15, 20, 30] as const;

export function OnboardingFlow() {
  const router = useRouter();
  const { progress, updateProgress } = useApp();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [minutes, setMinutes] =
    useState<(typeof durations)[number]>(progress.dailyMinutes || 10);
  const atDuration = step === steps.length;
  const atResult = step === steps.length + 1;
  const current = steps[step];
  const selected = atDuration
    ? String(minutes)
    : atResult
      ? "result"
      : answers[current.id];
  const profile = atResult ? buildLearningProfile(answers) : null;
  const recommended = profile
    ? lessonById.get(profile.recommendedLessonId)
    : null;

  const finish = () => {
    const result = buildLearningProfile(answers);
    updateProgress({
      dailyMinutes: minutes,
      lastRoute: `/apprendre#${result.recommendedLessonId}`,
      phoneticAssist: result.phoneticAssist,
      learnedSurahIds: Array.from(
        new Set([
          ...progress.learnedSurahIds,
          ...result.learnedSurahIds,
        ]),
      ).sort((a, b) => a - b),
      learningProfile: {
        completed: true,
        stage: result.stage,
        goal: result.goal,
        recommendedLessonId: result.recommendedLessonId,
        answers,
      },
    });
    router.push(`/apprendre#${result.recommendedLessonId}`);
  };

  return (
    <div className="onboarding-flow card">
      <div className="onboarding-progress">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${((step + 1) / (steps.length + 2)) * 100}%`,
            }}
          />
        </div>
        <span>
          {step + 1} / {steps.length + 2}
        </span>
      </div>

      <div className="onboarding-body">
        <p className="eyebrow">
          {atResult ? "Ton parcours calculé" : "Ton point de départ"}
        </p>
        <h1 className="page-title">
          {atResult
            ? `Commence par « ${recommended?.title} »`
            : atDuration
              ? "Combien de temps veux-tu consacrer chaque jour ?"
              : current.question}
        </h1>
        <p className="lead">
          {atResult
            ? profile?.rationale
            : atDuration
              ? "Le nombre de leçons proposées sur l’accueil s’adaptera à cette durée."
              : current.helper}
        </p>

        {atResult && profile ? (
          <div className="onboarding-result">
            <div>
              <span>Niveau de départ</span>
              <strong>
                {profile.stage === "alphabet"
                  ? "Alphabet"
                  : profile.stage === "decoding"
                    ? "Lecture des mots"
                    : profile.stage === "reading"
                      ? "Lecture du muṣḥaf"
                      : "Tajwīd"}
              </strong>
            </div>
            <div>
              <span>Première leçon</span>
              <strong>{recommended?.title}</strong>
            </div>
            <div>
              <span>Phonétique</span>
              <strong>
                {profile.phoneticAssist === "complete"
                  ? "Toujours visible"
                  : "Retrait progressif"}
              </strong>
            </div>
            <div>
              <span>Rythme</span>
              <strong>{minutes} minutes par jour</strong>
            </div>
            <div>
              <span>Sourates enregistrées</span>
              <strong>{profile.learnedSurahIds.length}</strong>
            </div>
          </div>
        ) : atDuration ? (
          <div className="onboarding-options duration-options">
            {durations.map((duration) => (
              <button
                className={minutes === duration ? "selected" : ""}
                key={duration}
                type="button"
                onClick={() => setMinutes(duration)}
                aria-pressed={minutes === duration}
              >
                <strong>{duration} min</strong>
                <small>
                  {duration <= 5
                    ? "1 leçon courte"
                    : duration <= 15
                      ? "1 leçon + pratique"
                      : "Parcours approfondi"}
                </small>
                {minutes === duration ? (
                  <Check size={18} weight="bold" />
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <div className="onboarding-options">
            {current.options.map((option) => (
              <button
                className={
                  answers[current.id] === option ? "selected" : ""
                }
                key={option}
                type="button"
                onClick={() =>
                  setAnswers((value) => ({
                    ...value,
                    [current.id]: option,
                  }))
                }
                aria-pressed={answers[current.id] === option}
              >
                <strong>{option}</strong>
                {answers[current.id] === option ? (
                  <Check size={18} weight="bold" />
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="onboarding-actions">
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => setStep((value) => Math.max(0, value - 1))}
          disabled={step === 0}
        >
          <ArrowLeft size={18} /> Retour
        </button>
        <button
          className="btn btn-primary"
          type="button"
          disabled={!selected}
          onClick={
            atResult
              ? finish
              : () => setStep((value) => value + 1)
          }
        >
          {atResult ? (
            <>
              Ouvrir mon parcours <Compass size={18} />
            </>
          ) : (
            <>
              Continuer <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
