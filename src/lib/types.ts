export type ReviewStatus =
  | "imported"
  | "draft"
  | "needs_review"
  | "linguistically_reviewed"
  | "religiously_reviewed"
  | "approved"
  | "published"
  | "rejected";

export type PartOfSpeech = "nom" | "verbe" | "particule" | "adjectif" | "autre";
export type LearningRating = "again" | "hard" | "good" | "easy";
export type LearningStage = "alphabet" | "decoding" | "reading" | "tajweed";
export type LearningGoal = "read" | "vocabulary" | "tajweed" | "quran-reading";

export interface SourceRef {
  id: string;
  label: string;
  url: string;
  version: string;
  license: string;
  accessedAt: string;
}

export interface QuranWord {
  id: string;
  position: number;
  arabic: string;
  simpleArabic: string;
  beginnerPhonetic: string;
  transliteration: string;
  contextualMeaning: string;
  lemma?: string;
  root?: string;
  partOfSpeech: PartOfSpeech;
  status: ReviewStatus;
  sourceIds: string[];
  audioUrl?: string;
}

export interface Ayah {
  id: string;
  surah: number;
  number: number;
  textUthmani: string;
  translationFr: string;
  words: QuranWord[];
  status: ReviewStatus;
  translationStatus: ReviewStatus;
  sourceIds: string[];
  audioUrl?: string;
}

export interface Surah {
  id: number;
  nameArabic: string;
  nameTransliterated: string;
  nameFrench: string;
  versesCount: number;
  revelationPlace: "Mecque" | "Médine";
}

export interface VocabularyUnit {
  id: string;
  arabic: string;
  simpleArabic: string;
  beginnerPhonetic: string;
  transliteration: string;
  primaryMeaningFr: string;
  contextualMeanings: string[];
  partOfSpeech: PartOfSpeech;
  lemma: string;
  root: string | null;
  frequency: number;
  occurrences: number;
  examples: string[];
  level: 1 | 2 | 3;
  themes: string[];
  family: string | null;
  sourceIds: string[];
  status: ReviewStatus;
  audioUrl?: string;
}

export interface LearnerProgress {
  lastRoute: string;
  lastAyah: string;
  learnedWordIds: string[];
  favoriteAyahIds: string[];
  completedLessons: string[];
  learnedSurahIds: number[];
  reviewCount: number;
  phoneticAssist: "complete" | "progressive" | "hidden";
  dailyMinutes: 5 | 10 | 15 | 20 | 30;
  learningProfile: {
    completed: boolean;
    stage: LearningStage;
    goal: LearningGoal;
    recommendedLessonId: string;
    answers: Record<string, string>;
  };
  dailyChallenge: {
    date: string;
    completedWordIds: string[];
    ratings: Record<string, LearningRating>;
    streak: number;
    lastCompletedDate: string | null;
  };
  updatedAt: string;
}
