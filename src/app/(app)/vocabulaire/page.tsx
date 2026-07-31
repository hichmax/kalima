import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { VocabularyLibrary } from "@/components/vocabulary-library";
import { getVocabularyPage } from "@/lib/vocabulary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bibliothèque de vocabulaire",
};

export default function VocabularyPage() {
  const initialPage = getVocabularyPage();
  const totalLabel = new Intl.NumberFormat("fr-FR").format(initialPage.total);
  return (
    <>
      <PageHeader
        eyebrow={`${totalLabel} unités couvrant tout le corpus`}
        title="Retrouver un mot et sa famille"
        description="Parcours tous les mots du Coran par pages, ou recherche en français, en arabe, sans voyelles et par lettres de famille."
      />
      <VocabularyLibrary initialPage={initialPage} />
    </>
  );
}
