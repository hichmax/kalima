// Génère les données coraniques de Kalima à partir des sources versionnées.
//
//   node scripts/build-content.mjs          → écrit src/generated/**
//   node scripts/build-content.mjs --check  → vérifie que src/generated/** est à jour
//
// Sources :
//   - Tanzil Quran Text (Uthmani 1.1), CC BY 3.0, copie verbatim : content/sources/tanzil/
//   - Quranic Arabic Corpus 0.4 (miroir mustafa0x), GNU GPL : content/sources/qac/
//
// Le texte coranique n'est jamais modifié. Les mots sont les jetons du fichier Tanzil,
// les signes de pause (jetons isolés U+06D6–U+06DC) sont rattachés au mot précédent.

import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CHECK = process.argv.includes("--check");

const TANZIL_PATH = path.join(ROOT, "content/sources/tanzil/quran-uthmani.txt");
const TANZIL_SHA256 = "6933e133dd56db778c801bf738848454e43648105a151e8d84d86a7cae39ec5f";
const TANZIL_META_PATH = path.join(ROOT, "content/sources/tanzil/quran-data.xml");
const QAC_PATH = path.join(ROOT, "content/sources/qac/quran-morphology.txt");
const QAC_SHA256 = "742bfac59941b2cb09736d5b7aae694af50792261fb8450cbf6afafcc340645f";
const OUT = path.join(ROOT, "src/generated");

/** Sourates étudiées dans le programme de 30 jours (leurs lemmes entrent dans le lexique). */
const PROGRAM_SURAHS = [1, 112, 113, 114, 108, 103, 110, 106, 105, 107, 109];
const LEXICON_TOP = 300;

const TANZIL_NOTICE =
  "Tanzil Quran Text (Uthmani, Version 1.1). Copyright (C) 2007-2026 Tanzil Project. " +
  "License: Creative Commons Attribution 3.0. Verbatim copy, changing it is not allowed. " +
  "Source: https://tanzil.net";
const QAC_NOTICE =
  "Morphology derived from the Quranic Arabic Corpus 0.4 (Language Research Group, " +
  "University of Leeds), corrected mirror github.com/mustafa0x/quran-morphology " +
  "(commit 8f38b39). License: GNU GPL. https://corpus.quran.com";

// Signes de pause (U+06D6–U+06DC) et signe de prosternation ۩ (U+06E9), isolés dans Tanzil.
const PAUSE_MARK = /^[\u06D6-\u06DC\u06E9]$/u;
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

// ---------------------------------------------------------------- Tanzil
const tanzilRaw = await readFile(TANZIL_PATH);
if (sha256(tanzilRaw) !== TANZIL_SHA256) fail("Tanzil : SHA-256 inattendu, le fichier a été modifié.");
const tanzilText = tanzilRaw.toString("utf8");
if (!tanzilText.includes("PLEASE DO NOT REMOVE OR CHANGE THIS COPYRIGHT BLOCK")) {
  fail("Tanzil : l'en-tête de copyright est absent.");
}

