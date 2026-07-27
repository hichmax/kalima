"use client";

import {
  BookOpenText,
  Check,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useApp } from "@/components/providers";
import { chapters } from "@/data/chapters";

const normalize = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u064B-\u065F\u0670\u06D6-\u06ED]/gu, "")
    .toLocaleLowerCase("fr");

export function ProgressOverview() {
  const { progress, updateProgress } = useApp();
  const [query, setQuery] = useState("");
  const [showLearnedOnly, setShowLearnedOnly] = useState(false);
  const learned = useMemo(
    () => new Set(progress.learnedSurahIds),
    [progress.learnedSurahIds],
  );
  const results = useMemo(() => {
    const search = normalize(query.trim());
    return chapters.filter((chapter) => {
      if (showLearnedOnly && !learned.has(chapter.id)) return false;
      if (!search) return true;
      return normalize(
        `${chapter.id} ${chapter.nameArabic} ${chapter.nameFrench} ${chapter.nameTransliterated}`,
      ).includes(search);
    });
  }, [learned, query, showLearnedOnly]);

  const toggleSurah = (surahId: number) => {
    updateProgress({
      learnedSurahIds: learned.has(surahId)
        ? progress.learnedSurahIds.filter((id) => id !== surahId)
        : [...progress.learnedSurahIds, surahId].sort((a, b) => a - b),
    });
  };

  return (
    <div className="surah-progress-layout">
      <section className="surah-progress-hero card card-pad">
        <div>
          <p className="eyebrow">Sourates apprises</p>
          <p className="surah-progress-count">
            {progress.learnedSurahIds.length}
            <small>/114</small>
          </p>
          <p className="muted">
            Coche uniquement une sourate que tu peux réciter entièrement.
            Tu peux modifier cette liste à tout moment.
          </p>
        </div>
        <div className="surah-progress-symbol">
          <BookOpenText size={32} />
          <span className="quran-text" lang="ar" dir="rtl">
            قُرْآن
          </span>
        </div>
      </section>

      <section className="surah-progress-panel card">
        <div className="surah-progress-tools">
          <label className="search-field" htmlFor="surah-progress-search">
            <MagnifyingGlass size={18} />
            <input
              id="surah-progress-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nom ou numéro de sourate…"
            />
          </label>
          <button
            className={`btn ${
              showLearnedOnly ? "btn-primary" : "btn-secondary"
            }`}
            type="button"
            onClick={() => setShowLearnedOnly((value) => !value)}
            aria-pressed={showLearnedOnly}
          >
            {showLearnedOnly ? "Afficher toutes" : "Voir seulement les apprises"}
          </button>
        </div>

        <div className="surah-progress-list">
          {results.map((chapter) => {
            const isLearned = learned.has(chapter.id);
            return (
              <button
                className={`surah-progress-row ${
                  isLearned ? "learned" : ""
                }`}
                type="button"
                key={chapter.id}
                onClick={() => toggleSurah(chapter.id)}
                aria-pressed={isLearned}
              >
                <span className="surah-progress-index">{chapter.id}</span>
                <span>
                  <strong>{chapter.nameTransliterated}</strong>
                  <small>
                    {chapter.nameFrench} · {chapter.versesCount} versets
                  </small>
                </span>
                <span className="quran-text" lang="ar" dir="rtl">
                  {chapter.nameArabic}
                </span>
                <span className="surah-progress-check" aria-hidden="true">
                  {isLearned ? <Check size={18} weight="bold" /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
