import "server-only";
import { z } from "zod";
import type { Ayah, PartOfSpeech, QuranWord } from "@/lib/types";

const environmentSchema = z.enum(["prelive", "production"]);
const chapterResponseSchema = z.object({
  chapters: z.array(
    z.object({
      id: z.number(),
      name_simple: z.string(),
      name_arabic: z.string().optional(),
      verses_count: z.number(),
    }),
  ),
});

const quranFoundationWordSchema = z.object({
  id: z.number(),
  position: z.number(),
  audio_url: z.string().nullable().optional(),
  char_type_name: z.string(),
  text_uthmani: z.string(),
  text_imlaei: z.string().optional(),
  translation: z
    .object({
      text: z.string().nullable(),
      language_name: z.string().optional(),
    })
    .nullable()
    .optional(),
  transliteration: z
    .object({
      text: z.string().nullable(),
      language_name: z.string().optional(),
    })
    .nullable()
    .optional(),
});

const quranFoundationVerseSchema = z.object({
  id: z.number(),
  verse_number: z.number(),
  verse_key: z.string(),
  text_uthmani: z.string(),
  words: z.array(quranFoundationWordSchema).default([]),
  translations: z
    .array(
      z.object({
        resource_id: z.number(),
        text: z.string(),
      }),
    )
    .default([]),
  audio: z
    .object({
      url: z.string(),
    })
    .nullable()
    .optional(),
});

const versesPageSchema = z.object({
  verses: z.array(quranFoundationVerseSchema),
  pagination: z.object({
    current_page: z.number(),
    total_pages: z.number(),
    total_records: z.number(),
  }),
});

const verseResponseSchema = z.object({
  verse: quranFoundationVerseSchema,
});

type QuranFoundationVerse = z.infer<typeof quranFoundationVerseSchema>;

const CACHE_SECONDS = 86_400;
const QURAN_AUDIO_BASE = "https://verses.quran.com/";
const WORD_AUDIO_BASE = "https://audio.qurancdn.com/";

let tokenCache: { token: string; expiresAt: number } | null = null;

function getConfig() {
  const clientId = process.env.QF_CLIENT_ID;
  const clientSecret = process.env.QF_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  const environment = environmentSchema.parse(process.env.QF_ENV || "prelive");
  return {
    clientId,
    clientSecret,
    translationId: Number(process.env.QF_TRANSLATION_ID || 31),
    recitationId: Number(process.env.QF_RECITATION_ID || 7),
    authBase:
      environment === "production"
        ? "https://oauth2.quran.foundation"
        : "https://prelive-oauth2.quran.foundation",
    apiBase:
      environment === "production"
        ? "https://apis.quran.foundation"
        : "https://apis-prelive.quran.foundation",
  };
}

async function getAccessToken(force = false) {
  const config = getConfig();
  if (!config) throw new Error("Quran Foundation credentials are not configured");
  if (!force && tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.token;
  }

  const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const response = await fetch(`${config.authBase}/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=content",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Quran Foundation auth failed (${response.status})`);
  const body = z
    .object({ access_token: z.string(), expires_in: z.number().default(3600) })
    .parse(await response.json());
  tokenCache = {
    token: body.access_token,
    expiresAt: Date.now() + body.expires_in * 1000,
  };
  return body.access_token;
}

async function qfFetch(path: string, retry401 = true): Promise<unknown> {
  const config = getConfig();
  if (!config) throw new Error("Quran Foundation credentials are not configured");
  const token = await getAccessToken();
  const response = await fetch(`${config.apiBase}${path}`, {
    headers: {
      "x-auth-token": token,
      "x-client-id": config.clientId,
    },
    next: { revalidate: CACHE_SECONDS },
  });
  if (response.status === 401 && retry401) {
    await getAccessToken(true);
    return qfFetch(path, false);
  }
  if (!response.ok) throw new Error(`Quran Foundation request failed (${response.status})`);
  return response.json();
}

const stripArabicMarks = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/gu, "")
    .replace(/[ٱأإآ]/gu, "ا");

const decodeEntities = (value: string) =>
  value
    .replace(/&#(\d+);/gu, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/giu, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

const plainText = (value: string) =>
  decodeEntities(
    value
      .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/giu, "")
      .replace(/<[^>]+>/gu, " "),
  )
    .replace(/\s+/gu, " ")
    .replace(/\)(?=\p{L})/gu, ") ")
    .replace(/[،,;]\s*$/u, "")
    .trim();

