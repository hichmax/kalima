import Link from "next/link";
import { appConfig } from "@/config/app";

export function KalimaMark({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path
        d="M14 45V27.5C14 17.5 22.4 12.4 32 6c9.6 6.4 18 11.5 18 21.5V45"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 47.5c8.6.7 15.5 2.7 21 8.5 5.5-5.8 12.4-7.8 21-8.5-1 5.7-4.6 8.8-10.4 9.5-4.4.5-7.9 1.6-10.6 4-2.7-2.4-6.2-3.5-10.6-4-5.8-.7-9.4-3.8-10.4-9.5Z"
        fill="currentColor"
      />
      <path
        d="M23.5 21.5h7v19h-7V21.5Zm6.3 10.8 10.4-10.8h8.1L36.6 33.4l12.2 11.4h-8.7L29.8 34.6v-2.3Z"
        fill="currentColor"
      />
      <path d="m32 12 3.1 3.1L32 18.2l-3.1-3.1L32 12Z" className="kalima-mark-gold" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link className="logo" href={href} aria-label={`${appConfig.name}, accueil`}>
      <span className="logo-mark">
        <KalimaMark />
      </span>
      <span className="logo-wordmark">
        {appConfig.name}
        <small lang="ar" dir="rtl">كَلِمَة</small>
      </span>
    </Link>
  );
}
