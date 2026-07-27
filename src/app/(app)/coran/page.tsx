import type { Metadata } from "next";
import { QuranReader } from "@/components/quran-reader";
import { getFixtureAyahs } from "@/data/quran-fixtures";
import {
  getQuranFoundationChapterVerses,
  isQuranFoundationConfigured,
} from "@/lib/quran-foundation";

export const metadata: Metadata = {
  title: "Lire le Coran",
};

export default async function QuranPage() {
  let initialAyahs = getFixtureAyahs(1);
  let sourceConnected = false;

  if (isQuranFoundationConfigured()) {
    try {
      initialAyahs = await getQuranFoundationChapterVerses(1);
      sourceConnected = true;
    } catch {
      // The local fixture keeps the reader usable during a transient outage.
    }
  }

  return (
    <QuranReader
      initialAyahs={initialAyahs}
      sourceConnected={sourceConnected}
    />
  );
}
