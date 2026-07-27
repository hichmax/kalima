type PhoneticWord = {
  arabic: string;
  beginnerPhonetic?: string;
  transliteration?: string;
};

const placeholderPattern =
  /(?:à\s+(?:valider|compléter)|écoute\s+(?:le mot|guidée)|indisponible)/iu;

export function hasUsablePhonetic(value?: string | null) {
  return Boolean(value?.trim() && !placeholderPattern.test(value));
}

const consonants: Record<string, string> = {
  ا: "a",
  أ: "ʾ",
  إ: "ʾ",
  آ: "ā",
  ٱ: "a",
  ب: "b",
  ت: "t",
  ث: "th",
  ج: "j",
  ح: "ḥ",
  خ: "kh",
  د: "d",
  ذ: "dh",
  ر: "r",
  ز: "z",
  س: "s",
  ش: "sh",
  ص: "ṣ",
  ض: "ḍ",
  ط: "ṭ",
  ظ: "ẓ",
  ع: "ʿ",
  غ: "gh",
  ف: "f",
  ق: "q",
  ك: "k",
  ل: "l",
  م: "m",
  ن: "n",
  ه: "h",
  ة: "h",
  و: "w",
  ي: "y",
  ى: "ā",
  ء: "ʾ",
  ئ: "ʾ",
  ؤ: "ʾ",
};

const marks = new Set([
  "\u064B",
  "\u064C",
  "\u064D",
  "\u064E",
  "\u064F",
  "\u0650",
  "\u0651",
  "\u0652",
  "\u0670",
]);

const replaceLastVowel = (value: string, short: string, long: string) =>
  value.endsWith(short) ? `${value.slice(0, -short.length)}${long}` : `${value}${long}`;

export function transliterateArabic(value: string) {
  const simple = value
    .replace(/[\u06D6-\u06ED]/gu, "")
    .replace(/\u0640/gu, "")
    .trim();
  const withoutMarks = simple.replace(/[\u064B-\u0652\u0670]/gu, "");
  if (withoutMarks === "الله") return "Allāh";

  const characters = [...simple];
  let output = "";
  let lastConsonant = "";

  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];
    if (marks.has(character)) continue;
    if (/\s/u.test(character)) {
      output += " ";
      lastConsonant = "";
      continue;
    }
    if (/[،؛,.!?۝]/u.test(character)) continue;

    const nextMarks: string[] = [];
    let cursor = index + 1;
    while (cursor < characters.length && marks.has(characters[cursor])) {
      nextMarks.push(characters[cursor]);
      cursor += 1;
    }

    if (character === "ا" || character === "ى") {
      output = replaceLastVowel(output, "a", "ā");
      index = cursor - 1;
      continue;
    }
    if (character === "و" && output.endsWith("u")) {
      output = replaceLastVowel(output, "u", "ū");
      index = cursor - 1;
      continue;
    }
    if (character === "ي" && output.endsWith("i")) {
      output = replaceLastVowel(output, "i", "ī");
      index = cursor - 1;
      continue;
    }

    const consonant = consonants[character] || "";
    if (!consonant) continue;
    output += consonant;
    lastConsonant = consonant;

    if (nextMarks.includes("\u0651")) output += lastConsonant;
    if (nextMarks.includes("\u064B")) output += "an";
    else if (nextMarks.includes("\u064C")) output += "un";
    else if (nextMarks.includes("\u064D")) output += "in";
    else if (nextMarks.includes("\u064E")) output += "a";
    else if (nextMarks.includes("\u064F")) output += "u";
    else if (nextMarks.includes("\u0650")) output += "i";

    if (nextMarks.includes("\u0670")) {
      output = replaceLastVowel(output, "a", "ā");
    }
    index = cursor - 1;
  }

  return output
    .replace(/\s+/gu, " ")
    .replace(/^a(?=l)/u, "a")
    .trim();
}

export function getWordPhonetic(word: PhoneticWord) {
  if (hasUsablePhonetic(word.beginnerPhonetic)) {
    return word.beginnerPhonetic!.trim();
  }
  if (hasUsablePhonetic(word.transliteration)) {
    return word.transliteration!.trim();
  }
  return transliterateArabic(word.arabic);
}
