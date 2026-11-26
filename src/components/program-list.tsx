"use client";

import { CheckCircle, Circle, Star } from "@phosphor-icons/react";
import Link from "next/link";
import { program, WEEKS } from "@/content/program";
import { currentDay } from "@/lib/progress";
import { useHydrated, useKalima } from "@/lib/storage";

export function ProgramList({ lessonTitles, surahNames }: { lessonTitles: Record<string, string>; surahNames: Record<number, string> }) {
  const state = useKalima();
  const hydrated = useHydrated();
  const today = hydrated ? currentDay(state) : 1;

  return (
    <div className="stack" style={{ "--gap": "28px" } as React.CSSProperties}>
      {WEEKS.map((week) => {
        const days = program.filter((d) => d.week === week.week);
        if (!days.length) return null;
        return (
          <section key={week.week} className="stack" style={{ "--gap": "12px" } as React.CSSProperties} aria-labelledby={`semaine-${week.week}`}>
            <div className="stack" style={{ "--gap": "4px" } as React.CSSProperties}>
              <span className="eyebrow plain">Semaine {week.week}</span>
              <h2 id={`semaine-${week.week}`}>{week.title}</h2>
              <p className="muted">{week.subtitle}</p>
            </div>
            <ol className="day-list">
              {days.map((day) => {
                const done = hydrated && Boolean(state.days[String(day.day)]?.completedAt);
                const isToday = day.day === today && !done;
                return (
                  <li key={day.day}>
                    <Link href={`/programme/${day.day}`} className="glass thin day-row" data-today={isToday || undefined}>
                      <span className="day-no num">{day.day}</span>
                      <span className="day-body">
                        <span className="day-name">
                          {day.title}
                          {day.challenge ? <Star className="day-star" weight="fill" aria-label="défi de la semaine" /> : null}
                        </span>
                        <span className="day-detail">
                          {day.lessons.map((id) => lessonTitles[id]).join(" · ")}
                          {" — "}
                          {day.memorize.map((m) => `${surahNames[m.s]} ${m.from === m.to ? m.from : `${m.from}–${m.to}`}`).join(", ")}
                          {day.bonus ? " (bonus)" : ""}
                        </span>
                      </span>
                      {done ? (
                        <CheckCircle className="day-state done" weight="fill" aria-label="terminé" />
                      ) : (
                        <Circle className="day-state" aria-hidden="true" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
