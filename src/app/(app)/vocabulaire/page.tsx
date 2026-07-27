import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { VocabularyLibrary } from "@/components/vocabulary-library";
import { getVocabularyUnits } from "@/lib/vocabulary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bibliothèque de vocabulaire",
};

export default function VocabularyPage() {
  return (
    <>
      <PageHeader
        eyebrow="1 000 unités issues du corpus"
        title="Retrouver un mot et sa famille"
        description="Recherche en français, en arabe, sans signes de voyelles ou par lettres de famille."
      />
      <VocabularyLibrary units={getVocabularyUnits()} />
    </>
  );
}
