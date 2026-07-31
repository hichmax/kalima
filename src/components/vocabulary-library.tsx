"use client";

import {
  ArrowRight,
  Funnel,
  MagnifyingGlass,
  Star,
} from "@phosphor-icons/react";
import { useDeferredValue, useEffect, useState } from "react";
import type {
  VocabularyFilter,
  VocabularyPageResult,
  VocabularySort,
  VocabularyUnit,
} from "@/lib/types";
import { RootFamilyGraph } from "@/components/root-family-graph";
import { QuranAudioPlayer } from "@/components/quran-audio-player";
import { SourceReference } from "@/components/source-reference";
import { useApp } from "@/components/providers";
import { getWordPhonetic } from "@/lib/phonetics";
import { toggleStoredId } from "@/lib/storage";
import { CatalogPagination } from "@/components/catalog-pagination";

const filters: { value: VocabularyFilter; label: string }[] = [
  { value: "all", label: "Tout" },
  { value: "nom", label: "Noms" },
  { value: "verbe", label: "Verbes" },
  { value: "particule", label: "Petits mots" },
  { value: "adjectif", label: "Adjectifs" },
];

const sortOptions = [
  { value: "occurrences-desc", label: "Plus fréquents d’abord" },
  { value: "occurrences-asc", label: "Moins fréquents d’abord" },
  { value: "french", label: "Français A–Z" },
  { value: "arabic", label: "Arabe ا–ي" },
] as const;

