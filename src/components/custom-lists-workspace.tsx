"use client";

import {
  ArrowLeft,
  BookOpenText,
  Check,
  CheckCircle,
  FolderPlus,
  FolderSimple,
  MagnifyingGlass,
  PencilSimple,
  Play,
  Plus,
  Star,
  Trash,
  X,
} from "@phosphor-icons/react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { CatalogPagination } from "@/components/catalog-pagination";
import { FlashcardSession } from "@/components/flashcard-session";
import { useApp } from "@/components/providers";
import type { Surah } from "@/lib/types";
import {
  mergePracticeWords,
  practiceWordsFromAyahs,
  toPracticeWord,
  updateCustomList,
} from "@/lib/custom-lists";
import { getWordPhonetic } from "@/lib/phonetics";
import type {
  Ayah,
  CustomWordList,
  CustomWordListOrigin,
  PracticeWord,
  VocabularyPageResult,
  VocabularyUnit,
} from "@/lib/types";

type BuilderSource = "manual" | "saved" | "quran";
const maxCustomListWords = 5000;

export function CustomListsWorkspace({
  initialVocabularyPage,
  chapters,
}: {
  initialVocabularyPage: VocabularyPageResult;
  chapters: Surah[];
}) {
  const { progress, updateProgress } = useApp();
  const lists = progress.customWordLists;
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [trainingListId, setTrainingListId] = useState<string | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [draftWords, setDraftWords] = useState<PracticeWord[]>([]);
  const [draftOrigin, setDraftOrigin] =
    useState<CustomWordListOrigin>("manual");
  const [sourceLabels, setSourceLabels] = useState<string[]>([]);
  const [builderSource, setBuilderSource] =
    useState<BuilderSource>("manual");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [vocabularyPage, setVocabularyPage] = useState(initialVocabularyPage);
  const [vocabularyPageNumber, setVocabularyPageNumber] = useState(
    initialVocabularyPage.page,
  );
  const [vocabularyLoading, setVocabularyLoading] = useState(false);
  const [vocabularyError, setVocabularyError] = useState<string | null>(null);
  const [favoriteUnits, setFavoriteUnits] = useState<VocabularyUnit[]>([]);
  const [chapterId, setChapterId] = useState(1);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [selectedAyahIds, setSelectedAyahIds] = useState<string[]>([]);
  const [loadingChapter, setLoadingChapter] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const activeList =
    lists.find((list) => list.id === activeListId) || lists[0] || null;
  const trainingList =
    lists.find((list) => list.id === trainingListId) || null;
  const selectedChapter =
    chapters.find((chapter) => chapter.id === chapterId) || chapters[0];
  const savedWords = useMemo(
    () => mergePracticeWords(progress.savedPracticeWords),
    [progress.savedPracticeWords],
  );
  const draftIds = useMemo(
    () => new Set(draftWords.map((word) => word.id)),
    [draftWords],
  );

  useEffect(() => {
    const controller = new AbortController();
    const loadVocabulary = async () => {
      setVocabularyLoading(true);
      setVocabularyError(null);
      try {
        const params = new URLSearchParams({
          query: deferredQuery,
          page: String(vocabularyPageNumber),
          pageSize: String(initialVocabularyPage.pageSize),
        });
        const response = await fetch(`/api/vocabulary?${params.toString()}`, {
          signal: controller.signal,
        });
        const body = (await response.json()) as VocabularyPageResult & {
          error?: string;
        };
        if (!response.ok) {
          throw new Error(body.error || "Impossible de charger le vocabulaire.");
        }
        setVocabularyPage(body);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }
        setVocabularyError(
          requestError instanceof Error
            ? requestError.message
            : "Impossible de charger le vocabulaire.",
        );
      } finally {
        if (!controller.signal.aborted) setVocabularyLoading(false);
      }
    };
    void loadVocabulary();
    return () => controller.abort();
  }, [deferredQuery, initialVocabularyPage.pageSize, vocabularyPageNumber]);

  useEffect(() => {
    if (!progress.favoriteVocabularyWordIds.length) {
      return;
    }
    const controller = new AbortController();
    const loadFavorites = async () => {
      const response = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: progress.favoriteVocabularyWordIds }),
        signal: controller.signal,
      });
      if (!response.ok) return;
      const body = (await response.json()) as { items: VocabularyUnit[] };
      setFavoriteUnits(body.items);
    };
    void loadFavorites();
    return () => controller.abort();
  }, [progress.favoriteVocabularyWordIds]);

  const availableFavoriteUnits = progress.favoriteVocabularyWordIds.length
    ? favoriteUnits
    : [];

  const resetBuilder = () => {
    setEditingListId(null);
    setName("");
    setDescription("");
    setDraftWords([]);
    setDraftOrigin("manual");
    setSourceLabels([]);
    setBuilderSource("manual");
    setQuery("");
    setVocabularyPageNumber(1);
    setAyahs([]);
    setSelectedAyahIds([]);
    setMessage(null);
  };

  const openNewList = () => {
    resetBuilder();
    setTrainingListId(null);
    setBuilderOpen(true);
  };

  const openEditList = (list: CustomWordList) => {
    setEditingListId(list.id);
    setName(list.name);
    setDescription(list.description);
    setDraftWords(list.words);
    setDraftOrigin(list.origin);
    setSourceLabels(list.sourceLabels);
    setBuilderSource("manual");
    setMessage(null);
    setTrainingListId(null);
    setBuilderOpen(true);
  };

  const addWords = (
    words: PracticeWord[],
    sourceLabel: string,
    origin: CustomWordListOrigin,
  ) => {
    if (!words.length) {
      setMessage("Aucun mot exploitable n’a été trouvé dans cette sélection.");
      return;
    }
    setDraftWords((current) =>
      mergePracticeWords(current, words).slice(0, maxCustomListWords),
    );
    setSourceLabels((current) =>
      Array.from(new Set([...current, sourceLabel])).slice(0, 20),
    );
    setDraftOrigin((current) =>
      draftWords.length === 0 || current === origin ? origin : "mixed",
    );
    setMessage(`${words.length} carte${words.length === 1 ? "" : "s"} ajoutée${words.length === 1 ? "" : "s"}.`);
  };

  const toggleManualWord = (word: PracticeWord) => {
    if (draftIds.has(word.id)) {
      setDraftWords((current) =>
        current.filter((item) => item.id !== word.id),
      );
      return;
    }
    addWords([word], "Sélection manuelle", "manual");
  };

  const loadChapter = async () => {
    setLoadingChapter(true);
    setMessage(null);
    setSelectedAyahIds([]);
    try {
      const response = await fetch(`/api/quran/chapters/${chapterId}/verses`);
      const body = (await response.json()) as {
        ayahs?: Ayah[];
        error?: string;
      };
      if (!response.ok || !body.ayahs) {
        throw new Error(body.error || "Impossible de charger cette sourate.");
      }
      setAyahs(body.ayahs);
      setMessage(
        `${body.ayahs.length} verset${body.ayahs.length === 1 ? "" : "s"} chargé${body.ayahs.length === 1 ? "" : "s"}.`,
      );
    } catch (error) {
      setAyahs([]);
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible de charger cette sourate.",
      );
    } finally {
      setLoadingChapter(false);
    }
  };

  const toggleAyah = (ayahId: string) => {
    setMessage(null);
    setSelectedAyahIds((current) => {
      if (current.includes(ayahId)) {
        return current.filter((id) => id !== ayahId);
      }
      return [...current, ayahId];
    });
  };

  const addSelectedAyahs = () => {
    const selected = ayahs.filter((ayah) => selectedAyahIds.includes(ayah.id));
    addWords(
      practiceWordsFromAyahs(selected),
      `${selectedChapter.nameTransliterated} · ${selectedAyahIds.length} versets`,
      "verses",
    );
    if (!name.trim() && selectedAyahIds.length) {
      setName(`Mes versets de ${selectedChapter.nameTransliterated}`);
    }
  };

  const addWholeChapter = () => {
    addWords(
      practiceWordsFromAyahs(ayahs),
      `Sourate ${selectedChapter.nameTransliterated}`,
      "surah",
    );
    if (!name.trim()) {
      setName(`Mots de ${selectedChapter.nameTransliterated}`);
    }
  };

  const selectFavoriteAyahs = () => {
    const favoriteIds = new Set(progress.favoriteAyahIds);
    const selected = ayahs
      .filter((ayah) => favoriteIds.has(ayah.id))
      .map((ayah) => ayah.id);
    setSelectedAyahIds(selected);
    setMessage(
      selected.length
        ? `${selected.length} verset${selected.length === 1 ? " favori sélectionné" : "s favoris sélectionnés"}.`
        : "Aucun verset favori dans cette sourate.",
    );
  };

  const toggleAllAyahs = () => {
    setMessage(null);
    setSelectedAyahIds((current) =>
      current.length === ayahs.length ? [] : ayahs.map((ayah) => ayah.id),
    );
  };

  const saveList = () => {
    const cleanName = name.trim();
    if (!cleanName) {
      setMessage("Donne un nom à ta liste avant de l’enregistrer.");
      return;
    }
    if (!draftWords.length) {
      setMessage("Ajoute au moins un mot à cette liste.");
      return;
    }
    const previous = lists.find((list) => list.id === editingListId);
    const now = new Date().toISOString();
    const wordIds = new Set(draftWords.map((word) => word.id));
    const list: CustomWordList = {
      id: previous?.id || crypto.randomUUID(),
      name: cleanName.slice(0, 80),
      description: description.trim().slice(0, 300),
      origin: draftOrigin,
      sourceLabels: sourceLabels.length
        ? sourceLabels
        : ["Sélection personnelle"],
      words: draftWords,
      masteredWordIds: (previous?.masteredWordIds || []).filter((id) =>
        wordIds.has(id),
      ),
      createdAt: previous?.createdAt || now,
      updatedAt: now,
    };
    updateProgress({
      customWordLists: updateCustomList(lists, list),
    });
    setActiveListId(list.id);
    setBuilderOpen(false);
    resetBuilder();
  };

  const deleteList = (list: CustomWordList) => {
    if (!window.confirm(`Supprimer la liste « ${list.name} » ?`)) return;
    const next = lists.filter((item) => item.id !== list.id);
    updateProgress({ customWordLists: next });
    setActiveListId(next[0]?.id || null);
    setTrainingListId(null);
  };

  const updateListMastery = (list: CustomWordList, wordId: string) => {
    const updated: CustomWordList = {
      ...list,
      masteredWordIds: Array.from(
        new Set([...list.masteredWordIds, wordId]),
      ),
      updatedAt: new Date().toISOString(),
    };
    updateProgress({ customWordLists: updateCustomList(lists, updated) });
  };

  const resetListMastery = (list: CustomWordList) => {
    const updated: CustomWordList = {
      ...list,
      masteredWordIds: [],
      updatedAt: new Date().toISOString(),
    };
    updateProgress({ customWordLists: updateCustomList(lists, updated) });
  };

  if (trainingList) {
    return (
      <section className="custom-list-training">
        <div className="custom-list-training-head">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => setTrainingListId(null)}
          >
            <ArrowLeft size={18} /> Mes listes
          </button>
          <div>
            <p className="eyebrow">Entraînement personnalisé</p>
            <h2>{trainingList.name}</h2>
            <p className="muted">
              {trainingList.words.length} carte{trainingList.words.length === 1 ? "" : "s"} · {trainingList.masteredWordIds.length} facile{trainingList.masteredWordIds.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <FlashcardSession
          units={trainingList.words}
          masteredWordIds={trainingList.masteredWordIds}
          onMasterWord={(wordId) => updateListMastery(trainingList, wordId)}
          poolLabel="cette liste"
        />
      </section>
    );
  }

  return (
    <div className="custom-lists-workspace">
      <aside className="custom-lists-rail card">
        <div className="custom-lists-rail-head">
          <div>
            <p className="eyebrow">Bibliothèque personnelle</p>
            <h2>Mes listes</h2>
          </div>
          <button
            className="btn btn-primary btn-icon"
            type="button"
            onClick={openNewList}
            aria-label="Créer une nouvelle liste"
          >
            <FolderPlus size={20} />
          </button>
        </div>
        <div className="custom-lists-rail-list">
          {lists.map((list) => (
            <button
              className={activeList?.id === list.id ? "active" : ""}
              type="button"
              key={list.id}
              onClick={() => {
                setActiveListId(list.id);
                setBuilderOpen(false);
              }}
              aria-pressed={activeList?.id === list.id}
            >
              <FolderSimple size={20} weight={activeList?.id === list.id ? "fill" : "regular"} />
              <span>
                <strong>{list.name}</strong>
                <small>
                  {list.words.length} mot{list.words.length === 1 ? "" : "s"} · {list.masteredWordIds.length} facile{list.masteredWordIds.length === 1 ? "" : "s"}
                </small>
              </span>
            </button>
          ))}
        </div>
        {!lists.length ? (
          <div className="custom-lists-rail-empty">
            <FolderSimple size={28} />
            <span>Tes listes apparaîtront ici.</span>
          </div>
        ) : null}
      </aside>

      <main className="custom-lists-main">
        {builderOpen ? (
          <section className="custom-list-builder card">
            <div className="custom-list-builder-head">
              <div>
                <p className="eyebrow">
                  {editingListId ? "Modifier la liste" : "Nouvelle liste"}
                </p>
                <h2>
                  {editingListId
                    ? "Fais évoluer ta sélection"
                    : "Que veux-tu apprendre ?"}
                </h2>
              </div>
              <button
                className="btn btn-ghost btn-icon"
                type="button"
                onClick={() => setBuilderOpen(false)}
                aria-label="Fermer le créateur de liste"
              >
                <X size={20} />
              </button>
            </div>

            <div className="custom-list-fields">
              <label>
                <span>Nom de la liste</span>
                <input
                  className="input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex. Les mots de Yā-Sīn"
                  maxLength={80}
                />
              </label>
              <label>
                <span>Description <small>(facultatif)</small></span>
                <input
                  className="input"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Mon objectif pour cette liste…"
                  maxLength={300}
                />
              </label>
            </div>

            <nav className="custom-list-source-tabs" aria-label="Sources de mots">
              {[
                ["manual", "Vocabulaire"],
                ["saved", "Favoris et enregistrés"],
                ["quran", "Sourate et versets"],
              ].map(([value, label]) => (
                <button
                  className={builderSource === value ? "active" : ""}
                  type="button"
                  key={value}
                  onClick={() => setBuilderSource(value as BuilderSource)}
                  aria-pressed={builderSource === value}
                >
                  {label}
                </button>
              ))}
            </nav>

            {builderSource === "manual" ? (
              <section className="custom-list-source-panel">
                <label className="search-field" htmlFor="list-word-search">
                  <MagnifyingGlass size={18} />
                  <input
                    id="list-word-search"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setVocabularyPageNumber(1);
                    }}
                    placeholder="Chercher en français, arabe ou phonétique…"
                  />
                </label>
                <p className="muted custom-list-helper">
                  Recherche dans les {initialVocabularyPage.total.toLocaleString("fr-FR")} unités couvrant tout le corpus, puis ajoute celles que tu veux travailler.
                </p>
                <WordPicker
                  words={vocabularyPage.items}
                  selectedIds={draftIds}
                  onToggle={toggleManualWord}
                  emptyLabel="Essaie un autre mot ou une autre orthographe."
                />
                {vocabularyError ? (
                  <p className="form-error" role="alert">{vocabularyError}</p>
                ) : null}
                <div className="custom-list-catalog-count">
                  <span>
                    {vocabularyPage.total.toLocaleString("fr-FR")} résultat{vocabularyPage.total === 1 ? "" : "s"}
                  </span>
                  <span>Page {vocabularyPage.page}/{vocabularyPage.totalPages}</span>
                </div>
                <CatalogPagination
                  page={vocabularyPage.page}
                  totalPages={vocabularyPage.totalPages}
                  onChange={setVocabularyPageNumber}
                  disabled={vocabularyLoading}
                />
              </section>
            ) : null}

            {builderSource === "saved" ? (
              <section className="custom-list-source-panel stack">
                <div className="custom-list-import-cards">
                  <button
                    type="button"
                    onClick={() =>
                      addWords(
                        availableFavoriteUnits.map(toPracticeWord),
                        "Mots favoris",
                        "favorites",
                      )
                    }
                    disabled={!availableFavoriteUnits.length}
                  >
                    <Star size={24} weight="fill" />
                    <strong>Ajouter mes favoris</strong>
                    <small>{availableFavoriteUnits.length} mots disponibles</small>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      addWords(
                        savedWords,
                        "Mots enregistrés",
                        "favorites",
                      )
                    }
                    disabled={!savedWords.length}
                  >
                    <CheckCircle size={24} weight="fill" />
                    <strong>Ajouter mes mots enregistrés</strong>
                    <small>{savedWords.length} mots disponibles</small>
                  </button>
                </div>
                {!availableFavoriteUnits.length && !savedWords.length ? (
                  <div className="custom-list-empty-state soft-card">
                    <Star size={25} />
                    <div>
                      <strong>Commence par enregistrer quelques mots</strong>
                      <p className="muted">
                        Utilise l’étoile dans Vocabulaire ou ajoute des mots depuis l’étude d’un verset.
                      </p>
                    </div>
                  </div>
                ) : (
                  <WordPicker
                    words={mergePracticeWords(
                      availableFavoriteUnits.map(toPracticeWord),
                      savedWords,
                    )}
                    selectedIds={draftIds}
                    onToggle={(word) => {
                      if (draftIds.has(word.id)) {
                        setDraftWords((current) => current.filter((item) => item.id !== word.id));
                      } else {
                        addWords([word], "Favoris et enregistrés", "favorites");
                      }
                    }}
                    emptyLabel="Aucun mot enregistré pour le moment."
                  />
                )}
              </section>
            ) : null}

            {builderSource === "quran" ? (
              <section className="custom-list-source-panel stack">
                <div className="custom-list-chapter-tools">
                  <label htmlFor="custom-list-chapter">
                    <span>Sourate</span>
                    <select
                      className="select"
                      id="custom-list-chapter"
                      value={chapterId}
                      onChange={(event) => {
                        setChapterId(Number(event.target.value));
                        setAyahs([]);
                        setSelectedAyahIds([]);
                      }}
                    >
                      {chapters.map((chapter) => (
                        <option value={chapter.id} key={chapter.id}>
                          {chapter.id}. {chapter.nameTransliterated} · {chapter.nameFrench}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={loadChapter}
                    disabled={loadingChapter}
                  >
                    <BookOpenText size={18} />
                    {loadingChapter ? "Chargement…" : "Charger les versets"}
                  </button>
                </div>

                {ayahs.length ? (
                  <>
                    <div className="custom-list-quran-actions">
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={addWholeChapter}
                      >
                        <Plus size={18} /> Toute la sourate
                      </button>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={toggleAllAyahs}
                      >
                        <CheckCircle size={18} />
                        {selectedAyahIds.length === ayahs.length
                          ? "Tout désélectionner"
                          : "Sélectionner toute la sourate"}
                      </button>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={selectFavoriteAyahs}
                      >
                        <Star size={18} /> Mes versets favoris
                      </button>
                      <span className="chip">
                        {selectedAyahIds.length} verset{selectedAyahIds.length === 1 ? "" : "s"} sélectionné{selectedAyahIds.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="custom-list-ayah-grid" aria-label="Choisir les versets à ajouter">
                      {ayahs.map((ayah) => {
                        const selected = selectedAyahIds.includes(ayah.id);
                        return (
                          <button
                            className={selected ? "selected" : ""}
                            type="button"
                            key={ayah.id}
                            onClick={() => toggleAyah(ayah.id)}
                            aria-pressed={selected}
                          >
                            <span>{ayah.number}</span>
                            <strong className="quran-text" lang="ar" dir="rtl">
                              {ayah.textUthmani}
                            </strong>
                            {selected ? <Check size={17} weight="bold" /> : null}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={addSelectedAyahs}
                      disabled={!selectedAyahIds.length}
                    >
                      Ajouter les mots des {selectedAyahIds.length} verset{selectedAyahIds.length === 1 ? "" : "s"}
                      <Plus size={18} />
                    </button>
                  </>
                ) : (
                  <div className="custom-list-empty-state soft-card">
                    <BookOpenText size={26} />
                    <div>
                      <strong>Charge une sourate pour commencer</strong>
                      <p className="muted">
                        Tu pourras ajouter tous ses mots uniques ou sélectionner autant de versets précis que tu veux.
                      </p>
                    </div>
                  </div>
                )}
              </section>
            ) : null}

            <section className="custom-list-draft">
              <div className="custom-list-draft-head">
                <div>
                  <p className="eyebrow">Ta sélection</p>
                  <h3>{draftWords.length} carte{draftWords.length === 1 ? "" : "s"}</h3>
                </div>
                {draftWords.length ? (
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => setDraftWords([])}
                  >
                    Tout retirer
                  </button>
                ) : null}
              </div>
              {draftWords.length ? (
                <div className="custom-list-draft-words">
                  {draftWords.slice(0, 120).map((word) => (
                    <span key={word.id}>
                      <span className="quran-text" lang="ar" dir="rtl">{word.arabic}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setDraftWords((current) => current.filter((item) => item.id !== word.id))
                        }
                        aria-label={`Retirer ${word.arabic}`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  {draftWords.length > 120 ? (
                    <span className="custom-list-more">+ {draftWords.length - 120} autres</span>
                  ) : null}
                </div>
              ) : (
                <p className="muted">Ajoute des mots depuis l’une des trois sources ci-dessus.</p>
              )}
            </section>

            {message ? <p className="custom-list-message" role="status">{message}</p> : null}

            <div className="custom-list-builder-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setBuilderOpen(false)}
              >
                Annuler
              </button>
              <button className="btn btn-primary" type="button" onClick={saveList}>
                {editingListId ? "Enregistrer les modifications" : "Créer la liste"}
                <Check size={18} weight="bold" />
              </button>
            </div>
          </section>
        ) : activeList ? (
          <ListDetail
            list={activeList}
            onTrain={() => setTrainingListId(activeList.id)}
            onEdit={() => openEditList(activeList)}
            onDelete={() => deleteList(activeList)}
            onReset={() => resetListMastery(activeList)}
          />
        ) : (
          <section className="custom-lists-welcome card">
            <span className="custom-lists-welcome-icon"><FolderPlus size={34} /></span>
            <p className="eyebrow">Ton espace personnel</p>
            <h2>Crée une liste qui correspond à ce que tu lis.</h2>
            <p className="muted">
              Pars de tes favoris, d’une sourate entière, d’autant de versets que tu veux ou d’une recherche dans les {initialVocabularyPage.total.toLocaleString("fr-FR")} mots du corpus.
            </p>
            <button className="btn btn-primary" type="button" onClick={openNewList}>
              Créer ma première liste <FolderPlus size={19} />
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

function WordPicker({
  words,
  selectedIds,
  onToggle,
  emptyLabel,
}: {
  words: PracticeWord[];
  selectedIds: Set<string>;
  onToggle: (word: PracticeWord) => void;
  emptyLabel: string;
}) {
  if (!words.length) {
    return <p className="custom-list-no-results">{emptyLabel}</p>;
  }
  return (
    <div className="custom-list-word-picker">
      {words.map((word) => {
        const selected = selectedIds.has(word.id);
        return (
          <button
            className={selected ? "selected" : ""}
            type="button"
            key={word.id}
            onClick={() => onToggle(word)}
            aria-pressed={selected}
          >
            <span className="quran-text" lang="ar" dir="rtl">{word.arabic}</span>
            <span>
              <strong>{word.primaryMeaningFr}</strong>
              <small>{getWordPhonetic(word)}</small>
            </span>
            {selected ? <Check size={18} weight="bold" /> : <Plus size={18} />}
          </button>
        );
      })}
    </div>
  );
}

function ListDetail({
  list,
  onTrain,
  onEdit,
  onDelete,
  onReset,
}: {
  list: CustomWordList;
  onTrain: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReset: () => void;
}) {
  const mastered = new Set(list.masteredWordIds);
  const percentage = list.words.length
    ? Math.round((list.masteredWordIds.length / list.words.length) * 100)
    : 0;
  return (
    <section className="custom-list-detail card">
      <header className="custom-list-detail-head">
        <div>
          <p className="eyebrow">Liste personnelle</p>
          <h2>{list.name}</h2>
          <p className="muted">
            {list.description || "Une sélection prête à être travaillée en flashcards."}
          </p>
        </div>
        <div className="cluster">
          <button className="btn btn-secondary" type="button" onClick={onEdit}>
            <PencilSimple size={18} /> Modifier
          </button>
          <button className="btn btn-primary" type="button" onClick={onTrain} disabled={!list.words.length}>
            <Play size={18} weight="fill" /> S’entraîner
          </button>
        </div>
      </header>

      <div className="custom-list-stats">
        <div><strong>{list.words.length}</strong><span>carte{list.words.length === 1 ? "" : "s"}</span></div>
        <div><strong>{list.masteredWordIds.length}</strong><span>facile{list.masteredWordIds.length === 1 ? "" : "s"}</span></div>
        <div><strong>{percentage}%</strong><span>maîtrisé</span></div>
      </div>
      <div className="progress-track" aria-label={`${percentage}% de la liste classée Facile`}>
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
      <div className="custom-list-sources">
        {list.sourceLabels.map((label) => <span className="chip" key={label}>{label}</span>)}
      </div>

      <div className="custom-list-detail-words">
        {list.words.slice(0, 100).map((word) => (
          <article key={word.id} className={mastered.has(word.id) ? "mastered" : ""}>
            <span className="quran-text" lang="ar" dir="rtl">{word.arabic}</span>
            <span><strong>{word.primaryMeaningFr}</strong><small>{getWordPhonetic(word)}</small></span>
            {mastered.has(word.id) ? <CheckCircle size={19} weight="fill" /> : null}
          </article>
        ))}
      </div>
      {list.words.length > 100 ? (
        <p className="muted custom-list-limit-note">
          Aperçu des 100 premières cartes · {list.words.length - 100} autres seront bien incluses dans l’entraînement.
        </p>
      ) : null}

      <footer className="custom-list-detail-actions">
        {list.masteredWordIds.length ? (
          <button className="btn btn-ghost" type="button" onClick={onReset}>
            Recommencer cette liste
          </button>
        ) : <span />}
        <button className="btn btn-ghost custom-list-delete" type="button" onClick={onDelete}>
          <Trash size={18} /> Supprimer la liste
        </button>
      </footer>
    </section>
  );
}
