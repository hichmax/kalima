import { wordsToText, type QuranWord } from "@/lib/quran-types";

/**
 * Version serveur (sans JavaScript) d'un verset : texte Tanzil brut, léger à rendre.
 * Le verset entier déclenche l'étude mot à mot (`data-study`).
 * Les couleurs du tajwīd sont ajoutées dans le navigateur par <TajweedPainter /> (une sourate
 * longue comme al-Baqara triplerait de poids si chaque lettre colorée était envoyée par le serveur).
 */
export function QuranLine({ s, v, words }: { s: number; v: number; words: QuranWord[] }) {
  return (
    <p
      className="quran study-verse"
      lang="ar"
      dir="rtl"
      data-study={`${s}:${v}`}
      role="button"
      tabIndex={0}
      aria-label={`Verset ${v} : toucher pour étudier chaque mot`}
    >
      <span className="verse-text">{wordsToText(words)}</span>{" "}
      <span className="ayah-no" aria-hidden="true">
        {v}
      </span>
    </p>
  );
}