const absoluteAudioUrl = (path: string | null | undefined, base: string) => {
  if (!path) return undefined;
  if (/^https?:\/\//u.test(path)) return path;
  return new URL(path.replace(/^\/+/u, ""), base).toString();
};

const inferPartOfSpeech = (): PartOfSpeech => "autre";

function mapWord(
  word: z.infer<typeof quranFoundationWordSchema>,
  verseKey: string,
): QuranWord | null {
  if (word.char_type_name !== "word") return null;
  const transliteration = plainText(word.transliteration?.text || "");
  const contextualMeaning =
    plainText(word.translation?.text || "") || "Traduction indisponible";

  return {
    id: `${verseKey}:${word.position}`,
    position: word.position,
    arabic: word.text_uthmani,
    simpleArabic: word.text_imlaei || stripArabicMarks(word.text_uthmani),
    beginnerPhonetic: transliteration || "Écoute le mot pour le prononcer",
    transliteration,
    contextualMeaning,
    partOfSpeech: inferPartOfSpeech(),
    status: "published",
    sourceIds: ["quran-foundation-v4"],
    audioUrl: absoluteAudioUrl(word.audio_url, WORD_AUDIO_BASE),
  };
}

function mapVerse(verse: QuranFoundationVerse): Ayah {
  const [surah] = verse.verse_key.split(":").map(Number);
  return {
    id: verse.verse_key,
    surah,
    number: verse.verse_number,
    textUthmani: verse.text_uthmani,
    translationFr:
      plainText(verse.translations[0]?.text || "") ||
      "Traduction française temporairement indisponible.",
    words: verse.words
      .map((word) => mapWord(word, verse.verse_key))
      .filter((word): word is QuranWord => Boolean(word)),
    status: "published",
    translationStatus: "published",
    sourceIds: ["quran-foundation-v4"],
    audioUrl: absoluteAudioUrl(verse.audio?.url, QURAN_AUDIO_BASE),
  };
}

function getVerseQuery() {
  const config = getConfig();
  if (!config) throw new Error("Quran Foundation credentials are not configured");
  return new URLSearchParams({
    language: "fr",
    words: "true",
    translations: String(config.translationId),
    audio: String(config.recitationId),
    fields: "text_uthmani",
    word_fields:
      "text_uthmani,text_imlaei,translation,transliteration,audio_url",
  });
}

function assertChapter(chapter: number) {
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 114) {
    throw new Error("Invalid Quran chapter");
  }
}

export async function listQuranFoundationChapters() {
  return chapterResponseSchema.parse(
    await qfFetch("/content/api/v4/chapters"),
  ).chapters;
}

export async function getQuranFoundationChapterVerses(
  chapter: number,
): Promise<Ayah[]> {
  assertChapter(chapter);
  const firstQuery = getVerseQuery();
  firstQuery.set("per_page", "50");
  firstQuery.set("page", "1");
  const firstPage = versesPageSchema.parse(
    await qfFetch(
      `/content/api/v4/verses/by_chapter/${chapter}?${firstQuery.toString()}`,
    ),
  );

  const remainingPages = await Promise.all(
    Array.from(
      { length: Math.max(0, firstPage.pagination.total_pages - 1) },
      async (_, index) => {
        const query = getVerseQuery();
        query.set("per_page", "50");
        query.set("page", String(index + 2));
        return versesPageSchema.parse(
          await qfFetch(
            `/content/api/v4/verses/by_chapter/${chapter}?${query.toString()}`,
          ),
        );
      },
    ),
  );

  return [firstPage, ...remainingPages]
    .flatMap((page) => page.verses)
    .map(mapVerse);
}

export async function getQuranFoundationVerse(
  chapter: number,
  verse: number,
): Promise<Ayah> {
  assertChapter(chapter);
  if (!Number.isInteger(verse) || verse < 1) throw new Error("Invalid Quran verse");
  const query = getVerseQuery();
  const body = verseResponseSchema.parse(
    await qfFetch(
      `/content/api/v4/verses/by_key/${chapter}:${verse}?${query.toString()}`,
    ),
  );
  return mapVerse(body.verse);
}

export function isQuranFoundationConfigured() {
  return Boolean(getConfig());
}
