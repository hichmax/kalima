import type { Ayah, PartOfSpeech, QuranWord } from "@/lib/types";

const stripArabicMarks = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/gu, "")
    .replace(/[ٱأإآ]/gu, "ا");

const word = (
  id: string,
  position: number,
  arabic: string,
  meaning: string,
  phonetic: string,
  lemma: string,
  root: string | undefined,
  partOfSpeech: PartOfSpeech,
): QuranWord => ({
  id,
  position,
  arabic,
  simpleArabic: stripArabicMarks(arabic),
  beginnerPhonetic: phonetic,
  transliteration: phonetic,
  contextualMeaning: meaning,
  lemma,
  root,
  partOfSpeech,
  status: "needs_review",
  sourceIds: ["qac-0.4-mirror", "kalima-pedagogy-draft"],
});

export const fatihaAyahs: Ayah[] = [
  {
    id: "1:1",
    surah: 1,
    number: 1,
    textUthmani: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    translationFr:
      "Au nom de Dieu, le Tout Miséricordieux, le Très Miséricordieux.",
    words: [
      word("1:1:1", 1, "بِسْمِ", "au nom de", "bismi", "اسْم", "سمو", "nom"),
      word("1:1:2", 2, "ٱللَّهِ", "Dieu", "Allāhi", "اللَّه", "أله", "nom"),
      word("1:1:3", 3, "ٱلرَّحْمَٰنِ", "le Tout Miséricordieux", "ar-Raḥmāni", "رَحْمٰن", "رحم", "adjectif"),
      word("1:1:4", 4, "ٱلرَّحِيمِ", "le Très Miséricordieux", "ar-Raḥīmi", "رَحِيم", "رحم", "adjectif"),
    ],
    status: "imported",
    translationStatus: "needs_review",
    sourceIds: ["tanzil-1.1", "kalima-pedagogy-draft"],
  },
  {
    id: "1:2",
    surah: 1,
    number: 2,
    textUthmani: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
    translationFr: "La louange appartient à Dieu, Seigneur des mondes.",
    words: [
      word("1:2:1", 1, "ٱلْحَمْدُ", "la louange", "al-ḥamdou", "حَمْد", "حمد", "nom"),
      word("1:2:2", 2, "لِلَّهِ", "à Dieu", "lillāhi", "اللَّه", "أله", "nom"),
      word("1:2:3", 3, "رَبِّ", "Seigneur", "rabbi", "رَبّ", "ربب", "nom"),
      word("1:2:4", 4, "ٱلْعَٰلَمِينَ", "des mondes", "al-ʿālamīna", "عالَم", "علم", "nom"),
    ],
    status: "imported",
    translationStatus: "needs_review",
    sourceIds: ["tanzil-1.1", "kalima-pedagogy-draft"],
  },
  {
    id: "1:3",
    surah: 1,
    number: 3,
    textUthmani: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    translationFr: "Le Tout Miséricordieux, le Très Miséricordieux.",
    words: [
      word("1:3:1", 1, "ٱلرَّحْمَٰنِ", "le Tout Miséricordieux", "ar-Raḥmāni", "رَحْمٰن", "رحم", "adjectif"),
      word("1:3:2", 2, "ٱلرَّحِيمِ", "le Très Miséricordieux", "ar-Raḥīmi", "رَحِيم", "رحم", "adjectif"),
    ],
    status: "imported",
    translationStatus: "needs_review",
    sourceIds: ["tanzil-1.1", "kalima-pedagogy-draft"],
  },
  {
    id: "1:4",
    surah: 1,
    number: 4,
    textUthmani: "مَٰلِكِ يَوْمِ ٱلدِّينِ",
    translationFr: "Maître du Jour de la rétribution.",
    words: [
      word("1:4:1", 1, "مَٰلِكِ", "Maître", "māliki", "مالِك", "ملك", "nom"),
      word("1:4:2", 2, "يَوْمِ", "du jour", "yawmi", "يَوْم", "يوم", "nom"),
      word("1:4:3", 3, "ٱلدِّينِ", "de la rétribution", "ad-dīni", "دِين", "دين", "nom"),
    ],
    status: "imported",
    translationStatus: "needs_review",
    sourceIds: ["tanzil-1.1", "kalima-pedagogy-draft"],
  },
  {
    id: "1:5",
    surah: 1,
    number: 5,
    textUthmani: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    translationFr: "C’est Toi que nous adorons, et Toi dont nous demandons l’aide.",
    words: [
      word("1:5:1", 1, "إِيَّاكَ", "Toi seul", "iyyāka", "إِيّا", undefined, "autre"),
      word("1:5:2", 2, "نَعْبُدُ", "nous adorons", "naʿboudou", "عَبَدَ", "عبد", "verbe"),
      word("1:5:3", 3, "وَإِيَّاكَ", "et Toi seul", "wa iyyāka", "إِيّا", undefined, "autre"),
      word("1:5:4", 4, "نَسْتَعِينُ", "nous demandons l’aide", "nastaʿīnou", "اسْتَعانَ", "عون", "verbe"),
    ],
    status: "imported",
    translationStatus: "needs_review",
    sourceIds: ["tanzil-1.1", "kalima-pedagogy-draft"],
  },
  {
    id: "1:6",
    surah: 1,
    number: 6,
    textUthmani: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
    translationFr: "Guide-nous sur le chemin droit.",
    words: [
      word("1:6:1", 1, "ٱهْدِنَا", "guide-nous", "ihdinā", "هَدَى", "هدي", "verbe"),
      word("1:6:2", 2, "ٱلصِّرَٰطَ", "le chemin", "aṣ-ṣirāṭa", "صِراط", "صرط", "nom"),
      word("1:6:3", 3, "ٱلْمُسْتَقِيمَ", "droit", "al-moustaqīma", "مُسْتَقِيم", "قوم", "adjectif"),
    ],
    status: "imported",
    translationStatus: "needs_review",
    sourceIds: ["tanzil-1.1", "kalima-pedagogy-draft"],
  },
  {
    id: "1:7",
    surah: 1,
    number: 7,
    textUthmani:
      "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
    translationFr:
      "Le chemin de ceux que Tu as comblés de bienfaits, non de ceux qui ont encouru la colère, ni des égarés.",
    words: [
      word("1:7:1", 1, "صِرَٰطَ", "le chemin", "ṣirāṭa", "صِراط", "صرط", "nom"),
      word("1:7:2", 2, "ٱلَّذِينَ", "de ceux qui", "alladhīna", "الَّذِي", undefined, "autre"),
      word("1:7:3", 3, "أَنْعَمْتَ", "Tu as comblés", "anʿamta", "أَنْعَمَ", "نعم", "verbe"),
      word("1:7:4", 4, "عَلَيْهِمْ", "sur eux", "ʿalayhim", "عَلَى", undefined, "particule"),
      word("1:7:5", 5, "غَيْرِ", "non / autre que", "ghayri", "غَيْر", "غير", "nom"),
      word("1:7:6", 6, "ٱلْمَغْضُوبِ", "ceux qui ont encouru la colère", "al-maghḍūbi", "مَغْضُوب", "غضب", "adjectif"),
      word("1:7:7", 7, "عَلَيْهِمْ", "sur eux", "ʿalayhim", "عَلَى", undefined, "particule"),
      word("1:7:8", 8, "وَلَا", "et non", "wa lā", "لا", undefined, "particule"),
      word("1:7:9", 9, "ٱلضَّآلِّينَ", "les égarés", "aḍ-ḍāllīna", "ضالّ", "ضلل", "nom"),
    ],
    status: "imported",
    translationStatus: "needs_review",
    sourceIds: ["tanzil-1.1", "kalima-pedagogy-draft"],
  },
];

export const featuredAyah = fatihaAyahs[0];

export const quranFixtureBySurah: Record<number, Ayah[]> = {
  1: fatihaAyahs,
};

export const getFixtureAyahs = (surah: number) =>
  quranFixtureBySurah[surah] || [];

export const getFixtureAyah = (surah: number, ayah: number) =>
  getFixtureAyahs(surah).find((item) => item.number === ayah);
