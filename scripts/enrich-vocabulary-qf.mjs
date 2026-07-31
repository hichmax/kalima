import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const vocabularyPath = path.resolve("src/data/vocabulary.generated.json");
const vocabulary = JSON.parse(await readFile(vocabularyPath, "utf8"));

const clientId = process.env.QF_CLIENT_ID;
const clientSecret = process.env.QF_CLIENT_SECRET;
const environment = process.env.QF_ENV || "prelive";
if (!clientId || !clientSecret) {
  throw new Error("QF_CLIENT_ID and QF_CLIENT_SECRET are required");
}

const authBase =
  environment === "production"
    ? "https://oauth2.quran.foundation"
    : "https://prelive-oauth2.quran.foundation";
const apiBase =
  environment === "production"
    ? "https://apis.quran.foundation"
    : "https://apis-prelive.quran.foundation";

const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
const tokenResponse = await fetch(`${authBase}/oauth2/token`, {
  method: "POST",
  headers: {
    Authorization: `Basic ${basic}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: "grant_type=client_credentials&scope=content",
});
if (!tokenResponse.ok) {
  throw new Error(`Quran Foundation authentication failed (${tokenResponse.status})`);
}
const { access_token: accessToken } = await tokenResponse.json();

const query = new URLSearchParams({
  language: "fr",
  words: "true",
  fields: "text_uthmani",
  word_fields:
    "text_uthmani,text_imlaei,translation,transliteration,audio_url",
});

const verseByKey = new Map();
let chapterCursor = 1;

const fetchPage = async (chapter, page) => {
  const pageQuery = new URLSearchParams(query);
  pageQuery.set("page", String(page));
  pageQuery.set("per_page", "50");
  const response = await fetch(
    `${apiBase}/content/api/v4/verses/by_chapter/${chapter}?${pageQuery.toString()}`,
    {
      headers: {
        "x-auth-token": accessToken,
        "x-client-id": clientId,
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Chapter ${chapter}, page ${page} failed (${response.status})`);
  }
  return response.json();
};

const workers = Array.from({ length: 6 }, async () => {
  while (chapterCursor <= 114) {
    const chapter = chapterCursor;
    chapterCursor += 1;
    const firstPage = await fetchPage(chapter, 1);
    const remainingPages = await Promise.all(
      Array.from(
        { length: Math.max(0, firstPage.pagination.total_pages - 1) },
        (_, index) => fetchPage(chapter, index + 2),
      ),
    );
    for (const verse of [firstPage, ...remainingPages].flatMap(
      (page) => page.verses,
    )) {
      verseByKey.set(verse.verse_key, verse);
    }
    console.log(`Fetched chapter ${chapter}/114`);
  }
});
await Promise.all(workers);

const decodeEntities = (value = "") =>
  value
    .replace(/&#(\d+);/gu, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/giu, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

const plainText = (value = "") =>
  decodeEntities(
    value
      .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/giu, "")
      .replace(/<[^>]+>/gu, " "),
  )
    .replace(/\)(?=\p{L})/gu, ") ")
    .replace(/\s+/gu, " ")
    .replace(/[،,;]\s*$/u, "")
    .trim();

let enriched = 0;
const units = vocabulary.units.map((unit) => {
  const [chapter, verse, position] = unit.examples[0]?.split(":").map(Number) || [];
  const sourceVerse = verseByKey.get(`${chapter}:${verse}`);
  const sourceWord = sourceVerse?.words?.find(
    (word) => word.char_type_name === "word" && word.position === position,
  );
  const meaning = plainText(sourceWord?.translation?.text);
  const transliteration = plainText(sourceWord?.transliteration?.text);
  if (!meaning || !transliteration || !sourceWord?.audio_url) return unit;
  enriched += 1;
  return {
    ...unit,
    arabic: sourceWord.text_uthmani || unit.arabic,
    simpleArabic: sourceWord.text_imlaei || unit.simpleArabic,
    beginnerPhonetic: transliteration,
    transliteration,
    primaryMeaningFr: meaning,
    contextualMeanings: Array.from(
      new Set([meaning, ...unit.contextualMeanings].filter(Boolean)),
    ),
    audioUrl: new URL(
      sourceWord.audio_url.replace(/^\/+/u, ""),
      "https://audio.qurancdn.com/",
    ).toString(),
    sourceIds: Array.from(
      new Set([...unit.sourceIds, "quran-foundation-v4"]),
    ),
    status: "needs_review",
  };
});

const unresolved = units.filter(
  (unit) =>
    !unit.audioUrl ||
    !unit.transliteration ||
    /(?:à valider|à compléter|sens français)/iu.test(
      `${unit.primaryMeaningFr} ${unit.transliteration}`,
    ),
);

await writeFile(
  vocabularyPath,
  `${JSON.stringify(
    {
      metadata: {
        ...vocabulary.metadata,
        quranFoundationEnrichedAt: new Date().toISOString(),
        quranFoundationTranslation: "French word-by-word",
        quranFoundationVersion: "Content API v4",
        enrichedCount: enriched,
        unresolvedCount: unresolved.length,
        note:
          "Chaque unité reprend la traduction contextuelle, la translittération et l’audio de sa première occurrence Quran.Foundation. La validation lexicale finale reste suivie dans l’administration.",
      },
      units,
    },
    null,
    2,
  )}\n`,
);

console.log(`Enriched ${enriched}/${units.length} vocabulary units`);
console.log(`Unresolved units: ${unresolved.length}`);
if (unresolved.length) {
  console.log(
    unresolved
      .slice(0, 25)
      .map((unit) => `${unit.id}:${unit.arabic}`)
      .join(" "),
  );
  process.exitCode = 2;
}
