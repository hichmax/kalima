"use client";

import { Segmented } from "@/components/segmented";
import { MagnifyingGlass, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { memo, useMemo, useState } from "react";
import type { LemmaEntry } from "@/lib/learning-data";
import { spellRoot } from "@/lib/morphology";
import { player } from "@/lib/recitation-client";
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

const audioCache = new Map<string, Promise<string | null>>();
function wordAudioUrl(ref: string): Promise<string | null> {
  if (!audioCache.has(ref)) {
    audioCache.set(
      ref,
      fetch(`/api/audio-mot?ref=${encodeURIComponent(ref)}`)
        .then((r) => r.json() as Promise<{ url: string | null }>)
        .then((body) => body.url)
        .catch(() => null),
    );
  }
  return audioCache.get(ref)!;
}

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
      <Segmented label="Filtrer" value={filter} onChange={setFilter} options={FILTERS.map(([id, label]) => ({ value: id, label }))} />
      <p className="faint">{visible.length} mots · touche le haut-parleur pour entendre le mot récité dans le Coran.</p>
      {filter === "appris" && hydrated ? (
        <div className="tip tip-info" role="note">
          <span>
            <strong>Comment un mot devient « appris » ?</strong> Automatiquement : chaque jour, l&apos;étape « Mots du jour »
            de ta séance te présente une dizaine de mots, puis te teste dessus. Dès ce test, le mot apparaît ici et entre
            dans tes révisions : il reviendra juste avant que tu l&apos;oublies.
            {visible.length === 0 ? " Pour l'instant, aucun mot : commence par le jour 1 du programme." : ""}
          </span>
        </div>
      ) : null}
      <ol className="lemma-grid fade-swap" key={filter}>
        {visible.map((e) => (
          <LemmaCard key={e.key} entry={e} known={hydrated && Boolean(state.cards[`lemma:${e.key}`])} />
        ))}
      </ol>
    </div>
  );
}

const LemmaCard = memo(function LemmaCard({ entry, known }: { entry: LemmaEntry; known: boolean }) {
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "unavailable">("idle");

  const listen = async () => {
    if (!entry.firstRef || status === "loading") return;
    if (status === "playing") {
      player.stop();
      return;
    }
    setStatus("loading");
    const url = await wordAudioUrl(entry.firstRef);
    if (!url) {
      setStatus("unavailable");
      setTimeout(() => setStatus("idle"), 2200);
      return;
    }
    setStatus("playing");
    await player.playOnce(url);
    setStatus("idle");
  };

  const where = entry.firstRef?.split(":").slice(0, 2).join(":");
  return (
    <li className="glass thin lemma-card tilt" data-known={known || undefined} data-audio={status}>
      <div className="row between lemma-top">
        <span className="faint num">n° {entry.rank}</span>
        {entry.firstRef ? (
          <button
            type="button"
            className="lemma-listen"
            onClick={() => void listen()}
            aria-label={status === "playing" ? "Arrêter" : `Écouter ce mot récité dans le Coran, ${where}`}
            aria-pressed={status === "playing"}
          >
            {status === "unavailable" ? <SpeakerSlash aria-hidden="true" /> : <SpeakerHigh weight={status === "playing" ? "fill" : "regular"} aria-hidden="true" />}
          </button>
        ) : null}
        <span className="faint num">{entry.count}×</span>
      </div>
      <p className="ar lemma-ar" lang="ar" dir="rtl">
        {entry.lemma}
      </p>
      <p className="lemma-fr">{entry.fr}</p>
      {entry.root ? (
        <p className="faint">
          racine <span className="ar" lang="ar">{spellRoot(entry.root)}</span>
        </p>
      ) : null}
      <p className="faint lemma-where" aria-live="polite">
        {status === "unavailable" ? "audio indisponible ici" : status === "playing" ? `récité en ${where}` : " "}
      </p>
      <div className="bar lemma-bar" title={`Couverture cumulée : ${entry.coverage} %`}>
        <span style={{ width: `${Math.min(100, entry.coverage)}%` }} />
      </div>
    </li>
  );
});
