import type { Metadata } from "next";
import { WordLibrary } from "@/components/word-library";
import { allLemmaEntries, lexiconSummary } from "@/lib/learning-data";

export const metadata: Metadata = { title: "Les mots du Coran" };

export default async function WordsPage() {
  const entries = await allLemmaEntries(false);
  const fr = (n: number) => n.toLocaleString("fr-FR");
  return (
    <main className="container page stack" style={{ "--gap": "24px" } as React.CSSProperties}>
      <header className="stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <span className="eyebrow plain">Vocabulaire</span>
        <h1>Les mots qui comptent</h1>
        <p className="lead">
          Les 300 lemmes les plus fréquents, plus ceux des sourates du programme. Chaque fiche donne le mot de
          dictionnaire et son sens général ; le sens en contexte se lit dans le verset.
        </p>
        <p className="faint">
          {fr(lexiconSummary.totalStems)} mots analysés, {fr(lexiconSummary.distinctLemmas)} lemmes distincts, dont{" "}
          {fr(lexiconSummary.hapax)} n&apos;apparaissent qu&apos;une fois. Source : Quranic Arabic Corpus. Sens : lexique
          Kalima, en cours de relecture.
        </p>
      </header>
      <WordLibrary entries={entries} />
    </main>
  );
}