export function VocabularyLibrary({
  initialPage,
}: {
  initialPage: VocabularyPageResult;
}) {
  const { progress, updateProgress } = useApp();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [filter, setFilter] = useState<VocabularyFilter>("all");
  const [sort, setSort] = useState<VocabularySort>("occurrences-desc");
  const [page, setPage] = useState(initialPage.page);
  const [catalog, setCatalog] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<VocabularyUnit | null>(
    initialPage.items[0] || null,
  );
  const [familyUnits, setFamilyUnits] = useState<VocabularyUnit[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          query: deferredQuery,
          filter,
          sort,
          page: String(page),
          pageSize: String(initialPage.pageSize),
        });
        const response = await fetch(`/api/vocabulary?${params.toString()}`, {
          signal: controller.signal,
        });
        const body = (await response.json()) as VocabularyPageResult & {
          error?: string;
        };
        if (!response.ok) {
          throw new Error(body.error || "Impossible de charger cette page.");
        }
        setCatalog(body);
        setSelected((current) =>
          body.items.find((item) => item.id === current?.id) ||
          body.items[0] ||
          null,
        );
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Impossible de charger cette page.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [deferredQuery, filter, initialPage.pageSize, page, sort]);

  useEffect(() => {
    if (!selected?.root) {
      return;
    }
    const controller = new AbortController();
    const loadFamily = async () => {
      setFamilyUnits([]);
      setDetailLoading(true);
      try {
        const response = await fetch(
          `/api/vocabulary/${encodeURIComponent(selected.id)}`,
          { signal: controller.signal },
        );
        const body = (await response.json()) as {
          familyUnits?: VocabularyUnit[];
        };
        if (response.ok) setFamilyUnits(body.familyUnits || []);
      } finally {
        if (!controller.signal.aborted) setDetailLoading(false);
      }
    };
    void loadFamily();
    return () => controller.abort();
  }, [selected]);

  const visibleFamilyUnits = selected?.root ? familyUnits : [];

  const favorite = selected
    ? progress.favoriteVocabularyWordIds.includes(selected.id)
    : false;

  return (
    <div className="vocabulary-layout">
      <section className="vocabulary-results card" aria-busy={loading}>
        <div className="vocabulary-tools">
          <label className="search-field" htmlFor="vocabulary-search">
            <MagnifyingGlass size={18} />
            <input
              id="vocabulary-search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Français, arabe ou racine…"
            />
          </label>
          <label className="vocabulary-sort" htmlFor="vocabulary-sort">
            <span>Trier par</span>
            <select
              className="select"
              id="vocabulary-sort"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as VocabularySort);
                setPage(1);
              }}
            >
              {sortOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="filter-chips" aria-label="Filtrer les mots">
            <Funnel size={17} aria-hidden="true" />
            {filters.map((item) => (
              <button
                className={filter === item.value ? "active" : ""}
                type="button"
                key={item.value}
                onClick={() => {
                  setFilter(item.value);
                  setPage(1);
                }}
                aria-pressed={filter === item.value}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="vocabulary-count">
          <span>
            {catalog.total
              ? `${(catalog.page - 1) * catalog.pageSize + 1}–${Math.min(catalog.page * catalog.pageSize, catalog.total)} sur ${catalog.total.toLocaleString("fr-FR")}`
              : "Aucun résultat"}
          </span>
          <span>
            Page {catalog.page}/{catalog.totalPages} · corpus complet : {initialPage.total.toLocaleString("fr-FR")}
          </span>
        </div>
        <div className="vocabulary-list">
          {catalog.items.map((unit) => (
            <button
              className={`vocabulary-row ${selected?.id === unit.id ? "active" : ""}`}
              type="button"
              onClick={() => setSelected(unit)}
              key={unit.id}
            >
              <span>
                <span className="quran-text" lang="ar" dir="rtl">{unit.arabic}</span>
                <small lang="fr-Latn" dir="ltr">{getWordPhonetic(unit)}</small>
              </span>
              <span>
                <strong lang="fr" dir="ltr">{unit.primaryMeaningFr}</strong>
                <small>{unit.partOfSpeech} · {unit.occurrences} occurrences</small>
              </span>
              <ArrowRight size={17} />
            </button>
          ))}
          {!loading && !catalog.items.length ? (
            <div className="vocabulary-empty-state">
              <MagnifyingGlass size={25} />
              <strong>Aucun mot ne correspond à cette recherche.</strong>
              <span>Essaie une forme arabe sans voyelles, une racine ou un sens plus court.</span>
            </div>
          ) : null}
        </div>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <CatalogPagination
          page={catalog.page}
          totalPages={catalog.totalPages}
          onChange={setPage}
          disabled={loading}
        />
      </section>

      <aside className="vocabulary-detail card">
        {selected ? (
          <>
            <div className="vocabulary-detail-head">
              <div>
                <p className="eyebrow">Unité {selected.id.replace("qac-lemma-", "#")}</p>
                <p className="quran-text" lang="ar" dir="rtl">{selected.arabic}</p>
              </div>
              <button
                className="btn btn-ghost btn-icon"
                type="button"
                aria-label={
                  favorite ? "Retirer ce mot des favoris" : "Ajouter ce mot aux favoris"
                }
                aria-pressed={favorite}
                onClick={() =>
                  selected &&
                  updateProgress({
                    favoriteVocabularyWordIds: toggleStoredId(
                      progress.favoriteVocabularyWordIds,
                      selected.id,
                    ),
                  })
                }
              >
                <Star size={21} weight={favorite ? "fill" : "regular"} />
              </button>
            </div>
            <p className="vocabulary-phonetic" lang="fr-Latn" dir="ltr">
              {getWordPhonetic(selected)}
            </p>
            <h2 lang="fr" dir="ltr">{selected.primaryMeaningFr}</h2>
            <QuranAudioPlayer
              src={selected.audioUrl}
              label={`Écouter ${selected.arabic}`}
            />
            <p className="muted">
              Forme de base : <span className="quran-text">{selected.lemma}</span>
            </p>
            <dl className="word-dl">
              <div><dt>Catégorie</dt><dd>{selected.partOfSpeech}</dd></div>
              <div><dt>Occurrences</dt><dd>{selected.occurrences}</dd></div>
              <div>
                <dt>Niveau</dt>
                <dd>
                  {selected.level === 1
                    ? "Essentiel 500"
                    : selected.level === 2
                      ? "Essentiel 1 000"
                      : "Corpus complet"}
                </dd>
              </div>
            </dl>
            {selected.root && visibleFamilyUnits.length ? (
              <RootFamilyGraph root={selected.root} units={visibleFamilyUnits} />
            ) : detailLoading ? (
              <div className="soft-card muted" role="status">
                Chargement de la famille de lettres…
              </div>
            ) : (
              <div className="soft-card muted">
                Cette unité n’appartient pas à une famille de lettres renseignée dans la source.
              </div>
            )}
            <div className="soft-card">
              <strong>Où le rencontrer ?</strong>
              <p className="muted">
                {selected.examples.map((reference) => reference.replaceAll(":", " : ")).join(" · ")}
              </p>
            </div>
            <p className="reader-source-note">
              Traduction contextuelle, translittération et audio :
              Quran.Foundation Content API v4.
            </p>
            <SourceReference sourceIds={selected.sourceIds} />
          </>
        ) : null}
      </aside>
    </div>
  );
}
