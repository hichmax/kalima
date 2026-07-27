"use client";

import { ArrowRight, BookmarkSimple } from "@phosphor-icons/react";
import Link from "next/link";
import { useApp } from "@/components/providers";
import type { Ayah } from "@/lib/types";
import { toggleStoredId } from "@/lib/storage";
import { getWordPhonetic } from "@/lib/phonetics";

export function AyahCard({
  ayah,
  preview = false,
}: {
  ayah: Ayah;
  preview?: boolean;
}) {
  const { progress, updateProgress } = useApp();
  const saved = progress.favoriteAyahIds.includes(ayah.id);
  const studyHref = `/coran/${ayah.surah}/${ayah.number}/etude`;
  const phonetic = ayah.words
    .map((word) =>
      progress.phoneticAssist === "progressive" &&
      progress.learnedWordIds.includes(word.id)
        ? ""
        : getWordPhonetic(word),
    )
    .filter(Boolean)
    .join(" · ");

  const openStudy = () => {
    updateProgress({ lastAyah: ayah.id, lastRoute: studyHref });
  };

  return (
    <article className={`ayah-card ${preview ? "ayah-preview" : ""}`}>
      <div className="ayah-card-meta">
        <span className="ayah-number" aria-label={`Verset ${ayah.number}`}>
          {ayah.number}
        </span>
        <div className="cluster">
          <button
            className="btn btn-ghost btn-icon"
            type="button"
            aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
            onClick={(event) => {
              event.stopPropagation();
              updateProgress({
                favoriteAyahIds: toggleStoredId(progress.favoriteAyahIds, ayah.id),
              });
            }}
          >
            <BookmarkSimple size={20} weight={saved ? "fill" : "regular"} />
          </button>
        </div>
      </div>
      <Link
        className="ayah-reading-action"
        href={studyHref}
        onClick={openStudy}
        aria-label={`Étudier le verset ${ayah.id}`}
        data-testid="ayah-reading-action"
      >
        <span
          className="quran-text ayah-arabic"
          lang="ar"
          dir="rtl"
          translate="no"
          data-testid="reader-arabic-text"
        >
          {ayah.words.map((item) => (
            <span className="reader-word" key={item.id} data-testid="reader-word">
              {item.arabic}
            </span>
          ))}
        </span>
        {progress.phoneticAssist !== "hidden" ? (
          <span className="ayah-phonetic" lang="fr-Latn" dir="ltr">
            {phonetic}
          </span>
        ) : null}
        <span className="ayah-translation" lang="fr" dir="ltr">
          {ayah.translationFr}
        </span>
        <span className="ayah-study-hint">
          Ouvrir le mot-à-mot <ArrowRight size={17} aria-hidden="true" />
        </span>
      </Link>
    </article>
  );
}
