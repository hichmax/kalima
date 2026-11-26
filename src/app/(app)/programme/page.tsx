import type { Metadata } from "next";
import { ProgramList } from "@/components/program-list";
import { allLessons } from "@/content/program";
import { surahIndex } from "@/lib/quran-data";

export const metadata: Metadata = { title: "Le programme de 30 jours" };

export default function ProgramPage() {
  const lessonTitles = Object.fromEntries(allLessons.map((l) => [l.id, l.title]));
  const surahNames = Object.fromEntries(surahIndex.map((s) => [s.n, s.tr]));
  return (
    <main className="narrow page stack" style={{ "--gap": "28px" } as React.CSSProperties}>
      <header className="stack" style={{ "--gap": "12px" } as React.CSSProperties}>
        <span className="eyebrow plain">Programme</span>
        <h1>Trente jours, un rituel.</h1>
        <p className="lead">
          Chaque jour : une révision, une leçon, des versets à mémoriser, dix mots et un défi express. Les jours 7, 14, 21
          et 28 sont des bilans. Le rythme est indicatif : refaire un jour n&apos;efface rien.
        </p>
      </header>
      <ProgramList lessonTitles={lessonTitles} surahNames={surahNames} />
    </main>
  );
}
