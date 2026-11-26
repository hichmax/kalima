import type { Metadata } from "next";
import Link from "next/link";
import { allLessons, program } from "@/content/program";

export const metadata: Metadata = { title: "Leçons" };

const TRACKS = [
  { id: "lecture", title: "Lire", detail: "De l'alphabet au muṣḥaf de Médine." },
  { id: "tajwid", title: "Tajwīd", detail: "Les règles de base, riwāya de Ḥafṣ ʿan ʿĀṣim." },
  { id: "arabe", title: "Comprendre", detail: "La grammaire minimale pour reconnaître les mots." },
  { id: "bilan", title: "Bilans", detail: "Révisions mélangées de chaque semaine." },
] as const;

export default function LessonsPage() {
  const dayOf = (id: string) => program.find((d) => d.lessons.includes(id))?.day;
  return (
    <main className="container page stack" style={{ "--gap": "32px" } as React.CSSProperties}>
      <header className="stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <span className="eyebrow plain">Bibliothèque</span>
        <h1>Toutes les leçons</h1>
        <p className="lead">Chaque leçon peut être refaite à tout moment : les exercices changent à chaque fois.</p>
      </header>
      {TRACKS.map((track) => (
        <section key={track.id} className="stack" style={{ "--gap": "12px" } as React.CSSProperties}>
          <div>
            <h2>{track.title}</h2>
            <p className="muted">{track.detail}</p>
          </div>
          <div className="grid-auto">
            {allLessons
              .filter((l) => l.track === track.id)
              .map((lesson) => (
                <Link key={lesson.id} href={`/lecons/${lesson.id}`} className="glass card stack lesson-card tilt" style={{ "--gap": "6px" } as React.CSSProperties}>
                  <span className="faint">{dayOf(lesson.id) ? `Jour ${dayOf(lesson.id)}` : "Révision"} · {lesson.minutes} min</span>
                  <h3>{lesson.title}</h3>
                  <p className="muted">{lesson.subtitle}</p>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}
