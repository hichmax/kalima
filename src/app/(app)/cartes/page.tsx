import type { Metadata } from "next";
import { DecksPage } from "@/components/decks-page";
import { surahIndex } from "@/lib/quran-data";

export const metadata: Metadata = { title: "Mes cartes" };

export default function CardsPage() {
  return (
    <main className="narrow page stack" style={{ "--gap": "22px" } as React.CSSProperties}>
      <header className="stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <span className="eyebrow plain">Flashcards et quiz</span>
        <h1>Mes cartes</h1>
        <p className="lead">
          Choisis des versets, par exemple les dix premiers d&apos;al-Kahf : chaque mot et chaque verset devient une carte. Écoute,
          regarde la phonétique si tu bloques, retourne la carte, et dis si tu as trouvé.
        </p>
      </header>
      <DecksPage surahs={surahIndex} />
    </main>
  );
}
