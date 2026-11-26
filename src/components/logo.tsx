import { useId } from "react";

/**
 * Logo Kalima : le bāʾ de « bismillah » en un seul trait calligraphique — effilé à gauche,
 * creusé au centre, pointe montante à droite — et son point devenu étoile.
 * Version vectorielle du logo choisi (dégradé crème → rose → violet, étoile lumineuse).
 */
const STROKE =
  "M150 715C195 610 280 520 345 520C400 520 430 555 500 600C560 640 620 672 700 672C860 672 1010 600 1050 500C1062 470 1070 440 1076 410C1090 470 1100 560 1070 620C1010 730 860 782 700 782C560 782 470 740 390 700C360 685 300 660 250 660C210 660 175 685 150 715Z";
const STAR = "M627 822C634 860 650 877 688 885C650 893 634 910 627 947C620 910 604 893 566 885C604 877 620 860 627 822Z";

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`stroke-${id}`} x1="150" y1="620" x2="1090" y2="560" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#F9DFB0" />
        <stop offset="0.38" stopColor="#F78ED2" />
        <stop offset="0.74" stopColor="#B57CF8" />
        <stop offset="1" stopColor="#7C62F7" />
      </linearGradient>
      <radialGradient id={`glow-${id}`} cx="627" cy="885" r="95" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#B99BFF" stopOpacity="0.7" />
        <stop offset="1" stopColor="#B99BFF" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/** Marque seule (sans fond), pour la barre de navigation. Format large. */
export function LogoMark({ size = 30, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size * 1.7} height={size} viewBox="130 390 980 576" className={className} aria-hidden="true" focusable="false">
      <Defs id={id} />
      <path d={STROKE} fill={`url(#stroke-${id})`} />
      <circle cx="627" cy="885" r="95" fill={`url(#glow-${id})`} />
      <path d={STAR} fill="#F3EEFF" />
    </svg>
  );
}

/** Icône complète (fond violet arrondi), pour les grands formats. */
export function LogoIcon({ size = 64 }: { size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 1254 1254" aria-hidden="true" focusable="false">
      <Defs id={id} />
      <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0" y2="1254" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#130A33" />
        <stop offset="1" stopColor="#2B1462" />
      </linearGradient>
      <rect width="1254" height="1254" rx="280" fill={`url(#bg-${id})`} />
      <path d={STROKE} fill={`url(#stroke-${id})`} />
      <circle cx="627" cy="885" r="95" fill={`url(#glow-${id})`} />
      <path d={STAR} fill="#F3EEFF" />
    </svg>
  );
}
