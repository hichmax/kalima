import type { Metadata } from "next";
import lexiconStats from "@/generated/lexicon-stats.json";
import { ProgressView } from "@/components/progress-view";

export const metadata: Metadata = { title: "Ta progression" };

export default function ProgressPage() {
  // Courbe de couverture : % cumulé des occurrences selon le rang des lemmes (Quranic Arabic Corpus).
  const ranked = lexiconStats.lemmas.filter((l) => l.rank <= 300).sort((a, b) => a.rank - b.rank);
  const curve: Array<[number, number]> = [[0, 0], ...ranked.filter((l) => l.rank % 5 === 0 || l.rank === 1).map((l) => [l.rank, l.coverage] as [number, number])];
  const lemmaCounts = Object.fromEntries(lexiconStats.lemmas.map((l) => [l.key, l.count]));
  return (
    <main className="container page stack" style={{ "--gap": "22px" } as React.CSSProperties}>
      <header className="stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <span className="eyebrow plain">Tableau de bord</span>
        <h1>Ta progression</h1>
        <p className="lead">Ta régularité, la solidité de ta mémoire, et la part du Coran que tu reconnais déjà.</p>
      </header>
      <ProgressView curve={curve} lemmaCounts={lemmaCounts} totalStems={lexiconStats.totalStems} />
    </main>
  );
}
