import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DaySession } from "@/components/day-session";
import { program } from "@/content/program";
import { dayPayload } from "@/lib/learning-data";
import { surahIndex } from "@/lib/quran-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return program.map((d) => ({ jour: String(d.day) }));
}

export async function generateMetadata({ params }: { params: Promise<{ jour: string }> }): Promise<Metadata> {
  const { jour } = await params;
  const day = program.find((d) => String(d.day) === jour);
  return { title: day ? `Jour ${day.day} — ${day.title}` : "Jour" };
}

export default async function DayPage({ params }: { params: Promise<{ jour: string }> }) {
  const { jour } = await params;
  const n = Number(jour);
  if (!program.some((d) => d.day === n)) notFound();
  const payload = await dayPayload(n);
  const surahNames = Object.fromEntries(surahIndex.map((s) => [s.n, s.tr]));
  return (
    <main className="narrow page">
      <DaySession payload={payload} surahNames={surahNames} />
    </main>
  );
}
