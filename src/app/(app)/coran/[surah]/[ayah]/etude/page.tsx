import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { getFixtureAyah } from "@/data/quran-fixtures";
import { StudyVerseView } from "@/components/study-verse-view";
import {
  getQuranFoundationVerse,
  isQuranFoundationConfigured,
} from "@/lib/quran-foundation";

export const metadata: Metadata = {
  title: "Étudier un verset",
};

export default async function StudyAyahPage({
  params,
}: {
  params: Promise<{ surah: string; ayah: string }>;
}) {
  const route = await params;
  const surah = Number(route.surah);
  const verse = Number(route.ayah);
  let ayah = getFixtureAyah(surah, verse);

  if (isQuranFoundationConfigured()) {
    try {
      ayah = await getQuranFoundationVerse(surah, verse);
    } catch {
      // Keep the local Al-Fatiha fallback available if the remote source is down.
    }
  }
  if (!ayah) notFound();

  return (
    <>
      <Link className="btn btn-ghost" href="/coran" style={{ marginBottom: 18 }}>
        <ArrowLeft size={18} /> Retour au lecteur
      </Link>
      <StudyVerseView ayah={ayah} />
    </>
  );
}
