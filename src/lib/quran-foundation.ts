import "server-only";
import { z } from "zod";

/**
 * Quran.Foundation Content API v4 — traduction des sens (Hamidullah, ressource 31), traduction
 * française mot à mot, et récitation : Mishary al-ʿAfāsī (ressource 7, un fichier par verset) ou
 * Yāsir ad-Dawsarī (récitant de sourate 174 : un fichier par sourate + minutage de chaque verset).
 *
 * Conditions (Developer Terms, mise à jour du 20/11/2026) :
 *   - contenu affiché uniquement dans l'application, jamais redistribué comme données ;
 *   - rien n'est écrit dans le dépôt ; cache serveur de 24 h (limite : 1 semaine) ;
 *   - crédit à Quran.Foundation et au récitant dans l'interface.
 * Le texte arabe affiché reste celui de Tanzil : seuls traduction et audio viennent d'ici.
 */

const CACHE_SECONDS = 86_400;
// Les URL audio des versets sont absolues (verses.quran.foundation) ; ces bases ne servent
// qu'aux chemins relatifs (audio mot à mot : « wbw/001_001_001.mp3 »).
const VERSE_AUDIO_BASE = "https://verses.quran.foundation/";
const WORD_AUDIO_BASE = "https://audio.qurancdn.com/";

/** Les nouvelles applications QF utilisent des scopes granulaires (doc consultée le 26/11/2026). */
const GRANULAR_SCOPES = "content.quran.read content.translations.read content.audio.read";
const LEGACY_SCOPE = "content";
/** Un User-Agent explicite : sans lui, la passerelle peut répondre 403 « error code: 1010 ». */
const USER_AGENT = "Kalima/2.0 (+https://github.com/hichmax/kalima)";

export type QfEnvironment = "prelive" | "production";

/**
 * Tolère les variantes saisies dans Vercel : « production », « prod », une URL de production
 * (https://oauth2.quran.foundation), ou « prelive » / une URL prelive. Vide → production.
 */
export function parseQfEnvironment(value: string | undefined): QfEnvironment {
  const v = (value ?? "").trim().toLowerCase();
  if (v.includes("prelive") || v.includes("pre-live") || v === "test") return "prelive";
  return "production";
}

function getConfig() {
  const clientId = process.env.QF_CLIENT_ID?.trim();
  const clientSecret = process.env.QF_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  const environment = parseQfEnvironment(process.env.QF_ENV);
  return {
    clientId,
    clientSecret,
    environment,
    /** Forcer un scope précis (sinon : granulaires, puis repli sur « content »). */
    scope: process.env.QF_SCOPE?.trim() || null,
    translationId: Number(process.env.QF_TRANSLATION_ID || 31),
    recitationId: Number(process.env.QF_RECITATION_ID || 7),
    authBase: environment === "production" ? "https://oauth2.quran.foundation" : "https://prelive-oauth2.quran.foundation",
    apiBase: environment === "production" ? "https://apis.quran.foundation" : "https://apis-prelive.quran.foundation",
  };
}

export const isQuranFoundationConfigured = () => getConfig() !== null;
export const quranFoundationEnvironment = (): QfEnvironment | null => getConfig()?.environment ?? null;

/** L'environnement de test (prelive) ne contient que les sourates 1 et 2. */
export const PRELIVE_CHAPTERS = [1, 2];

let tokenCache: { token: string; expiresAt: number } | null = null;
let workingScope: string | null = null;

