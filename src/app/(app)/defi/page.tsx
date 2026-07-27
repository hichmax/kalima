import type { Metadata } from "next";
import { DailyWordChallenge } from "@/components/daily-word-challenge";
import { getTodayKey, selectDailyWords } from "@/lib/daily-challenge";
import { getVocabularyUnits } from "@/lib/vocabulary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Défi de 5 mots",
  description: "Apprends cinq mots d’arabe coranique aujourd’hui.",
};

export default function DailyChallengePage() {
  const date = getTodayKey();
  const words = selectDailyWords(getVocabularyUnits(), date);

  return <DailyWordChallenge date={date} words={words} />;
}
