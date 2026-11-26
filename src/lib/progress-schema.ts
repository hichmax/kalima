import { z } from "zod";

/**
 * Format du document de progression, partagé entre le navigateur (localStorage) et le
 * serveur (synchronisation de compte). Toute donnée reçue est validée par ce schéma.
 */

export const storedCardSchema = z.object({
  kind: z.enum(["letter", "sign", "rule", "lemma", "verse", "concept"]),
  addedAt: z.string(),
  fsrs: z.record(z.string(), z.unknown()),
  lastGrade: z.number().int().min(1).max(4).optional(),
});

export const dayProgressSchema = z.object({
  steps: z.record(z.string(), z.boolean()).default({}),
  lessonScores: z.record(z.string(), z.number()).default({}),
  completedAt: z.string().optional(),
});

export const stateSchema = z.object({
  version: z.literal(2),
  createdAt: z.string(),
  updatedAt: z.string(),
  settings: z
    .object({
      phonetic: z.enum(["auto", "always", "tap", "after", "never"]).default("auto"),
      arabicScale: z.number().min(0.8).max(1.8).default(1),
      theme: z.enum(["nuit", "papier"]).default("nuit"),
      track: z.enum(["debutant", "lecteur"]).default("debutant"),
      onboarded: z.boolean().default(false),
      /** couleurs du tajwīd sur le texte coranique (mushaf coloré) */
      tajweed: z.boolean().default(true),
    })
    .default({ phonetic: "auto", arabicScale: 1, theme: "nuit", track: "debutant", onboarded: false, tajweed: true }),
  days: z.record(z.string(), dayProgressSchema).default({}),
  cards: z.record(z.string(), storedCardSchema).default({}),
  activity: z
    .record(z.string(), z.object({ reviews: z.number().default(0), correct: z.number().default(0), sessions: z.number().default(0) }))
    .default({}),
  challenges: z.record(z.string(), z.object({ score: z.number(), total: z.number() })).default({}),
  recordings: z.record(z.string(), z.string()).default({}),
});

export type KalimaState = z.infer<typeof stateSchema>;
export type StoredCard = z.infer<typeof storedCardSchema>;
export type Settings = KalimaState["settings"];

export function emptyState(now = new Date()): KalimaState {
  const iso = now.toISOString();
  return stateSchema.parse({ version: 2, createdAt: iso, updatedAt: iso });
}

const time = (value: unknown) => {
  const t = typeof value === "string" ? Date.parse(value) : Number.NaN;
  return Number.isFinite(t) ? t : 0;
};

/**
 * Fusionne deux progressions sans rien perdre (appareil + compte) :
 * - cartes : on garde la plus récemment révisée (sinon la plus récemment ajoutée) ;
 * - jours : union des étapes, meilleurs scores, première date de validation ;
 * - activité : maximum par jour (une même séance n'est jamais comptée deux fois) ;
 * - défis : meilleur score du jour ; réglages : ceux du document le plus récent.
 */
export function mergeStates(a: KalimaState, b: KalimaState): KalimaState {
  const newer = time(a.updatedAt) >= time(b.updatedAt) ? a : b;

  const cards: KalimaState["cards"] = { ...a.cards };
  for (const [id, card] of Object.entries(b.cards)) {
    const mine = cards[id];
    if (!mine) {
      cards[id] = card;
      continue;
    }
    const reviewedA = time(mine.fsrs.lastReviewAt);
    const reviewedB = time(card.fsrs.lastReviewAt);
    if (reviewedB > reviewedA || (reviewedB === reviewedA && time(card.addedAt) > time(mine.addedAt))) cards[id] = card;
  }

  const days: KalimaState["days"] = { ...a.days };
  for (const [day, progress] of Object.entries(b.days)) {
    const mine = days[day];
    if (!mine) {
      days[day] = progress;
      continue;
    }
    const scores = { ...mine.lessonScores };
    for (const [lesson, score] of Object.entries(progress.lessonScores)) scores[lesson] = Math.max(scores[lesson] ?? 0, score);
    const completed = [mine.completedAt, progress.completedAt].filter((v): v is string => Boolean(v)).sort()[0];
    days[day] = {
      steps: { ...mine.steps, ...Object.fromEntries(Object.entries(progress.steps).filter(([, done]) => done)) },
      lessonScores: scores,
      ...(completed ? { completedAt: completed } : {}),
    };
  }

  const activity: KalimaState["activity"] = { ...a.activity };
  for (const [day, value] of Object.entries(b.activity)) {
    const mine = activity[day];
    activity[day] = mine
      ? { reviews: Math.max(mine.reviews, value.reviews), correct: Math.max(mine.correct, value.correct), sessions: Math.max(mine.sessions, value.sessions) }
      : value;
  }

  const challenges: KalimaState["challenges"] = { ...a.challenges };
  for (const [day, value] of Object.entries(b.challenges)) {
    const mine = challenges[day];
    challenges[day] = !mine || value.score > mine.score ? value : mine;
  }

  return {
    version: 2,
    createdAt: time(a.createdAt) && time(b.createdAt) ? (time(a.createdAt) <= time(b.createdAt) ? a.createdAt : b.createdAt) : a.createdAt || b.createdAt,
    updatedAt: newer.updatedAt,
    settings: newer.settings,
    days,
    cards,
    activity,
    challenges,
    recordings: { ...b.recordings, ...a.recordings },
  };
}
