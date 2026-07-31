import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabase } from "@/lib/database";

export const runtime = "nodejs";

const deviceIdSchema = z.string().uuid();
const practiceWordSchema = z.object({
  id: z.string().min(1).max(80),
  arabic: z.string().min(1).max(160),
  simpleArabic: z.string().min(1).max(160),
  beginnerPhonetic: z.string().max(240),
  transliteration: z.string().max(240),
  primaryMeaningFr: z.string().min(1).max(500),
  lemma: z.string().max(160),
  occurrences: z.number().int().min(0).max(100_000),
  examples: z.array(z.string().max(80)).max(10),
  sourceIds: z.array(z.string().max(80)).max(12),
  audioUrl: z.string().url().optional(),
});
const customWordListSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(80),
  description: z.string().max(300),
  origin: z.enum(["manual", "favorites", "surah", "verses", "mixed"]),
  sourceLabels: z.array(z.string().max(120)).max(20),
  words: z.array(practiceWordSchema).max(5000),
  masteredWordIds: z.array(z.string().max(80)).max(5000),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const progressSchema = z.object({
  lastRoute: z.string().startsWith("/").max(240),
  lastAyah: z.string().regex(/^\d+:\d+$/u),
  learnedWordIds: z.array(z.string().max(80)).max(5000),
  favoriteAyahIds: z.array(z.string().max(20)).max(1000),
  completedLessons: z.array(z.string().max(80)).max(500),
  learnedSurahIds: z.array(z.number().int().min(1).max(114)).max(114),
  reviewCount: z.number().int().min(0).max(100_000),
  reviewMasteredWordIds: z.array(z.string().max(80)).max(5000),
  favoriteVocabularyWordIds: z.array(z.string().max(80)).max(5000),
  savedPracticeWords: z.array(practiceWordSchema).max(5000),
  customWordLists: z.array(customWordListSchema).max(30),
  phoneticAssist: z.enum(["complete", "progressive", "hidden"]),
  dailyMinutes: z.union([
    z.literal(5),
    z.literal(10),
    z.literal(15),
    z.literal(20),
    z.literal(30),
  ]),
  learningProfile: z.object({
    completed: z.boolean(),
    stage: z.enum(["alphabet", "decoding", "reading", "tajweed"]),
    goal: z.enum(["read", "vocabulary", "tajweed", "quran-reading"]),
    recommendedLessonId: z.string().min(1).max(100),
    answers: z.record(z.string().max(80), z.string().max(160)),
  }),
  dailyChallenge: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u).or(z.literal("")),
    completedWordIds: z.array(z.string().max(80)).max(5),
    ratings: z.record(
      z.string().max(80),
      z.enum(["again", "hard", "good", "easy"]),
    ),
    streak: z.number().int().min(0).max(100_000),
    lastCompletedDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/u)
      .nullable(),
  }),
  updatedAt: z.string().datetime(),
});

export async function POST(request: Request) {
  const deviceId = deviceIdSchema.safeParse(request.headers.get("x-device-id"));
  if (!deviceId.success) {
    return NextResponse.json({ error: "Identifiant d’appareil invalide" }, { status: 400 });
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }
  const body = progressSchema.safeParse(payload);
  if (!body.success) {
    return NextResponse.json({ error: "Progression invalide" }, { status: 422 });
  }
  getDatabase()
    .prepare(
      `insert into device_progress
        (device_id, payload, client_updated_at, server_updated_at)
       values (?, ?, ?, datetime('now'))
       on conflict(device_id) do update set
         payload = excluded.payload,
         client_updated_at = excluded.client_updated_at,
         server_updated_at = datetime('now')`,
    )
    .run(deviceId.data, JSON.stringify(body.data), body.data.updatedAt);
  return NextResponse.json({ synced: true, storage: "sqlite-local" });
}

export async function GET(request: Request) {
  const deviceId = deviceIdSchema.safeParse(request.headers.get("x-device-id"));
  if (!deviceId.success) {
    return NextResponse.json({ error: "Identifiant d’appareil invalide" }, { status: 400 });
  }
  const row = getDatabase()
    .prepare("select payload from device_progress where device_id = ?")
    .get(deviceId.data) as { payload: string } | undefined;
  return NextResponse.json({ progress: row ? JSON.parse(row.payload) : null });
}
