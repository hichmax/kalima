import type { Metadata } from "next";
import { ReviewPage } from "@/components/review-page";

export const metadata: Metadata = { title: "Réviser" };

export default function Page() {
  return (
    <main className="narrow page stack" style={{ "--gap": "22px" } as React.CSSProperties}>
      <header className="stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <span className="eyebrow plain">Répétition espacée</span>
        <h1>Réviser</h1>
        <p className="lead">
          Chaque lettre, règle, mot et verset appris devient une carte. L&apos;algorithme FSRS la remet sous tes yeux juste
          avant que tu l&apos;oublies.
        </p>
      </header>
      <ReviewPage />
    </main>
  );
}
