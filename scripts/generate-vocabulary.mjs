import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const input =
  process.env.QURAN_MORPHOLOGY_PATH ||
  "/tmp/kalima-quran-morphology/quran-morphology.txt";
const output = path.resolve("src/data/vocabulary.generated.json");

const curatedMeanings = new Map([
  ["اللَّه", "Dieu"],
  ["رَبّ", "Seigneur"],
  ["رَحْمٰن", "Le Tout Miséricordieux"],
  ["رَحِيم", "Le Très Miséricordieux"],
  ["حَمْد", "louange"],
  ["يَوْم", "jour"],
  ["دِين", "rétribution, religion selon le contexte"],
  ["صِراط", "chemin"],
  ["عَلَى", "sur"],
  ["فِي", "dans"],
  ["مِن", "de, depuis"],
  ["إِلَى", "vers"],
  ["لا", "ne… pas / non"],
  ["ما", "ce que / ce qui, selon le contexte"],
  ["مَن", "qui / celui qui"],
  ["قالَ", "dire"],
  ["كانَ", "être / se trouver"],
  ["آمَنَ", "croire, avoir foi"],
  ["عَلِمَ", "savoir"],
  ["جَعَلَ", "faire, placer"],
  ["كِتاب", "livre, écrit"],
  ["ناس", "gens, êtres humains"],
  ["حَقّ", "vérité, droit"],
  ["أَرْض", "terre"],
  ["سَماء", "ciel"],
]);

const raw = await readFile(input, "utf8");
const checksum = createHash("sha256").update(raw).digest("hex");
const byLemma = new Map();

for (const line of raw.split(/\r?\n/u)) {
  if (!line || line.startsWith("#")) continue;
  const [location, arabic, coarsePos, tags = ""] = line.split("\t");
  if (!location || !arabic) continue;
  const lemma = tags.match(/(?:^|\|)LEM:([^|]+)/u)?.[1];
  if (!lemma || tags.includes("PREF") || tags.includes("SUFF")) continue;
  const root = tags.match(/(?:^|\|)ROOT:([^|]+)/u)?.[1] || null;
  const key = `${lemma}|${coarsePos}`;
  const existing = byLemma.get(key) || {
    lemma,
    arabic,
    root,
    coarsePos,
    count: 0,
    examples: [],
  };
  existing.count += 1;
  if (existing.examples.length < 3) {
    existing.examples.push(location.split(":").slice(0, 3).join(":"));
  }
  byLemma.set(key, existing);
}

const normalizeArabic = (value) =>
  value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/gu, "")
    .replace(/[ٱأإآ]/gu, "ا");

const pos = (coarsePos, tags) => {
  if (coarsePos === "V") return "verbe";
  if (coarsePos === "P") return "particule";
  if (tags.includes("ADJ")) return "adjectif";
  if (coarsePos === "N") return "nom";
  return "autre";
};

const units = [...byLemma.values()]
  .sort((a, b) => b.count - a.count || a.lemma.localeCompare(b.lemma, "ar"))
  .slice(0, 1000)
  .map((item, index) => {
    const knownMeaning = curatedMeanings.get(item.lemma);
    return {
      id: `qac-lemma-${String(index + 1).padStart(4, "0")}`,
      arabic: item.lemma,
      simpleArabic: normalizeArabic(item.lemma),
      beginnerPhonetic: knownMeaning ? "À compléter après écoute guidée" : "À valider",
      transliteration: "À valider",
      primaryMeaningFr: knownMeaning || "Sens français à valider",
      contextualMeanings: knownMeaning ? [knownMeaning] : [],
      partOfSpeech: pos(item.coarsePos, ""),
      lemma: item.lemma,
      root: item.root,
      frequency: item.count,
      occurrences: item.count,
      examples: item.examples,
      level: index < 500 ? 1 : index < 1000 ? 2 : 3,
      themes: index < 500 ? ["Essentiel 500"] : ["Essentiel 1 000"],
      family: item.root,
      sourceIds: ["qac-0.4-mirror"],
      status: knownMeaning ? "needs_review" : "imported",
    };
  });

await mkdir(path.dirname(output), { recursive: true });
await writeFile(
  output,
  `${JSON.stringify(
    {
      metadata: {
        generatedAt: new Date().toISOString(),
        sourcePath: "quran-morphology.txt",
        sourceCommit: "8f38b39016824284f9ed16ae15069ff9102c4acf",
        sourceSha256: checksum,
        count: units.length,
        note: "Les unités sont réelles et classées par fréquence de lemme. Les sens français restent à valider lorsqu’ils ne sont pas explicitement renseignés.",
      },
      units,
    },
    null,
    2,
  )}\n`,
);

console.log(`Generated ${units.length} vocabulary units at ${output}`);
console.log(`Source SHA-256: ${checksum}`);
