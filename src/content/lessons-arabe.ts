import type { Lesson } from "@/content/types";

/**
 * Parcours « Comprendre » : la grammaire minimale pour reconnaître les mots du Coran.
 * Analyses morphologiques conformes au Quranic Arabic Corpus.
 * STATUT : rédaction Kalima, relecture requise par un arabisant.
 */
export const arabeLessons: Lesson[] = [
  {
    id: "article",
    track: "arabe",
    title: "Le nom et l'article",
    subtitle: "ال : le, la, les",
    minutes: 6,
    status: "draft",
    sources: ["qac"],
    blocks: [
      {
        kind: "text",
        title: "Un seul article pour tout",
        body: "L'arabe n'a qu'un article, ال, qui vaut « le », « la » et « les ». Il s'attache au début du nom : حَمْد (une louange) devient ٱلْحَمْدُ (la louange). Sans article, le nom est indéfini.",
      },
      { kind: "quran", ref: "1:2", focus: [1, 1], label: "ٱلْحَمْدُ", note: "al- (la) + ḥamd (louange)." },
      { kind: "quran", ref: "1:4", focus: [3, 3], label: "ٱلدِّينِ", note: "ad- (le) + dîn (rétribution) : l'article s'assimile à la lettre solaire." },
    ],
    practice: [
      {
        gen: "choice",
        items: [
          { q: "Que veut dire ٱلْ au début de ce mot ?", ref: "1:2:1", options: ["et", "le, la, les", "dans"], answer: 1, explain: "L'article défini.", card: "concept:article" },
          { q: "Ce mot porte-t-il l'article ?", ref: "1:2:3", options: ["Oui", "Non"], answer: 1, explain: "رَبِّ, « Seigneur de », n'a pas d'article.", card: "concept:article" },
          { q: "Ce mot porte-t-il l'article ?", ref: "114:1:4", options: ["Oui", "Non"], answer: 0, explain: "ٱلنَّاسِ : an-nâs, « les gens ».", card: "concept:article" },
        ],
      },
    ],
  },
  {
    id: "pronoms",
    track: "arabe",
    title: "Les pronoms attachés",
    subtitle: "ـكَ ـنَا ـهُ ـهُمْ : toi, nous, lui, eux",
    minutes: 8,
    status: "draft",
    sources: ["qac"],
    blocks: [
      {
        kind: "text",
        title: "Des pronoms collés à la fin des mots",
        body: "En arabe, « mon », « ton », « nous », « eux »… sont souvent de petites terminaisons attachées au mot. Sur un nom, ils indiquent le possesseur ; sur un verbe, le complément ; après une préposition, ce qu'elle désigne.",
      },
      {
        kind: "table",
        head: ["Suffixe", "Sens", "Exemple"],
        rows: [
          ["ـِى / ـنِى", "moi, mon", "دِينِ (ma religion, le ى est sous-entendu), en 109:6"],
          ["ـكَ", "toi, ton", "إِيَّاكَ, rabbouka"],
          ["ـهُۥ", "lui, son", "لَهُۥ (à lui)"],
          ["ـنَا", "nous, notre", "ٱهْدِنَا (guide-nous)"],
          ["ـكُمْ", "vous, votre", "دِينُكُمْ (votre religion)"],
          ["ـهُمْ / ـهِمْ", "eux, leur", "عَلَيْهِمْ (sur eux)"],
        ],
      },
      { kind: "quran", ref: "1:6", focus: [1, 1], label: "ٱهْدِنَا", note: "ihdi (guide !) + nâ (nous)." },
      { kind: "quran", ref: "1:7", focus: [4, 4], label: "عَلَيْهِمْ", note: "ʿalay (sur) + him (eux)." },
      { kind: "quran", ref: "109:6", label: "لَكُمْ دِينُكُمْ وَلِىَ دِينِ", note: "À vous votre religion, et à moi ma religion." },
    ],
    practice: [
      {
        gen: "choice",
        items: [
          { q: "Que signifie la fin ـنَا de ce mot ?", ref: "1:6:1", options: ["nous", "toi", "eux"], answer: 0, explain: "ihdinâ : guide-NOUS.", card: "concept:pronom-na" },
          { q: "Que signifie la fin ـهِمْ de ce mot ?", ref: "1:7:4", options: ["lui", "eux", "vous"], answer: 1, explain: "ʿalayhim : sur EUX.", card: "concept:pronom-hum" },
          { q: "Que signifie la fin ـكَ de ce mot ?", ref: "108:1:2", options: ["toi", "moi", "nous"], answer: 0, explain: "aʿṭaynâ-ka : nous T'avons donné.", card: "concept:pronom-ka" },
          { q: "Que signifie la fin ـكُمْ de ce mot ?", ref: "109:6:2", options: ["votre", "leur", "notre"], answer: 0, explain: "dînoukoum : VOTRE religion.", card: "concept:pronom-kum" },
          { q: "Que signifie la fin ـهُۥ de ce mot ?", ref: "112:4:3", options: ["à lui", "à moi", "à elle"], answer: 0, explain: "la-hoû : à LUI.", card: "concept:pronom-hu" },
        ],
      },
    ],
  },
  {
    id: "prefixes",
    track: "arabe",
    title: "Les petits mots collés au début",
    subtitle: "و ف ب ل ك",
    minutes: 8,
    status: "draft",
    sources: ["qac"],
    blocks: [
      {
        kind: "text",
        title: "Une lettre, un mot",
        body: "Plusieurs mots très fréquents ne font qu'une lettre et s'attachent au mot suivant : وَ (et), فَ (alors, puis), بِ (par, avec), لِ (pour, à), كَ (comme). Les repérer permet de retrouver le mot principal.",
      },
      { kind: "quran", ref: "113:1", focus: [3, 3], label: "بِرَبِّ", note: "bi (auprès de, par) + rabbi (le Seigneur)." },
      { kind: "quran", ref: "1:2", focus: [2, 2], label: "لِلَّهِ", note: "li (à, pour) + Allah." },
      { kind: "quran", ref: "108:2", focus: [1, 1], label: "فَصَلِّ", note: "fa (alors) + ṣalli (prie)." },
      { kind: "quran", ref: "105:5", focus: [2, 2], label: "كَعَصْفٍ", note: "ka (comme) + ʿaṣf (de la paille)." },
    ],
    practice: [
      {
        gen: "choice",
        items: [
          { q: "Que signifie la première lettre de ce mot ?", ref: "113:1:3", options: ["par, auprès de", "et", "comme"], answer: 0, explain: "bi.", card: "concept:prefixe-bi" },
          { q: "Que signifie la première lettre de ce mot ?", ref: "1:5:3", options: ["et", "pour", "alors"], answer: 0, explain: "wa iyyâka : ET c'est Toi…", card: "concept:prefixe-wa" },
          { q: "Que signifie la première lettre de ce mot ?", ref: "105:5:2", options: ["comme", "pour", "par"], answer: 0, explain: "ka : comme.", card: "concept:prefixe-ka" },
          { q: "Que signifie la première lettre de ce mot ?", ref: "108:2:1", options: ["alors", "comme", "dans"], answer: 0, explain: "fa : alors.", card: "concept:prefixe-fa" },
          { q: "Que signifie la première lettre de ce mot ?", ref: "1:2:2", options: ["à, pour", "et", "comme"], answer: 0, explain: "li : à, pour.", card: "concept:prefixe-li" },
        ],
      },
    ],
  },
  {
    id: "verbe-passe",
    track: "arabe",
    title: "Le verbe au passé",
    subtitle: "فَعَلَ : il a fait",
    minutes: 8,
    status: "draft",
    sources: ["qac"],
    blocks: [
      {
        kind: "text",
        title: "Trois lettres et des terminaisons",
        body: "La forme de base du verbe au passé est « il a fait » : فَعَلَ (faʿala), خَلَقَ (khalaqa, il a créé). La personne s'ajoute à la fin : ـتَ (tu), ـنَا (nous), ـتُمْ (vous), ـوا۟ (ils).",
      },
      { kind: "quran", ref: "113:2", focus: [4, 4], label: "خَلَقَ", note: "khalaqa : il a créé." },
      { kind: "quran", ref: "1:7", focus: [3, 3], label: "أَنْعَمْتَ", note: "anʿam-ta : TU as comblé de bienfaits." },
      { kind: "quran", ref: "108:1", focus: [2, 2], label: "أَعْطَيْنَـٰكَ", note: "aʿṭay-nâ-ka : NOUS t'avons donné." },
      { kind: "quran", ref: "103:3", focus: [3, 3], label: "ءَامَنُوا۟", note: "âman-oû : ILS ont cru." },
    ],
    practice: [
      {
        gen: "choice",
        items: [
          { q: "Qui fait l'action ?", ref: "1:7:3", options: ["tu", "il", "nous"], answer: 0, explain: "La terminaison ـتَ : tu.", card: "concept:passe-ta" },
          { q: "Qui fait l'action ?", ref: "108:1:2", options: ["nous", "ils", "tu"], answer: 0, explain: "La terminaison ـنَا : nous.", card: "concept:passe-na" },
          { q: "Qui fait l'action ?", ref: "103:3:3", options: ["ils", "il", "vous"], answer: 0, explain: "La terminaison ـُوا۟ : ils.", card: "concept:passe-u" },
          { q: "Qui fait l'action ?", ref: "113:2:4", options: ["il", "tu", "nous"], answer: 0, explain: "Sans terminaison : il.", card: "concept:passe-a" },
        ],
      },
    ],
  },
  {
    id: "verbe-present",
    track: "arabe",
    title: "Le verbe au présent",
    subtitle: "نَعْبُدُ : nous adorons",
    minutes: 8,
    status: "draft",
    sources: ["qac"],
    blocks: [
      {
        kind: "text",
        title: "La personne se met devant",
        body: "Au présent (l'inaccompli), la personne est marquée par une lettre AU DÉBUT du verbe : أَ (je), نَ (nous), تَ (tu), يَ (il). Pour « vous » et « ils », on ajoute aussi une fin ـُونَ.",
      },
      {
        kind: "table",
        head: ["Préfixe", "Personne", "Exemple"],
        rows: [
          ["أَ", "je", "أَعْبُدُ : j'adore"],
          ["نَ", "nous", "نَعْبُدُ : nous adorons"],
          ["تَ … ـُونَ", "vous", "تَعْبُدُونَ : vous adorez"],
          ["يَ", "il", "يَلِدْ : il engendre"],
        ],
      },
      { kind: "quran", ref: "1:5", label: "نَعْبُدُ · نَسْتَعِينُ", note: "C'est Toi que NOUS adorons, et c'est Toi dont NOUS implorons le secours." },
      { kind: "quran", ref: "109:2", label: "لَآ أَعْبُدُ مَا تَعْبُدُونَ", note: "JE n'adore pas ce que VOUS adorez." },
    ],
    practice: [
      {
        gen: "choice",
        items: [
          { q: "Qui fait l'action ?", ref: "1:5:2", options: ["nous", "je", "il"], answer: 0, explain: "نَ au début : nous.", card: "concept:present-na" },
          { q: "Qui fait l'action ?", ref: "109:2:2", options: ["je", "tu", "ils"], answer: 0, explain: "أَ au début : je.", card: "concept:present-a" },
          { q: "Qui fait l'action ?", ref: "109:2:4", options: ["vous", "nous", "il"], answer: 0, explain: "تَ… ـُونَ : vous.", card: "concept:present-tuna" },
          { q: "Qui fait l'action ?", ref: "114:5:2", options: ["il", "nous", "je"], answer: 0, explain: "يُ au début : il (souffle de mauvaises suggestions).", card: "concept:present-ya" },
        ],
      },
    ],
  },
  {
    id: "negation",
    track: "arabe",
    title: "Dire non",
    subtitle: "لَا · مَا · لَمْ · لَنْ",
    minutes: 6,
    status: "draft",
    sources: ["qac"],
    blocks: [
      {
        kind: "table",
        head: ["Mot", "Usage", "Exemple"],
        rows: [
          ["لَا", "ne… pas (présent), ne… pas ! (interdiction)", "لَآ أَعْبُدُ : je n'adore pas"],
          ["مَا", "ne… pas (souvent passé)", "مَا وَدَّعَكَ : Il ne t'a pas abandonné"],
          ["لَمْ", "ne… pas (passé), + présent", "لَمْ يَلِدْ : Il n'a pas engendré"],
          ["لَنْ", "ne… jamais (futur)", "لَّن يَحُورَ : il ne reviendra jamais"],
        ],
      },
      {
        kind: "tip",
        tone: "warn",
        body: "مَا peut aussi vouloir dire « ce que » : مَا تَعْبُدُونَ = ce que vous adorez. Le contexte tranche.",
      },
      { kind: "quran", ref: "112:3", label: "لَمْ يَلِدْ وَلَمْ يُولَدْ", note: "Il n'a pas engendré et n'a pas été engendré." },
    ],
    practice: [
      {
        gen: "choice",
        items: [
          { q: "Quel est le sens de ce mot ici ?", ref: "112:3:1", options: ["ne… pas (passé)", "ce que", "pour"], answer: 0, explain: "لَمْ + présent = négation du passé.", card: "lemma:لَم|P" },
          { q: "Quel est le sens de مَا ici ?", ref: "93:3:1", options: ["ne… pas", "ce que"], answer: 0, explain: "مَا وَدَّعَكَ : Il ne t'a pas abandonné.", card: "lemma:ما|P" },
          { q: "Quel est le sens de مَا ici ?", ref: "109:2:3", options: ["ne… pas", "ce que"], answer: 1, explain: "مَا تَعْبُدُونَ : ce que vous adorez.", card: "lemma:ما|N" },
          { q: "Quel mot veut dire « ne… jamais » (futur) ?", options: ["لَنْ", "لَمْ", "لَا"], answer: 0, explain: "لَنْ nie le futur.", card: "lemma:لَن|P" },
        ],
      },
    ],
  },
  {
    id: "idafa",
    track: "arabe",
    title: "Le complément du nom",
    subtitle: "رَبِّ ٱلْعَـٰلَمِينَ : le Seigneur des mondes",
    minutes: 6,
    status: "draft",
    sources: ["qac"],
    blocks: [
      {
        kind: "text",
        title: "Deux noms côte à côte",
        body: "Pour dire « le Seigneur des mondes », l'arabe met simplement deux noms côte à côte : رَبِّ ٱلْعَـٰلَمِينَ. Le premier n'a jamais d'article ; le second est au cas indirect (souvent une kasra). C'est l'iḍāfa, l'annexion.",
      },
      { kind: "quran", ref: "1:2", focus: [3, 4], label: "رَبِّ ٱلْعَـٰلَمِينَ", note: "Seigneur + les mondes." },
      { kind: "quran", ref: "1:4", label: "مَـٰلِكِ يَوْمِ ٱلدِّينِ", note: "Maître + jour + la rétribution : deux annexions en chaîne." },
      { kind: "quran", ref: "110:1", focus: [3, 4], label: "نَصْرُ ٱللَّهِ", note: "Le secours + Allah = le secours d'Allah." },
    ],
    practice: [
      {
        gen: "choice",
        items: [
          { q: "Comment traduire ces deux mots ?", ref: "114:1:3-4", options: ["par le Seigneur des hommes", "le Seigneur et les hommes", "les hommes du Seigneur"], answer: 0, explain: "bi + rabbi + an-nâs.", card: "concept:idafa" },
          { q: "Comment traduire ces deux mots ?", ref: "110:2:5-6", options: ["la religion d'Allah", "Allah et la religion", "la religion est Allah"], answer: 0, explain: "dîni l-lâhi.", card: "concept:idafa" },
          { q: "Dans une annexion, le premier nom…", options: ["n'a jamais l'article", "a toujours l'article"], answer: 0, explain: "رَبِّ, pas ٱلرَّبِّ.", card: "concept:idafa" },
        ],
      },
    ],
  },
  {
    id: "racines",
    track: "arabe",
    title: "Racines et schèmes",
    subtitle: "ع ب د : une famille de mots",
    minutes: 10,
    status: "draft",
    sources: ["qac"],
    blocks: [
      {
        kind: "text",
        title: "Trois lettres, une idée",
        body: "La plupart des mots arabes viennent d'une racine de trois consonnes porteuse d'une idée : ع ب د = adorer, servir. Des moules (schèmes) fabriquent ensuite les mots : un verbe, celui qui fait l'action, ce qui la subit… Reconnaître la racine, c'est deviner le sens d'un mot jamais vu.",
      },
      {
        kind: "table",
        head: ["Schème", "Sens", "Exemples du parcours"],
        rows: [
          ["فَاعِل", "celui qui fait", "عَابِد (adorateur), حَاسِد (envieux), غَاسِق (la nuit qui s'étend)"],
          ["مَفْعُول", "celui qui subit", "مَغْضُوب (objet de colère), مَأْكُول (mangé)"],
          ["فَعِيل", "qualité durable", "رَحِيم (très miséricordieux), عَلِيم (omniscient)"],
        ],
      },
      { kind: "quran", ref: "109:4", focus: [3, 3], label: "عَابِدٌ", note: "Schème فَاعِل sur ع ب د : un adorateur." },
      { kind: "quran", ref: "1:7", focus: [6, 6], label: "ٱلْمَغْضُوبِ", note: "Schème مَفْعُول sur غ ض ب : ceux qui ont encouru la colère." },
    ],
    practice: [
      {
        gen: "choice",
        items: [
          { q: "Quelle est la racine de ce mot ?", ref: "1:5:2", options: ["ع ب د", "ن ع ب", "ب د ن"], answer: 0, explain: "نَ est le préfixe « nous ».", card: "concept:racine" },
          { q: "Quelle est la racine de ce mot ?", ref: "109:4:3", options: ["ع ب د", "ع ا ب", "ب د ع"], answer: 0, explain: "Le alif appartient au schème فَاعِل.", card: "concept:racine" },
          { q: "Quel est le sens de ce schème ?", ref: "113:5:3", options: ["celui qui fait (envieux)", "celui qui subit", "le lieu"], answer: 0, explain: "فَاعِل : celui qui envie.", card: "concept:scheme-faail" },
          { q: "Quel est le sens de ce schème ?", ref: "105:5:3", options: ["celui qui mange", "ce qui est mangé", "la nourriture"], answer: 1, explain: "مَفْعُول : ce qui subit l'action.", card: "concept:scheme-mafuul" },
          { q: "Quelle est la racine de ce mot ?", ref: "1:1:4", options: ["ر ح م", "ح ي م", "ر ح ي"], answer: 0, explain: "رَحِيم : schème فَعِيل sur ر ح م.", card: "concept:racine" },
        ],
      },
    ],
  },
];

