"use client";

import { ArrowRight, BookOpenText, CalendarCheck, Fire, Sparkle, Target } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { program } from "@/content/program";
import { ActivityHeatmap, CoverageChart, ForecastChart, MemoryStrength, ReviewsChart } from "@/components/progress-charts";
import { countUp } from "@/lib/anime";
import { computeStreak, localDayKey, addDays } from "@/lib/dates";
import { completedDays } from "@/lib/progress";
import { knownCount } from "@/lib/srs";
import { useSyncStatus } from "@/lib/account-sync";
import { useSession } from "@/lib/auth-client";
import { useHydrated, useKalima } from "@/lib/storage";

function Stat({ value, suffix = "", label, icon }: { value: number; suffix?: string; label: string; icon: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) countUp(ref.current, Math.round(value));
  }, [value]);
  return (
    <div className="glass thin stat">
      <span className="stat-icon" aria-hidden="true">{icon}</span>
      <span className="stat-value num">
        <span ref={ref}>0</span>
        {suffix}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export function ProgressView({ curve, lemmaCounts, totalStems }: { curve: Array<[number, number]>; lemmaCounts: Record<string, number>; totalStems: number }) {
  const state = useKalima();
  const hydrated = useHydrated();
  if (!hydrated) return <div className="dashboard-skeleton" aria-busy="true" />;

  const knownLemmas = Object.keys(state.cards).filter((id) => id.startsWith("lemma:")).map((id) => id.slice("lemma:".length));
  const coveredStems = knownLemmas.reduce((sum, key) => sum + (lemmaCounts[key] ?? 0), 0);
  const coverage = totalStems ? (100 * coveredStems) / totalStems : 0;
  const today = localDayKey();
  const active = new Set(Object.entries(state.activity).filter(([, a]) => a.reviews > 0 || a.sessions > 0).map(([d]) => d));
  const streak = computeStreak(active, today);
  const last30 = Array.from({ length: 30 }, (_, i) => state.activity[addDays(today, -i)]).filter(Boolean);
  const answers = last30.reduce((s, a) => s + a.reviews, 0);
  const success = answers ? Math.round((100 * last30.reduce((s, a) => s + a.correct, 0)) / answers) : 0;
  const done = completedDays(state);

  return (
    <div className="stack" style={{ "--gap": "18px" } as React.CSSProperties}>
      <section className="stats stats-5">
        <Stat value={done} suffix="/30" label="jours du programme" icon={<CalendarCheck weight="duotone" />} />
        <Stat value={knownLemmas.length} label={`mots appris · ${coverage.toFixed(1)} % du Coran`} icon={<Sparkle weight="duotone" />} />
        <Stat value={knownCount(state, "verse")} label="versets mémorisés" icon={<BookOpenText weight="duotone" />} />
        <Stat value={streak.current} label="jours de suite" icon={<Fire weight="duotone" />} />
        <Stat value={success} suffix=" %" label="réussite sur 30 jours" icon={<Target weight="duotone" />} />
      </section>

      <section className="glass card stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <div className="row between">
          <h2 className="h3">Le parcours</h2>
          <Link href="/programme" className="btn small ghost">
            Voir le programme <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <ol className="journey" aria-label="Les 30 jours">
          {program.map((d) => {
            const day = state.days[String(d.day)];
            const scores = Object.values(day?.lessonScores ?? {});
            const score = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
            return (
              <li key={d.day}>
                <Link
                  href={`/programme/${d.day}`}
                  className="journey-dot"
                  data-state={day?.completedAt ? "done" : day ? "started" : undefined}
                  title={`Jour ${d.day} — ${d.title}${score !== null ? ` · ${score} %` : ""}`}
                >
                  <span className="num">{d.day}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="chart-grid">
        <ActivityHeatmap activity={state.activity} />
        <CoverageChart curve={curve} known={knownLemmas.length} coverage={coverage} />
        <ReviewsChart activity={state.activity} />
        <MemoryStrength cards={state.cards} />
        <ForecastChart cards={state.cards} />
      </div>

      <SaveCard />
    </div>
  );
}

function SaveCard() {
  const { data: session } = useSession();
  const sync = useSyncStatus();
  if (session) {
    return (
      <section className="glass card stack" style={{ "--gap": "8px" } as React.CSSProperties}>
        <h2 className="h3">Ta progression est sauvegardée</h2>
        <p className="muted">
          {sync.state === "error"
            ? "La dernière synchronisation a échoué ; elle sera retentée automatiquement. Rien n'est perdu sur cet appareil."
            : "Elle est liée à ton compte et se synchronise toute seule sur tous tes appareils."}
        </p>
        <Link href="/compte" className="btn small" style={{ justifySelf: "start" }}>
          Mon compte
        </Link>
      </section>
    );
  }
  return (
    <section className="glass card stack" style={{ "--gap": "8px" } as React.CSSProperties}>
      <h2 className="h3">Garder ta progression</h2>
      <p className="muted">
        Pour l&apos;instant, elle est enregistrée sur cet appareil seulement. Crée un compte gratuit pour la retrouver partout :
        ce que tu as déjà fait est conservé.
      </p>
      <div className="row">
        <Link href="/connexion?mode=inscription&suite=/progression" className="btn small primary">
          Créer un compte
        </Link>
        <Link href="/reglages" className="btn small ghost">
          Exporter un fichier
        </Link>
      </div>
    </section>
  );
}
