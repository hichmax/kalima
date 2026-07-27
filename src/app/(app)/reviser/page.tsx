import type { Metadata } from "next";
import { FlashcardSession } from "@/components/flashcard-session";
import { PageHeader } from "@/components/page-header";
import { getVocabularyUnits } from "@/lib/vocabulary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Réviser le vocabulaire",
};

export default function ReviewPage() {
  const units = getVocabularyUnits().sort(
    (left, right) =>
      right.occurrences - left.occurrences ||
      left.id.localeCompare(right.id),
  );
  return (
    <>
      <PageHeader
        eyebrow="Révision jusqu’à maîtrise"
        title="Choisis ta séance, puis avance jusqu’à « Facile »."
        description="Les mots arrivent dans l’ordre du vocabulaire, du plus fréquent au moins fréquent. Arrête-toi quand tu veux : un résumé sera toujours disponible."
      />
      <FlashcardSession units={units} />
    </>
  );
}
