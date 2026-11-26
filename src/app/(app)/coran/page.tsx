import type { Metadata } from "next";
import { SurahIndex } from "@/components/reader";
import { surahIndex } from "@/lib/quran-data";

export const metadata: Metadata = { title: "Le Coran" };

export default function QuranPage() {
  return (
    <main className="narrow page stack" style={{ "--gap": "24px" } as React.CSSProperties}>
      <header className="stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <span className="eyebrow plain">Lecteur</span>
        <h1>Le Coran</h1>
        <p className="lead">
          114 sourates, texte uthmānī (Tanzil). Touche un verset pour étudier chacun de ses mots : décomposition et sens général.
          Lecture : Ḥafṣ ʿan ʿĀṣim.
        </p>
      </header>
      <SurahIndex surahs={surahIndex} />
    </main>
  );
}
