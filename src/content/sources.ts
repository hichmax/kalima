import type { SourceId } from "@/content/types";

export interface SourceRef {
  id: SourceId;
  label: string;
  detail: string;
  url?: string;
  license?: string;
  kind: "texte" | "données" | "audio" | "tajwid" | "pédagogie" | "police";
  /** Vérifié pendant la refonte (lecture de la source ou contrôle automatique). */
  verified: boolean;
}

export const sources: SourceRef[] = [
  {
    id: "tanzil",
    kind: "texte",
    label: "Tanzil Quran Text — Uthmani 1.1",
    detail: "Texte arabe de tous les versets affichés. Copie verbatim, SHA-256 contrôlé à chaque build.",
    url: "https://tanzil.net",
    license: "Creative Commons BY 3.0 — copie verbatim, modification interdite",
    verified: true,
  },
  {
    id: "qac",
    kind: "données",
    label: "Quranic Arabic Corpus 0.4 (University of Leeds)",
    detail: "Découpage des mots, lemmes, racines et fréquences. Miroir corrigé mustafa0x/quran-morphology, commit 8f38b39.",
    url: "https://corpus.quran.com",
    license: "GNU GPL",
    verified: true,
  },
  {
    id: "qf",
    kind: "données",
    label: "Quran.Foundation — Content API v4",
    detail: "Traduction et récitation, chargées à la demande et jamais stockées dans le dépôt, conformément aux Developer Terms (20/11/2026).",
    url: "https://api-docs.quran.foundation",
    license: "Quran.Foundation Developer Terms",
    verified: true,
  },
  {
    id: "hamidullah",
    kind: "texte",
    label: "Muhammad Hamidullah — traduction des sens en français",
    detail: "Révision du Complexe du Roi Fahd, via Quran.Foundation (ressource 31). Une traduction est une interprétation, pas le Coran.",
    license: "Œuvre protégée, diffusée par Quran.Foundation",
    verified: false,
  },
  {
    id: "alafasy",
    kind: "audio",
    label: "Mishary Rāshid al-ʿAfāsī — récitation (Ḥafṣ ʿan ʿĀṣim)",
    detail: "Audio des versets et des mots, via Quran.Foundation (ressource 7).",
    license: "Quran.Foundation Developer Terms — crédit du récitant",
    verified: true,
  },
  {
    id: "tuhfa",
    kind: "tajwid",
    label: "Sulaymān al-Jamzūrī — Tuḥfat al-Aṭfāl",
    detail: "Poème didactique de référence : nūn sākina, tanwīn, mīm sākina, madd.",
    verified: true,
  },
  {
    id: "jazariyya",
    kind: "tajwid",
    label: "Ibn al-Jazarī (m. 833 H.) — al-Muqaddima al-Jazariyya",
    detail: "Points d'articulation (17 dans 5 zones), caractéristiques des lettres, tafkhīm, qalqala, waqf.",
    verified: true,
  },
  {
    id: "mushaf-madina",
    kind: "tajwid",
    label: "Muṣḥaf de Médine — Complexe du Roi Fahd",
    detail: "Conventions graphiques (اصطلاحات الضبط) et signes de pause, expliqués dans la postface du muṣḥaf.",
    url: "https://qurancomplex.gov.sa",
    verified: true,
  },
  {
    id: "nuraniyya",
    kind: "tajwid",
    label: "Nūr Muḥammad Ḥaqqānī — al-Qāʿida an-Nūrāniyya",
    detail: "Progression de lecture : lettres, voyelles, signes, lecture continue.",
    verified: true,
  },
  {
    id: "marsafi",
    kind: "tajwid",
    label: "ʿAbd al-Fattāḥ al-Marṣafī — Hidāyat al-Qārī ilā Tajwīd Kalām al-Bārī",
    detail: "Ouvrage de référence détaillé pour les cas limites.",
    verified: true,
  },
  {
    id: "roediger-2006",
    kind: "pédagogie",
    label: "Roediger & Karpicke (2006), Test-Enhanced Learning",
    detail: "Psychological Science 17(3). Se tester fait mieux retenir que relire.",
    verified: true,
  },
  {
    id: "cepeda-2006",
    kind: "pédagogie",
    label: "Cepeda et al. (2006), Distributed practice in verbal recall tasks",
    detail: "Psychological Bulletin 132(3). Les révisions espacées dans le temps.",
    verified: true,
  },
  {
    id: "dunlosky-2013",
    kind: "pédagogie",
    label: "Dunlosky et al. (2013), Improving Students' Learning With Effective Learning Techniques",
    detail: "Psychological Science in the Public Interest 14(1). Tests et pratique distribuée en tête.",
    verified: true,
  },
  {
    id: "fsrs",
    kind: "pédagogie",
    label: "Ye, Su & Cao (2022) — FSRS ; bibliothèque ts-fsrs",
    detail: "KDD 2022. Algorithme de répétition espacée utilisé pour chaque carte (rétention cible 90 %).",
    url: "https://github.com/open-spaced-repetition/ts-fsrs",
    license: "MIT",
    verified: true,
  },
  {
    id: "kornell-2008",
    kind: "pédagogie",
    label: "Kornell & Bjork (2008), Learning concepts and categories: is spacing the “enemy of induction”?",
    detail: "Psychological Science 19(6). Mélanger les types de questions aide à discriminer.",
    verified: true,
  },
  {
    id: "ehri-2014",
    kind: "pédagogie",
    label: "Ehri (2014), Orthographic mapping",
    detail: "Scientific Studies of Reading 18(1). Lier lettre et son pour automatiser la lecture.",
    verified: true,
  },
  {
    id: "abu-rabia-2001",
    kind: "pédagogie",
    label: "Abu-Rabia (2001), The role of vowels in reading Semitic scripts",
    detail: "Reading and Writing 14. Les voyelles écrites facilitent la lecture de l'arabe.",
    verified: true,
  },
  {
    id: "amiri",
    kind: "police",
    label: "Amiri Quran — Khaled Hosny",
    detail: "Police du texte coranique, version 1.003, auto-hébergée.",
    url: "https://github.com/aliftype/amiri",
    license: "SIL Open Font License 1.1",
    verified: true,
  },
];

export const sourceById = (id: SourceId) => {
  const source = sources.find((s) => s.id === id);
  if (!source) throw new Error(`Source inconnue : ${id}`);
  return source;
};
