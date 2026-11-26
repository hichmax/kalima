"use client";

import { Segmented } from "@/components/segmented";
import { Microphone, Repeat, Stop, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Phonetic, PlayButton, QuranText } from "@/components/quran";
import type { StudyVerse } from "@/lib/learning-data";
import { recordGrades } from "@/lib/progress";
import { player, usePlayer, useRecitations, useStopOnUnmount } from "@/lib/recitation-client";
import type { Grade } from "@/lib/srs";

type Stage = "ecouter" | "repeter" | "masquer" | "evaluer";
const STAGES: Array<{ id: Stage; label: string; hint: string }> = [
  { id: "ecouter", label: "Écouter", hint: "Écoute chaque verset trois fois en suivant le texte du doigt." },
  { id: "repeter", label: "Répéter", hint: "Mets un verset en boucle et répète avec le récitant, à vitesse réduite si besoin." },
  { id: "masquer", label: "Réciter", hint: "Le texte s'efface peu à peu : récite de mémoire, puis vérifie." },
  { id: "evaluer", label: "Évaluer", hint: "Sois honnête : ta note décide quand ce verset reviendra." },
];

const GRADES: Array<{ grade: Grade; label: string }> = [
  { grade: 1, label: "À revoir" },
  { grade: 2, label: "Difficile" },
  { grade: 3, label: "Bien" },
  { grade: 4, label: "Facile" },
];

