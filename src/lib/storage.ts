"use client";

import type { LearnerProgress } from "@/lib/types";

export const progressStorageKey = "kalima:progress:v2";
const legacyProgressStorageKey = "nour:progress:v1";
export const progressEventName = "kalima:progress";

export const defaultProgress: LearnerProgress = {
  lastRoute: "/coran",
  lastAyah: "1:1",
  learnedWordIds: [],
  favoriteAyahIds: [],
  completedLessons: [],
  learnedSurahIds: [],
  reviewCount: 0,
  phoneticAssist: "complete",
  dailyMinutes: 10,
  learningProfile: {
    completed: false,
    stage: "alphabet",
    goal: "read",
    recommendedLessonId: "alphabet-overview",
    answers: {},
  },
  dailyChallenge: {
    date: "",
    completedWordIds: [],
    ratings: {},
    streak: 0,
    lastCompletedDate: null,
  },
  updatedAt: new Date(0).toISOString(),
};

export function normalizeProgress(value?: Partial<LearnerProgress> | null): LearnerProgress {
  return {
    ...defaultProgress,
    ...value,
    learningProfile: {
      ...defaultProgress.learningProfile,
      ...(value?.learningProfile || {}),
    },
    dailyChallenge: {
      ...defaultProgress.dailyChallenge,
      ...(value?.dailyChallenge || {}),
    },
  };
}

export function loadProgress(): LearnerProgress {
  if (typeof window === "undefined") return defaultProgress;
  const stored =
    window.localStorage.getItem(progressStorageKey) ||
    window.localStorage.getItem(legacyProgressStorageKey);
  if (!stored) return defaultProgress;
  try {
    const progress = normalizeProgress(JSON.parse(stored) as Partial<LearnerProgress>);
    window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
    return progress;
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: LearnerProgress): LearnerProgress {
  const next = {
    ...normalizeProgress(progress),
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(progressStorageKey, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(progressEventName, { detail: next }));
  return next;
}

export function toggleStoredId(
  list: string[],
  id: string,
): string[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}
