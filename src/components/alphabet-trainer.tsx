"use client";

import { Segmented } from "@/components/segmented";
import { Brain, Cards, GraduationCap, SpeakerHigh, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { alphabet, CONFUSABLE_SOUNDS, MAKHRAJ_ZONES, type ArabicLetter } from "@/content/alphabet";
import type { Practice } from "@/content/types";
import { ExerciseRunner, type ExerciseResult } from "@/components/exercise-runner";
import { QuranText } from "@/components/quran";
import { revealStagger } from "@/lib/anime";
import { generatePractice, letterForms, seededRandom, shuffle, type Exercise } from "@/lib/exercises";
import { recordResults, scoreOf } from "@/lib/progress";
import type { QuranWord } from "@/lib/quran-types";
import { player, useRecitations } from "@/lib/recitation-client";
import { dueAt, dueCardIds } from "@/lib/srs";
import { useHydrated, useKalima } from "@/lib/storage";

export interface LetterExample {
  char: string;
  ref: string;
  words: QuranWord[];
}

type Tab = "apprendre" | "entrainer" | "reviser";
type QuizKind = "name" | "find" | "sound" | "forms" | "pairs" | "listen" | "mix";

const QUIZZES: Array<{ id: QuizKind; label: string; detail: string }> = [
  { id: "mix", label: "Tout mélangé", detail: "Noms, sons et formes" },
  { id: "name", label: "Le nom", detail: "Voir la lettre, trouver son nom" },
  { id: "find", label: "Trouver la lettre", detail: "Lire un nom, trouver la lettre" },
  { id: "sound", label: "Le son", detail: "Associer lettre et transcription" },
  { id: "forms", label: "Les formes liées", detail: "Début, milieu, fin de mot" },
  { id: "pairs", label: "Les sosies", detail: "ح/ه, ع/ء, س/ص, ت/ط…" },
  { id: "listen", label: "À l'oreille", detail: "Écouter un mot récité" },
];

const ALL = alphabet.map((l) => l.char);
const JOINABLE = alphabet.filter((l) => l.joinsNext).map((l) => l.char);

export function AlphabetTrainer({ examples }: { examples: LetterExample[] }) {
  const state = useKalima();
  const hydrated = useHydrated();
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<Tab>("apprendre");
  const [selected, setSelected] = useState<ArabicLetter | null>(null);
  const [quiz, setQuiz] = useState<{ kind: QuizKind; exercises: Exercise[] } | null>(null);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const quizCount = useRef(0);
  const [openedAt] = useState(() => Date.now());
  const exampleSurahs = useMemo(() => [...new Set(examples.map((e) => Number(e.ref.split(":")[0])))], [examples]);
  const recitations = useRecitations(tab === "apprendre" || quiz?.kind === "listen" ? exampleSurahs : []);
  const audioReady = exampleSurahs.length > 0 && exampleSurahs.every((s) => recitations[s]?.available);

  const wordAudio = (ref: string) => {
    const [s, v, w] = ref.split(":").map(Number);
    return recitations[s]?.verses?.find((x) => x.v === v)?.words[w - 1] ?? null;
  };

  useEffect(() => {
    if (tab === "apprendre" && gridRef.current) revealStagger(gridRef.current.querySelectorAll(".abc-tile"), { step: 22 });
  }, [tab]);

  const known = hydrated ? alphabet.filter((l) => state.cards[`letter:${l.char}`]) : [];
  const dueLetters = hydrated ? dueCardIds(state, new Date(), ["letter"]).map((id) => id.slice("letter:".length)) : [];
  const weak = hydrated
    ? alphabet.filter((l) => state.cards[`letter:${l.char}`]?.lastGrade === 1).map((l) => l.char)
    : [];

  const startQuiz = (kind: QuizKind, chars: string[] = ALL) => {
    quizCount.current += 1;
    const rand = seededRandom(`${kind}:${openedAt}:${quizCount.current}`);
    const pool = chars.length ? chars : ALL;
    const practices: Practice[] = [];
    if (kind === "name" || kind === "mix") practices.push({ gen: "letter-name", chars: pool });
    if (kind === "find" || kind === "mix") practices.push({ gen: "name-letter", chars: pool });
    if (kind === "sound" || kind === "mix") practices.push({ gen: "letter-sound", chars: pool.filter((c) => c !== "ا") });
    if (kind === "forms" || kind === "mix") practices.push({ gen: "letter-forms", chars: pool.filter((c) => JOINABLE.includes(c)) });
    let exercises: Exercise[] = practices.flatMap((p) => generatePractice(p, `alphabet-${kind}`, {}, rand));
    if (kind === "pairs") exercises = pairExercises(rand);
    if (kind === "listen") exercises = listenExercises(examples, rand);
    exercises = shuffle(exercises, rand).slice(0, kind === "mix" ? 24 : 20);
    setLastScore(null);
    setQuiz({ kind, exercises });
  };

  const startReview = () => {
    const fresh = ALL.filter((c) => !state.cards[`letter:${c}`]).slice(0, 5);
    const chars = [...new Set([...dueLetters, ...fresh])];
    startQuiz("mix", chars.length ? chars : ALL);
  };

  const finish = async (results: ExerciseResult[]) => {
    await recordResults(results);
    setLastScore(scoreOf(results));
    setQuiz(null);
  };

  const spring = reduce ? { duration: 0.1 } : { type: "spring" as const, bounce: 0, duration: 0.4 };

  if (quiz) {
    return (
      <div className="stack" style={{ "--gap": "12px" } as React.CSSProperties}>
        <button type="button" className="btn small ghost" onClick={() => setQuiz(null)} style={{ justifySelf: "start" }}>
          <X aria-hidden="true" /> Quitter le quiz
        </button>
        {quiz.kind === "listen" ? (
          <ListenQuiz exercises={quiz.exercises} audioFor={wordAudio} ready={audioReady} onComplete={finish} />
        ) : (
          <ExerciseRunner exercises={quiz.exercises} onComplete={finish} title={QUIZZES.find((q) => q.id === quiz.kind)?.label} />
        )}
      </div>
    );
  }

  return (
    <div className="stack" style={{ "--gap": "18px" } as React.CSSProperties}>
      <Segmented
        role="tablist"
        label="Modes"
        value={tab}
        onChange={setTab}
        options={[
          { value: "apprendre", label: <><GraduationCap aria-hidden="true" /> Apprendre</> },
          { value: "entrainer", label: <><Brain aria-hidden="true" /> S&apos;entraîner</> },
          { value: "reviser", label: <><Cards aria-hidden="true" /> Réviser</> },
        ]}
      />

      {lastScore !== null ? (
        <p className="feedback good" role="status">
          Quiz terminé : <strong className="num">{lastScore} %</strong> de bonnes réponses du premier coup. Chaque lettre
          revient en révision au bon moment.
        </p>
      ) : null}

      {tab === "apprendre" ? (
        <>
          <p className="muted">
            Touche une lettre pour voir ses formes, d&apos;où elle sort et un mot du Coran récité qui la contient. Les 28
            lettres se lisent de droite à gauche.
          </p>
          <div ref={gridRef} className="abc-grid" dir="rtl">
            {alphabet.map((letter) => {
              const card = hydrated ? state.cards[`letter:${letter.char}`] : undefined;
              return (
                <button
                  key={letter.char}
                  type="button"
                  className="abc-tile tilt"
                  data-known={card ? "true" : undefined}
                  data-heavy={letter.heavy ? "true" : undefined}
                  onClick={() => setSelected(letter)}
                  style={{ opacity: 0 }}
                >
                  <span className="ar abc-glyph" lang="ar">{letter.char}</span>
                  <span className="abc-name" dir="ltr">{letter.name}</span>
                </button>
              );
            })}
          </div>
          <p className="faint">
            Les lettres soulignées en rose sont épaisses (خ ص ض غ ط ق ظ). Une lettre devient verte dès qu&apos;elle entre
            dans tes révisions.
          </p>
        </>
      ) : null}

      {tab === "entrainer" ? (
        <div className="grid-auto">
          {QUIZZES.map((q) => (
            <button key={q.id} type="button" className="glass card quiz-card tilt" onClick={() => startQuiz(q.id)} disabled={q.id === "listen" && hydrated && !audioReady && Object.keys(recitations).length > 0}>
              {q.id === "listen" ? <SpeakerHigh size={26} weight="duotone" aria-hidden="true" /> : <Brain size={26} weight="duotone" aria-hidden="true" />}
              <h3>{q.label}</h3>
              <p className="muted">{q.detail}</p>
            </button>
          ))}
          {weak.length ? (
            <button type="button" className="glass card quiz-card tilt" onClick={() => startQuiz("mix", weak)}>
              <Brain size={26} weight="duotone" aria-hidden="true" />
              <h3>Mes lettres fragiles</h3>
              <p className="muted ar" lang="ar" dir="rtl">{weak.join(" ")}</p>
            </button>
          ) : null}
        </div>
      ) : null}

      {tab === "reviser" ? (
        <section className="glass card stack" style={{ "--gap": "12px" } as React.CSSProperties}>
          <div className="stats">
            <div className="stat">
              <span className="stat-value num">{known.length}/29</span>
              <span className="stat-label">lettres en révision</span>
            </div>
            <div className="stat">
              <span className="stat-value num">{dueLetters.length}</span>
              <span className="stat-label">à revoir maintenant</span>
            </div>
          </div>
          <p className="muted">
            La révision mélange les lettres que l&apos;algorithme FSRS juge sur le point d&apos;être oubliées et cinq lettres
            nouvelles. Une erreur fait revenir la lettre plus tôt ; une réussite l&apos;éloigne.
          </p>
          {known.length ? (
            <ul className="due-list" dir="rtl">
              {alphabet
                .filter((l) => state.cards[`letter:${l.char}`])
                .map((l) => {
                  const card = state.cards[`letter:${l.char}`];
                  const days = Math.max(0, Math.round((dueAt(card).getTime() - openedAt) / 86_400_000));
                  return (
                    <li key={l.char}>
                      <span className="ar" lang="ar">{l.char}</span>
                      <span className="faint" dir="ltr">{days === 0 ? "maintenant" : `dans ${days} j`}</span>
                    </li>
                  );
                })}
            </ul>
          ) : null}
          <button type="button" className="btn primary" onClick={startReview}>
            {dueLetters.length ? `Réviser ${dueLetters.length} lettre${dueLetters.length > 1 ? "s" : ""}` : "Commencer la révision"}
          </button>
        </section>
      ) : null}

      <AnimatePresence>
        {selected ? (
          <>
            <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} />
            <motion.aside
              className="letter-sheet glass float"
              role="dialog"
              aria-label={`La lettre ${selected.name}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.97 }}
              transition={spring}
            >
              <LetterDetail letter={selected} example={examples.find((e) => e.char === selected.char)} audioFor={wordAudio} onClose={() => setSelected(null)} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function LetterDetail({ letter, example, audioFor, onClose }: { letter: ArabicLetter; example?: LetterExample; audioFor: (ref: string) => string | null; onClose: () => void }) {
  const forms = letterForms(letter.char);
  const audio = example ? audioFor(example.ref) : null;
  const w = example ? Number(example.ref.split(":")[2]) : 0;
  const zone = MAKHRAJ_ZONES[letter.zone];
  return (
    <div className="stack" style={{ "--gap": "12px" } as React.CSSProperties}>
      <div className="row between">
        <span className="eyebrow plain">{letter.name} · {letter.ph}</span>
        <button type="button" className="btn icon ghost" aria-label="Fermer" onClick={onClose}>
          <X aria-hidden="true" />
        </button>
      </div>
      <p className="ar letter-hero" lang="ar">{letter.char}</p>
      <p className="muted center">{letter.sound}</p>
      <div className="forms-row" dir="rtl">
        {(
          [
            ["isolée", forms.isolated],
            ["début", forms.initial],
            ["milieu", forms.medial],
            ["fin", forms.final],
          ] as const
        ).map(([label, form]) => (
          <div key={label} className="form-cell">
            <span className="ar" lang="ar">{form}</span>
            <span className="faint" dir="ltr">{label}</span>
          </div>
        ))}
      </div>
      <div className="row" style={{ "--gap": "6px" } as React.CSSProperties}>
        <span className="chip">{zone.label}</span>
        {letter.heavy ? <span className="chip draft">épaisse</span> : <span className="chip">fine</span>}
        {letter.sun !== undefined ? <span className="chip">{letter.sun ? "solaire" : "lunaire"}</span> : <span className="chip">lunaire</span>}
        {!letter.joinsNext ? <span className="chip">ne se lie pas à gauche</span> : null}
      </div>
      {example ? (
        <div className="example">
          <QuranText words={example.words} focus={[w, w]} size="1.7rem" />
          <div className="row between">
            <span className="faint">Coran {example.ref.split(":").slice(0, 2).join(":")}</span>
            {audio ? (
              <button type="button" className="btn small" onClick={() => void player.play(audio)}>
                <SpeakerHigh weight="fill" aria-hidden="true" /> Écouter le mot
              </button>
            ) : (
              <span className="faint">audio indisponible ici</span>
            )}
          </div>
        </div>
      ) : null}
      <p className="faint">
        Le son d&apos;une lettre s&apos;apprend à l&apos;oreille : écoute le mot, répète-le, et fais-toi corriger par une personne
        qualifiée.
      </p>
    </div>
  );
}

/** Paires de sosies : même forme ou son proche, à départager. */
function pairExercises(rand: () => number): Exercise[] {
  const out: Exercise[] = [];
  for (const [a, b] of CONFUSABLE_SOUNDS) {
    for (const target of [a, b]) {
      const letter = alphabet.find((l) => l.char === target)!;
      const options = shuffle([a, b], rand);
      out.push({
        id: `pairs:${a}${b}:${target}`,
        prompt: `Laquelle est « ${letter.name} » (${letter.ph}) ?`,
        options: options.map((label) => ({ label, arabic: true })),
        answer: options.indexOf(target),
        explain: letter.sound,
        card: `letter:${target}`,
      });
    }
  }
  return out;
}

/** Quiz d'écoute : un mot récité, quatre mots écrits. */
function listenExercises(examples: LetterExample[], rand: () => number): Exercise[] {
  const usable = examples.filter((e) => e.words.length);
  return usable.map((example) => {
    const w = Number(example.ref.split(":")[2]);
    const target = example.words[w - 1].ar;
    const others = shuffle(usable.filter((e) => e.ref !== example.ref), rand)
      .slice(0, 3)
      .map((e) => e.words[Number(e.ref.split(":")[2]) - 1].ar);
    const options = shuffle([target, ...others], rand);
    return {
      id: `listen:${example.ref}`,
      prompt: "Écoute, puis touche le mot récité.",
      display: { kind: "latin", text: example.ref },
      options: options.map((label) => ({ label, arabic: true })),
      answer: options.indexOf(target),
      explain: `Ce mot contient la lettre ${example.char}.`,
      card: `letter:${example.char}`,
    };
  });
}

function ListenQuiz({ exercises, audioFor, ready, onComplete }: { exercises: Exercise[]; audioFor: (ref: string) => string | null; ready: boolean; onComplete: (r: ExerciseResult[]) => void }) {
  // Le « display » porte la référence du mot : on le remplace par un bouton d'écoute.
  const playable = exercises.map((e) => ({ ...e, display: undefined, audioRef: e.display?.kind === "latin" ? e.display.text : "" }));
  const [index, setIndex] = useState(0);
  const current = playable[index];
  useEffect(() => {
    const src = current ? audioFor(current.audioRef) : null;
    if (src) void player.play(src);
  }, [current, audioFor]);
  if (!ready) return <p className="tip tip-warn">L&apos;audio n&apos;est pas disponible dans cet environnement.</p>;
  return (
    <div className="stack" style={{ "--gap": "10px" } as React.CSSProperties}>
      <button type="button" className="btn" onClick={() => { const src = current && audioFor(current.audioRef); if (src) void player.play(src); }}>
        <SpeakerHigh weight="fill" aria-hidden="true" /> Réécouter
      </button>
      <ExerciseRunner
        exercises={playable}
        title="À l'oreille"
        onComplete={onComplete}
        onAdvance={(id) => setIndex(Math.max(0, playable.findIndex((e) => e.id === id)))}
      />
    </div>
  );
}