export function MemorizeStep({
  verses,
  phoneticMode,
  surahNames,
  onDone,
}: {
  verses: StudyVerse[];
  phoneticMode: "always" | "tap" | "after" | "never";
  surahNames: Record<number, string>;
  onDone: () => void;
}) {
  useStopOnUnmount();
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>("ecouter");
  const [mask, setMask] = useState<"none" | "hint" | "all">("none");
  const [grades, setGrades] = useState<Record<string, Grade>>({});
  const [selected, setSelected] = useState<{ verse: string; word: number } | null>(null);
  const surahs = [...new Set(verses.map((v) => v.s))];
  const recitations = useRecitations(surahs);
  const playerState = usePlayer();

  const media = (s: number, v: number) => recitations[s]?.verses?.find((item) => item.v === v);
  const first = recitations[surahs[0] ?? 0];
  const audioAvailable = first ? first.available : null;

  const goStage = (next: Stage) => {
    setStage(next);
    setMask(next === "masquer" ? "hint" : "none");
  };

  /** Lecture enchaînée de tous les versets du jour. */
  const playAll = (index = 0) => {
    const verse = verses[index];
    const src = verse ? media(verse.s, verse.v)?.audio : null;
    if (!verse || !src) return;
    void player.play(src, { onEnd: () => playAll(index + 1) });
  };

  const saveGrades = async () => {
    await recordGrades(Object.entries(grades).map(([key, grade]) => ({ id: `verse:${key}`, grade })));
    onDone();
  };

  const allGraded = verses.every((v) => grades[`${v.s}:${v.v}`]);
  const spring = reduce ? { duration: 0.1 } : { type: "spring" as const, bounce: 0, duration: 0.45 };

  return (
    <section className="stack" style={{ "--gap": "16px" } as React.CSSProperties}>
      <Segmented
        role="tablist"
        label="Étapes de mémorisation"
        value={stage}
        onChange={goStage}
        options={STAGES.map((s, i) => ({ value: s.id, label: <><span className="num">{i + 1}</span> {s.label}</> }))}
      />
      <p className="muted">{STAGES.find((s) => s.id === stage)?.hint}</p>

      {audioAvailable === false ? (
        <p className="tip tip-warn" role="note">
          La récitation n&apos;est pas disponible ici (service Quran.Foundation non configuré ou injoignable). Utilise
          l&apos;application de ton choix pour écouter, puis reviens réciter.
        </p>
      ) : null}

      {stage === "ecouter" && first?.available ? (
        <div className="row">
          <button type="button" className="btn" onClick={() => playAll(0)}>
            Écouter tout, dans l&apos;ordre
          </button>
          <Segmented size="sm" label="Vitesse" value={playerState.rate} onChange={(rate) => player.setRate(rate)} options={[{ value: 0.75, label: "Lent" }, { value: 1, label: "Normal" }]} />
        </div>
      ) : null}

      <div className="stack" style={{ "--gap": "12px" } as React.CSSProperties}>
        {verses.map((verse) => {
          const key = `${verse.s}:${verse.v}`;
          const m = media(verse.s, verse.v);
          const activeWord = selected?.verse === key ? selected.word : null;
          return (
            <article key={key} className="glass card stack verse-card" style={{ "--gap": "10px" } as React.CSSProperties}>
              <div className="row between">
                <span className="faint">
                  {surahNames[verse.s]} · {key}
                </span>
                <div className="row" style={{ "--gap": "6px" } as React.CSSProperties}>
                  {stage === "repeter" && m?.audio ? (
                    <button
                      type="button"
                      className="btn small"
                      aria-pressed={playerState.src === m.audio && playerState.loop}
                      onClick={() => void player.play(m.audio!, { loop: true })}
                    >
                      <Repeat aria-hidden="true" /> En boucle
                    </button>
                  ) : null}
                  <PlayButton src={m?.audio} small label="Écouter" />
                </div>
              </div>

              <QuranText
                words={verse.words}
                verse={verse.v}
                hidden={stage === "masquer" ? mask : "none"}
                focus={activeWord ? [activeWord, activeWord] : undefined}
                onWord={stage === "masquer" ? undefined : (index) => setSelected(activeWord === index ? null : { verse: key, word: index })}
              />

              <AnimatePresence>
                {activeWord ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={spring}
                    className="word-parts"
                  >
                    <div className="row between">
                      <span className="faint">Décomposition du mot (Quranic Arabic Corpus)</span>
                      <button type="button" className="btn icon ghost small" aria-label="Fermer" onClick={() => setSelected(null)}>
                        <X aria-hidden="true" />
                      </button>
                    </div>
                    <div className="parts" dir="rtl">
                      {verse.parts[activeWord - 1]?.map((part, i) => (
                        <div key={i} className={`part part-${part.role === "mot" ? "stem" : "affix"}`}>
                          <span className="ar" lang="ar">{part.ar}</span>
                          <span className="part-role" dir="ltr">{part.role}</span>
                          <span className="part-fr" dir="ltr">{part.fr}</span>
                        </div>
                      ))}
                    </div>
                    {m?.words[activeWord - 1] ? <PlayButton src={m.words[activeWord - 1]} small label="Le mot" /> : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {stage !== "masquer" ? <Phonetic text={verse.phonetic ?? undefined} mode={phoneticMode} /> : null}
              {m?.translation && stage !== "masquer" ? (
                <p className="translation">
                  {m.translation}
                  <span className="faint"> — traduction des sens, Hamidullah</span>
                </p>
              ) : null}

              {stage === "evaluer" ? (
                <div className="grade-row" role="radiogroup" aria-label={`Ta récitation de ${key}`}>
                  {GRADES.map(({ grade, label }) => (
                    <button
                      key={grade}
                      type="button"
                      role="radio"
                      aria-checked={grades[key] === grade}
                      className="btn small"
                      data-grade={grade}
                      onClick={() => setGrades((prev) => ({ ...prev, [key]: grade }))}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {stage === "masquer" ? (
        <div className="row">
          <Segmented
            label="Niveau de masquage"
            value={mask}
            onChange={setMask}
            options={[
              { value: "none", label: "Tout voir" },
              { value: "hint", label: "Premières lettres" },
              { value: "all", label: "Rien" },
            ]}
          />
          <Recorder />
        </div>
      ) : null}

      <div className="row">
        {stage !== "evaluer" ? (
          <button
            type="button"
            className="btn primary"
            onClick={() => goStage(STAGES[STAGES.findIndex((s) => s.id === stage) + 1].id)}
          >
            Étape suivante
          </button>
        ) : (
          <button type="button" className="btn primary" disabled={!allGraded} onClick={saveGrades}>
            {allGraded ? "Enregistrer et continuer" : "Évalue chaque verset"}
          </button>
        )}
      </div>
      <Link
        className="btn dashed"
        href={`/ecouter?s=${verses[0]?.s ?? 1}&from=${verses[0]?.v ?? 1}&to=${verses.filter((v) => v.s === verses[0]?.s).at(-1)?.v ?? 1}`}
      >
        <Repeat aria-hidden="true" /> Répéter ces versets en boucle dans le lecteur
      </Link>
      <p className="faint">
        Récitation : Mishary Rāshid al-ʿAfāsī (Ḥafṣ ʿan ʿĀṣim), via Quran.Foundation. Texte : Tanzil.
      </p>
    </section>
  );
}

/** Enregistrement local : le fichier ne quitte jamais l'appareil. */
function Recorder() {
  const [state, setState] = useState<"idle" | "recording" | "ready" | "denied">("idle");
  const [url, setUrl] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (event) => chunks.push(event.data);
      rec.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        setUrl(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType })));
        setState("ready");
      };
      recorder.current = rec;
      rec.start();
      setState("recording");
    } catch {
      setState("denied");
    }
  };

  if (typeof window !== "undefined" && !("MediaRecorder" in window)) return null;
  return (
    <div className="row" style={{ "--gap": "8px" } as React.CSSProperties}>
      {state === "recording" ? (
        <button type="button" className="btn small recording" onClick={() => recorder.current?.stop()}>
          <Stop weight="fill" aria-hidden="true" /> Arrêter
        </button>
      ) : (
        <button type="button" className="btn small" onClick={start}>
          <Microphone weight="fill" aria-hidden="true" /> {state === "ready" ? "Recommencer" : "M'enregistrer"}
        </button>
      )}
      {url ? <audio controls src={url} className="recording-audio" /> : null}
      {state === "denied" ? <span className="faint">Micro refusé ou indisponible.</span> : null}
    </div>
  );
}
