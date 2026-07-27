import { describe, expect, it } from "vitest";
import { alphabetLetters, beginnerLessons } from "@/data/lessons";

describe("beginner lessons", () => {
  it("provides one unique audio file for every Arabic letter", () => {
    expect(alphabetLetters).toHaveLength(28);
    expect(new Set(alphabetLetters.map((letter) => letter.arabic)).size).toBe(28);
    expect(new Set(alphabetLetters.map((letter) => letter.audioSrc)).size).toBe(28);

    for (const letter of alphabetLetters) {
      expect(letter.spokenArabic).toBeTruthy();
      expect(letter.audioSrc).toMatch(/^\/audio\/alphabet\/.+\.wav$/);
    }
  });

  it("asks the first visual quizzes by transliterated letter name", () => {
    expect(beginnerLessons[0].quiz.question).toContain("bāʾ");
    expect(beginnerLessons[0].quiz.question).not.toContain("ب");
    expect(beginnerLessons[1].quiz.question).toContain("tāʾ");
    expect(beginnerLessons[1].quiz.question).not.toContain("ت");
  });
});
