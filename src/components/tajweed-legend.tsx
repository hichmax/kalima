import { TAJWEED_LEGEND } from "@/lib/tajweed";

/** Légende des couleurs du tajwīd (dépliable). */
export function TajweedLegend({ open = false }: { open?: boolean }) {
  return (
    <details className="legend tajweed-legend" open={open}>
      <summary>Les couleurs du tajwīd</summary>
      <ul>
        {TAJWEED_LEGEND.map((item) => (
          <li key={item.rule}>
            <span className={`tj-swatch tj-${item.rule}`} aria-hidden="true" />
            <span>
              <strong>{item.label}</strong> <span className="faint">— {item.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="faint">
        Couleurs calculées automatiquement sur le texte Tanzil, selon le code des mushafs de tajwīd. Une aide visuelle :
        l&apos;écoute et un enseignant priment.
      </p>
    </details>
  );
}
