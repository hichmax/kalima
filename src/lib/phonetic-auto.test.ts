import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { recitationPhonetics } from "@/content/recitation";
import { autoPhonetic, prefixSegments } from "@/lib/phonetic-auto";
import type { QuranWord, SurahMorph } from "@/lib/quran-types";

const load = (n: number) => ({
  surah: JSON.parse(readFileSync(`src/generated/surahs/${n}.json`, "utf8")) as { verses: Array<{ v: number; w: QuranWord[] }> },
  morph: JSON.parse(readFileSync(`src/generated/morph/${n}.json`, "utf8")) as SurahMorph,
});
const ph = (ref: string) => {
  const [n, v] = ref.split(":").map(Number);
  const { surah, morph } = load(n);
  return autoPhonetic(surah.verses[v - 1].w, (morph.verses[v - 1] ?? []).map(prefixSegments));
};
const loose = (s: string) => s.toLowerCase().replace(/[,'’-]/g, "").replace(/â+/g, "â").replace(/î+/g, "î").replace(/û+/g, "û").replace(/\s+/g, " ").trim();

describe("phonétique automatique", () => {
  it("retrouve au moins 45 des 53 transcriptions écrites à la main", () => {
    const same = Object.entries(recitationPhonetics).filter(([ref, manual]) => loose(ph(ref)) === loose(manual)).length;
    expect(same).toBeGreaterThanOrEqual(45);
  });

  it("applique les règles clés", () => {
    expect(ph("112:1")).toBe("Qoul houwa l-lâhou aḥad"); // Allâh après voyelle, arrêt final
    expect(ph("2:1")).toBe("Alif lââââm mîîîm"); // lettres isolées
    expect(ph("1:2")).toBe("Al-ḥamdou lil-lâhi rabbi l-ʿâlamîn"); // article, li + llâh
    expect(ph("114:6")).toBe("Mina l-djinnati wa n-nâs"); // lettre solaire
    expect(ph("3:112")).toContain("bi-âyâti l-lâhi"); // hamza sur tatweel
    expect(ph("40:41")).toMatch(/^Wa yâ qawmi/); // préfixes wa + yâ
    expect(ph("107:4")).toBe("Fa-wayloul lil-mouṣallîn"); // tanwîn assimilé
    expect(ph("109:4")).toContain("ʿabattoum"); // assimilation dans le mot
  });

  it("transcrit les 6236 versets sans laisser de lettre arabe", () => {
    let count = 0;
    for (let n = 1; n <= 114; n += 1) {
      const { surah, morph } = load(n);
      for (const verse of surah.verses) {
        const text = autoPhonetic(verse.w, (morph.verses[verse.v - 1] ?? []).map(prefixSegments));
        expect(text.length, `${n}:${verse.v}`).toBeGreaterThan(0);
        expect(/[؀-ۿ]/.test(text), `${n}:${verse.v} ${text}`).toBe(false);
        count += 1;
      }
    }
    expect(count).toBe(6236);
  });
});
