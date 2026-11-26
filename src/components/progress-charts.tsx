"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, useMemo, useState, type ReactNode } from "react";
import { addDays, localDayKey } from "@/lib/dates";
import type { KalimaState } from "@/lib/storage";

/**
 * Graphiques de progression (SVG, sans bibliothèque).
 * Palettes validées (dataviz/validate_palette.js, mode sombre, surface #171329) :
 *   - 2 séries : violet #9085e9 · rose #d55181 (CVD ΔE 16, normal ΔE 19.7)
 *   - ordinal  : #4a3a9a → #6a54d4 → #8d74ff → #c9bbff (monotone, ≥ 2:1)
 * Chaque graphique : info-bulle au survol, légende, et une vue en tableau.
 */
export const SERIES = { good: "#9085e9", again: "#d55181" } as const;
export const ORDINAL = ["#4a3a9a", "#6a54d4", "#8d74ff", "#c9bbff"] as const;

const fr = (n: number) => n.toLocaleString("fr-FR");
const dayLabel = (key: string) =>
  new Date(`${key}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });

// ---------------------------------------------------------------- cadre commun
export function ChartCard({ title, subtitle, children, table, legend }: { title: string; subtitle?: string; children: ReactNode; table?: ReactNode; legend?: ReactNode }) {
  return (
    <section className="glass card stack chart-card" style={{ "--gap": "12px" } as React.CSSProperties}>
      <header className="stack" style={{ "--gap": "2px" } as React.CSSProperties}>
        <h2 className="h3">{title}</h2>
        {subtitle ? <p className="faint">{subtitle}</p> : null}
      </header>
      {legend ? <div className="chart-legend">{legend}</div> : null}
      {children}
      {table ? (
        <details className="chart-table">
          <summary>Voir les données en tableau</summary>
          {table}
        </details>
      ) : null}
    </section>
  );
}

export function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="legend-item">
      <span className="legend-swatch" style={{ background: color }} aria-hidden="true" />
      {label}
    </span>
  );
}

function Tooltip({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <div className="chart-tip" style={{ left: `${x}%`, top: y }} role="status">
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- 1. régularité (carte de chaleur)
export function ActivityHeatmap({ activity, weeks = 16 }: { activity: KalimaState["activity"]; weeks?: number }) {
  const [hover, setHover] = useState<{ key: string; x: number; y: number } | null>(null);
  const today = localDayKey();
  // Colonnes = semaines (lundi en haut), la dernière contient aujourd'hui.
  const todayDate = new Date(`${today}T12:00:00`);
  const offset = (todayDate.getDay() + 6) % 7; // 0 = lundi
  const start = addDays(today, -(weeks * 7 - 1) + (6 - offset));
  const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i));
  const max = Math.max(1, ...days.map((d) => activity[d]?.reviews ?? 0));
  const cell = 14;
  const gap = 3;
  const level = (reviews: number) => (reviews === 0 ? -1 : Math.min(3, Math.floor((reviews / max) * 3.999)));
  const activeDays = days.filter((d) => (activity[d]?.reviews ?? 0) > 0 || (activity[d]?.sessions ?? 0) > 0).length;

  return (
    <ChartCard
      title="Ta régularité"
      subtitle={`${activeDays} jour${activeDays > 1 ? "s" : ""} actif${activeDays > 1 ? "s" : ""} sur les ${weeks} dernières semaines`}
      legend={
        <>
          <span className="faint">moins</span>
          {ORDINAL.map((c) => (
            <span key={c} className="legend-swatch" style={{ background: c }} aria-hidden="true" />
          ))}
          <span className="faint">plus de révisions</span>
        </>
      }
      table={
        <table className="table">
          <thead>
            <tr><th>Jour</th><th>Révisions</th><th>Réussies</th></tr>
          </thead>
          <tbody>
            {days.filter((d) => activity[d]).map((d) => (
              <tr key={d}><td>{dayLabel(d)}</td><td>{activity[d].reviews}</td><td>{activity[d].correct}</td></tr>
            ))}
          </tbody>
        </table>
      }
    >
      <div className="chart-wrap heatmap" onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${weeks * (cell + gap)} ${7 * (cell + gap)}`} role="img" aria-label="Carte des jours d'activité">
          {days.map((d, i) => {
            const w = Math.floor(i / 7);
            const dow = i % 7;
            const a = activity[d];
            const l = level(a?.reviews ?? 0);
            const future = d > today;
            return (
              <rect
                key={d}
                x={w * (cell + gap)}
                y={dow * (cell + gap)}
                width={cell}
                height={cell}
                rx={4}
                fill={future ? "transparent" : l < 0 ? "rgba(255,255,255,0.06)" : ORDINAL[l]}
                stroke={d === today ? "#ffffff" : "none"}
                strokeWidth={d === today ? 1.5 : 0}
                onMouseEnter={() => setHover({ key: d, x: ((w + 0.5) / weeks) * 100, y: dow * 17 })}
              />
            );
          })}
        </svg>
        {hover ? (
          <Tooltip x={hover.x} y={hover.y}>
            <strong>{dayLabel(hover.key)}</strong>
            <span>{activity[hover.key] ? `${activity[hover.key].reviews} révisions · ${activity[hover.key].correct} réussies` : "pas d'activité"}</span>
          </Tooltip>
        ) : null}
      </div>
    </ChartCard>
  );
}

