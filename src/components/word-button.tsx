import type { QuranWord } from "@/lib/types";
import { getWordPhonetic } from "@/lib/phonetics";

export function WordButton({
  word,
  selected,
  onSelect,
}: {
  word: QuranWord;
  selected: boolean;
  onSelect: (word: QuranWord) => void;
}) {
  const phonetic = getWordPhonetic(word);

  return (
    <button
      className={`word-button ${selected ? "selected" : ""}`}
      type="button"
      onClick={() => onSelect(word)}
      aria-pressed={selected}
      aria-label={`${word.arabic}, ${phonetic}, ${word.contextualMeaning}`}
      data-testid="study-word"
    >
      <span className="quran-text word-button-arabic" lang="ar" dir="rtl">
        {word.arabic}
      </span>
      <span className="word-button-phonetic" lang="fr-Latn" dir="ltr">
        {phonetic}
      </span>
      <span className="word-button-meaning" lang="fr" dir="ltr">
        {word.contextualMeaning}
      </span>
    </button>
  );
}
