import type { TajweedSegment } from "@/lib/tajweed";

/**
 * Un mot du Coran avec ses couleurs de tajwīd. Les couleurs ne s'affichent que si le réglage
 * est activé (attribut html[data-tajweed] ; voir globals.css). Le texte reste celui de Tanzil,
 * découpé en morceaux : les lettres restent liées (même police, même ligne).
 */
export function TajweedWord({ segments }: { segments: TajweedSegment[] }) {
  return (
    <>
      {segments.map((segment, i) =>
        segment.r ? (
          <span key={i} className={`tj tj-${segment.r}`}>
            {segment.t}
          </span>
        ) : (
          segment.t
        ),
      )}
    </>
  );
}
