"use client";

import {
  ArrowRight,
  BookOpenText,
  CardsThree,
  CheckCircle,
  FolderSimple,
  Headphones,
  Path,
  Sparkle,
  Target,
} from "@phosphor-icons/react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { useApp } from "@/components/providers";
import { lessonById } from "@/data/lessons";
import { getTodayKey } from "@/lib/daily-challenge";

const durations = [5, 10, 15, 20, 30] as const;

export default function DashboardPage() {
  const { progress, updateProgress } = useApp();
  const challengeCount =
    progress.dailyChallenge.date === getTodayKey()
      ? progress.dailyChallenge.completedWordIds.length
      : 0;
  const recommendedLesson =
    lessonById.get(progress.learningProfile.recommendedLessonId) ||
    lessonById.get("alphabet-overview")!;
  const vocabularyAnswer = progress.learningProfile.answers.vocabulary;
  const suggestedWords =
    vocabularyAnswer === "Plus de 100"
      ? 20
      : vocabularyAnswer === "Entre 20 et 100"
        ? 10
        : 5;
  const customListWords = progress.customWordLists.reduce(
    (total, list) => total + list.words.length,
    0,
  );
  const metricCards = [
    { label: "Mots appris", value: String(progress.learnedWordIds.length), note: "conservés sur cet appareil", icon: BookOpenText },
    { label: "Défi du jour", value: `${challengeCount}/5`, note: "mots reconnus aujourd’hui", icon: Target },
    { label: "Sourates apprises", value: String(progress.learnedSurahIds.length), note: "déclarées dans Progression", icon: Sparkle },
    { label: "Leçons terminées", value: String(progress.completedLessons.length), note: "dans le parcours Apprendre", icon: Path },
  ] as const;
  const steps = [
    {
      icon: Path,
      title: recommendedLesson.title,
      meta: `${recommendedLesson.duration} min · parcours personnalisé`,
    },
    {
      icon: CardsThree,
      title: `Réviser ${suggestedWords} mots fréquents`,
      meta: "jusqu’à les classer Facile",
    },
    {
      icon: BookOpenText,
      title: "Lire un verset mot à mot",
      meta: "arabe · phonétique · audio",
    },
    {
      icon: Headphones,
      title: "Écouter puis répéter",
      meta: "1 courte portion",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Aujourd’hui"
        title="Bonsoir, prends le temps qu’il te faut."
        description="Une courte séance suffit pour garder le lien."
      />
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow" style={{ color: "#d6b77f" }}>Reprendre là où tu t’es arrêté</p>
          <h2 className="page-title">{recommendedLesson.title}</h2>
          <p>{recommendedLesson.summary}</p>
          <Link className="btn btn-secondary" href={progress.lastRoute || `/apprendre#${recommendedLesson.id}`}>
            Continuer <ArrowRight size={18} />
          </Link>
        </div>
        <div className="stack">
          <span style={{ fontSize: ".78rem", color: "#d6e0d8" }}>J’ai aujourd’hui</span>
          <div className="session-lengths" aria-label="Durée de la séance">
            {durations.map((duration) => (
              <button
                className={`session-length ${progress.dailyMinutes === duration ? "active" : ""}`}
                type="button"
                key={duration}
                onClick={() => updateProgress({ dailyMinutes: duration })}
                aria-pressed={progress.dailyMinutes === duration}
              >
                {duration}′
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid-2" style={{ marginTop: 20 }}>
        <article className="card card-pad stack challenge-dashboard-card">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <p className="eyebrow">Le rituel Kalima</p>
              <h2 style={{ margin: 0 }}>Tes 5 mots du jour</h2>
            </div>
            {challengeCount === 5 ? (
              <CheckCircle size={30} weight="fill" color="var(--sage-500)" />
            ) : (
              <Target size={30} color="var(--gold)" />
            )}
          </div>
          <p className="muted">
            {challengeCount === 5
              ? "Défi terminé. Tu peux maintenant retrouver les mots en contexte."
              : `${challengeCount} sur 5 reconnus. Quelques minutes suffisent pour continuer.`}
          </p>
          <div className="progress-track" aria-label={`${challengeCount} mots sur 5`}>
            <div className="progress-fill" style={{ width: `${challengeCount * 20}%` }} />
          </div>
          <Link className="btn btn-primary" href="/defi">
            {challengeCount === 5 ? "Refaire le défi" : "Continuer le défi"} <ArrowRight size={18} />
          </Link>
        </article>
        <article className="card card-pad">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <p className="eyebrow">Séance proposée</p>
              <h2 style={{ margin: 0 }}>Un chemin de {progress.dailyMinutes} minutes</h2>
            </div>
            <span className="chip">Sans pression</span>
          </div>
          <div className="today-session">
            {steps.slice(0, progress.dailyMinutes <= 5 ? 2 : progress.dailyMinutes <= 10 ? 4 : 4).map((step) => {
              const Icon = step.icon;
              return (
                <div className="session-step" key={step.title}>
                  <span className="session-step-mark"><Icon size={19} /></span>
                  <span>
                    <strong>{step.title}</strong>
                    <small>{step.meta}</small>
                  </span>
                  <ArrowRight size={18} />
                </div>
              );
            })}
          </div>
          <Link className="btn btn-primary" href="/apprendre">Commencer la séance</Link>
        </article>
        <article className="card card-pad stack">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <p className="eyebrow">À revoir doucement</p>
              <h2 style={{ margin: 0 }}>
                {progress.reviewCount
                  ? `${progress.reviewCount} mots restent dans ta séance`
                  : "Choisis ta prochaine séance"}
              </h2>
            </div>
            <CardsThree size={30} color="var(--gold)" />
          </div>
          <div className="soft-card">
            <p className="quran-text" lang="ar" dir="rtl" style={{ fontSize: "2.5rem", margin: 0 }}>
              رَبّ · رَحْمَٰن · يَوْم
            </p>
            <p className="muted">
              Commence par 5, 10, 20, 30 ou 50 mots tirés dans toute la base.
            </p>
          </div>
          <Link className="btn btn-secondary" href="/reviser">Ouvrir les révisions</Link>
        </article>
        <article className="card card-pad stack">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <p className="eyebrow">Flashcards sur mesure</p>
              <h2 style={{ margin: 0 }}>
                {progress.customWordLists.length
                  ? `${progress.customWordLists.length} liste${progress.customWordLists.length === 1 ? " personnelle" : "s personnelles"}`
                  : "Crée ta première liste"}
              </h2>
            </div>
            <FolderSimple size={30} color="var(--gold)" />
          </div>
          <div className="soft-card">
            <strong>{customListWords} carte{customListWords === 1 ? "" : "s"} enregistrée{customListWords === 1 ? "" : "s"}</strong>
            <p className="muted">
              Favoris, vocabulaire, sourate entière ou jusqu’à 10 versets choisis.
            </p>
          </div>
          <Link className="btn btn-secondary" href="/listes">
            Ouvrir mes listes <ArrowRight size={18} />
          </Link>
        </article>
      </section>

      <section style={{ marginTop: 20 }}>
        <div className="grid-4">
          {metricCards.map(({ label, value, note, icon: Icon }) => (
            <article className="card card-pad metric-card" key={label}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="muted" style={{ fontSize: ".75rem", fontWeight: 700 }}>{label}</span>
                <Icon size={20} color="var(--gold)" />
              </div>
              <p className="metric-value">{value}</p>
              <p>{note}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
