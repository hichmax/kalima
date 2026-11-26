import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonView } from "@/components/lesson-view";
import { allLessons } from "@/content/program";
import { lessonBundle } from "@/lib/learning-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return allLessons.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: allLessons.find((l) => l.id === id)?.title ?? "Leçon" };
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!allLessons.some((l) => l.id === id)) notFound();
  const bundle = await lessonBundle(id);
  return (
    <main className="narrow page">
      <LessonView lesson={bundle.lesson} sourceLessons={bundle.sourceLessons} refs={bundle.refs} />
    </main>
  );
}
