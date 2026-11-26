"use client";

import { Segmented } from "@/components/segmented";
import { ArrowCounterClockwise, Pause, Play, Repeat, SkipBack, SkipForward } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Phonetic, QuranText } from "@/components/quran";
import { RepeatProgress } from "@/components/repeat-progress";
import type { QuranWord, SurahMeta } from "@/lib/quran-types";
import { player, unavailableMessage, usePlayer, useRecitation, useStopOnUnmount } from "@/lib/recitation-client";

type SurahPayload = { n: number; verses: Array<{ v: number; w: QuranWord[]; ph: string | null; phAuto?: boolean }> };
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
  const [text, setText] = useState<SurahPayload | null>(null);
  const [position, setPosition] = useState<{ v: number; k: number; r: number } | null>(null);
  const [running, setRunning] = useState(false);
  const runToken = useRef(0);
  // Mot demandé pendant l'écoute : lu à la fin du verset en cours, puis l'écoute reprend.
  const queued = useRef<{ src: string; ar: string } | null>(null);
  const wordPlaying = useRef<Promise<unknown> | null>(null);
  const phase = useRef<"verse" | "gap" | "word">("gap");
  const [waitingWord, setWaitingWord] = useState<{ ar: string; src: string } | null>(null);
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);
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
    queued.current = null;
    wordPlaying.current = null;
    phase.current = "gap";
    setWaitingWord(null);
    setSpeakingWord(null);
    player.stop();
    setRunning(false);
  };

  /** Lit le mot en attente (s'il y en a un) et attend qu'il soit fini. */
  const flushWord = async () => {
    const word = queued.current;
    if (word) {
      queued.current = null;
      setWaitingWord(null);
      setSpeakingWord(word.ar);
      const previous = phase.current;
      phase.current = "word";
      wordPlaying.current = player.playOnce(word.src).finally(() => {
        setSpeakingWord(null);
        phase.current = previous === "verse" ? "gap" : previous;
      });
    }
    if (wordPlaying.current) {
      await wordPlaying.current;
      wordPlaying.current = null;
    }
    // Un autre mot touché pendant la lecture du premier : on l'enchaîne.
    if (queued.current) await flushWord();
  };

  /**
   * Touche d'un mot. À l'arrêt : il est lu tout de suite. Pendant l'écoute : si un verset est
   * en cours, le mot attend la fin du verset (jauge visible) ; pendant une pause, il est lu aussitôt.
   * Dans les deux cas, l'écoute reprend ensuite d'elle-même.
   */
  const onWord = (src: string, ar: string) => {
    if (!running) {
      player.stop();
      setSpeakingWord(ar);
      void player.playOnce(src).finally(() => setSpeakingWord(null));
      return;
    }
    queued.current = { src, ar };
    // On se fie à la phase de la boucle, pas à l'état de l'audio : pendant le chargement d'un verset,
    // l'audio est encore « en pause » mais le verset va commencer — le mot doit attendre.
    if (phase.current === "verse") setWaitingWord({ ar, src });
    else if (phase.current === "gap") void flushWord();
    // phase « word » : un mot est déjà en cours ; celui-ci passera juste après.
  };

  /** Lance la répétition depuis `at` (par défaut : début de la plage). Reprend verset, répétition et tour. */
  const start = async (at: { v: number; k: number; r: number } = { v: from, k: 0, r: 0 }) => {
    const token = ++runToken.current;
    setRunning(true);
    const alive = () => runToken.current === token;
    const startV = clamp(at.v, from, to);
    for (let r = at.r; rangeRepeat === 0 || r < rangeRepeat; r += 1) {
      for (let v = r === at.r ? startV : from; v <= to; v += 1) {
        for (let k = r === at.r && v === startV ? Math.min(at.k, verseRepeat - 1) : 0; k < verseRepeat; k += 1) {
          if (!alive()) return;
          const src = media.get(v)?.audio;
          if (!src) {
            stop();
            return;
          }
          setPosition({ v, k, r });
          if (wordPlaying.current) await flushWord();
          if (!alive()) return;
          phase.current = "verse";
          const result = await player.playOnce(src, state.rate);
          phase.current = "gap";
          if (!alive() || !result.ended) return;
          await flushWord(); // mot demandé pendant le verset : lu maintenant, avant la pause
          if (!alive()) return;
          if (gap === "short") await sleep(2000);
          if (gap === "echo") await sleep(Math.max(1500, (result.duration / Math.max(0.5, state.rate)) * 1000));
          await flushWord(); // mot demandé pendant la pause : on attend qu'il soit fini
        }
      }
    }
    if (alive()) {
      setRunning(false);
      setPosition(null); // terminé : la prochaine écoute repart du début
    }
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
        </div>
        {currentVerse ? (
          <QuranText
            words={currentVerse.w}
            verse={currentVerse.v}
            onWord={(i) => {
              const src = media.get(currentVerse.v)?.words[i - 1];
              if (src) onWord(src, currentVerse.w[i - 1]?.ar ?? "");
            }}
          />
        ) : (
          <p className="faint">Chargement du texte…</p>
        )}
        <AnimatePresence>
          {waitingWord ? (
            <WordWait
              key="wait"
              word={waitingWord.ar}
              verseSrc={position ? media.get(position.v)?.audio ?? null : null}
              onCancel={() => {
                queued.current = null;
                setWaitingWord(null);
              }}
            />
          ) : speakingWord !== null ? (
            <motion.p key="speak" className="word-wait speaking" role="status" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="word-wait-ar" lang="ar" dir="rtl">
                {speakingWord}
              </span>{" "}
              lecture du mot…
            </motion.p>
          ) : null}
        </AnimatePresence>
        {currentVerse?.ph ? <Phonetic text={currentVerse.ph} mode="tap" /> : null}
        {currentVerse?.phAuto ? <p className="faint phonetic-note">Phonétique automatique : une aide à la lecture, l&apos;écoute de la récitation prime.</p> : null}
        {media.get(currentV)?.translation ? <p className="translation">{media.get(currentV)?.translation}</p> : null}

        <RepeatProgress
          from={from}
          to={to}
          verseRepeat={verseRepeat}
          rangeRepeat={rangeRepeat}
          position={position}
          running={running}
          currentSrc={position ? media.get(position.v)?.audio ?? null : null}
        />

        <div className="player-controls">
          <button type="button" className="btn icon" aria-label="Verset précédent" disabled={running || currentV <= from} onClick={() => setPosition({ v: currentV - 1, k: 0, r: 0 })}>
            <SkipBack weight="fill" aria-hidden="true" />
          </button>
          {running ? (
            <button type="button" className="btn primary play-main" onClick={stop}>
              <Pause weight="fill" aria-hidden="true" /> Pause
            </button>
          ) : position ? (
            <button type="button" className="btn primary play-main" disabled={!available} onClick={() => void start(position)}>
              <Play weight="fill" aria-hidden="true" /> Reprendre (v. {position.v})
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
        {position && !running ? (
          <button
            type="button"
            className="btn small ghost restart"
            disabled={!available}
            onClick={() => {
              setPosition(null);
              void start();
            }}
          >
            <ArrowCounterClockwise aria-hidden="true" /> Depuis le début
          </button>
        ) : null}
        {unavailableMessage(recitation) ? (
          <p className="tip tip-warn" role="note">
            {unavailableMessage(recitation)}
          </p>
        ) : null}
        <p className="faint">
          <Repeat aria-hidden="true" /> Touche un mot pour l&apos;écouter seul : pendant l&apos;écoute, il est lu à la fin du verset en cours, puis l&apos;écoute reprend. Récitation : Mishary Rāshid al-ʿAfāsī
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

/** Jauge d'attente : le mot sera lu quand le verset en cours se termine. */
function WordWait({ word, verseSrc, onCancel }: { word: string; verseSrc: string | null; onCancel: () => void }) {
  const barRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const p = player.progress();
      // verset pas encore chargé : jauge vide ; elle se remplit au rythme de la récitation
      const fraction = p && p.src === verseSrc && p.d > 0 ? Math.min(1, p.t / p.d) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${fraction})`;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [verseSrc]);
  return (
    <motion.div className="word-wait" role="status" initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
      <span className="word-wait-text">
        <span className="word-wait-ar" lang="ar" dir="rtl">
          {word}
        </span>
        sera lu à la fin du verset
      </span>
      <span className="word-wait-gauge" aria-hidden="true">
        <span ref={barRef} />
      </span>
      <button type="button" className="btn small ghost" onClick={onCancel}>
        Annuler
      </button>
    </motion.div>
  );
}