async function requestToken(config: NonNullable<ReturnType<typeof getConfig>>, scope: string) {
  const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  return fetch(`${config.authBase}/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: new URLSearchParams({ grant_type: "client_credentials", scope }).toString(),
    cache: "no-store",
  });
}

async function getAccessToken(force = false) {
  const config = getConfig();
  if (!config) throw new Error("Quran.Foundation non configuré");
  if (!force && tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;

  const candidates = config.scope ? [config.scope] : workingScope ? [workingScope] : [GRANULAR_SCOPES, LEGACY_SCOPE];
  let lastStatus = 0;
  for (const scope of candidates) {
    const response = await requestToken(config, scope);
    if (response.ok) {
      const body = z.object({ access_token: z.string(), expires_in: z.number().default(3600) }).parse(await response.json());
      workingScope = scope;
      tokenCache = { token: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
      return body.access_token;
    }
    lastStatus = response.status;
    // invalid_scope (400) : on essaie le scope suivant ; toute autre erreur est définitive.
    if (response.status !== 400) break;
  }
  throw new Error(`Authentification Quran.Foundation refusée (${lastStatus})`);
}

async function qfFetch(path: string, retry = true): Promise<unknown> {
  const config = getConfig();
  if (!config) throw new Error("Quran.Foundation non configuré");
  const response = await fetch(`${config.apiBase}${path}`, {
    headers: { "x-auth-token": await getAccessToken(), "x-client-id": config.clientId, "User-Agent": USER_AGENT },
    next: { revalidate: CACHE_SECONDS },
  });
  if (response.status === 401 && retry) {
    await getAccessToken(true);
    return qfFetch(path, false);
  }
  if (!response.ok) throw new Error(`Requête Quran.Foundation échouée (${response.status})`);
  return response.json();
}

/** Réservé aux tests. */
export function __resetQuranFoundationForTests() {
  tokenCache = null;
  workingScope = null;
}

const wordSchema = z.object({
  position: z.number(),
  char_type_name: z.string(),
  audio_url: z.string().nullable().optional(),
  translation: z.object({ text: z.string().nullable().optional() }).nullable().optional(),
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

/** Sens mot à mot sans la ponctuation de la phrase (« guillemets », virgule ou point final). */
function cleanGloss(text: string | null | undefined): string | null {
  const clean = (text ?? "")
    .replace(/[«»“”"]/gu, "")
    .replace(/[\s,.;:!?]+$/u, "")
    .replace(/\s+/gu, " ")
    .trim();
  return clean || null;
}

export interface VerseMedia {
  v: number;
  translation: string | null;
  audio: string | null;
  /** Audio de chaque mot (ordre des mots), null si indisponible. */
  words: Array<string | null>;
  /** Traduction française mot à mot (Quran.Foundation), null si indisponible. */
  wordsFr: Array<string | null>;
}

export type Reciter = "afasy" | "dossari";
/** Yāsir ad-Dawsarī : récitant « de sourate » chez Quran.Foundation (pas de fichier par verset). */
const DOSSARI_CHAPTER_RECITER = 174;

const chapterAudioSchema = z.object({
  audio_file: z.object({
    audio_url: z.string(),
    timestamps: z.array(z.object({ verse_key: z.string(), timestamp_from: z.number(), timestamp_to: z.number() })).default([]),
  }),
});

/**
 * Audio de chaque verset dans le fichier de la sourate, sous forme d'URL à fragment temporel
 * (« …/18.mp3#t=7.21,16.9 ») : le lecteur de Kalima lit exactement ce passage.
 */
async function chapterVerseAudio(reciterId: number, chapter: number): Promise<Map<number, string>> {
  const body = chapterAudioSchema.parse(await qfFetch(`/content/api/v4/chapter_recitations/${reciterId}/${chapter}?segments=true`));
  const url = absolute(body.audio_file.audio_url, VERSE_AUDIO_BASE);
  const byVerse = new Map<number, string>();
  if (!url) return byVerse;
  // Le minutage compte une ouverture (basmala, ou isti'ādha + basmala : ~3 s ou ~7 s) qui n'est pas
  // dans le fichier : celui-ci commence directement au verset 1. Mesuré le 28/11/2026 sur les 114
  // sourates (pauses de la récitation alignées sur les frontières des versets) : le décalage est
  // égal au début annoncé du verset 1, constant d'un bout à l'autre de la sourate.
  const offset = body.audio_file.timestamps[0]?.timestamp_from ?? 0;
  for (const t of body.audio_file.timestamps) {
    const verse = Number(t.verse_key.split(":")[1]);
    const from = Math.max(0, t.timestamp_from - offset) / 1000;
    const to = Math.max(0, t.timestamp_to - offset) / 1000;
    if (Number.isInteger(verse) && to > from) byVerse.set(verse, `${url}#t=${from.toFixed(2)},${to.toFixed(2)}`);
  }
  return byVerse;
}

export async function getChapterMedia(chapter: number, reciter: Reciter = "afasy"): Promise<VerseMedia[]> {
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 114) throw new Error("Sourate invalide");
  const config = getConfig();
  if (!config) throw new Error("Quran.Foundation non configuré");
  const query = (page: number) =>
    new URLSearchParams({
      language: "fr",
      words: "true",
      translations: String(config.translationId),
      ...(reciter === "afasy" ? { audio: String(config.recitationId) } : {}),
      word_fields: "audio_url",
      word_translation_language: "fr",
      per_page: "50",
      page: String(page),
    }).toString();

  const [first, dossari] = await Promise.all([
    qfFetch(`/content/api/v4/verses/by_chapter/${chapter}?${query(1)}`).then((body) => pageSchema.parse(body)),
    reciter === "dossari" ? chapterVerseAudio(DOSSARI_CHAPTER_RECITER, chapter) : Promise.resolve(null),
  ]);
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
      audio: dossari ? (dossari.get(verse.verse_number) ?? null) : absolute(verse.audio?.url, VERSE_AUDIO_BASE),
      words: verse.words.filter((w) => w.char_type_name === "word").map((w) => absolute(w.audio_url, WORD_AUDIO_BASE)),
      wordsFr: verse.words.filter((w) => w.char_type_name === "word").map((w) => cleanGloss(w.translation?.text)),
    }));
}

const verseByKeySchema = z.object({ verse: z.object({ words: z.array(wordSchema).default([]) }) });

/** Audio de chaque mot d'un verset (léger : un seul verset, pas toute la sourate). */
export async function getVerseWordAudio(chapter: number, verse: number): Promise<Array<string | null>> {
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 114 || !Number.isInteger(verse) || verse < 1) {
    throw new Error("Référence invalide");
  }
  const query = new URLSearchParams({ words: "true", word_fields: "audio_url" }).toString();
  const body = verseByKeySchema.parse(await qfFetch(`/content/api/v4/verses/by_key/${chapter}:${verse}?${query}`));
  return body.verse.words.filter((w) => w.char_type_name === "word").map((w) => absolute(w.audio_url, WORD_AUDIO_BASE));
}
