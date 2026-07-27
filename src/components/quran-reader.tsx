"use client";

import {
  ArrowDown,
  MagnifyingGlass,
  SlidersHorizontal,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { chapters } from "@/data/chapters";
import { AyahCard } from "@/components/ayah-card";
import { QuranAudioPlayer } from "@/components/quran-audio-player";
import { useApp } from "@/components/providers";
import type { Ayah } from "@/lib/types";

export function QuranReader({
  initialAyahs,
  sourceConnected,
}: {
  initialAyahs: Ayah[];
  sourceConnected: boolean;
}) {
  const { progress, updateProgress } = useApp();
  const [query, setQuery] = useState("");
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [arabicSize, setArabicSize] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [visibleCount, setVisibleCount] = useState(30);
  const [remoteActive, setRemoteActive] = useState(sourceConnected);
  const [ayahCache, setAyahCache] = useState<Record<number, Ayah[] | undefined>>({
    1: initialAyahs,
  });
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const selected = chapters[selectedSurah - 1];
  const ayahs = ayahCache[selectedSurah] || [];
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    if (!normalized) return chapters;
    return chapters.filter(
      (chapter) =>
        chapter.nameFrench.toLocaleLowerCase("fr").includes(normalized) ||
        chapter.nameTransliterated.toLocaleLowerCase("fr").includes(normalized) ||
        chapter.nameArabic.includes(query.trim()) ||
        String(chapter.id) === normalized,
    );
  }, [query]);

  useEffect(() => {
    if (ayahCache[selectedSurah]) return;
    const controller = new AbortController();

    queueMicrotask(() => {
      setLoading(true);
      setLoadError("");
    });

    void fetch(`/api/quran/chapters/${selectedSurah}/verses`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("remote-content-unavailable");
        return (await response.json()) as { ayahs?: Ayah[]; source?: string };
      })
      .then((body) => {
        if (!body.ayahs?.length) throw new Error("empty-chapter");
        if (body.source === "quran-foundation-v4") setRemoteActive(true);
        setAyahCache((current) => ({
          ...current,
          [selectedSurah]: body.ayahs,
        }));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadError(
          "Impossible de charger cette sourate pour le moment. Réessaie dans quelques instants.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [ayahCache, selectedSurah]);

  useEffect(() => {
    queueMicrotask(() => setVisibleCount(30));
  }, [selectedSurah]);

  return (
    <div className="reader-layout">
      <aside className="surah-panel card" aria-label="Liste des sourates">
        <div className="surah-panel-head">
          <label className="screen-reader-only" htmlFor="surah-search">
            Rechercher une sourate
          </label>
          <div className="search-field">
            <MagnifyingGlass size={18} aria-hidden="true" />
            <input
              id="surah-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nom ou numéro…"
            />
          </div>
          <div className="reader-filters" aria-label="Mode de navigation">
            <button className="active" type="button">Sourate</button>
            <button type="button" disabled title="Navigation par juzʾ bientôt disponible">Juzʾ</button>
            <button type="button" disabled title="Navigation par page bientôt disponible">Page</button>
          </div>
        </div>
        <div className="surah-list">
          {filtered.map((chapter) => (
            <button
              className={`surah-list-item ${selectedSurah === chapter.id ? "active" : ""}`}
              key={chapter.id}
              onClick={() => setSelectedSurah(chapter.id)}
              type="button"
              aria-pressed={selectedSurah === chapter.id}
            >
              <span className="surah-index">{chapter.id}</span>
              <span>
                <strong>{chapter.nameTransliterated}</strong>
                <small>{chapter.nameFrench} · {chapter.versesCount} versets</small>
              </span>
              <span className="quran-text" lang="ar" dir="rtl">{chapter.nameArabic}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="reader-content" aria-label={`Lecture de ${selected.nameTransliterated}`}>
        <header className="reader-toolbar card">
          <div>
            <p className="eyebrow">Sourate {selected.id} · {selected.revelationPlace}</p>
            <h1>{selected.nameTransliterated}</h1>
            <span className="quran-text" lang="ar" dir="rtl">{selected.nameArabic}</span>
          </div>
          <div className="cluster">
            <QuranAudioPlayer
              compact
              src={ayahs[0]?.audioUrl}
              label={`Écouter le premier verset de ${selected.nameTransliterated}`}
            />
            <button
              className="btn btn-secondary btn-icon"
              type="button"
              onClick={() => setShowSettings((value) => !value)}
              aria-expanded={showSettings}
              aria-label="Réglages de lecture"
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </header>

        {showSettings ? (
          <div className="reader-settings card card-pad">
            <div>
              <label htmlFor="arabic-size">Taille du texte arabe</label>
              <input
                id="arabic-size"
                type="range"
                min="0.82"
                max="1.35"
                step="0.05"
                value={arabicSize}
                onChange={(event) => setArabicSize(Number(event.target.value))}
              />
            </div>
            <div>
              <label htmlFor="phonetic-assist">Affichage phonétique</label>
              <select
                className="select"
                id="phonetic-assist"
                value={progress.phoneticAssist}
                onChange={(event) =>
                  updateProgress({
                    phoneticAssist: event.target.value as
                      | "complete"
                      | "progressive"
                      | "hidden",
                  })
                }
              >
                <option value="complete">Toujours visible</option>
                <option value="progressive">Masquer les mots appris</option>
                <option value="hidden">Masqué</option>
              </select>
            </div>
          </div>
        ) : null}

        <div className="reader-guidance">
          <span>
            Ouvre un verset pour écouter et apprendre chacun de ses mots.
          </span>
          <ArrowDown size={17} aria-hidden="true" />
        </div>

        <div
          className="ayah-list"
          style={{ "--reader-scale": arabicSize } as React.CSSProperties}
          aria-busy={loading}
        >
          {loading ? (
            <div className="reader-loading card card-pad" role="status">
              <span className="reader-loading-mark" aria-hidden="true">ك</span>
              <div>
                <h2>Chargement de {selected.nameTransliterated}</h2>
                <p>Texte, traduction française, mots et récitation arrivent ensemble.</p>
              </div>
            </div>
          ) : ayahs.length ? (
            <>
              {ayahs
                .slice(0, visibleCount)
                .map((ayah) => <AyahCard ayah={ayah} key={ayah.id} />)}
              {visibleCount < ayahs.length ? (
                <button
                  className="btn btn-secondary reader-load-more"
                  type="button"
                  onClick={() => setVisibleCount((count) => count + 30)}
                >
                  Afficher les versets suivants · {visibleCount}/{ayahs.length}
                </button>
              ) : null}
            </>
          ) : (
            <div className="card card-pad empty-reader-state">
              <p className="quran-text" lang="ar" dir="rtl">{selected.nameArabic}</p>
              <h2>{loadError ? "Le chargement a été interrompu." : "Cette sourate est prête à être chargée."}</h2>
              <p className="muted">
                {loadError ||
                  "Le lecteur utilise le contenu local disponible sur cet appareil."}
              </p>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  setAyahCache((current) => ({ ...current, [selectedSurah]: undefined }));
                  setLoadError("");
                }}
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
        <p className="reader-source-note">
          {remoteActive
            ? "Texte, traduction et récitation fournis par Quran.Foundation · cache local temporaire"
            : "Mode de secours local actif pour Al-Fātiḥa"}
        </p>
      </section>
    </div>
  );
}