// ---------------------------------------------------------------- 2. révisions des 30 derniers jours (barres empilées)
export function ReviewsChart({ activity, days = 30 }: { activity: KalimaState["activity"]; days?: number }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const today = localDayKey();
  const keys = Array.from({ length: days }, (_, i) => addDays(today, i - days + 1));
  const rows = keys.map((k) => ({ key: k, good: activity[k]?.correct ?? 0, again: Math.max(0, (activity[k]?.reviews ?? 0) - (activity[k]?.correct ?? 0)) }));
  const max = Math.max(5, ...rows.map((r) => r.good + r.again));
  const W = 600;
  const H = 180;
  const bw = W / days;
  const total = rows.reduce((s, r) => s + r.good + r.again, 0);
  const good = rows.reduce((s, r) => s + r.good, 0);

  return (
    <ChartCard
      title="Tes révisions"
      subtitle={total ? `${fr(total)} réponses sur ${days} jours · ${Math.round((100 * good) / total)} % réussies du premier coup` : "Tes réponses aux exercices apparaîtront ici."}
      legend={
        <>
          <LegendItem color={SERIES.good} label="réussies du premier coup" />
          <LegendItem color={SERIES.again} label="à revoir" />
        </>
      }
      table={
        <table className="table">
          <thead><tr><th>Jour</th><th>Réussies</th><th>À revoir</th></tr></thead>
          <tbody>{rows.filter((r) => r.good + r.again).map((r) => <tr key={r.key}><td>{dayLabel(r.key)}</td><td>{r.good}</td><td>{r.again}</td></tr>)}</tbody>
        </table>
      }
    >
      <div className="chart-wrap" onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H + 22}`} role="img" aria-label="Révisions par jour">
          {[0.5, 1].map((t) => (
            <line key={t} x1={0} x2={W} y1={H - H * t} y2={H - H * t} className="grid-line" />
          ))}
          <text x={0} y={10} className="axis-label">{fr(max)}</text>
          {rows.map((r, i) => {
            const hGood = (r.good / max) * H;
            const hAgain = (r.again / max) * H;
            const x = i * bw + 2;
            const w = Math.max(2, bw - 4);
            return (
              <g key={r.key} onMouseEnter={() => setHover(i)}>
                <rect x={i * bw} y={0} width={bw} height={H} fill="transparent" />
                {hGood > 0 ? (
                  <motion.rect x={x} width={w} rx={3} fill={SERIES.good} initial={reduce ? false : { height: 0, y: H }} animate={{ height: hGood, y: H - hGood }} transition={{ type: "spring", bounce: 0.25, duration: 0.7, delay: reduce ? 0 : i * 0.012 }} />
                ) : null}
                {hAgain > 0 ? (
                  <motion.rect x={x} width={w} rx={3} fill={SERIES.again} initial={reduce ? false : { height: 0, y: H - hGood }} animate={{ height: Math.max(0, hAgain - 2), y: H - hGood - hAgain }} transition={{ type: "spring", bounce: 0.25, duration: 0.7, delay: reduce ? 0 : i * 0.012 + 0.08 }} />
                ) : null}
                {hover === i ? <rect x={i * bw} y={0} width={bw} height={H} className="hover-band" /> : null}
              </g>
            );
          })}
          <text x={0} y={H + 18} className="axis-label">{dayLabel(keys[0])}</text>
          <text x={W} y={H + 18} className="axis-label" textAnchor="end">aujourd&apos;hui</text>
        </svg>
        {hover !== null ? (
          <Tooltip x={((hover + 0.5) / days) * 100} y={20}>
            <strong>{dayLabel(rows[hover].key)}</strong>
            <span><i style={{ background: SERIES.good }} /> {rows[hover].good} réussies</span>
            <span><i style={{ background: SERIES.again }} /> {rows[hover].again} à revoir</span>
          </Tooltip>
        ) : null}
      </div>
    </ChartCard>
  );
}

// ---------------------------------------------------------------- 3. solidité de la mémoire (barres horizontales empilées)
const KINDS: Array<[string, string]> = [
  ["letter", "Lettres"],
  ["sign", "Signes"],
  ["rule", "Règles"],
  ["lemma", "Mots"],
  ["verse", "Versets"],
  ["concept", "Notions"],
];
const STRENGTH = ["nouvelle (< 1 j)", "en cours (1 à 7 j)", "solide (1 à 4 sem.)", "ancrée (> 1 mois)"] as const;

export function MemoryStrength({ cards }: { cards: KalimaState["cards"] }) {
  const [hover, setHover] = useState<string | null>(null);
  const rows = useMemo(
    () =>
      KINDS.map(([kind, label]) => {
        const buckets = [0, 0, 0, 0];
        for (const card of Object.values(cards)) {
          if (card.kind !== kind) continue;
          const stability = Number(card.fsrs.stability) || 0;
          buckets[stability < 1 ? 0 : stability < 7 ? 1 : stability < 30 ? 2 : 3] += 1;
        }
        return { kind, label, buckets, total: buckets.reduce((a, b) => a + b, 0) };
      }).filter((r) => r.total > 0),
    [cards],
  );
  const max = Math.max(1, ...rows.map((r) => r.total));

  return (
    <ChartCard
      title="La solidité de ta mémoire"
      subtitle="Selon FSRS : le temps pendant lequel tu retiens chaque élément à 90 %."
      legend={ORDINAL.map((c, i) => <LegendItem key={c} color={c} label={STRENGTH[i]} />)}
      table={
        <table className="table">
          <thead><tr><th>Type</th>{STRENGTH.map((s) => <th key={s}>{s}</th>)}</tr></thead>
          <tbody>{rows.map((r) => <tr key={r.kind}><td>{r.label}</td>{r.buckets.map((b, i) => <td key={i}>{b}</td>)}</tr>)}</tbody>
        </table>
      }
    >
      {rows.length === 0 ? (
        <p className="muted">Termine ta première leçon : tes lettres, règles et mots apparaîtront ici.</p>
      ) : (
        <div className="hbars">
          {rows.map((r) => (
            <div key={r.kind} className="hbar-row" onMouseEnter={() => setHover(r.kind)} onMouseLeave={() => setHover(null)}>
              <span className="hbar-label">{r.label}</span>
              <div className="hbar-track">
                <motion.div className="hbar-fill" initial={{ width: 0 }} animate={{ width: `${(r.total / max) * 100}%` }} transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}>
                  {r.buckets.map((b, i) => (b ? <span key={i} style={{ flexGrow: b, background: ORDINAL[i] }} /> : null))}
                </motion.div>
              </div>
              <span className="hbar-value num">{r.total}</span>
              {hover === r.kind ? (
                <div className="chart-tip hbar-tip" role="status">
                  <strong>{r.label}</strong>
                  {r.buckets.map((b, i) => (
                    <span key={i}><i style={{ background: ORDINAL[i] }} /> {b} {STRENGTH[i]}</span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  );
}

// ---------------------------------------------------------------- 4. couverture du Coran (courbe + toi)
export function CoverageChart({ curve, known, coverage }: { curve: Array<[number, number]>; known: number; coverage: number }) {
  const id = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = 200;
  const maxX = curve.at(-1)?.[0] ?? 300;
  const sx = (x: number) => (x / maxX) * W;
  const sy = (y: number) => H - (y / 100) * H;
  const path = curve.map(([x, y], i) => `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(" ");
  const area = `${path} L${W},${H} L0,${H} Z`;
  const point = hover !== null ? curve[hover] : null;
  const youX = Math.min(maxX, known);

  return (
    <ChartCard
      title="Combien du Coran tu reconnais"
      subtitle={`Les ${fr(maxX)} mots les plus fréquents couvrent ${Math.round(curve.at(-1)?.[1] ?? 0)} % des occurrences. Toi : ${known} mot${known > 1 ? "s" : ""}, soit ${coverage.toFixed(1)} %.`}
      legend={
        <>
          <LegendItem color={SERIES.good} label="mots appris par ordre de fréquence" />
          <span className="legend-item"><span className="legend-dot" aria-hidden="true" /> toi</span>
        </>
      }
    >
      <div
        className="chart-wrap"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * maxX;
          let best = 0;
          curve.forEach(([cx], i) => {
            if (Math.abs(cx - x) < Math.abs(curve[best][0] - x)) best = i;
          });
          setHover(best);
        }}
        onMouseLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H + 22}`} role="img" aria-label="Couverture du Coran selon le nombre de mots appris">
          <defs>
            <linearGradient id={`cov-${id}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={SERIES.good} stopOpacity="0.35" />
              <stop offset="1" stopColor={SERIES.good} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[25, 50, 75].map((t) => (
            <g key={t}>
              <line x1={0} x2={W} y1={sy(t)} y2={sy(t)} className="grid-line" />
              <text x={4} y={sy(t) - 4} className="axis-label">{t} %</text>
            </g>
          ))}
          <path d={area} fill={`url(#cov-${id})`} />
          <motion.path d={path} fill="none" stroke={SERIES.good} strokeWidth={2.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />
          {known > 0 ? (
            <g>
              <line x1={sx(youX)} x2={sx(youX)} y1={sy(coverage)} y2={H} className="you-line" />
              <motion.circle cx={sx(youX)} cy={sy(coverage)} r={7} className="you-dot" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 1.1 }} />
              <text x={Math.min(W - 6, sx(youX) + 12)} y={sy(coverage) - 10} className="you-label" textAnchor={sx(youX) > W - 80 ? "end" : "start"}>toi</text>
            </g>
          ) : null}
          {point ? (
            <g>
              <line x1={sx(point[0])} x2={sx(point[0])} y1={0} y2={H} className="crosshair" />
              <circle cx={sx(point[0])} cy={sy(point[1])} r={5} fill={SERIES.good} stroke="#171329" strokeWidth={2} />
            </g>
          ) : null}
          <text x={0} y={H + 18} className="axis-label">0 mot</text>
          <text x={W} y={H + 18} className="axis-label" textAnchor="end">{fr(maxX)} mots</text>
        </svg>
        {point ? (
          <Tooltip x={(point[0] / maxX) * 100} y={10}>
            <strong>{fr(point[0])} mots</strong>
            <span>{point[1].toFixed(1)} % du Coran</span>
          </Tooltip>
        ) : null}
      </div>
    </ChartCard>
  );
}

