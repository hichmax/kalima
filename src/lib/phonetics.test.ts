import { describe, expect, it } from "vitest";
import { getWordPhonetic, transliterateArabic } from "@/lib/phonetics";

describe("pedagogical phonetics", () => {
  it("transliterates frequent vocalized Quranic words", () => {
    expect(transliterateArabic("مِن")).toBe("min");
    expect(transliterateArabic("رَبّ")).toBe("rabb");
    expect(transliterateArabic("يَوْم")).toBe("yawm");
    expect(transliterateArabic("قالَ")).toBe("qāla");
    expect(transliterateArabic("اللَّه")).toBe("Allāh");
  });

  it("replaces placeholder phonetics with a local transliteration", () => {
    expect(
      getWordPhonetic({
        arabic: "ناس",
        beginnerPhonetic: "À compléter après écoute guidée",
        transliteration: "À valider",
      }),
    ).toBe("nās");
  });
});
