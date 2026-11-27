"use client";

import { ArrowsClockwise, BookOpenText, Eye, Lightbulb, SpeakerHigh } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlayButton, QuranText } from "@/components/quran";
import { surahNamesFr } from "@/content/surah-names";
import { useStudy } from "@/lib/decks";
import { recordGrades } from "@/lib/progress";
import { player, useRecitations, useStopOnUnmount, type RecitationData } from "@/lib/recitation-client";
import type { Grade } from "@/lib/srs";
import { parseDeckCard, type StudySurah } from "@/lib/study-types";

const WORD_GRADES: Array<{ grade: Grade; label: string }> = [
  { grade: 1, label: "Pas trouvé" },
  { grade: 2, label: "Difficile" },
  { grade: 3, label: "Trouvé" },
  { grade: 4, label: "Facile" },
];
const READING_GRADES: Array<{ grade: Grade; label: string }> = [
  { grade: 1, label: "Pas su lire" },
  { grade: 2, label: "Difficile" },
  { grade: 3, label: "Bien lu" },
  { grade: 4, label: "Facile" },
];

export const surahLabel = (s: number) => surahNamesFr[s - 1]?.[1] ?? `Sourate ${s}`;

/** Sens mot à mot de Quran.Foundation, seulement s'il est aligné mot pour mot avec le texte Tanzil. */
export function alignedWordsFr(recitation: RecitationData | undefined, study: StudySurah | undefined, v: number) {
  const fr = recitation?.verses?.find((x) => x.v === v)?.wordsFr;
  const words = study?.verses[v - 1]?.w;
  return fr && words && fr.length === words.length ? fr : undefined;
}

/**
 * Séance de cartes : recto (le mot ou le verset), indices à la demande (écouter, phonétique,
 * voir le mot dans son verset), verso (le sens), puis « trouvé / pas trouvé » → répétition espacée.
 * Une carte « pas trouvée » revient une fois en fin de séance.
 */
