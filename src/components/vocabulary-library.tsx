"use client";

import {
  ArrowRight,
  Funnel,
  MagnifyingGlass,
  Star,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { PartOfSpeech, VocabularyUnit } from "@/lib/types";
import { RootFamilyGraph } from "@/components/root-family-graph";
import { QuranAudioPlayer } from "@/components/quran-audio-player";
import { SourceReference } from "@/components/source-reference";
import { getWordPhonetic } from "@/lib/phonetics";

const normalize = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u064B-\u065F\u0670\u06D6-\u06ED]/gu, "")
    .replace(/[ٱأإآ]/gu, "ا")
    .toLocaleLowerCase("fr");

const filters: { value: "all" | PartOfSpeech; label: string }[] = [
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

type SortValue = (typeof sortOptions)[number]["value"];

export function VocabularyLibrary({ units }: { units: VocabularyUnit[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");
  const [sort, setSort] = useState<SortValue>("occurrences-desc");
  const [selected, setSelected] = useState<VocabularyUnit | null>(
    [...units].sort((left, right) => right.occurrences - left.occurrences)[0] ||
      null,
  );

  const results = useMemo(() => {
    const search = normalize(query.trim());
    return units
      .filter((unit) => filter === "all" || unit.partOfSpeech === filter)
      .filter((unit) => {
        if (!search) return true;
        return normalize(
          `${unit.arabic} ${unit.simpleArabic} ${getWordPhonetic(unit)} ${unit.primaryMeaningFr} ${unit.root || ""} ${unit.lemma}`,
        ).includes(search);
      })
      .sort((left, right) => {
        if (sort === "occurrences-asc") {
          return left.occurrences - right.occurrences;
        }
        if (sort === "french") {
          return left.primaryMeaningFr.localeCompare(
            right.primaryMeaningFr,
            "fr",
          );
        }
        if (sort === "arabic") {
          return left.simpleArabic.localeCompare(right.simpleArabic, "ar");
        }
        return right.occurrences - left.occurrences;
      })
      .slice(0, 80);
  }, [filter, query, sort, units]);

  const familyUnits = selected?.root
    ? units.filter((unit) => unit.root === selected.root)
    : [];

  return (
    <div className="vocabulary-layout">
      <section className="vocabulary-results card">
        <div className="vocabulary-tools">
          <label className="search-field" htmlFor="vocabulary-search">
            <MagnifyingGlass size={18} />
            <input
              id="vocabulary-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Français, arabe ou racine…"
            />
          </label>
          <label className="vocabulary-sort" htmlFor="vocabulary-sort">
            <span>Trier par</span>
            <select
              className="select"
              id="vocabulary-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortValue)}
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
                onClick={() => setFilter(item.value)}
                aria-pressed={filter === item.value}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="vocabulary-count">
          <span>{results.length} résultats affichés</span>
          <span>Base : {units.length} unités réelles</span>
        </div>
        <div className="vocabulary-list">
          {results.map((unit) => (
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
        </div>
      </section>

      <aside className="vocabulary-detail card">
        {selected ? (
          <>
            <div className="vocabulary-detail-head">
              <div>
                <p className="eyebrow">Unité {selected.id.replace("qac-lemma-", "#")}</p>
                <p className="quran-text" lang="ar" dir="rtl">{selected.arabic}</p>
              </div>
              <button className="btn btn-ghost btn-icon" type="button" aria-label="Ajouter aux favoris">
                <Star size={21} />
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
              <div><dt>Niveau</dt><dd>Essentiel {selected.level === 1 ? "500" : "1 000"}</dd></div>
            </dl>
            {selected.root && familyUnits.length ? (
              <RootFamilyGraph root={selected.root} units={units} />
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
