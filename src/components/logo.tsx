import { useId } from "react";

/**
 * Logo Kalima : le bāʾ de « bismillah », premier mot du Coran, dessiné comme une dune
 * sous un ciel de nuit. Son point devient une étoile. (ب = une barque + un point.)
 */
export function LogoMark({ size = 30, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`dune-${id}`} x1="4" y1="14" x2="44" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f4e6cf" />
          <stop offset="0.55" stopColor="#e9a3c9" />
          <stop offset="1" stopColor="#8d74ff" />
        </linearGradient>
        <radialGradient id={`star-${id}`} cx="24" cy="41" r="7" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cbbcff" />
        </radialGradient>
      </defs>
      <path
        d="M5 17.5c1.2 9.6 7.8 14.6 19.4 14.6 11.4 0 17.6-5.3 18.6-16.6"
        fill="none"
        stroke={`url(#dune-${id})`}
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path d="M43 15.5c.1-2.4-.3-4.6-1.3-6.6" fill="none" stroke="#8d74ff" strokeWidth="4.2" strokeLinecap="round" />
      <path
        d="M24 35.6l1.35 3.9 3.9 1.35-3.9 1.35L24 46.1l-1.35-3.9-3.9-1.35 3.9-1.35z"
        fill={`url(#star-${id})`}
      />
    </svg>
  );
}

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <span className="brand">
      <LogoMark size={size} />
      <span className="brand-word">Kalima</span>
    </span>
  );
}
