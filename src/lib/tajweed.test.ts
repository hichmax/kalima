import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { tajweedVerse } from "@/lib/tajweed";
import type { QuranWord } from "@/lib/quran-types";

const verse = (n: number, v: number) =>
  (JSON.parse(readFileSync(`src/generated/surahs/${n}.json`, "utf8")).verses as Array<{ w: QuranWord[] }>)[v - 1].w.map((w) => w.ar);
const rulesOf = (n: number, v: number) => tajweedVerse(verse(n, v)).map((word) => word.filter((s) => s.r).map((s) => `${s.r}:${s.t}`));

describe("couleurs du tajwīd", () => {
  it("ne modifie jamais le texte : les segments redonnent chaque mot des 6236 versets", () => {
    let count = 0;
    const mismatches: string[] = [];
    for (let n = 1; n <= 114; n += 1) {
      const surah = JSON.parse(readFileSync(`src/generated/surahs/${n}.json`, "utf8")) as { verses: Array<{ w: QuranWord[] }> };
      for (const v of surah.verses) {
        const words = v.w.map((w) => w.ar);
        tajweedVerse(words).forEach((segments, i) => {
          if (segments.map((s) => s.t).join("") !== words[i]) mismatches.push(`${n}:${count}:${i}`);
        });
        count += 1;
      }
    }
    expect(mismatches).toEqual([]);
    expect(count).toBe(6236);
  }, 60_000);

  it("repère les règles attendues dans al-Fātiḥa et al-Ikhlāṣ", () => {
    const fatiha7 = rulesOf(1, 7).flat();
    expect(fatiha7.some((r) => r.startsWith("madd6:"))).toBe(true); // ٱلضَّآلِّينَ
    expect(fatiha7.some((r) => r.startsWith("silent:"))).toBe(true); // alif de liaison, lām solaire
    const ikhlas1 = rulesOf(112, 1);
    expect(ikhlas1.at(-1)!.some((r) => r.startsWith("qalqala:"))).toBe(true); // أَحَدٌ à l'arrêt
    expect(rulesOf(1, 1).flat().filter((r) => r.startsWith("silent:")).length).toBeGreaterThanOrEqual(3); // ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
    expect(rulesOf(108, 1)[0].some((r) => r.startsWith("ghunna:"))).toBe(true); // إِنَّآ : nūn chaddé
    expect(rulesOf(108, 1)[0].some((r) => r.startsWith("madd246:"))).toBe(true); // إِنَّآ أَعْطَيْنَٰكَ
    expect(rulesOf(110, 1).flat().some((r) => r.startsWith("madd45:"))).toBe(true); // جَآءَ
    expect(rulesOf(2, 1)[0].some((r) => r.startsWith("madd6:"))).toBe(true); // الٓمٓ
  });
});
