"use client";

import { program } from "@/content/program";
import type { ExerciseResult } from "@/components/exercise-runner";
import { localDayKey } from "@/lib/dates";
import { applyReviewsWith, getScheduler, gradeFromAnswer, type Grade } from "@/lib/srs";
import { updateState, type KalimaState } from "@/lib/storage";

export type StepId = "revision" | "lecon" | "memoriser" | "mots" | "defi";

/** Premier jour non terminé (1 à 30). */
export function currentDay(state: KalimaState): number {
  const next = program.find((d) => !state.days[String(d.day)]?.completedAt);
  return next ? next.day : 30;
}

export function completedDays(state: KalimaState): number {
  return program.filter((d) => state.days[String(d.day)]?.completedAt).length;
}

export function isStepDone(state: KalimaState, day: number, step: StepId) {
  return Boolean(state.days[String(day)]?.steps[step]);
}

function withDay(state: KalimaState, day: number) {
  const key = String(day);
  return state.days[key] ?? { steps: {}, lessonScores: {} };
}

function markActive(state: KalimaState): KalimaState {
  const today = localDayKey();
  const activity = state.activity[today] ?? { reviews: 0, correct: 0, sessions: 0 };
  return { ...state, activity: { ...state.activity, [today]: { ...activity, sessions: activity.sessions + 1 } } };
}

export function markStep(day: number, step: StepId) {
  updateState((state) => {
    const progress = withDay(state, day);
    return markActive({ ...state, days: { ...state.days, [String(day)]: { ...progress, steps: { ...progress.steps, [step]: true } } } });
  });
}

export function completeDay(day: number) {
  updateState((state) => {
    const progress = withDay(state, day);
    return markActive({
      ...state,
      days: { ...state.days, [String(day)]: { ...progress, completedAt: progress.completedAt ?? new Date().toISOString() } },
    });
  });
}

export function saveLessonScore(day: number | null, lessonId: string, score: number) {
  if (day === null) return;
  updateState((state) => {
    const progress = withDay(state, day);
    const best = Math.max(progress.lessonScores[lessonId] ?? 0, score);
    return { ...state, days: { ...state.days, [String(day)]: { ...progress, lessonScores: { ...progress.lessonScores, [lessonId]: best } } } };
  });
}

/** Transforme des réponses d'exercice en révisions FSRS et les enregistre. */
export async function recordResults(results: ExerciseResult[]) {
  const reviews = new Map<string, Grade>();
  for (const result of results) {
    if (!result.card) continue;
    const grade = gradeFromAnswer(result.correctFirstTry, result.fast);
    // Si une même carte apparaît plusieurs fois, on garde la note la plus basse.
    reviews.set(result.card, Math.min(reviews.get(result.card) ?? 4, grade) as Grade);
  }
  await recordGrades([...reviews].map(([id, grade]) => ({ id, grade })));
}

export async function recordGrades(reviews: Array<{ id: string; grade: Grade }>) {
  if (!reviews.length) return;
  const scheduler = await getScheduler();
  updateState((state) => applyReviewsWith(scheduler, state, reviews));
}

export const scoreOf = (results: ExerciseResult[]) =>
  results.length ? Math.round((100 * results.filter((r) => r.correctFirstTry).length) / results.length) : 0;
