"use client";

import {
  ArrowLeft,
  ArrowRight,
  CardsThree,
  X,
} from "@phosphor-icons/react";
import { SourceReference } from "@/components/source-reference";
import type { QuranWord } from "@/lib/types";
import { QuranAudioPlayer } from "@/components/quran-audio-player";
import { getWordPhonetic } from "@/lib/phonetics";

export function WordDetailSheet({
  word,
  onClose,
  onPrevious,
  onNext,
  onAdd,
  added,
}: {
  word: QuranWord;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onAdd: () => void;
  added: boolean;
}) {
  const phonetic = getWordPhonetic(word);

  return (
    <aside className="word-sheet card" aria-label={`Fiche du mot ${word.arabic}`}>
      <div className="word-sheet-head">
        <div>
          <p className="eyebrow">Mot {word.position} du verset</p>
          <span className="chip">Apprentissage mot à mot</span>
        </div>
        <button className="btn btn-ghost btn-icon" type="button" onClick={onClose} aria-label="Fermer la fiche">
          <X size={21} />
        </button>
      </div>
      <div className="word-sheet-primary">
        <p className="quran-text" lang="ar" dir="rtl" translate="no">{word.arabic}</p>
        <h2 lang="fr" dir="ltr">{word.contextualMeaning}</h2>
        <p className="word-sheet-phonetic" lang="fr-Latn" dir="ltr">
          <span>Phonétique</span>
          <strong>{phonetic}</strong>
        </p>
        <div className="cluster">
          <QuranAudioPlayer
            src={word.audioUrl}
            compact
            label={`Écouter ${word.arabic}`}
          />
          <button className="btn btn-primary" type="button" onClick={onAdd}>
            <CardsThree size={18} /> {added ? "Ajouté aux révisions" : "Ajouter aux révisions"}
          </button>
        </div>
      </div>

      <div className="word-details">
        <details open>
          <summary>Repères pour apprendre ce mot</summary>
          <p>
            Forme simple :{" "}
            <span className="quran-text" lang="ar" dir="rtl">
              {word.simpleArabic || word.arabic}
            </span>
            {" · "}phonétique : <span lang="fr-Latn" dir="ltr">{phonetic}</span>.
          </p>
        </details>
        {word.root ? <details>
          <summary>Famille de lettres</summary>
          <p>
            {[...word.root].join(" · ")} — un repère visuel pour reconnaître
            d’autres mots de la même famille.
          </p>
        </details> : null}
        <details>
          <summary>Référence de cette occurrence</summary>
          <dl className="word-dl">
            <div><dt>Forme de base</dt><dd>{word.lemma || "—"}</dd></div>
            <div><dt>Position</dt><dd>Mot {word.position}</dd></div>
            <div><dt>Identifiant</dt><dd>{word.id}</dd></div>
          </dl>
        </details>
      </div>

      <div className="word-sheet-nav">
        <button className="btn btn-secondary" onClick={onPrevious} type="button">
          <ArrowLeft size={18} /> Précédent
        </button>
        <button className="btn btn-secondary" onClick={onNext} type="button">
          Suivant <ArrowRight size={18} />
        </button>
      </div>
      <SourceReference sourceIds={word.sourceIds} />
    </aside>
  );
}