/** @type {Map<number, Array<{v:number, words:Array<{ar:string, stop?:string}>, basmala:string[] | null}>>} */
const surahs = new Map();
// La basmala de référence est le verset 1:1 lui-même, jamais une chaîne saisie à la main.
const BASMALA = tanzilText.match(/^1\|1\|(.+)$/mu)?.[1];
if (!BASMALA) fail("Tanzil : verset 1:1 introuvable");
for (const line of tanzilText.split(/\r?\n/u)) {
  if (!/^\d+\|\d+\|/u.test(line)) continue;
  const [s, v, ...rest] = line.split("|");
  const surah = Number(s);
  const verse = Number(v);
  const text = rest.join("|");
  const words = [];
  for (const token of text.split(" ")) {
    if (!token) continue;
    if (PAUSE_MARK.test(token)) {
      const previous = words.at(-1);
      if (!previous) fail(`${s}:${v} commence par un signe de pause`);
      previous.stop = (previous.stop ?? "") + token;
    } else {
      words.push({ ar: token });
    }
  }
  // Tanzil préfixe la basmala au verset 1 de chaque sourate sauf 1 et 9.
  /** @type {string[] | null} */
  let basmala = null;
  if (verse === 1 && surah !== 1 && surah !== 9) {
    const prefix = words.slice(0, 4).map((w) => w.ar).join(" ");
    // Tanzil marque parfois l'idghām avec la fin de la sourate précédente par une shadda
    // sur le bāʾ (بِّسْمِ, ex. 95:1) : on conserve ce préfixe tel quel.
    if (prefix.replace("بّ", "ب") !== BASMALA) fail(`${s}:1 : basmala attendue en préfixe`);
    basmala = words.splice(0, 4).map((w) => w.ar);
  }
  if (!surahs.has(surah)) surahs.set(surah, []);
  surahs.get(surah).push({ v: verse, words, basmala });
}

