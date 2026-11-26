import type { Metadata } from "next";
import { Suspense } from "react";
import { ListenPlayer } from "@/components/listen-player";
import { surahIndex } from "@/lib/quran-data";

export const metadata: Metadata = { title: "Écouter et répéter" };

export default function ListenPage() {
  return (
    <main className="narrow page stack" style={{ "--gap": "22px" } as React.CSSProperties}>
      <header className="stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <span className="eyebrow plain">Mémoriser à l&apos;oreille</span>
        <h1>Écouter et répéter</h1>
        <p className="lead">
          Choisis un ou plusieurs versets, combien de fois les répéter, et laisse un temps de silence pour les redire
          après le récitant.
        </p>
      </header>
      <Suspense fallback={<p className="faint">Chargement…</p>}>
        <ListenPlayer surahs={surahIndex} />
      </Suspense>
    </main>
  );
}
