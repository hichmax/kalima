import { beforeEach, describe, expect, it } from "vitest";
import {
  defaultProgress,
  loadProgress,
  progressStorageKey,
  saveProgress,
} from "@/lib/storage";

describe("local progress", () => {
  beforeEach(() => window.localStorage.clear());

  it("starts with a safe local default", () => {
    expect(loadProgress().lastAyah).toBe("1:1");
  });

  it("persists the selected study duration", () => {
    saveProgress({ ...defaultProgress, dailyMinutes: 20 });
    expect(JSON.parse(localStorage.getItem(progressStorageKey) || "{}").dailyMinutes).toBe(20);
  });

  it("normalizes the daily challenge when loading an older progress payload", () => {
    window.localStorage.setItem(
      progressStorageKey,
      JSON.stringify({ lastAyah: "2:255", dailyMinutes: 5 }),
    );
    expect(loadProgress().dailyChallenge.completedWordIds).toEqual([]);
    expect(loadProgress().favoriteVocabularyWordIds).toEqual([]);
    expect(loadProgress().savedPracticeWords).toEqual([]);
    expect(loadProgress().customWordLists).toEqual([]);
    expect(loadProgress().lastAyah).toBe("2:255");
  });
});
