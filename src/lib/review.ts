import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  type Card,
  type Grade,
} from "ts-fsrs";
export type ReviewChoice = "again" | "hard" | "good" | "easy";

export const reviewRating: Record<ReviewChoice, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

export function selectRandomReviewUnits<T extends { id: string }>(
  units: T[],
  count: number,
  excludedIds: string[] = [],
  random: () => number = Math.random,
): T[] {
  const excluded = new Set(excludedIds);
  const seen = new Set<string>();
  const eligible = units.filter((unit) => {
    if (excluded.has(unit.id) || seen.has(unit.id)) return false;
    seen.add(unit.id);
    return true;
  });

  for (let index = eligible.length - 1; index > 0; index -= 1) {
    const target = Math.min(index, Math.floor(random() * (index + 1)));
    [eligible[index], eligible[target]] = [eligible[target], eligible[index]];
  }

  return eligible.slice(0, Math.max(0, Math.min(count, eligible.length)));
}

export function createReviewCard(now = new Date()): Card {
  return createEmptyCard(now);
}

export function scheduleReview(
  card: Card,
  choice: ReviewChoice,
  now = new Date(),
) {
  const scheduler = fsrs(
    generatorParameters({
      request_retention: 0.9,
      enable_fuzz: false,
    }),
  );
  return scheduler.next(card, now, reviewRating[choice]);
}