/** Bilans : révision mélangée des leçons précédentes, sans contenu nouveau. */
export const bilanLessons: Lesson[] = [
  { id: "bilan-1", track: "bilan", title: "Bilan de la semaine 1", subtitle: "Les 28 lettres et les voyelles brèves", minutes: 15, status: "draft", sources: ["roediger-2006", "kornell-2008"], blocks: [], practice: [], reviewOf: ["lettres-1", "lettres-2", "lettres-3", "lettres-4", "lettres-liees", "voyelles-breves", "article", "pronoms"] },
  { id: "bilan-2", track: "bilan", title: "Bilan de la semaine 2", subtitle: "Les signes : sukūn, madd, shadda, tanwīn, hamza, ال", minutes: 15, status: "draft", sources: ["roediger-2006", "kornell-2008"], blocks: [], practice: [], reviewOf: ["sukun", "voyelles-longues", "shadda", "tanwin", "hamza-wasl", "lam-article", "prefixes", "verbe-passe"] },
  { id: "bilan-3", track: "bilan", title: "Bilan de la semaine 3", subtitle: "Repérer les règles du tajwīd", minutes: 15, status: "draft", sources: ["roediger-2006", "kornell-2008"], blocks: [], practice: [], reviewOf: ["makharij", "nun-1", "nun-2", "mim-ghunna", "qalqala", "ra", "verbe-present", "negation"] },
  { id: "bilan-4", track: "bilan", title: "Bilan de la semaine 4", subtitle: "Madd, waqf et conventions du muṣḥaf", minutes: 15, status: "draft", sources: ["roediger-2006", "kornell-2008"], blocks: [], practice: [], reviewOf: ["madd-1", "madd-2", "waqf", "mushaf-signes", "idafa", "racines"] },
  { id: "bilan-final", track: "bilan", title: "Évaluation finale", subtitle: "Tout le parcours", minutes: 20, status: "draft", sources: ["roediger-2006", "kornell-2008"], blocks: [], practice: [], reviewOf: ["lettres-liees", "voyelles-breves", "sukun", "voyelles-longues", "shadda", "tanwin", "hamza-wasl", "lam-article", "nun-1", "nun-2", "mim-ghunna", "qalqala", "ra", "madd-1", "madd-2", "waqf", "mushaf-signes", "pronoms", "prefixes", "verbe-passe", "verbe-present", "negation", "idafa", "racines"] },
];
