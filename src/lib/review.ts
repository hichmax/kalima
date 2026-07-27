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
