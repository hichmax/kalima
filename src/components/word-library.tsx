"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { LemmaEntry } from "@/lib/learning-data";
import { spellRoot } from "@/lib/morphology";
import { useHydrated, useKalima } from "@/lib/storage";

const FILTERS = [
  ["tous", "Tous"],
  ["N", "Noms"],
  ["V", "Verbes"],
  ["P", "Particules"],
  ["appris", "Appris"],
] as const;

/** Recherche insensible aux accents latins et aux voyelles arabes. */
const strip = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ًͯ-ٰٟ]/gu, "")
    .toLowerCase();

export function WordLibrary({ entries }: { entries: LemmaEntry[] }) {
  const state = useKalima();
  const hydrated = useHydrated();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("tous");
  const visible = useMemo(() => {
    const q = strip(query.trim());
    return entries
      .filter((e) =>
        filter === "tous" ? true : filter === "appris" ? hydrated && Boolean(state.cards[`lemma:${e.key}`]) : e.pos === filter,
      )
      .filter((e) => !q || strip(`${e.fr} ${e.lemma} ${e.root ?? ""}`).includes(q))
      .sort((a, b) => a.rank - b.rank);
  }, [entries, filter, query, state.cards, hydrated]);

  return (
    <div className="stack" style={{ "--gap": "16px" } as React.CSSProperties}>
      <label className="search glass thin">
        <MagnifyingGlass aria-hidden="true" />
        <span className="visually-hidden">Rechercher un mot</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Un sens, un mot arabe, une racine" />
      </label>
      <div className="segmented" aria-label="Filtrer">
        {FILTERS.map(([id, label]) => (
          <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>
      <p className="faint">{visible.length} mots</p>
      <ol className="lemma-grid">
        {visible.map((e) => {
          const known = hydrated && Boolean(state.cards[`lemma:${e.key}`]);
          return (
            <li key={e.key} className="glass thin lemma-card" data-known={known || undefined}>
              <div className="row between">
                <span className="faint num">n° {e.rank}</span>
                <span className="faint num">{e.count}×</span>
              </div>
              <p className="ar lemma-ar" lang="ar" dir="rtl">
                {e.lemma}
              </p>
              <p className="lemma-fr">{e.fr}</p>
              {e.root ? (
                <p className="faint">
                  racine <span className="ar" lang="ar">{spellRoot(e.root)}</span>
                </p>
              ) : null}
              <div className="bar lemma-bar" title={`Couverture cumulée : ${e.coverage} %`}>
                <span style={{ width: `${Math.min(100, e.coverage)}%` }} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