export function FlashcardSession({ cards, onDone, title = "Cartes" }: { cards: string[]; onDone: () => void; title?: string }) {
  useStopOnUnmount();
  const reduce = useReducedMotion();
  const surahs = useMemo(() => [...new Set(cards.map((id) => parseDeckCard(id)?.s).filter((s): s is number => Boolean(s)))], [cards]);
  const { data: study, error } = useStudy(surahs);
  const recitations = useRecitations(surahs);
  const [queue, setQueue] = useState(cards);
  const [flipped, setFlipped] = useState(false);
  const [hint, setHint] = useState<{ ph: boolean; ctx: boolean }>({ ph: false, ctx: false });
  const [tally, setTally] = useState({ found: 0, missed: 0 });
  const retried = useRef(new Set<string>());
  const total = cards.length;
  // Première carte affichable (une carte dont le verset serait introuvable est ignorée).
  const id = study
    ? queue.find((card) => {
        const p = parseDeckCard(card);
        const verse = p ? study[p.s]?.verses[p.v - 1] : undefined;
        return Boolean(verse && (p?.kind === "reading" || verse.w[(p?.kind === "word" ? p.w : 0) - 1]));
      })
    : queue[0];
  const parsed = id ? parseDeckCard(id) : null;

  const grade = useCallback(
    (value: Grade) => {
      if (!id) return;
      player.stop();
      void recordGrades([{ id, grade: value }]);
      const again = value === 1 && !retried.current.has(id);
      if (again) retried.current.add(id);
      setTally((t) => (value >= 3 ? { ...t, found: t.found + 1 } : value === 1 ? { ...t, missed: t.missed + 1 } : t));
      setQueue((q) => {
        const at = q.indexOf(id);
        const rest = at < 0 ? q : [...q.slice(0, at), ...q.slice(at + 1)];
        return again ? [...rest, id] : rest;
      });
      setFlipped(false);
      setHint({ ph: false, ctx: false });
    },
    [id],
  );

  // Clavier (ordinateur) : espace pour retourner, 1 à 4 pour répondre.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
      if (!flipped && (event.key === " " || event.key === "Enter")) {
        event.preventDefault();
        setFlipped(true);
      } else if (flipped && ["1", "2", "3", "4"].includes(event.key)) grade(Number(event.key) as Grade);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, grade]);

  if (error) return <p className="tip tip-warn">Les cartes n&apos;ont pas pu être chargées. Vérifie ta connexion.</p>;
  if (!study) return <p className="faint">Préparation des cartes…</p>;

  if (!id || !parsed || !study[parsed.s]) {
    return (
      <section className="glass card stack fc-done" style={{ "--gap": "12px" } as React.CSSProperties}>
        <h2 className="h3">Séance terminée</h2>
        <p className="muted">
          {tally.found} trouvée{tally.found > 1 ? "s" : ""} · {tally.missed} à retravailler. Chaque carte reviendra juste avant que tu
          l&apos;oublies.
        </p>
        <div className="row">
          <button type="button" className="btn primary" onClick={onDone}>
            Continuer
          </button>
        </div>
      </section>
    );
  }

  const surah = study[parsed.s];
  const verse = surah.verses[parsed.v - 1];
  const recitation = recitations[parsed.s];
  const media = recitation?.verses?.find((x) => x.v === parsed.v);
  const done = total - new Set(queue).size;
  const spring = reduce ? { duration: 0.12 } : { type: "spring" as const, bounce: 0.12, duration: 0.5 };
  const where = `${surahLabel(parsed.s)} ${parsed.s}:${parsed.v}`;

  let front: React.ReactNode;
  let back: React.ReactNode;
  let grades = WORD_GRADES;
  if (parsed.kind === "word") {
    const word = verse.w[parsed.w - 1];
    const fr = alignedWordsFr(recitation, surah, parsed.v)?.[parsed.w - 1] ?? null;
    const wordAudio = media?.words?.[parsed.w - 1] ?? null;
    front = (
      <>
        <span className="chip">Mot · {where}</span>
        <QuranText words={[{ ar: word.ar }]} className="fc-word" />
        <div className="fc-hints">
          {wordAudio ? (
            <button type="button" className="btn small" onClick={() => void player.play(wordAudio)}>
              <SpeakerHigh weight="fill" aria-hidden="true" /> Écouter
            </button>
          ) : null}
          <button type="button" className="btn small" aria-pressed={hint.ph} onClick={() => setHint((h) => ({ ...h, ph: !h.ph }))}>
            <Lightbulb aria-hidden="true" /> Phonétique
          </button>
          <button type="button" className="btn small" aria-pressed={hint.ctx} onClick={() => setHint((h) => ({ ...h, ctx: !h.ctx }))}>
            <BookOpenText aria-hidden="true" /> Dans le verset
          </button>
        </div>
        {hint.ph || flipped ? <p className="phonetic fc-ph">{word.ph}</p> : null}
        {hint.ctx || flipped ? <QuranText words={verse.w} focus={[parsed.w, parsed.w]} verse={parsed.v} className="fc-context" /> : null}
      </>
    );
    back = (
      <div className="fc-back stack" style={{ "--gap": "6px" } as React.CSSProperties}>
        <p className="fc-meaning">{fr ?? word.g ?? "Sens à lire dans la traduction du verset"}</p>
        {fr && word.g && word.g !== fr ? <p className="faint">sens général : {word.g}</p> : null}
        {word.l || word.r ? (
          <p className="faint">
            {word.l ? (
              <>
                mot de dictionnaire{" "}
                <span className="ar" lang="ar" dir="rtl">
                  {word.l}
                </span>
              </>
            ) : null}
            {word.l && word.r ? " · " : null}
            {word.r ? (
              <>
                racine{" "}
                <span className="ar" lang="ar" dir="rtl">
                  {[...word.r].join(" ")}
                </span>
              </>
            ) : null}
          </p>
        ) : null}
        {media?.translation ? <p className="translation fc-translation">{media.translation}</p> : null}
      </div>
    );
  } else {
    grades = READING_GRADES;
    front = (
      <>
        <span className="chip">Lire · {where}</span>
        <p className="fc-ask">Lis ce verset à voix haute, puis retourne la carte.</p>
        <QuranText words={verse.w} verse={parsed.v} className="fc-verse" />
        <div className="fc-hints">
          <PlayButton src={media?.audio} small label="Écouter" />
          <button type="button" className="btn small" aria-pressed={hint.ph} onClick={() => setHint((h) => ({ ...h, ph: !h.ph }))}>
            <Lightbulb aria-hidden="true" /> Phonétique
          </button>
        </div>
        {hint.ph || flipped ? <p className="phonetic fc-ph">{verse.ph}</p> : null}
      </>
    );
    back = (
      <div className="fc-back stack" style={{ "--gap": "6px" } as React.CSSProperties}>
        {media?.translation ? <p className="translation fc-translation">{media.translation}</p> : null}
        <p className="faint">Compare ta lecture à la récitation et à la phonétique.</p>
      </div>
    );
  }

  return (
    <section className="stack fc" style={{ "--gap": "14px" } as React.CSSProperties} aria-live="polite">
      <div className="row between">
        <span className="faint">{title}</span>
        <span className="faint num">
          {Math.min(done + 1, total)} / {total}
        </span>
      </div>
      <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((done / Math.max(1, total)) * 100)}>
        <motion.span initial={false} animate={{ width: `${(done / Math.max(1, total)) * 100}%` }} transition={spring} />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${id}-${queue.length}`}
          className="glass card stack fc-card"
          style={{ "--gap": "14px" } as React.CSSProperties}
          initial={reduce ? { opacity: 0 } : { opacity: 0, rotateY: -14, y: 12, filter: "blur(6px)" }}
          animate={{ opacity: 1, rotateY: 0, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, rotateY: 14, y: -8, filter: "blur(6px)" }}
          transition={spring}
        >
          {front}
          <AnimatePresence initial={false}>
            {flipped ? (
              <motion.div key="back" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring}>
                {back}
              </motion.div>
            ) : null}
          </AnimatePresence>
          {flipped ? (
            <div className="grade-row fc-grades">
              {grades.map((g) => (
                <button key={g.grade} type="button" className="btn small" data-grade={g.grade} onClick={() => grade(g.grade)}>
                  {g.label}
                </button>
              ))}
            </div>
          ) : (
            <button type="button" className="btn primary block" onClick={() => setFlipped(true)}>
              {parsed.kind === "word" ? <ArrowsClockwise aria-hidden="true" /> : <Eye aria-hidden="true" />} Retourner la carte
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
