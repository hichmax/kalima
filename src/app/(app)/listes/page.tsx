import type { Metadata } from "next";
import { CustomListsWorkspace } from "@/components/custom-lists-workspace";
import { PageHeader } from "@/components/page-header";
import { chapters } from "@/data/chapters";
import { getVocabularyUnits } from "@/lib/vocabulary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mes listes de mots",
};

export default function ListsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Flashcards sur mesure"
        title="Crée les listes que tu veux vraiment apprendre."
        description="Mélange tes favoris, tes mots enregistrés, une sourate entière ou jusqu’à 10 versets choisis."
      />
      <CustomListsWorkspace units={getVocabularyUnits()} chapters={chapters} />
    </>
  );
}
