import type { VocabularyUnit } from "@/lib/types";

export function RootFamilyGraph({
  root,
  units,
}: {
  root: string;
  units: VocabularyUnit[];
}) {
  const family = units.filter((unit) => unit.root === root).slice(0, 6);
  return (
    <div className="root-graph" aria-label={`Famille de mots ${root}`}>
      <div className="root-center">
        <span className="quran-text" lang="ar" dir="rtl">{[...root].join(" ")}</span>
        <small>Lettres de famille</small>
      </div>
      {family.map((unit, index) => (
        <div
          className={`root-node root-node-${index + 1}`}
          key={unit.id}
          style={{ "--node-index": index } as React.CSSProperties}
        >
          <span className="quran-text" lang="ar" dir="rtl">{unit.arabic}</span>
          <small>{unit.primaryMeaningFr}</small>
          <span>{unit.occurrences}×</span>
        </div>
      ))}
    </div>
  );
}
