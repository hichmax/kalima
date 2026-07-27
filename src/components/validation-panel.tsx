"use client";

import {
  Check,
  DownloadSimple,
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { QuranAudioPlayer } from "@/components/quran-audio-player";
import { SourceReference } from "@/components/source-reference";
import type {
  ReviewStatus,
  VocabularyUnit,
} from "@/lib/types";

type ReviewItem = {
  id: string;
  reference: string;
  unit: VocabularyUnit;
  sourceIds: string[];
  status: ReviewStatus;
  updatedAt: string;
};

const statusLabels: Partial<Record<ReviewStatus, string>> = {
  needs_review: "À vérifier",
  approved: "Approuvé",
  published: "Publié",
  rejected: "Rejeté",
};

const normalize = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u064B-\u065F\u0670\u06D6-\u06ED]/gu, "")
    .toLocaleLowerCase("fr");

export function ValidationPanel({
  initialItems,
}: {
  initialItems: ReviewItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState(initialItems[0]?.id || "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "needs_review" | "approved" | "rejected"
  >("needs_review");
  const [visibleCount, setVisibleCount] = useState(60);
  const selected = items.find((item) => item.id === selectedId) || items[0];
  const [meaning, setMeaning] = useState(
    initialItems[0]?.unit.primaryMeaningFr || "",
  );
  const [phonetic, setPhonetic] = useState(
    initialItems[0]?.unit.beginnerPhonetic || "",
  );
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const counts = useMemo(
    () =>
      items.reduce(
        (result, item) => {
          result[item.status] = (result[item.status] || 0) + 1;
          return result;
        },
        {} as Partial<Record<ReviewStatus, number>>,
      ),
    [items],
  );

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!needle) return true;
      return normalize(
        `${item.unit.arabic} ${item.unit.primaryMeaningFr} ${item.unit.beginnerPhonetic} ${item.reference}`,
      ).includes(needle);
    });
  }, [items, query, statusFilter]);

  const selectItem = (item: ReviewItem) => {
    setSelectedId(item.id);
    setMeaning(item.unit.primaryMeaningFr);
    setPhonetic(item.unit.beginnerPhonetic);
    setComment("");
    setMessage("");
  };

  const saveDecision = async (nextStatus: "approved" | "rejected") => {
    if (!selected) return;
    setSaving(true);
    setMessage("");
    const nextUnit: VocabularyUnit = {
      ...selected.unit,
      primaryMeaningFr: meaning.trim(),
      contextualMeanings: Array.from(
        new Set([
          meaning.trim(),
          ...selected.unit.contextualMeanings.filter(Boolean),
        ]),
      ),
      beginnerPhonetic: phonetic.trim(),
      transliteration: phonetic.trim(),
      status: nextStatus,
    };
    const response = await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentItemId: selected.id,
        nextStatus,
        comment,
        payload: nextUnit,
      }),
    });
    if (response.ok) {
      setItems((current) =>
        current.map((item) =>
          item.id === selected.id
            ? { ...item, status: nextStatus, unit: nextUnit }
            : item,
        ),
      );
      setMessage(
        nextStatus === "approved"
          ? "Mot approuvé : cette version sera utilisée dans les écrans d’apprentissage."
          : "Mot rejeté et conservé dans la file pour correction.",
      );
      setComment("");
    } else {
      setMessage("La décision n’a pas pu être enregistrée.");
    }
    setSaving(false);
  };

  if (!selected) {
    return <p className="card card-pad">Aucun mot dans la file locale.</p>;
  }

  return (
    <div className="validation-layout">
      <aside className="validation-queue card">
        <div className="card-pad validation-queue-head">
          <p className="eyebrow">File locale</p>
          <h2>
            {counts.needs_review || 0} à vérifier
            <small> sur {items.length}</small>
          </h2>
          <label className="search-field" htmlFor="review-search">
            <MagnifyingGlass size={17} />
            <input
              id="review-search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(60);
              }}
              placeholder="Arabe, français, phonétique…"
            />
          </label>
          <label className="screen-reader-only" htmlFor="review-status">
            Statut
          </label>
          <select
            id="review-status"
            className="select"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(
                event.target.value as typeof statusFilter,
              );
              setVisibleCount(60);
            }}
          >
            <option value="needs_review">
              À vérifier ({counts.needs_review || 0})
            </option>
            <option value="approved">
              Approuvés ({counts.approved || 0})
            </option>
            <option value="rejected">
              Rejetés ({counts.rejected || 0})
            </option>
            <option value="all">Tous ({items.length})</option>
          </select>
        </div>

        <div className="validation-list">
          {filtered.slice(0, visibleCount).map((item) => (
            <button
              className={`validation-item ${
                item.id === selected.id ? "active" : ""
              }`}
              type="button"
              key={item.id}
              onClick={() => selectItem(item)}
            >
              <span className={`status-dot status-dot-${item.status}`} />
              <span>
                <strong>
                  <span lang="ar" dir="rtl">{item.unit.arabic}</span>
                  {" · "}
                  <span lang="fr" dir="ltr">{item.unit.primaryMeaningFr}</span>
                </strong>
                <small>
                  {item.unit.beginnerPhonetic} ·{" "}
                  {statusLabels[item.status] || item.status}
                </small>
              </span>
            </button>
          ))}
          {visibleCount < filtered.length ? (
            <button
              className="btn btn-ghost validation-more"
              type="button"
              onClick={() => setVisibleCount((count) => count + 60)}
            >
              Afficher 60 mots de plus
            </button>
          ) : null}
        </div>
      </aside>

      <section className="validation-workbench card card-pad">
        <div className="validation-workbench-head">
          <div>
            <p className="eyebrow">
              Mot {selected.reference} ·{" "}
              {statusLabels[selected.status] || selected.status}
            </p>
            <h1>Vérifier la fiche</h1>
          </div>
          <a className="btn btn-secondary" href="/api/admin/export">
            <DownloadSimple size={18} /> Export CSV
          </a>
        </div>

        <div className="validation-word-preview">
          <div>
            <p className="quran-text" lang="ar" dir="rtl" translate="no">
              {selected.unit.arabic}
            </p>
            <p className="validation-phonetic" lang="fr-Latn" dir="ltr">
              {phonetic}
            </p>
          </div>
          <QuranAudioPlayer
            src={selected.unit.audioUrl}
            label={`Écouter ${selected.unit.arabic}`}
          />
        </div>

        <div className="validation-fields">
          <label>
            <span className="field-label">Traduction française proposée</span>
            <input
              className="input"
              lang="fr"
              dir="ltr"
              value={meaning}
              onChange={(event) => setMeaning(event.target.value)}
            />
          </label>
          <label>
            <span className="field-label">Phonétique proposée</span>
            <input
              className="input"
              lang="fr-Latn"
              dir="ltr"
              value={phonetic}
              onChange={(event) => setPhonetic(event.target.value)}
            />
          </label>
        </div>

        <dl className="word-dl">
          <div>
            <dt>Occurrence exacte</dt>
            <dd>{selected.reference.replaceAll(":", " : ")}</dd>
          </div>
          <div>
            <dt>Fréquence du lemme</dt>
            <dd>{selected.unit.occurrences} occurrences</dd>
          </div>
          <div>
            <dt>Catégorie</dt>
            <dd>{selected.unit.partOfSpeech}</dd>
          </div>
        </dl>

        <SourceReference sourceIds={selected.sourceIds} />
        <p className="validation-source-note">
          La traduction contextuelle, la translittération et l’audio de cette
          occurrence proviennent de Quran.Foundation Content API v4. Le lemme,
          la racine et la fréquence proviennent du Quranic Arabic Corpus.
        </p>

        <label>
          <span className="field-label">Commentaire de relecture</span>
          <textarea
            className="review-textarea"
            rows={3}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Ex. vérifié avec l’occurrence et la source indiquées…"
          />
        </label>
        <div className="validation-actions">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => void saveDecision("rejected")}
            disabled={saving || comment.trim().length < 3}
          >
            <X size={18} /> Rejeter
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => void saveDecision("approved")}
            disabled={
              saving ||
              comment.trim().length < 3 ||
              meaning.trim().length < 1 ||
              phonetic.trim().length < 1
            }
          >
            <Check size={18} /> Approuver
          </button>
          <span role="status" className="muted">
            {saving
              ? "Enregistrement dans SQLite…"
              : message ||
                "Ajoute un commentaire pour enregistrer la décision."}
          </span>
        </div>
      </section>
    </div>
  );
}
