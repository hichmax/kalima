import type { Metadata } from "next";
import { LearningPath } from "@/components/learning-path";
import { PageHeader } from "@/components/page-header";
import { getQuranFoundationChapterVerses } from "@/lib/quran-foundation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Apprendre l’arabe",
};

export default async function LearnPage() {
  const audioByReference: Record<string, string> = {};
  try {
    const ayahs = await getQuranFoundationChapterVerses(1);
    for (const ayah of ayahs) {
      if (ayah.audioUrl) audioByReference[ayah.id] = ayah.audioUrl;
      for (const word of ayah.words) {
        if (word.audioUrl) audioByReference[word.id] = word.audioUrl;
      }
    }
  } catch {
    // Les leçons restent utilisables hors ligne, sans bouton audio actif.
  }

  return (
    <>
      <PageHeader
        eyebrow="26 leçons · du premier caractère au tajwīd"
        title="Apprendre réellement à lire l’arabe du Coran"
        description="Alphabet complet, formes liées, voyelles, lecture de mots et de phrases, signes du muṣḥaf puis fondations du tajwīd — avec exercices, récitation et sources."
      />
      <LearningPath audioByReference={audioByReference} />
    </>
  );
}
