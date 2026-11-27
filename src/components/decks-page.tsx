"use client";

import { CardsThree, Exam, Plus, Trash } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { ExerciseRunner, type ExerciseResult } from "@/components/exercise-runner";
import { alignedWordsFr, FlashcardSession, surahLabel } from "@/components/flashcards";
import { Segmented } from "@/components/segmented";
import { activeDecks, createDeck, deckCards, deckStats, loadStudy, MAX_DECK_VERSES, removeDeck, useStudy } from "@/lib/decks";
import { buildDeckQuiz } from "@/lib/deck-quiz";
import { seededRandom } from "@/lib/exercises";
import { recordResults, scoreOf } from "@/lib/progress";
import { useRecitations } from "@/lib/recitation-client";
import { useHydrated, useKalima, type Deck } from "@/lib/storage";
import type { SurahMeta } from "@/lib/quran-types";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type Mode = { deck: string; kind: "cards" | "quiz" } | null;

/** « Mes cartes » : créer un paquet à partir de versets, puis s'entraîner en flashcards ou en quiz. */
export function DecksPage({ surahs }: { surahs: SurahMeta[] }) {
  const state = useKalima();
  const hydrated = useHydrated();
  const [mode, setMode] = useState<Mode>(null);
  const [session, setSession] = useState(0);
  if (!hydrated) return null;
  const decks = activeDecks(state);
  const current = mode ? state.decks[mode.deck] : null;

  if (mode && current) {
    return (
      <div className="stack" style={{ "--gap": "14px" } as React.CSSProperties}>
        <div className="row between">
          <h2 className="h3">
            {surahLabel(current.s)} · v. {current.from}
            {current.to > current.from ? `–${current.to}` : ""}
          </h2>
          <button type="button" className="btn small ghost" onClick={() => setMode(null)}>
            Mes paquets
          </button>
        </div>
        {mode.kind === "cards" ? (
          <FlashcardSession key={session} cards={studyOrder(state, current)} title="Flashcards" onDone={() => setMode(null)} />
        ) : (
          <DeckQuiz key={session} deck={current} onDone={() => setMode(null)} />
        )}
      </div>
    );
  }

  return (
    <div className="stack" style={{ "--gap": "18px" } as React.CSSProperties}>
      <DeckBuilder surahs={surahs} onCreated={() => undefined} />
      <section className="stack" style={{ "--gap": "12px" } as React.CSSProperties}>
        <h2 className="h3">Mes paquets</h2>
        {decks.length === 0 ? (
          <p className="muted">Aucun paquet pour l&apos;instant : choisis quelques versets ci-dessus.</p>
        ) : (
          <ul className="deck-list">
            <AnimatePresence initial={false}>
              {decks.map((deck) => (
                <DeckRow
                  key={deck.id}
                  deck={deck}
                  onStudy={(kind) => {
                    setSession((s) => s + 1);
                    setMode({ deck: deck.id, kind });
                  }}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>
    </div>
  );
}

/** Ordre d'une séance de flashcards : à revoir d'abord, puis les nouvelles, puis le reste du paquet. */
function studyOrder(state: ReturnType<typeof useKalima>, deck: Deck): string[] {
  const now = Date.now();
  const due: string[] = [];
  const fresh: string[] = [];
  const rest: string[] = [];
  for (const id of deck.cards) {
    const card = state.cards[id];
    if (!card) fresh.push(id);
    else if (Date.parse(String(card.fsrs.dueAt)) <= now) due.push(id);
    else rest.push(id);
  }
  return [...due, ...fresh, ...rest].slice(0, 40);
}

function DeckRow({ deck, onStudy }: { deck: Deck; onStudy: (kind: "cards" | "quiz") => void }) {
  const state = useKalima();
  const reduce = useReducedMotion();
  const [confirm, setConfirm] = useState(false);
  const stats = deckStats(state, deck);
  return (
    <motion.li
      layout={!reduce}
      className="glass card stack deck-row"
      style={{ "--gap": "10px" } as React.CSSProperties}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
    >
      <div className="row between">
        <strong>
          {surahLabel(deck.s)} · v. {deck.from}
          {deck.to > deck.from ? `–${deck.to}` : ""}
        </strong>
        <span className="faint num">
          {stats.words} mot{stats.words > 1 ? "s" : ""} · {stats.verses} verset{stats.verses > 1 ? "s" : ""}
        </span>
      </div>
      <div className="bar deck-bar" title={`${stats.solid} cartes solides sur ${stats.total}`}>
        <span style={{ width: `${(stats.solid / Math.max(1, stats.total)) * 100}%` }} />
      </div>
      <p className="faint">
        {stats.due ? `${stats.due} à revoir · ` : ""}
        {stats.fresh ? `${stats.fresh} nouvelle${stats.fresh > 1 ? "s" : ""} · ` : ""}
        {stats.solid} solide{stats.solid > 1 ? "s" : ""}
      </p>
      <div className="row deck-actions">
        <button type="button" className="btn primary small" onClick={() => onStudy("cards")}>
          <CardsThree aria-hidden="true" /> Flashcards
        </button>
        <button type="button" className="btn small" onClick={() => onStudy("quiz")}>
          <Exam aria-hidden="true" /> Quiz
        </button>
        {confirm ? (
          <>
            <button type="button" className="btn small danger-text" onClick={() => removeDeck(deck.id)}>
              Oui, supprimer
            </button>
            <button type="button" className="btn small ghost" onClick={() => setConfirm(false)}>
              Annuler
            </button>
          </>
        ) : (
          <button type="button" className="btn small ghost icon-text" aria-label="Supprimer ce paquet" onClick={() => setConfirm(true)}>
            <Trash aria-hidden="true" />
          </button>
        )}
      </div>
    </motion.li>
  );
}

function DeckBuilder({ surahs, onCreated }: { surahs: SurahMeta[]; onCreated: () => void }) {
  const [surah, setSurah] = useState(18);
  const meta = surahs[surah - 1];
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(Math.min(10, meta.ayas));
  const [include, setInclude] = useState<"both" | "words" | "verses">("both");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { data } = useStudy([surah]);
  const preview = useMemo(() => {
    const study = data?.[surah];
    if (!study) return null;
    const cards = deckCards(study, from, to, { words: include !== "verses", verses: include !== "words" });
    return { words: cards.filter((c) => c.startsWith("word:")).length, verses: cards.filter((c) => c.startsWith("reading:")).length };
  }, [data, surah, from, to, include]);

  const changeSurah = (n: number) => {
    setSurah(n);
    setFrom(1);
    setTo(Math.min(10, surahs[n - 1].ayas));
    setMessage(null);
  };
  const setRange = (f: number, t: number) => {
    const nf = clamp(f, 1, meta.ayas);
    setFrom(nf);
    setTo(clamp(t, nf, Math.min(meta.ayas, nf + MAX_DECK_VERSES - 1)));
    setMessage(null);
  };

  const create = async () => {
    setBusy(true);
    try {
      const study = await loadStudy(surah);
      const cards = deckCards(study, from, to, { words: include !== "verses", verses: include !== "words" });
      createDeck({ s: surah, from, to, cards });
      setMessage(`Paquet créé : ${cards.length} cartes. Elles arrivent aussi dans « Réviser », 20 nouvelles par jour.`);
      onCreated();
    } catch {
      setMessage("Impossible de préparer ce paquet : vérifie ta connexion.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="glass card stack" style={{ "--gap": "14px" } as React.CSSProperties}>
      <h2 className="h3">Créer un paquet</h2>
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
        <NumberField label="Du verset" value={from} min={1} max={meta.ayas} onChange={(v) => setRange(v, Math.max(v, to))} />
        <NumberField label="au verset" value={to} min={from} max={Math.min(meta.ayas, from + MAX_DECK_VERSES - 1)} onChange={(v) => setRange(from, v)} />
      </div>
      <div className="row" style={{ "--gap": "6px" } as React.CSSProperties}>
        {[5, 10, 20].map((n) => (
          <button key={n} type="button" className="btn small" aria-pressed={to - from + 1 === n} onClick={() => setRange(from, from + n - 1)}>
            {n} versets
          </button>
        ))}
      </div>
      <div className="choice">
        <span className="faint">Apprendre</span>
        <Segmented
          size="sm"
          label="Apprendre"
          value={include}
          onChange={(v) => {
            setInclude(v);
            setMessage(null);
          }}
          options={[
            { value: "both", label: "Tout" },
            { value: "words", label: "Les mots" },
            { value: "verses", label: "Les versets" },
          ]}
        />
      </div>
      <p className="faint" aria-live="polite">
        {preview
          ? `${preview.words ? `${preview.words} mot${preview.words > 1 ? "s" : ""} différent${preview.words > 1 ? "s" : ""}` : ""}${preview.words && preview.verses ? " et " : ""}${preview.verses ? `${preview.verses} verset${preview.verses > 1 ? "s" : ""} à lire` : ""}. Jusqu'à ${MAX_DECK_VERSES} versets par paquet.`
          : "Préparation…"}
      </p>
      <div className="row">
        <button type="button" className="btn primary" disabled={busy || !preview} onClick={() => void create()}>
          <Plus aria-hidden="true" /> Créer le paquet
        </button>
      </div>
      {message ? (
        <p className="tip tip-info" role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}

function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
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

function DeckQuiz({ deck, onDone }: { deck: Deck; onDone: () => void }) {
  const { data: study, error } = useStudy([deck.s]);
  const recitations = useRecitations([deck.s]);
  const [seed] = useState(() => Math.random().toString(36));
  const [score, setScore] = useState<number | null>(null);
  const ready = Boolean(study) && Boolean(recitations[deck.s]);
  const exercises = useMemo(() => {
    if (!study || !ready) return [];
    return buildDeckQuiz(deck.cards, study, { wordsFr: (s, v) => alignedWordsFr(recitations[s], study[s], v) }, seededRandom(seed), 12);
  }, [study, ready, deck.cards, recitations, seed]);

  if (error) return <p className="tip tip-warn">Le quiz n&apos;a pas pu être préparé. Vérifie ta connexion.</p>;
  if (!ready) return <p className="faint">Préparation du quiz…</p>;
  if (score !== null) {
    return (
      <section className="glass card stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <h2 className="h3">Quiz terminé</h2>
        <p className="score num">{score} %</p>
        <p className="muted">Tes réponses comptent pour la répétition espacée de ces cartes.</p>
        <div className="row">
          <button type="button" className="btn primary" onClick={onDone}>
            Mes paquets
          </button>
        </div>
      </section>
    );
  }
  if (!exercises.length) return <p className="muted">Ce paquet est trop petit pour un quiz : ajoute quelques versets.</p>;
  return (
    <ExerciseRunner
      exercises={exercises}
      title="Quiz"
      onComplete={(results: ExerciseResult[]) => {
        void recordResults(results);
        setScore(scoreOf(results));
      }}
    />
  );
}
