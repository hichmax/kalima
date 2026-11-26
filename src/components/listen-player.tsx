"use client";

import { Segmented } from "@/components/segmented";
import { Pause, Play, Repeat, SkipBack, SkipForward } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Phonetic, QuranText } from "@/components/quran";
import type { QuranWord, SurahMeta } from "@/lib/quran-types";
import { player, unavailableMessage, usePlayer, useRecitation, useStopOnUnmount } from "@/lib/recitation-client";

type SurahPayload = { n: number; verses: Array<{ v: number; w: QuranWord[]; ph: string | null }> };
const textCache = new Map<number, Promise<SurahPayload>>();
const loadText = (n: number) => {
  if (!textCache.has(n)) textCache.set(n, fetch(`/api/sourate/${n}`).then((r) => r.json() as Promise<SurahPayload>));
  return textCache.get(n)!;
};

const VERSE_REPEATS = [1, 3, 5, 7, 10] as const;
const RANGE_REPEATS = [1, 3, 5, 0] as const; // 0 = sans fin
const GAPS = [
  { id: "none", label: "Aucune" },
  { id: "short", label: "2 s" },
  { id: "echo", label: "Le temps de répéter" },
] as const;
type Gap = (typeof GAPS)[number]["id"];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Lecteur de mémorisation : une plage de versets, chaque verset répété N fois, la plage
 * répétée M fois (ou sans fin), avec une pause optionnelle pour répéter soi-même.
 */
