import { DefaultScheduler, Rating } from "ts-fsrs";
import type { KalimaState, StoredCard } from "@/lib/storage";
import { localDayKey } from "@/lib/dates";

/**
 * Répétition espacée FSRS-7 (ts-fsrs 6, MIT). Une carte par élément appris :
 *   letter:ب · sign:shadda · rule:ikhfa · lemma:<lemme|cat> · verse:112:1 · concept:<id>
 * Rétention cible 0,9 ; pas d'aléa (fuzz) pour des révisions prévisibles.
 */

export type CardKind = StoredCard["kind"];
export type Grade = 1 | 2 | 3 | 4;
export const GRADE = { again: Rating.Again, hard: Rating.Hard, good: Rating.Good, easy: Rating.Easy } as const;

const createScheduler = () =>
  DefaultScheduler({ version: "FSRS-7", desiredRetention: 0.9, enableFuzz: false, maximumInterval: 3650 });
type Scheduler = Awaited<ReturnType<typeof createScheduler>>;
type FsrsCard = Parameters<Scheduler["review"]>[0]["card"];

let schedulerPromise: Promise<Scheduler> | null = null;
export function getScheduler(): Promise<Scheduler> {
  schedulerPromise ??= createScheduler();
  return schedulerPromise;
}

export function cardKindOf(id: string): CardKind {
  const kind = id.split(":")[0];
  if (kind === "letter" || kind === "sign" || kind === "rule" || kind === "lemma" || kind === "verse" || kind === "concept") {
    return kind;
  }
  throw new Error(`Identifiant de carte inconnu : ${id}`);
}

function revive(stored: StoredCard["fsrs"]): FsrsCard {
  const raw = stored as Record<string, unknown>;
  return {
    ...raw,
    dueAt: new Date(String(raw.dueAt)),
    lastReviewAt: raw.lastReviewAt ? new Date(String(raw.lastReviewAt)) : null,
  } as unknown as FsrsCard;
}

const serialize = (card: FsrsCard) => JSON.parse(JSON.stringify(card)) as Record<string, unknown>;

export function dueAt(card: StoredCard): Date {
  return new Date(String(card.fsrs.dueAt));
}

export interface ReviewInput {
  id: string;
  grade: Grade;
}

/** Applique une série de réponses et renvoie le nouvel état (pur, ne persiste pas). */
export async function applyReviews(state: KalimaState, reviews: ReviewInput[], now = new Date()): Promise<KalimaState> {
  if (reviews.length === 0) return state;
  return applyReviewsWith(await getScheduler(), state, reviews, now);
}

/** Version synchrone, à utiliser à l'intérieur d'une mise à jour d'état atomique. */
export function applyReviewsWith(scheduler: Scheduler, state: KalimaState, reviews: ReviewInput[], now = new Date()): KalimaState {
  if (reviews.length === 0) return state;
  const cards = { ...state.cards };
  let correct = 0;
  for (const { id, grade } of reviews) {
    const existing = cards[id];
    const card = existing ? revive(existing.fsrs) : scheduler.newCard({ now });
    const result = scheduler.review({ card, grade, now });
    cards[id] = {
      kind: cardKindOf(id),
      addedAt: existing?.addedAt ?? now.toISOString(),
      fsrs: serialize(result.card),
      lastGrade: grade,
    };
    if (grade >= Rating.Good) correct += 1;
  }
  const day = localDayKey(now);
  const activity = state.activity[day] ?? { reviews: 0, correct: 0, sessions: 0 };
  return {
    ...state,
    cards,
    activity: {
      ...state.activity,
      [day]: { ...activity, reviews: activity.reviews + reviews.length, correct: activity.correct + correct },
    },
  };
}

/** Cartes à réviser maintenant, les plus en retard d'abord. */
export function dueCardIds(state: KalimaState, now = new Date(), kinds?: CardKind[]): string[] {
  return Object.entries(state.cards)
    .filter(([, card]) => (!kinds || kinds.includes(card.kind)) && dueAt(card) <= now)
    .sort(([, a], [, b]) => dueAt(a).getTime() - dueAt(b).getTime())
    .map(([id]) => id);
}

export function knownCount(state: KalimaState, kind?: CardKind): number {
  return Object.values(state.cards).filter((card) => !kind || card.kind === kind).length;
}

/**
 * Note d'une question à choix : juste du premier coup = « Bien » (ou « Facile » si la
 * réponse a été donnée rapidement), sinon « À revoir ». L'apprenant ne s'auto-évalue
 * que pour la récitation, où la machine ne peut pas juger.
 */
export function gradeFromAnswer(correctFirstTry: boolean, fast = false): Grade {
  if (!correctFirstTry) return GRADE.again;
  return fast ? GRADE.easy : GRADE.good;
}
