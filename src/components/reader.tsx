"use client";

import { Segmented } from "@/components/segmented";
import { ArrowCounterClockwise, FastForward, MagnifyingGlass, Pause, Play, Repeat, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { SurahMeta } from "@/lib/quran-types";
import { ReciterChoice } from "@/components/reciter-choice";
import { player, unavailableMessage, usePlayer, useRecitation, useStopOnUnmount } from "@/lib/recitation-client";
import type { WordPart } from "@/lib/morphology";

/** Événement « lire la sourate à partir de ce verset », émis par les boutons de verset. */
const READ_FROM_EVENT = "kalima:read-from";

// ---------------------------------------------------------------- liste des sourates
export function SurahIndex({ surahs }: { surahs: SurahMeta[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/gu, "");
  const filtered = useMemo(
    () =>
      surahs.filter((s) => {
        if (!normalized) return true;
        const hay = `${s.n} ${s.tr} ${s.fr} ${s.ar}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/gu, "");
        return hay.includes(normalized);
      }),
    [surahs, normalized],
  );
  return (
    <div className="stack" style={{ "--gap": "16px" } as React.CSSProperties}>
      <label className="search glass thin">
        <MagnifyingGlass aria-hidden="true" />
        <span className="visually-hidden">Rechercher une sourate</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nom ou numéro de sourate" inputMode="search" />
      </label>
      <ol className="surah-list">
        {filtered.map((s) => (
          <li key={s.n}>
            <Link href={`/coran/${s.n}`} className="glass thin surah-row">
              <span className="surah-no num">{s.n}</span>
              <span className="surah-names">
                <span className="surah-tr">{s.tr}</span>
                <span className="surah-fr">{s.fr} · {s.ayas} versets · {s.type}</span>
              </span>
              <span className="ar surah-ar" lang="ar">{s.ar}</span>
            </Link>
          </li>
        ))}
      </ol>
      {!filtered.length ? <p className="muted">Aucune sourate ne correspond.</p> : null}
    </div>
  );
}

// ---------------------------------------------------------------- lecteur
export function ReaderControls({ surah, ayas }: { surah: number; ayas: number }) {
  useStopOnUnmount();
  const recitation = useRecitation(surah);
  const state = usePlayer();
  /** Verset en cours (ou où l'on s'est arrêté) de la lecture continue. */
  const [from, setFrom] = useState<number | null>(null);
  const [continuous, setContinuous] = useState(false);

  const playFrom = (v: number) => {
    const src = recitation?.verses?.find((x) => x.v === v)?.audio;
    if (!src) return;
    setFrom(v);
    setContinuous(true);
    document.querySelector(`[data-verse="${v}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
    void player.play(src, {
      onEnd: () => {
        if (v < ayas) playFrom(v + 1);
        else {
          setFrom(null);
          setContinuous(false);
        }
      },
    });
  };

  // « Lire à partir d'ici », depuis le bouton d'un verset.
  const playFromRef = useRef(playFrom);
  useEffect(() => {
    playFromRef.current = playFrom;
  });
  useEffect(() => {
    const onReadFrom = (event: Event) => {
      const detail = (event as CustomEvent<{ surah: number; verse: number }>).detail;
      if (detail?.surah === surah) playFromRef.current(detail.verse);
    };
    window.addEventListener(READ_FROM_EVENT, onReadFrom);
    return () => window.removeEventListener(READ_FROM_EVENT, onReadFrom);
  }, [surah]);

  useEffect(() => {
    document.querySelectorAll(".verse-item.playing").forEach((el) => el.classList.remove("playing"));
    if (from && state.playing && continuous) document.querySelector(`[data-verse="${from}"]`)?.classList.add("playing");
  }, [from, state.playing, continuous]);

  if (recitation && !recitation.available) {
    return <p className="tip tip-warn">{unavailableMessage(recitation)}</p>;
  }
  // La lecture continue n'est « en cours » que si c'est bien le verset de la chaîne qui joue
  // (un verset écouté seul ou en boucle interrompt la chaîne, qu'on peut ensuite reprendre).
  const chainSrc = from ? recitation?.verses?.find((x) => x.v === from)?.audio : null;
  const playingContinuous = state.playing && continuous && state.src === chainSrc && !state.loop;
  return (
    <div className="reader-controls glass thin">
      {playingContinuous ? (
        <button
          type="button"
          className="btn small"
          onClick={() => {
            player.stop();
            setContinuous(false);
          }}
        >
          <Pause weight="fill" aria-hidden="true" /> Pause (v. {from})
        </button>
      ) : from ? (
        <>
          <button type="button" className="btn small primary" onClick={() => playFrom(from)} disabled={!recitation}>
            <Play weight="fill" aria-hidden="true" /> Reprendre (v. {from})
          </button>
          <button type="button" className="btn small" onClick={() => playFrom(1)} disabled={!recitation}>
            <ArrowCounterClockwise aria-hidden="true" /> Recommencer
          </button>
        </>
      ) : (
        <button type="button" className="btn small primary" onClick={() => playFrom(1)} disabled={!recitation}>
          <Play weight="fill" aria-hidden="true" /> Écouter la sourate
        </button>
      )}
      <Segmented size="sm" label="Vitesse de récitation" value={state.rate} onChange={(rate) => player.setRate(rate)} options={[0.75, 1, 1.25].map((rate) => ({ value: rate, label: rate === 1 ? "×1" : `×${rate}` }))} />
      <ReciterChoice />
      <span className="faint reader-credit">{recitation?.credits?.reciter ?? " "}</span>
    </div>
  );
}

/** Boutons et traduction sous un verset (îlot client minimal). */
export function VerseExtras({ surah, verse, phonetic, phoneticAuto }: { surah: number; verse: number; phonetic?: string; phoneticAuto?: boolean }) {
  const recitation = useRecitation(surah);
  const state = usePlayer();
  const media = recitation?.verses?.find((v) => v.v === verse);
  const looping = Boolean(media?.audio) && state.src === media?.audio && state.loop && state.playing;
  return (
    <div className="verse-extras">
      {phonetic ? (
        <p className="phonetic" data-auto={phoneticAuto || undefined} title={phoneticAuto ? "Transcription automatique : une aide, l'écoute prime" : undefined}>
          {phonetic}
        </p>
      ) : null}
      {media?.translation ? <p className="translation">{media.translation}</p> : null}
      {media?.audio ? (
        <div className="row" style={{ "--gap": "6px" } as React.CSSProperties}>
          <button type="button" className="btn small ghost" onClick={() => void player.play(media.audio!)} aria-label={`Écouter le verset ${verse} seul`}>
            <Play aria-hidden="true" /> Ce verset
          </button>
          <button
            type="button"
            className="btn small ghost"
            onClick={() => window.dispatchEvent(new CustomEvent(READ_FROM_EVENT, { detail: { surah, verse } }))}
            aria-label={`Lire la sourate à partir du verset ${verse}`}
          >
            <FastForward aria-hidden="true" /> À partir d&apos;ici
          </button>
          <button
            type="button"
            className="btn small ghost"
            aria-pressed={looping}
            onClick={() => (looping ? player.stop() : void player.play(media.audio!, { loop: true }))}
            aria-label={`Répéter le verset ${verse} en boucle`}
          >
            <Repeat aria-hidden="true" /> {looping ? "Arrêter la boucle" : "En boucle"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

type StudyPart = WordPart & { note?: string };
type StudyWord = { ar: string; parts: StudyPart[] };

/** Étude mot à mot : toucher un verset [data-study] ouvre une feuille avec ses mots. */
export function WordStudy({ surah, children }: { surah: number; children: ReactNode }) {
  const reduce = useReducedMotion();
  const recitation = useRecitation(surah);
  const [selected, setSelected] = useState<{ ref: string; words: StudyWord[] | null; word: number } | null>(null);

  const open = async (target: HTMLElement) => {
    const ref = target.dataset.study;
    if (!ref) return;
    document.querySelectorAll(".study-verse.focus").forEach((el) => el.classList.remove("focus"));
    target.classList.add("focus");
    const v = Number(ref.split(":")[1]);
    setSelected({ ref, words: null, word: 0 });
    try {
      const response = await fetch(`/api/mot/${surah}/${v}`);
      const body = (await response.json()) as { words?: StudyWord[] };
      setSelected((prev) => (prev?.ref === ref ? { ...prev, words: body.words ?? [] } : prev));
    } catch {
      setSelected((prev) => (prev?.ref === ref ? { ...prev, words: [] } : prev));
    }
  };

  const close = () => {
    document.querySelectorAll(".study-verse.focus").forEach((el) => el.classList.remove("focus"));
    setSelected(null);
  };

  const v = selected ? Number(selected.ref.split(":")[1]) : 0;
  const current = selected?.words?.[selected.word];
  const wordAudio = selected ? recitation?.verses?.find((x) => x.v === v)?.words[selected.word] : null;

  return (
    <div
      onClick={(event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>("[data-study]");
        if (target) void open(target);
      }}
      onKeyDown={(event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>("[data-study]");
        if (target && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          void open(target);
        }
        if (event.key === "Escape") close();
      }}
    >
      {children}
      <AnimatePresence>
        {selected ? (
          <motion.aside
            className="word-sheet glass"
            role="dialog"
            aria-label={`Étude du verset ${selected.ref}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
            transition={reduce ? { duration: 0.12 } : { type: "spring", bounce: 0, duration: 0.4 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="row between">
              <span className="faint">Verset {selected.ref} · mot à mot</span>
              <button type="button" className="btn icon ghost" onClick={close} aria-label="Fermer">
                <X aria-hidden="true" />
              </button>
            </div>
            {selected.words === null ? <p className="faint">Chargement…</p> : null}
            {selected.words?.length ? (
              <div className="word-chips" dir="rtl" role="tablist" aria-label="Mots du verset">
                {selected.words.map((word, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={selected.word === i}
                    className="word-chip ar"
                    lang="ar"
                    onClick={() => setSelected((prev) => (prev ? { ...prev, word: i } : prev))}
                  >
                    {word.ar}
                  </button>
                ))}
              </div>
            ) : null}
            {current ? (
              <div className="parts" dir="rtl">
                {current.parts.map((part, i) => (
                  <div key={i} className={`part part-${part.role === "mot" ? "stem" : "affix"}`}>
                    <span className="ar" lang="ar">{part.ar}</span>
                    <span className="part-role" dir="ltr">{part.role}</span>
                    <span className="part-fr" dir="ltr">{part.fr}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {current?.parts.some((p) => p.note) ? <p className="faint">{current.parts.find((p) => p.note)?.note}</p> : null}
            <div className="row between">
              <span className="faint">Découpage : Quranic Arabic Corpus · sens général : lexique Kalima (en relecture)</span>
              {wordAudio ? (
                <button type="button" className="btn small" onClick={() => void player.play(wordAudio)}>
                  <Play weight="fill" aria-hidden="true" /> Écouter le mot
                </button>
              ) : null}
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
