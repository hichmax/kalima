import { describe, expect, it } from "vitest";
import { buildLearningProfile } from "@/lib/learning-profile";

describe("buildLearningProfile", () => {
  it("starts an absolute beginner at the alphabet", () => {
    const result = buildLearningProfile({
      letters: "Aucune pour l’instant",
      reading: "Pas encore",
      goal: "Apprendre l’alphabet",
      memorized: "Aucune",
    });
    expect(result.stage).toBe("alphabet");
    expect(result.recommendedLessonId).toBe("alphabet-overview");
    expect(result.phoneticAssist).toBe("complete");
  });

  it("sends an autonomous reader who wants tajwid to tajwid", () => {
    const result = buildLearningProfile({
      letters: "Toutes",
      reading: "Oui, seul",
      goal: "Améliorer mon tajwīd",
      memorized: "Al-Fātiḥa seulement",
    });
    expect(result.stage).toBe("tajweed");
    expect(result.recommendedLessonId).toBe("tajweed-introduction");
    expect(result.learnedSurahIds).toEqual([1]);
  });

  it("sends a reader needing help to mushaf signs", () => {
    const result = buildLearningProfile({
      letters: "Toutes",
      reading: "Avec un peu d’aide",
      goal: "Lire le Coran sans phonétique",
      memorized: "Aucune",
    });
    expect(result.stage).toBe("reading");
    expect(result.recommendedLessonId).toBe("mushaf-signs");
    expect(result.phoneticAssist).toBe("progressive");
  });
});
