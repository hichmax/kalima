import { describe, expect, it } from "vitest";
import { parseSegment } from "@/lib/recitation-client";

describe("passages audio (récitant de sourate)", () => {
  it("lit le début et la fin d'un fragment temporel", () => {
    expect(parseSegment("https://download.quranicaudio.com/qdc/yasser_ad-dussary/mp3/18.mp3#t=7.21,16.90")).toEqual({
      file: "https://download.quranicaudio.com/qdc/yasser_ad-dussary/mp3/18.mp3",
      segment: { start: 7.21, end: 16.9 },
    });
  });

  it("laisse intactes les pistes d'un seul verset", () => {
    expect(parseSegment("https://verses.quran.foundation/Alafasy/mp3/018001.mp3")).toEqual({
      file: "https://verses.quran.foundation/Alafasy/mp3/018001.mp3",
      segment: null,
    });
  });
});
