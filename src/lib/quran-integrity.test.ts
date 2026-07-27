import { describe, expect, it } from "vitest";
import { chapters } from "@/data/chapters";
import { fatihaAyahs } from "@/data/quran-fixtures";

describe("Quran fixture integrity", () => {
  it("contains exactly 114 chapters in canonical order", () => {
    expect(chapters).toHaveLength(114);
    chapters.forEach((chapter, index) => expect(chapter.id).toBe(index + 1));
  });

  it("keeps ayah and word references ordered", () => {
    expect(fatihaAyahs).toHaveLength(7);
    fatihaAyahs.forEach((ayah, ayahIndex) => {
      expect(ayah.id).toBe(`1:${ayahIndex + 1}`);
      ayah.words.forEach((item, wordIndex) => {
        expect(item.position).toBe(wordIndex + 1);
        expect(item.id.startsWith(`${ayah.id}:`)).toBe(true);
      });
    });
  });
});
