import type { Metadata } from "next";
import { CustomListsWorkspace } from "@/components/custom-lists-workspace";
import { PageHeader } from "@/components/page-header";
import { chapters } from "@/data/chapters";
import { getVocabularyPage } from "@/lib/vocabulary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mes listes de mots",
};

export default function ListsPage() {
  const initialVocabularyPage = getVocabularyPage();
  return (
    <>
      <PageHeader
        eyebrow="Flashcards sur mesure"
        title="Crée les listes que tu veux vraiment apprendre."
        description="Mélange tes favoris, tes mots enregistrés, n’importe quels mots du corpus, une sourate entière ou autant de versets que tu veux."
      />
      <CustomListsWorkspace
        initialVocabularyPage={initialVocabularyPage}
        chapters={chapters}
      />
    </>
  );
}
