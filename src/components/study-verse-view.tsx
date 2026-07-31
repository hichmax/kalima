"use client";

import { ListBullets } from "@phosphor-icons/react";
import { useState } from "react";
import { useApp } from "@/components/providers";
import { QuranAudioPlayer } from "@/components/quran-audio-player";
import { SourceReference } from "@/components/source-reference";
import { WordButton } from "@/components/word-button";
import { WordDetailSheet } from "@/components/word-detail-sheet";
import { getChapter } from "@/data/chapters";
import { mergePracticeWords, quranWordToPracticeWord } from "@/lib/custom-lists";
import { toggleStoredId } from "@/lib/storage";
import type { Ayah, QuranWord } from "@/lib/types";

export function StudyVerseView({ ayah }: { ayah: Ayah }) {
  const [selectedWord, setSelectedWord] = useState<QuranWord | null>(
    ayah.words[0] || null,
  );
  const { progress, updateProgress } = useApp();
  const chapter = getChapter(ayah.surah);
  const selectedIndex = selectedWord
    ? ayah.words.findIndex((item) => item.id === selectedWord.id)
    : -1;

  const move = (offset: number) => {
    const next =
      (selectedIndex + offset + ayah.words.length) % ayah.words.length;
    setSelectedWord(ayah.words[next]);
  };

  return (
    <div className="study-layout">
      <section className="study-main">
        <article className="study-verse-card card">
          <div className="study-verse-top">
            <span className="chip">
              {chapter?.nameTransliterated || `Sourate ${ayah.surah}`} ·{" "}
              {ayah.number}
            </span>
            <span className="chip">
              <ListBullets size={16} /> Mot à mot
            </span>
          </div>

          <div
            className="quran-text study-arabic"
            lang="ar"
            dir="rtl"
            translate="no"
            aria-label={`Mots du verset ${ayah.id}`}
          >
            {ayah.words.map((item) => (
              <WordButton
                key={item.id}
                word={item}
                selected={selectedWord?.id === item.id}
                onSelect={setSelectedWord}
              />
            ))}
          </div>

          <p className="study-instruction">
            Sélectionne un mot pour voir sa phonétique, écouter sa prononciation
            et l’ajouter à tes révisions.
          </p>
          <p className="study-translation" lang="fr" dir="ltr">
            {ayah.translationFr}
          </p>
          <QuranAudioPlayer
            src={ayah.audioUrl}
            label={`Écouter le verset ${ayah.id}`}
          />
          <SourceReference sourceIds={ayah.sourceIds} />
        </article>
      </section>

      {selectedWord ? (
        <WordDetailSheet
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
          onPrevious={() => move(-1)}
          onNext={() => move(1)}
          onAdd={() =>
            updateProgress(
              progress.learnedWordIds.includes(selectedWord.id)
                ? {
                    learnedWordIds: progress.learnedWordIds.filter(
                      (id) => id !== selectedWord.id,
                    ),
                    savedPracticeWords: progress.savedPracticeWords.filter(
                      (word) => word.id !== selectedWord.id,
                    ),
                  }
                : {
                    learnedWordIds: toggleStoredId(
                      progress.learnedWordIds,
                      selectedWord.id,
                    ),
                    savedPracticeWords: mergePracticeWords(
                      progress.savedPracticeWords,
                      [quranWordToPracticeWord(selectedWord, ayah)],
                    ),
                  },
            )
          }
          added={progress.learnedWordIds.includes(selectedWord.id)}
        />
      ) : (
        <aside className="study-placeholder card">
          <ListBullets size={28} color="var(--gold)" />
          <strong>Choisis un mot</strong>
          <span>
            Sa phonétique, son audio et sa traduction apparaîtront ici.
          </span>
        </aside>
      )}
    </div>
  );
}
