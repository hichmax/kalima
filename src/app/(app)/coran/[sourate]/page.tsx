import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuranLine } from "@/components/quran-static";
import { ReaderControls, VerseExtras, WordStudy } from "@/components/reader";
import { surahPhonetics } from "@/lib/phonetics";
import { TajweedLegend } from "@/components/tajweed-legend";
import { TajweedPainter } from "@/components/tajweed-painter";
import { getSurahMeta, loadSurah, surahIndex, tanzilNotice } from "@/lib/quran-data";
import { wordsToText } from "@/lib/quran-types";

export const dynamicParams = false;

export function generateStaticParams() {
  return surahIndex.map((s) => ({ sourate: String(s.n) }));
}

export async function generateMetadata({ params }: { params: Promise<{ sourate: string }> }): Promise<Metadata> {
  const { sourate } = await params;
  const meta = surahIndex[Number(sourate) - 1];
  return meta ? { title: `${meta.n}. ${meta.tr} — ${meta.fr}` } : {};
}

export default async function SurahPage({ params }: { params: Promise<{ sourate: string }> }) {
  const { sourate } = await params;
  const n = Number(sourate);
  if (!Number.isInteger(n) || n < 1 || n > 114) notFound();
  const meta = getSurahMeta(n);
  const surah = await loadSurah(n);
  const phonetics = await surahPhonetics(n);
  const basmala = n === 1 || n === 9 ? null : (await loadSurah(1)).verses[0].w;

  return (
    <main className="narrow page stack" style={{ "--gap": "22px" } as React.CSSProperties}>
      <header className="surah-head glass">
        <span className="eyebrow plain">Sourate {meta.n} · {meta.type} · {meta.ayas} versets</span>
        <p className="ar surah-title-ar" lang="ar" dir="rtl">{meta.ar}</p>
        <h1 className="surah-title">{meta.tr}</h1>
        <p className="muted">{meta.fr}</p>
      </header>

      <ReaderControls surah={n} ayas={meta.ayas} />
      <TajweedLegend />
      <TajweedPainter />
      {phonetics.some((p) => p.auto) ? (
        <p className="faint phonetic-note">
          Phonétique de cette sourate : transcription automatique, une aide à la lecture. L&apos;écoute de la récitation prime.
        </p>
      ) : null}

      <WordStudy surah={n}>
        {basmala ? (
          <p className="quran basmala" lang="ar" dir="rtl" aria-label="Basmala">
            {wordsToText(basmala)}
          </p>
        ) : null}
        <ol className="verses">
          {surah.verses.map((verse) => (
            <li key={verse.v} className="verse-item" data-verse={verse.v}>
              <QuranLine s={n} v={verse.v} words={verse.w} />
              <VerseExtras surah={n} verse={verse.v} phonetic={phonetics[verse.v - 1]?.text} phoneticAuto={phonetics[verse.v - 1]?.auto} />
            </li>
          ))}
        </ol>
      </WordStudy>

      <nav className="row between" aria-label="Sourates voisines">
        {n > 1 ? (
          <Link href={`/coran/${n - 1}`} className="btn small">
            <ArrowLeft aria-hidden="true" /> {surahIndex[n - 2].tr}
          </Link>
        ) : <span />}
        {n < 114 ? (
          <Link href={`/coran/${n + 1}`} className="btn small">
            {surahIndex[n].tr} <ArrowRight aria-hidden="true" />
          </Link>
        ) : null}
      </nav>

      <footer className="stack faint" style={{ "--gap": "6px" } as React.CSSProperties}>
        <p>{tanzilNotice}</p>
        <p>
          Traduction des sens : Muhammad Hamidullah (révision du Complexe du Roi Fahd). Une traduction est une
          interprétation humaine, pas le Coran. Récitation au choix : Mishary Rāshid al-ʿAfāsī ou Yāsir ad-Dawsarī. Traduction et audio fournis par
          Quran.Foundation.
        </p>
      </footer>
    </main>
  );
}
