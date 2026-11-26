"use client";

import { ArrowRight, BookOpenText, Cards, Fire, Sparkle } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { getDay, program, WEEKS } from "@/content/program";
import { Soffit } from "@/components/soffit";
import { countUp } from "@/lib/anime";
import { computeStreak, localDayKey } from "@/lib/dates";
import { completedDays, currentDay } from "@/lib/progress";
import { dueCardIds, knownCount } from "@/lib/srs";
import { updateState, useHydrated, useKalima } from "@/lib/storage";

function Counter({ value, label, icon }: { value: number; label: string; icon: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) countUp(ref.current, value);
  }, [value]);
  return (
    <div className="glass thin stat">
      <span className="stat-icon" aria-hidden="true">{icon}</span>
      <span ref={ref} className="stat-value num">0</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export function Dashboard() {
  const state = useKalima();
  const hydrated = useHydrated();
  const reduce = useReducedMotion();

  if (!hydrated) return <div className="dashboard-skeleton" aria-busy="true" />;

  const dayNumber = currentDay(state);
  const day = getDay(dayNumber);
  const week = WEEKS.find((w) => w.week === day.week);
  const done = completedDays(state);
  const due = dueCardIds(state).length;
  const active = new Set(Object.entries(state.activity).filter(([, a]) => a.reviews > 0 || a.sessions > 0).map(([d]) => d));
  const streak = computeStreak(active, localDayKey());
  const isNew = !state.settings.onboarded && Object.keys(state.days).length === 0 && Object.keys(state.cards).length === 0;
  const weekDays = program.filter((d) => d.week === day.week);
  const spring = reduce ? { duration: 0.15 } : { type: "spring" as const, bounce: 0, duration: 0.7 };

  return (
    <div className="stack" style={{ "--gap": "18px" } as React.CSSProperties}>
      {isNew ? <Welcome /> : null}

      <motion.section
        className="today glass"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={spring}
      >
        <Soffit />
        <div className="today-content">
          <span className="eyebrow plain">Aujourd&apos;hui · semaine {day.week}, {week?.title}</span>
          <h1>
            Jour <span className="num">{dayNumber}</span>
          </h1>
          <p className="today-title">{day.title}</p>
          <div className="row">
            <Link href={`/programme/${dayNumber}`} className="btn primary">
              {done === 0 ? "Commencer" : "Continuer"} <ArrowRight aria-hidden="true" />
            </Link>
            <span className="today-meta">environ 35 minutes</span>
          </div>
        </div>
      </motion.section>

      <section className="stats">
        <Counter value={streak.current} label={streak.restUsed ? "jours de suite (repos utilisé)" : "jours de suite"} icon={<Fire weight="duotone" />} />
        <Counter value={due} label="cartes à réviser" icon={<Cards weight="duotone" />} />
        <Counter value={knownCount(state, "lemma")} label="mots appris" icon={<Sparkle weight="duotone" />} />
        <Counter value={knownCount(state, "verse")} label="versets mémorisés" icon={<BookOpenText weight="duotone" />} />
      </section>

      <section className="glass card stack" style={{ "--gap": "14px" } as React.CSSProperties}>
        <div className="row between">
          <h2 className="h3">Semaine {day.week}</h2>
          <span className="faint num">{done} / 30 jours</span>
        </div>
        <ol className="week-strip">
          {weekDays.map((d) => {
            const complete = Boolean(state.days[String(d.day)]?.completedAt);
            return (
              <li key={d.day}>
                <Link
                  href={`/programme/${d.day}`}
                  className="week-day"
                  data-state={complete ? "done" : d.day === dayNumber ? "current" : "todo"}
                  aria-label={`Jour ${d.day} : ${d.title}${complete ? ", terminé" : ""}`}
                >
                  <span className="num">{d.day}</span>
                </Link>
              </li>
            );
          })}
        </ol>
        <div className="bar">
          <motion.span initial={{ width: 0 }} animate={{ width: `${(done / 30) * 100}%` }} transition={spring} />
        </div>
      </section>

      <section className="grid-auto">
        <Link href="/reviser" className="glass card quick">
          <Cards size={28} weight="duotone" aria-hidden="true" />
          <h3>Réviser</h3>
          <p className="muted">{due ? `${due} cartes t'attendent.` : "Rien d'urgent. Reviens plus tard."}</p>
        </Link>
        <Link href="/coran" className="glass card quick">
          <BookOpenText size={28} weight="duotone" aria-hidden="true" />
          <h3>Lire le Coran</h3>
          <p className="muted">Les 114 sourates, mot à mot, avec la récitation.</p>
        </Link>
        <Link href="/mots" className="glass card quick">
          <Sparkle size={28} weight="duotone" aria-hidden="true" />
          <h3>Les 300 mots</h3>
          <p className="muted">Le vocabulaire le plus fréquent, avec sa couverture.</p>
        </Link>
      </section>

    </div>
  );
}

function Welcome() {
  const choose = (track: "debutant" | "lecteur") =>
    updateState((state) => ({
      ...state,
      settings: { ...state.settings, track, onboarded: true, phonetic: track === "lecteur" ? "after" : "auto" },
    }));
  return (
    <section className="glass card stack welcome" style={{ "--gap": "12px" } as React.CSSProperties}>
      <span className="eyebrow plain">Bienvenue</span>
      <h2>Où en es-tu ?</h2>
      <p className="muted">Ta réponse règle seulement l&apos;affichage de la phonétique. Tu peux la changer dans les réglages.</p>
      <div className="grid-auto">
        <button type="button" className="option welcome-option" onClick={() => choose("debutant")}>
          Je ne sais pas encore lire l&apos;arabe
        </button>
        <button type="button" className="option welcome-option" onClick={() => choose("lecteur")}>
          Je lis déjà, je veux progresser
        </button>
      </div>
      <p className="faint">Ta progression reste sur cet appareil. Pense à l&apos;exporter de temps en temps (Réglages).</p>
    </section>
  );
}