// ---------------------------------------------------------------- 5. révisions à venir (14 jours)
export function ForecastChart({ cards, days = 14 }: { cards: KalimaState["cards"]; days?: number }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const today = localDayKey();
  const counts = Array.from({ length: days }, () => 0);
  let overdue = 0;
  for (const card of Object.values(cards)) {
    const key = localDayKey(new Date(String(card.fsrs.dueAt)));
    if (key <= today) {
      if (key < today) overdue += 1;
      counts[0] += 1;
      continue;
    }
    const diff = Math.round((new Date(`${key}T12:00:00`).getTime() - new Date(`${today}T12:00:00`).getTime()) / 86_400_000);
    if (diff < days) counts[diff] += 1;
  }
  const max = Math.max(3, ...counts);
  const W = 600;
  const H = 150;
  const bw = W / days;

  return (
    <ChartCard
      title="Tes prochaines révisions"
      subtitle={`${counts[0]} aujourd'hui${overdue ? ` (dont ${overdue} en retard)` : ""} · ${counts.slice(1).reduce((a, b) => a + b, 0)} dans les ${days - 1} jours suivants`}
      table={
        <table className="table">
          <thead><tr><th>Jour</th><th>Cartes</th></tr></thead>
          <tbody>{counts.map((c, i) => <tr key={i}><td>{dayLabel(addDays(today, i))}</td><td>{c}</td></tr>)}</tbody>
        </table>
      }
    >
      <div className="chart-wrap" onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H + 22}`} role="img" aria-label="Cartes à réviser par jour">
          <line x1={0} x2={W} y1={H} y2={H} className="grid-line" />
          {counts.map((c, i) => {
            const h = (c / max) * H;
            return (
              <g key={i} onMouseEnter={() => setHover(i)}>
                <rect x={i * bw} y={0} width={bw} height={H} fill="transparent" />
                <motion.rect x={i * bw + 4} width={Math.max(2, bw - 8)} rx={4} fill={i === 0 ? SERIES.again : ORDINAL[2]} initial={reduce ? false : { height: 0, y: H }} animate={{ height: h, y: H - h }} transition={{ type: "spring", bounce: 0.3, duration: 0.7, delay: reduce ? 0 : i * 0.03 }} />
                {c > 0 && bw > 30 ? <text x={i * bw + bw / 2} y={H - h - 6} className="bar-value" textAnchor="middle">{c}</text> : null}
              </g>
            );
          })}
          <text x={0} y={H + 18} className="axis-label">aujourd&apos;hui</text>
          <text x={W} y={H + 18} className="axis-label" textAnchor="end">dans {days - 1} j</text>
        </svg>
        {hover !== null ? (
          <Tooltip x={((hover + 0.5) / days) * 100} y={20}>
            <strong>{hover === 0 ? "Aujourd'hui" : dayLabel(addDays(today, hover))}</strong>
            <span>{counts[hover]} carte{counts[hover] > 1 ? "s" : ""}</span>
          </Tooltip>
        ) : null}
      </div>
    </ChartCard>
  );
}
