import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import "@/app/globals.css";
import { appConfig } from "@/config/app";

const geist = Geist({ subsets: ["latin", "latin-ext"], variable: "--font-geist", display: "swap" });

// Amiri Quran 1.003 (Khaled Hosny), SIL Open Font License — voir public/fonts/AMIRI-OFL.txt
const amiriQuran = localFont({
  src: "./AmiriQuran.woff2",
  variable: "--font-amiri-quran",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.url),
  title: {
    default: `${appConfig.name} — Le Coran en 30 jours`,
    template: `%s · ${appConfig.name}`,
  },
  description: appConfig.description,
  applicationName: appConfig.name,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: appConfig.name,
    title: `${appConfig.name} — Le Coran en 30 jours`,
    description: appConfig.description,
    images: [{ url: "/media/desert-poster.jpg", width: 1600, height: 1195, alt: "Désert sous un ciel violet, à l'aube" }],
  },
  appleWebApp: { capable: true, title: appConfig.name, statusBarStyle: "black-translucent" },
  other: { google: "notranslate" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07060c",
};

/**
 * Applique le thème et la taille du texte arabe avant le premier rendu (pas de flash).
 * Lit uniquement la clé locale de Kalima ; aucun appel réseau.
 */
const preferencesScript = `try{var s=JSON.parse(localStorage.getItem("kalima:v2")||"null");var p=s&&s.settings;if(p){if(p.theme==="papier")document.documentElement.dataset.theme="papier";if(p.arabicScale)document.documentElement.style.setProperty("--arabic-scale",String(p.arabicScale));}}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${geist.variable} ${amiriQuran.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferencesScript }} />
      </head>
      <body>
        <a className="skip-link" href="#contenu">
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