export function ListenPlayer({ surahs }: { surahs: SurahMeta[] }) {
  useStopOnUnmount();
  const reduce = useReducedMotion();
  const params = useSearchParams();
  const [surah, setSurah] = useState(() => clamp(Number(params.get("s")) || 1, 1, 114));
  const meta = surahs[surah - 1];
  const [from, setFrom] = useState(() => clamp(Number(params.get("from")) || 1, 1, meta.ayas));
  const [to, setTo] = useState(() => clamp(Number(params.get("to")) || Number(params.get("from")) || 1, 1, meta.ayas));
  const [verseRepeat, setVerseRepeat] = useState<number>(3);
  const [rangeRepeat, setRangeRepeat] = useState<number>(3);
  const [gap, setGap] = useState<Gap>("echo");
  const [hideText, setHideText] = useState(false);
  const [text, setText] = useState<SurahPayload | null>(null);
  const [position, setPosition] = useState<{ v: number; k: number; r: number } | null>(null);
  const [running, setRunning] = useState(false);
  const runToken = useRef(0);
  const recitation = useRecitation(surah);
  const state = usePlayer();

  useEffect(() => {
    let alive = true;
    void loadText(surah).then((payload) => alive && setText(payload));
    return () => {
      alive = false;
    };
  }, [surah]);

  const media = useMemo(() => new Map((recitation?.verses ?? []).map((v) => [v.v, v])), [recitation]);
  const currentV = position?.v ?? from;
  const currentVerse = text?.n === surah ? text.verses[currentV - 1] : undefined;

  const stop = () => {
    runToken.current += 1;
    player.stop();
    setRunning(false);
  };

  const start = async () => {
    const token = ++runToken.current;
    setRunning(true);
    const alive = () => runToken.current === token;
    for (let r = 0; rangeRepeat === 0 || r < rangeRepeat; r += 1) {
      for (let v = from; v <= to; v += 1) {
        for (let k = 0; k < verseRepeat; k += 1) {
          if (!alive()) return;
          const src = media.get(v)?.audio;
          if (!src) {
            stop();
            return;
          }
          setPosition({ v, k, r });
          const result = await player.playOnce(src, state.rate);
          if (!alive() || !result.ended) return;
          if (gap === "short") await sleep(2000);
          if (gap === "echo") await sleep(Math.max(1500, (result.duration / Math.max(0.5, state.rate)) * 1000));
        }
      }
    }
    if (alive()) setRunning(false);
  };

  const changeSurah = (n: number) => {
    stop();
    setSurah(n);
    setFrom(1);
    setTo(Math.min(surahs[n - 1].ayas, 1));
    setPosition(null);
  };

  const quickRange = (count: number | "all") => {
    stop();
    if (count === "all") {
      setFrom(1);
      setTo(meta.ayas);
    } else setTo(clamp(from + count - 1, from, meta.ayas));
    setPosition(null);
  };

  const available = recitation?.available;
  const spring = reduce ? { duration: 0.1 } : { type: "spring" as const, bounce: 0, duration: 0.45 };
  const total = (to - from + 1) * verseRepeat;
  const done = position ? (position.v - from) * verseRepeat + position.k + 1 : 0;

  return (
    <div className="stack" style={{ "--gap": "16px" } as React.CSSProperties}>
      <section className="glass card stack" style={{ "--gap": "14px" } as React.CSSProperties}>
        <label className="field">
          <span className="faint">Sourate</span>
          <select value={surah} onChange={(e) => changeSurah(Number(e.target.value))}>
            {surahs.map((s) => (
              <option key={s.n} value={s.n}>
                {s.n}. {s.tr} — {s.fr} ({s.ayas})
              </option>
            ))}
          </select>
        </label>
        <div className="range-row">
          <Stepper label="Du verset" value={from} min={1} max={meta.ayas} onChange={(v) => { stop(); setFrom(v); if (to < v) setTo(v); setPosition(null); }} />
          <Stepper label="au verset" value={to} min={from} max={meta.ayas} onChange={(v) => { stop(); setTo(v); setPosition(null); }} />
        </div>
        <div className="row" style={{ "--gap": "6px" } as React.CSSProperties}>
          {[1, 2, 3].map((n) => (
            <button key={n} type="button" className="btn small" aria-pressed={to - from + 1 === n} onClick={() => quickRange(n)}>
              {n} verset{n > 1 ? "s" : ""}
            </button>
          ))}
          <button type="button" className="btn small" aria-pressed={from === 1 && to === meta.ayas} onClick={() => quickRange("all")}>
            Toute la sourate
          </button>
        </div>
      </section>

      <section className="glass card stack" style={{ "--gap": "12px" } as React.CSSProperties}>
        <Choice label="Répéter chaque verset" values={VERSE_REPEATS.map((n) => [n, `${n}×`])} value={verseRepeat} onChange={(v) => { stop(); setVerseRepeat(v); }} />
        <Choice label="Répéter la plage" values={RANGE_REPEATS.map((n) => [n, n === 0 ? "∞" : `${n}×`])} value={rangeRepeat} onChange={(v) => { stop(); setRangeRepeat(v); }} />
        <Choice label="Pause pour répéter" values={GAPS.map((g) => [g.id, g.label])} value={gap} onChange={(v) => { stop(); setGap(v); }} />
        <Choice label="Vitesse" values={[[0.75, "Lente"], [1, "Normale"], [1.25, "Rapide"]]} value={state.rate} onChange={(v) => player.setRate(v)} />
      </section>

      <motion.section className="glass float card stack listen-stage" style={{ "--gap": "12px" } as React.CSSProperties} layout transition={spring}>
        <div className="row between">
          <span className="faint">
            {meta.tr} · verset {currentV}
            {position ? ` · répétition ${position.k + 1}/${verseRepeat} · tour ${position.r + 1}${rangeRepeat ? `/${rangeRepeat}` : ""}` : ""}
          </span>
          <button type="button" className="btn small ghost" aria-pressed={hideText} onClick={() => setHideText((h) => !h)}>
            {hideText ? "Montrer le texte" : "Masquer le texte"}
          </button>
        </div>
        {currentVerse ? (
          <QuranText
            words={currentVerse.w}
            verse={currentVerse.v}
            hidden={hideText ? "hint" : "none"}
            onWord={(i) => {
              const src = media.get(currentVerse.v)?.words[i - 1];
              if (src) void player.play(src);
            }}
          />
        ) : (
          <p className="faint">Chargement du texte…</p>
        )}
        {currentVerse?.ph ? <Phonetic text={currentVerse.ph} mode="tap" /> : null}
        {media.get(currentV)?.translation ? <p className="translation">{media.get(currentV)?.translation}</p> : null}

        <div className="bar" aria-hidden="true">
          <motion.span initial={false} animate={{ width: `${total ? (done / total) * 100 : 0}%` }} transition={spring} />
        </div>

        <div className="player-controls">
          <button type="button" className="btn icon" aria-label="Verset précédent" disabled={running || currentV <= from} onClick={() => setPosition({ v: currentV - 1, k: 0, r: 0 })}>
            <SkipBack weight="fill" aria-hidden="true" />
          </button>
          {running ? (
            <button type="button" className="btn primary play-main" onClick={stop}>
              <Pause weight="fill" aria-hidden="true" /> Arrêter
            </button>
          ) : (
            <button type="button" className="btn primary play-main" disabled={!available} onClick={() => void start()}>
              <Play weight="fill" aria-hidden="true" /> Lancer
            </button>
          )}
          <button type="button" className="btn icon" aria-label="Verset suivant" disabled={running || currentV >= to} onClick={() => setPosition({ v: currentV + 1, k: 0, r: 0 })}>
            <SkipForward weight="fill" aria-hidden="true" />
          </button>
        </div>
        {unavailableMessage(recitation) ? (
          <p className="tip tip-warn" role="note">
            {unavailableMessage(recitation)}
          </p>
        ) : null}
        <p className="faint">
          <Repeat aria-hidden="true" /> Touche un mot pour l&apos;écouter seul. Récitation : Mishary Rāshid al-ʿAfāsī
          (Ḥafṣ ʿan ʿĀṣim), via Quran.Foundation · texte Tanzil.
        </p>
      </motion.section>
    </div>
  );
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="field stepper">
      <span className="faint">{label}</span>
      <span className="stepper-box">
        <button type="button" className="btn icon small" aria-label={`${label} : moins`} disabled={value <= min} onClick={() => onChange(value - 1)}>
          −
        </button>
        <input type="number" inputMode="numeric" min={min} max={max} value={value} onChange={(e) => onChange(clamp(Number(e.target.value) || min, min, max))} />
        <button type="button" className="btn icon small" aria-label={`${label} : plus`} disabled={value >= max} onClick={() => onChange(value + 1)}>
          +
        </button>
      </span>
    </label>
  );
}

function Choice<T extends string | number>({ label, values, value, onChange }: { label: string; values: Array<[T, string]>; value: T; onChange: (v: T) => void }) {
  return (
    <div className="choice">
      <span className="faint">{label}</span>
      <Segmented size="sm" label={label} value={value} onChange={onChange} options={values.map(([v, text]) => ({ value: v, label: text }))} />
    </div>
  );
}