// ---------------------------------------------------------------- Métadonnées Tanzil
const metaXml = await readFile(TANZIL_META_PATH, "utf8");
const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`, "u"))?.[1];
const suraMeta = [...metaXml.matchAll(/<sura [^>]*\/>/gu)].map(([tag]) => ({
  n: Number(attr(tag, "index")),
  ayas: Number(attr(tag, "ayas")),
  ar: attr(tag, "name"),
  type: attr(tag, "type") === "Meccan" ? "mecquoise" : "médinoise",
  order: Number(attr(tag, "order")),
}));
const juzStarts = [...metaXml.matchAll(/<juz [^>]*\/>/gu)].map(([tag]) => ({
  juz: Number(attr(tag, "index")),
  s: Number(attr(tag, "sura")),
  v: Number(attr(tag, "aya")),
}));
const pageStarts = [...metaXml.matchAll(/<page [^>]*\/>/gu)].map(([tag]) => ({
  page: Number(attr(tag, "index")),
  s: Number(attr(tag, "sura")),
  v: Number(attr(tag, "aya")),
}));
if (suraMeta.length !== 114 || juzStarts.length !== 30 || pageStarts.length !== 604) {
  fail("Métadonnées Tanzil incomplètes");
}

// Noms français (fichier TypeScript simple, lu comme texte).
const namesSource = await readFile(path.join(ROOT, "src/content/surah-names.ts"), "utf8");
const names = [...namesSource.matchAll(/\["([^"]+)", "([^"]+)", "([^"]+)", (\d+)\]/gu)].map(
  (m) => ({ ar: m[1], tr: m[2], fr: m[3], ayas: Number(m[4]) }),
);
if (names.length !== 114) fail(`surah-names.ts : 114 noms attendus, ${names.length} trouvés`);

let totalVerses = 0;
for (const meta of suraMeta) {
  const verses = surahs.get(meta.n);
  if (!verses || verses.length !== meta.ayas) fail(`Sourate ${meta.n} : nombre de versets incohérent`);
  if (names[meta.n - 1].ayas !== meta.ayas) fail(`surah-names.ts : versets de ${meta.n} incohérents`);
  verses.forEach((verse, index) => {
    if (verse.v !== index + 1) fail(`Sourate ${meta.n} : ordre des versets`);
  });
  totalVerses += verses.length;
}
if (totalVerses !== 6236) fail(`6236 versets attendus, ${totalVerses} trouvés`);

// ---------------------------------------------------------------- QAC
const qacRaw = await readFile(QAC_PATH);
if (sha256(qacRaw) !== QAC_SHA256) fail("QAC : SHA-256 inattendu");

/** clé "s:v" → Map(mot → segments) */
const qac = new Map();
for (const line of qacRaw.toString("utf8").split(/\r?\n/u)) {
  if (!line || line.startsWith("#")) continue;
  const [location, ar, pos, tags = ""] = line.split("\t");
  const [s, v, w] = location.split(":").map(Number);
  const key = `${s}:${v}`;
  if (!qac.has(key)) qac.set(key, new Map());
  const verse = qac.get(key);
  if (!verse.has(w)) verse.set(w, []);
  const parts = tags.split("|");
  const kind = parts.includes("PREF") ? "pre" : parts.includes("SUFF") ? "suf" : "stem";
  const lem = parts.find((p) => p.startsWith("LEM:"))?.slice(4);
  const root = parts.find((p) => p.startsWith("ROOT:"))?.slice(5);
  const features = parts.filter(
    (p) => p !== "PREF" && p !== "SUFF" && !p.startsWith("LEM:") && !p.startsWith("ROOT:"),
  );
  const segment = { ar, k: kind, p: pos, f: features.join("|") };
  // Les lemmes sont normalisés en NFC (ordre canonique shadda/voyelle) pour servir de clés.
  if (lem) segment.l = lem.normalize("NFC");
  if (root) segment.r = root;
  verse.get(w).push(segment);
}

// Alignement mot à mot Tanzil ↔ QAC.
// Le corpus fusionne parfois deux jetons Tanzil en un mot (بَعْدَ مَا en 2:181, إِلْ يَاسِينَ en
// 37:130). On compare donc les squelettes consonantiques et on regroupe les jetons Tanzil.
const skeleton = (value) =>
  value
    .normalize("NFC")
    .replace(/[\u0640\u064B-\u065F\u0670\u06D6-\u06ED\s]/gu, "")
    .replace(/[\u0671\u0622\u0623\u0625]/gu, "\u0627")
    .replace(/[\u0624\u0626]/gu, "\u0621")
    .replace(/\u0649/gu, "\u064A");
let merged = 0;
for (const [s, verses] of surahs) {
  for (const verse of verses) {
    const morph = qac.get(`${s}:${verse.v}`);
    if (!morph) fail(`QAC : verset ${s}:${verse.v} absent`);
    if (morph.size === verse.words.length) continue;
    const grouped = [];
    let cursor = 0;
    for (let w = 1; w <= morph.size; w += 1) {
      const target = skeleton(morph.get(w).map((segment) => segment.ar).join(""));
      const group = [verse.words[cursor]];
      cursor += 1;
      while (skeleton(group.map((g) => g.ar).join("")).length < target.length && cursor < verse.words.length) {
        group.push(verse.words[cursor]);
        cursor += 1;
      }
      if (group.length > 1) merged += 1;
      grouped.push({
        ar: group.map((g) => g.ar).join(" "),
        ...(group.some((g) => g.stop) ? { stop: group.map((g) => g.stop ?? "").join("") } : {}),
      });
    }
    if (cursor !== verse.words.length) {
      fail(`Alignement ${s}:${verse.v} : ${verse.words.length} jetons Tanzil, ${morph.size} mots QAC`);
    }
    verse.words = grouped;
  }
}

// ---------------------------------------------------------------- Statistiques de lemmes
const lemmaStats = new Map();
for (const [s, verses] of surahs) {
  for (const verse of verses) {
    const morph = qac.get(`${s}:${verse.v}`);
    verse.words.forEach((_, index) => {
      for (const segment of morph.get(index + 1)) {
        if (segment.k !== "stem" || !segment.l) continue;
        const key = `${segment.l}|${segment.p}`;
        const entry = lemmaStats.get(key) ?? {
          key,
          lemma: segment.l,
          pos: segment.p,
          root: segment.r ?? null,
          count: 0,
          refs: [],
          programRefs: [],
        };
        entry.count += 1;
        const ref = `${s}:${verse.v}:${index + 1}`;
        if (entry.refs.length < 3) entry.refs.push(ref);
        if (PROGRAM_SURAHS.includes(s) && entry.programRefs.length < 3) entry.programRefs.push(ref);
        lemmaStats.set(key, entry);
      }
    });
  }
}
const ranked = [...lemmaStats.values()].sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
const totalStems = ranked.reduce((sum, entry) => sum + entry.count, 0);
let cumulative = 0;
const lexicon = [];
ranked.forEach((entry, index) => {
  cumulative += entry.count;
  const inProgram = entry.programRefs.length > 0;
  if (index < LEXICON_TOP || inProgram) {
    lexicon.push({
      key: entry.key,
      lemma: entry.lemma,
      pos: entry.pos,
      root: entry.root,
      count: entry.count,
      rank: index + 1,
      coverage: Number(((100 * cumulative) / totalStems).toFixed(2)),
      refs: entry.programRefs.length ? entry.programRefs : entry.refs,
      inProgram,
    });
  }
});

// ---------------------------------------------------------------- Sorties
const files = new Map();
const json = (value) => `${JSON.stringify(value)}\n`;

files.set(
  "surahs/index.json",
  json({
    notice: TANZIL_NOTICE,
    surahs: suraMeta.map((meta) => ({
      n: meta.n,
      ar: meta.ar,
      tr: names[meta.n - 1].tr,
      fr: names[meta.n - 1].fr,
      ayas: meta.ayas,
      type: meta.type,
      order: meta.order,
    })),
    juz: juzStarts,
    pages: pageStarts,
  }),
);

for (const [s, verses] of surahs) {
  files.set(
    `surahs/${s}.json`,
    json({
      notice: TANZIL_NOTICE,
      n: s,
      basmala: verses[0].basmala,
      verses: verses.map((verse) => ({ v: verse.v, w: verse.words })),
    }),
  );
  files.set(
    `morph/${s}.json`,
    json({
      notice: QAC_NOTICE,
      n: s,
      verses: verses.map((verse) => {
        const morph = qac.get(`${s}:${verse.v}`);
        return verse.words.map((_, index) => morph.get(index + 1));
      }),
    }),
  );
}

files.set(
  "lexicon-stats.json",
  json({
    notice: QAC_NOTICE,
    totalStems,
    distinctLemmas: ranked.length,
    hapax: ranked.filter((entry) => entry.count === 1).length,
    lemmas: lexicon,
  }),
);

const manifest = {
  tanzil: { file: "content/sources/tanzil/quran-uthmani.txt", sha256: TANZIL_SHA256, version: "Uthmani 1.1" },
  qac: { file: "content/sources/qac/quran-morphology.txt", sha256: QAC_SHA256, version: "0.4 (mustafa0x 8f38b39)" },
  verses: totalVerses,
  files: [...files.keys()].sort().map((name) => ({ name, sha256: sha256(files.get(name)) })),
};
files.set("manifest.json", json(manifest));

if (CHECK) {
  const stale = [];
  for (const [name, content] of files) {
    const existing = await readFile(path.join(OUT, name), "utf8").catch(() => null);
    if (existing !== content) stale.push(name);
  }
  const known = new Set(files.keys());
  for (const dir of ["surahs", "morph"]) {
    const entries = await readdir(path.join(OUT, dir)).catch(() => []);
    for (const entry of entries) if (!known.has(`${dir}/${entry}`)) stale.push(`${dir}/${entry} (orphelin)`);
  }
  if (stale.length) fail(`Données générées obsolètes (${stale.length}) : ${stale.slice(0, 5).join(", ")}… Lance npm run content:build.`);
  console.log(`✓ Contenu à jour (${merged} regroupements) : ${totalVerses} versets, ${files.size} fichiers, alignement Tanzil/QAC vérifié.`);
} else {
  await mkdir(path.join(OUT, "surahs"), { recursive: true });
  await mkdir(path.join(OUT, "morph"), { recursive: true });
  for (const [name, content] of files) await writeFile(path.join(OUT, name), content);
  console.log(`✓ ${files.size} fichiers écrits dans src/generated (${totalVerses} versets, ${lexicon.length} lemmes au lexique).`);
}
