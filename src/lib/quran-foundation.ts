import "server-only";
import { z } from "zod";

/**
 * Quran.Foundation Content API v4 — traduction des sens (Hamidullah, ressource 31) et
 * récitation (Mishary al-ʿAfāsī, ressource 7).
 *
 * Conditions (Developer Terms, mise à jour du 20/11/2026) :
 *   - contenu affiché uniquement dans l'application, jamais redistribué comme données ;
 *   - rien n'est écrit dans le dépôt ; cache serveur de 24 h (limite : 1 semaine) ;
 *   - crédit à Quran.Foundation et au récitant dans l'interface.
 * Le texte arabe affiché reste celui de Tanzil : seuls traduction et audio viennent d'ici.
 */

const CACHE_SECONDS = 86_400;
const VERSE_AUDIO_BASE = "https://verses.quran.com/";
const WORD_AUDIO_BASE = "https://audio.qurancdn.com/";

const environmentSchema = z.enum(["prelive", "production"]);

function getConfig() {
  const clientId = process.env.QF_CLIENT_ID;
  const clientSecret = process.env.QF_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  const environment = environmentSchema.catch("prelive").parse(process.env.QF_ENV);
  return {
    clientId,
    clientSecret,
    translationId: Number(process.env.QF_TRANSLATION_ID || 31),
    recitationId: Number(process.env.QF_RECITATION_ID || 7),
    authBase: environment === "production" ? "https://oauth2.quran.foundation" : "https://prelive-oauth2.quran.foundation",
    apiBase: environment === "production" ? "https://apis.quran.foundation" : "https://apis-prelive.quran.foundation",
  };
}

export const isQuranFoundationConfigured = () => getConfig() !== null;

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getAccessToken(force = false) {
  const config = getConfig();
  if (!config) throw new Error("Quran.Foundation non configuré");
  if (!force && tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;
  const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const response = await fetch(`${config.authBase}/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials&scope=content",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Authentification Quran.Foundation refusée (${response.status})`);
  const body = z.object({ access_token: z.string(), expires_in: z.number().default(3600) }).parse(await response.json());
  tokenCache = { token: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
  return body.access_token;
}

async function qfFetch(path: string, retry = true): Promise<unknown> {
  const config = getConfig();
  if (!config) throw new Error("Quran.Foundation non configuré");
  const response = await fetch(`${config.apiBase}${path}`, {
    headers: { "x-auth-token": await getAccessToken(), "x-client-id": config.clientId },
    next: { revalidate: CACHE_SECONDS },
  });
  if (response.status === 401 && retry) {
    await getAccessToken(true);
    return qfFetch(path, false);
  }
  if (!response.ok) throw new Error(`Requête Quran.Foundation échouée (${response.status})`);
  return response.json();
}

const wordSchema = z.object({
  position: z.number(),
  char_type_name: z.string(),
  audio_url: z.string().nullable().optional(),
});

const verseSchema = z.object({
  verse_number: z.number(),
  words: z.array(wordSchema).default([]),
  translations: z.array(z.object({ text: z.string() })).default([]),
  audio: z.object({ url: z.string() }).nullable().optional(),
});

const pageSchema = z.object({
  verses: z.array(verseSchema),
  pagination: z.object({ total_pages: z.number() }),
});

const absolute = (value: string | null | undefined, base: string) => {
  if (!value) return null;
  return /^https?:\/\//u.test(value) ? value : new URL(value.replace(/^\/+/u, ""), base).toString();
};

const plain = (html: string) =>
  html
    .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/giu, "")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/gu, " ")
    .replace(/&#(\d+);/gu, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&quot;/gu, '"')
    .replace(/&#39;|&apos;/gu, "'")
    .replace(/&amp;/gu, "&")
    .replace(/\s+/gu, " ")
    .trim();

export interface VerseMedia {
  v: number;
  translation: string | null;
  audio: string | null;
  /** Audio de chaque mot (ordre des mots), null si indisponible. */
  words: Array<string | null>;
}

export async function getChapterMedia(chapter: number): Promise<VerseMedia[]> {
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 114) throw new Error("Sourate invalide");
  const config = getConfig();
  if (!config) throw new Error("Quran.Foundation non configuré");
  const query = (page: number) =>
    new URLSearchParams({
      language: "fr",
      words: "true",
      translations: String(config.translationId),
      audio: String(config.recitationId),
      word_fields: "audio_url",
      per_page: "50",
      page: String(page),
    }).toString();

  const first = pageSchema.parse(await qfFetch(`/content/api/v4/verses/by_chapter/${chapter}?${query(1)}`));
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.pagination.total_pages - 1) }, async (_, i) =>
      pageSchema.parse(await qfFetch(`/content/api/v4/verses/by_chapter/${chapter}?${query(i + 2)}`)),
    ),
  );
  return [first, ...rest]
    .flatMap((page) => page.verses)
    .map((verse) => ({
      v: verse.verse_number,
      translation: verse.translations[0] ? plain(verse.translations[0].text) : null,
      audio: absolute(verse.audio?.url, VERSE_AUDIO_BASE),
      words: verse.words.filter((w) => w.char_type_name === "word").map((w) => absolute(w.audio_url, WORD_AUDIO_BASE)),
    }));
}
