export type LearningTrackId =
  | "alphabet"
  | "decoding"
  | "reading"
  | "tajweed";

export type LessonVisual = "alphabet" | "joining" | "tajweed-map";

export interface LearningExample {
  arabic: string;
  phonetic: string;
  translation?: string;
}

export interface LearningQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  success: string;
  retry: string;
}

export interface BeginnerLessonData {
  id: string;
  order: number;
  track: LearningTrackId;
  title: string;
  summary: string;
  explanation: string[];
  objectives: string[];
  examples: LearningExample[];
  quiz: LearningQuiz;
  duration: number;
  sourceIds: string[];
  audioReference?: string;
  visual?: LessonVisual;
}

export const learningTracks: Array<{
  id: LearningTrackId;
  label: string;
  title: string;
  description: string;
}> = [
  {
    id: "alphabet",
    label: "01",
    title: "Alphabet et sons",
    description:
      "Reconnaître les 28 lettres, leurs points, leurs formes liées et les voyelles.",
  },
  {
    id: "decoding",
    label: "02",
    title: "Former et lire",
    description:
      "Assembler les lettres, lire des syllabes, des mots puis de courtes phrases.",
  },
  {
    id: "reading",
    label: "03",
    title: "Lire le muṣḥaf",
    description:
      "Comprendre les signes du texte coranique et lire des passages vocalisés.",
  },
  {
    id: "tajweed",
    label: "04",
    title: "Fondations du tajwīd",
    description:
      "Découvrir les points d’articulation, les prolongations et les règles fréquentes.",
  },
];

export const alphabetLetters = [
  ["ا", "alif", "ā / support de hamza"],
  ["ب", "bāʾ", "b"],
  ["ت", "tāʾ", "t"],
  ["ث", "thāʾ", "th"],
  ["ج", "jīm", "j"],
  ["ح", "ḥāʾ", "ḥ"],
  ["خ", "khāʾ", "kh"],
  ["د", "dāl", "d"],
  ["ذ", "dhāl", "dh"],
  ["ر", "rāʾ", "r"],
  ["ز", "zāy", "z"],
  ["س", "sīn", "s"],
  ["ش", "shīn", "sh"],
  ["ص", "ṣād", "ṣ"],
  ["ض", "ḍād", "ḍ"],
  ["ط", "ṭāʾ", "ṭ"],
  ["ظ", "ẓāʾ", "ẓ"],
  ["ع", "ʿayn", "ʿ"],
  ["غ", "ghayn", "gh"],
  ["ف", "fāʾ", "f"],
  ["ق", "qāf", "q"],
  ["ك", "kāf", "k"],
  ["ل", "lām", "l"],
  ["م", "mīm", "m"],
  ["ن", "nūn", "n"],
  ["ه", "hāʾ", "h"],
  ["و", "wāw", "w / ū"],
  ["ي", "yāʾ", "y / ī"],
] as const;

const unicodeSources = ["unicode-arabic-17"];
const languageSources = ["unicode-arabic-17", "qac-0.4-mirror"];
const quranSources = [
  "quran-foundation-v4",
  "qac-0.4-mirror",
  "quran-complex-hafs",
];
const tajweedSources = [
  "quran-complex-tajweed-muyassar",
  "quran-complex-hafs",
  "quran-foundation-v4",
];

export const beginnerLessons: BeginnerLessonData[] = [
  {
    id: "alphabet-overview",
    order: 1,
    track: "alphabet",
    title: "Les 28 lettres et le sens de lecture",
    summary:
      "Commence à droite, repère la silhouette de chaque lettre et associe-la à un son.",
    explanation: [
      "L’arabe s’écrit et se lit de droite à gauche. Les lettres sont conservées dans un ordre logique, même si leur affichage visuel est inversé par rapport au français.",
      "Une lettre peut changer légèrement de silhouette lorsqu’elle est liée, mais elle garde son identité. Commence par reconnaître la forme isolée et le nombre de points.",
    ],
    objectives: [
      "Connaître le sens de lecture",
      "Voir les 28 lettres en une seule carte",
      "Distinguer nom de la lettre et son",
    ],
    examples: [
      { arabic: "بِسْمِ", phonetic: "bismi", translation: "au nom de" },
      { arabic: "رَبِّ", phonetic: "rabbi", translation: "Seigneur" },
    ],
    quiz: {
      question: "Où se trouve le premier mot d’une ligne arabe ?",
      options: ["À droite", "À gauche", "Au centre"],
      correctIndex: 0,
      success: "Exact : ton regard commence à droite.",
      retry: "Observe de nouveau la flèche de lecture : elle part de la droite.",
    },
    duration: 10,
    sourceIds: unicodeSources,
    audioReference: "1:1:1",
    visual: "alphabet",
  },
  {
    id: "letter-family-b",
    order: 2,
    track: "alphabet",
    title: "Une même silhouette, des points différents",
    summary:
      "ب ت ث ن ي partagent des formes proches : les points permettent de les reconnaître.",
    explanation: [
      "La position et le nombre de points font partie de la lettre. ب porte un point dessous, ت deux au-dessus et ث trois au-dessus.",
      "ن et ي rejoignent cette famille visuelle dans certaines positions. Compare toujours la ligne principale avant de compter les points.",
    ],
    objectives: [
      "Distinguer ب ت ث",
      "Utiliser les points comme repère",
      "Reconnaître ces lettres dans un mot",
    ],
    examples: [
      { arabic: "بَ تَ ثَ", phonetic: "ba · ta · tha" },
      { arabic: "بَيْت", phonetic: "bayt", translation: "maison" },
    ],
    quiz: {
      question: "Quelle lettre possède un seul point sous la ligne ?",
      options: ["ت", "ب", "ث"],
      correctIndex: 1,
      success: "Oui : ب est le bāʾ.",
      retry: "Compte les points et regarde s’ils sont au-dessus ou au-dessous.",
    },
    duration: 8,
    sourceIds: unicodeSources,
    audioReference: "1:1:1",
  },
  {
    id: "letter-families",
    order: 3,
    track: "alphabet",
    title: "Les grandes familles de formes",
    summary:
      "ج ح خ, د ذ, ر ز, س ش et ص ض se mémorisent plus vite par paires ou familles.",
    explanation: [
      "Apprendre les lettres par ressemblances réduit la quantité de formes nouvelles. Dans ج ح خ, seule la présence et la position du point changent.",
      "Fais la même comparaison pour د ذ, ر ز, س ش, ص ض, ط ظ et ع غ. Prononce chaque paire lentement sans forcer la gorge.",
    ],
    objectives: [
      "Regrouper les lettres par silhouette",
      "Repérer la lettre sans point",
      "Ne pas confondre forme et prononciation",
    ],
    examples: [
      { arabic: "جَ حَ خَ", phonetic: "ja · ḥa · kha" },
      { arabic: "سَ شَ", phonetic: "sa · sha" },
      { arabic: "عَ غَ", phonetic: "ʿa · gha" },
    ],
    quiz: {
      question: "Dans la famille ج ح خ, quelle lettre n’a aucun point ?",
      options: ["ج", "ح", "خ"],
      correctIndex: 1,
      success: "Exact : ح n’a pas de point.",
      retry: "ج a un point dessous et خ un point dessus.",
    },
    duration: 10,
    sourceIds: unicodeSources,
  },
  {
    id: "non-joining-letters",
    order: 4,
    track: "alphabet",
    title: "Les six lettres qui coupent la liaison",
    summary:
      "ا د ذ ر ز و se lient à la lettre précédente, mais pas à celle qui les suit.",
    explanation: [
      "La plupart des lettres arabes se lient des deux côtés. Six lettres — ا د ذ ر ز و — interrompent la liaison avec la lettre suivante.",
      "Cette coupure ne marque pas un espace et ne termine pas forcément le mot. Elle change seulement la forme graphique du caractère suivant.",
    ],
    objectives: [
      "Mémoriser ا د ذ ر ز و",
      "Ne pas confondre coupure et espace",
      "Anticiper la forme suivante",
    ],
    examples: [
      { arabic: "وَرَدَ", phonetic: "warada" },
      { arabic: "ذِكْر", phonetic: "dhikr", translation: "rappel" },
    ],
    quiz: {
      question: "Laquelle de ces lettres coupe la liaison suivante ?",
      options: ["ب", "ر", "س"],
      correctIndex: 1,
      success: "Oui : ر fait partie des six lettres non-liantes à gauche.",
      retry: "Reprends la série : ا د ذ ر ز و.",
    },
    duration: 8,
    sourceIds: unicodeSources,
  },
  {
    id: "short-vowels",
    order: 5,
    track: "alphabet",
    title: "Fatḥa, kasra et ḍamma",
    summary:
      "َ donne a, ِ donne i et ُ donne u : ces signes courts rendent le texte vocalisé lisible.",
    explanation: [
      "La fatḥa est un petit trait au-dessus de la lettre, la kasra se place dessous et la ḍamma ressemble à un petit wāw au-dessus.",
      "Ces voyelles sont brèves : بَ se lit ba, بِ se lit bi et بُ se lit bu. Garde un rythme court et régulier.",
    ],
    objectives: [
      "Reconnaître les trois voyelles courtes",
      "Lire une syllabe consonne-voyelle",
      "Éviter d’allonger une voyelle courte",
    ],
    examples: [
      { arabic: "بَ بِ بُ", phonetic: "ba · bi · bu" },
      { arabic: "كَتَبَ", phonetic: "kataba", translation: "il écrivit" },
    ],
    quiz: {
      question: "Comment lis-tu بِ ?",
      options: ["ba", "bi", "bu"],
      correctIndex: 1,
      success: "Exact : la kasra sous la lettre donne i.",
      retry: "Le petit trait sous la lettre est la kasra : i.",
    },
    duration: 10,
    sourceIds: languageSources,
  },
  {
    id: "sukun-shadda",
    order: 6,
    track: "alphabet",
    title: "Sukūn et shadda",
    summary:
      "Le sukūn arrête la voyelle ; la shadda double la consonne.",
    explanation: [
      "Le sukūn ْ indique qu’aucune voyelle courte ne suit la consonne. Dans مِنْ, le n se ferme sans ajouter a, i ou u.",
      "La shadda ّ représente deux consonnes successives : la première avec sukūn, la seconde avec sa voyelle. رَبِّ se lit rab-bi.",
    ],
    objectives: [
      "Fermer une syllabe avec sukūn",
      "Doubler clairement une consonne",
      "Découper la shadda en deux temps",
    ],
    examples: [
      { arabic: "مِنْ", phonetic: "min", translation: "de" },
      { arabic: "رَبِّ", phonetic: "rabbi", translation: "Seigneur" },
    ],
    quiz: {
      question: "Que fait la shadda dans رَبِّ ?",
      options: [
        "Elle allonge la voyelle",
        "Elle double la consonne",
        "Elle termine le mot",
      ],
      correctIndex: 1,
      success: "Oui : رَبِّ se découpe rab-bi.",
      retry: "Imagine deux fois la même consonne : la première fermée, la seconde vocalisée.",
    },
    duration: 10,
    sourceIds: languageSources,
    audioReference: "1:2:3",
  },
  {
    id: "tanwin-long-vowels",
    order: 7,
    track: "alphabet",
    title: "Tanwīn et voyelles longues",
    summary:
      "Les doubles voyelles ajoutent un n final ; ا و ي peuvent prolonger a, u et i.",
    explanation: [
      "ً ٍ ٌ sont les trois tanwīn : an, in et un. Ils apparaissent principalement à la fin des noms indéfinis.",
      "Une fatḥa suivie d’alif donne ā, une ḍamma suivie de wāw donne ū et une kasra suivie de yāʾ donne ī. La voyelle longue dure environ deux temps dans la lecture de base.",
    ],
    objectives: [
      "Lire an, in et un",
      "Distinguer voyelle courte et longue",
      "Reconnaître ā, ū et ī",
    ],
    examples: [
      { arabic: "كِتَابٌ", phonetic: "kitābun", translation: "un livre" },
      { arabic: "فِي", phonetic: "fī", translation: "dans" },
      { arabic: "نُور", phonetic: "nūr", translation: "lumière" },
    ],
    quiz: {
      question: "Quelle écriture contient une voyelle longue ī ?",
      options: ["فَ", "فِي", "فُ"],
      correctIndex: 1,
      success: "Exact : kasra + yāʾ produit ī.",
      retry: "Cherche la kasra suivie de ي.",
    },
    duration: 12,
    sourceIds: languageSources,
  },
  {
    id: "joining-forms",
    order: 8,
    track: "decoding",
    title: "Lire une lettre liée sans la perdre",
    summary:
      "Initiale, médiane, finale ou isolée : une lettre garde son squelette et ses points.",
    explanation: [
      "Une lettre à liaison double peut prendre quatre formes selon sa place. Unicode décrit ces formes contextuelles comme isolée, initiale, médiane et finale.",
      "Pour reconnaître une lettre liée, cherche son squelette, ses points et la direction de ses attaches. Ne mémorise pas chaque forme comme une nouvelle lettre.",
    ],
    objectives: [
      "Identifier les quatre positions",
      "Suivre les attaches dans un mot",
      "Retrouver la forme isolée",
    ],
    examples: [
      { arabic: "ب  بـ  ـبـ  ـب", phonetic: "b · b · b · b" },
      { arabic: "كِتَاب", phonetic: "kitāb", translation: "livre" },
    ],
    quiz: {
      question: "Qu’est-ce qui reste stable quand une lettre se lie ?",
      options: [
        "Son identité et ses points",
        "Sa largeur exacte",
        "Sa position dans le mot",
      ],
      correctIndex: 0,
      success: "Oui : la silhouette s’adapte, mais la lettre reste la même.",
      retry: "Compare le squelette et les points plutôt que la largeur.",
    },
    duration: 10,
    sourceIds: unicodeSources,
    visual: "joining",
  },
  {
    id: "syllable-building",
    order: 9,
    track: "decoding",
    title: "Découper puis fusionner les syllabes",
    summary:
      "Lis chaque bloc consonne-voyelle, puis rapproche les blocs sans perdre les signes.",
    explanation: [
      "Commence par découper : كَ / تَ / بَ. Quand chaque bloc est correct, réduis les pauses jusqu’à lire كَتَبَ d’un mouvement.",
      "Avec un sukūn, rattache la consonne fermée au bloc précédent : يَكْ / تُ / بُ. Cette stratégie fonctionne pour des mots de plus en plus longs.",
    ],
    objectives: [
      "Segmenter un mot vocalisé",
      "Fusionner sans modifier les voyelles",
      "Gérer une syllabe fermée",
    ],
    examples: [
      { arabic: "كَ / تَ / بَ", phonetic: "ka · ta · ba" },
      { arabic: "يَكْتُبُ", phonetic: "yaktubu", translation: "il écrit" },
    ],
    quiz: {
      question: "Quel découpage respecte le sukūn de يَكْتُبُ ?",
      options: ["ya · ka · tu · bu", "yak · tu · bu", "yā · kit · bū"],
      correctIndex: 1,
      success: "Exact : le كْ ferme la première syllabe yak.",
      retry: "Le sukūn rattache la consonne à la voyelle qui précède.",
    },
    duration: 10,
    sourceIds: languageSources,
  },
  {
    id: "definite-article",
    order: 10,
    track: "decoding",
    title: "Le ال et les lettres solaires",
    summary:
      "Avec une lettre solaire, le lām n’est pas prononcé et la consonne suivante porte une shadda.",
    explanation: [
      "Devant une lettre lunaire, ال se prononce al-, comme dans الْقَمَر al-qamar.",
      "Devant une lettre solaire, le lām s’assimile à la consonne suivante : الشَّمْس se lit ash-shams. L’écriture et la shadda permettent de voir la différence.",
    ],
    objectives: [
      "Lire al- devant une lettre lunaire",
      "Repérer la shadda d’une lettre solaire",
      "Ne pas prononcer deux fois le lām",
    ],
    examples: [
      { arabic: "الْقَمَر", phonetic: "al-qamar", translation: "la lune" },
      { arabic: "الشَّمْس", phonetic: "ash-shams", translation: "le soleil" },
      { arabic: "الرَّحْمَٰن", phonetic: "ar-Raḥmān" },
    ],
    quiz: {
      question: "Comment commence la lecture de الشَّمْس ?",
      options: ["al-shams", "ash-shams", "a-sha-mas"],
      correctIndex: 1,
      success: "Oui : la shadda montre l’assimilation du lām.",
      retry: "La lettre ش est solaire : le lām s’efface dans la prononciation.",
    },
    duration: 12,
    sourceIds: languageSources,
    audioReference: "1:1:3",
  },
  {
    id: "hamza-basics",
    order: 11,
    track: "decoding",
    title: "Hamza prononcée et hamzat al-waṣl",
    summary:
      "La hamza coupe le flux vocal ; ٱ aide à commencer un mot mais peut disparaître en liaison.",
    explanation: [
      "ء représente une attaque vocale distincte. Elle peut être portée par ا, و ou ي selon l’écriture.",
      "Le signe ٱ marque hamzat al-waṣl : elle se prononce lorsque tu commences par le mot, mais tombe souvent lorsque la lecture se poursuit depuis le mot précédent.",
    ],
    objectives: [
      "Repérer ء et ses supports",
      "Reconnaître ٱ dans le muṣḥaf",
      "Comparer début et liaison",
    ],
    examples: [
      { arabic: "إِيَّاكَ", phonetic: "iyyāka", translation: "Toi seul" },
      { arabic: "ٱلْحَمْدُ", phonetic: "al-ḥamdu", translation: "la louange" },
    ],
    quiz: {
      question: "Quel signe indique une hamzat al-waṣl dans le muṣḥaf ?",
      options: ["أ", "ٱ", "آ"],
      correctIndex: 1,
      success: "Exact : ٱ porte le petit signe de liaison.",
      retry: "Cherche l’alif surmonté du petit ṣād.",
    },
    duration: 12,
    sourceIds: quranSources,
    audioReference: "1:2:1",
  },
  {
    id: "frequent-quran-words",
    order: 12,
    track: "decoding",
    title: "Lire dix mots très fréquents",
    summary:
      "Applique les voyelles et les liaisons à des mots que tu rencontreras souvent.",
    explanation: [
      "Lis d’abord sans regarder la phonétique, puis vérifie. L’objectif est de reconnaître le mot écrit, pas de mémoriser uniquement sa traduction.",
      "Répète chaque mot dans son occurrence audio. Le même lemme peut recevoir une terminaison différente selon sa place.",
    ],
    objectives: [
      "Lire sans deviner par la traduction",
      "Reconnaître des formes récurrentes",
      "Accepter les variations de terminaison",
    ],
    examples: [
      { arabic: "اللَّه", phonetic: "Allāh" },
      { arabic: "رَبّ", phonetic: "rabb", translation: "Seigneur" },
      { arabic: "يَوْم", phonetic: "yawm", translation: "jour" },
      { arabic: "فِي", phonetic: "fī", translation: "dans" },
      { arabic: "مِنْ", phonetic: "min", translation: "de" },
    ],
    quiz: {
      question: "Quel mot se lit yawm ?",
      options: ["يَوْم", "رَبّ", "فِي"],
      correctIndex: 0,
      success: "Oui : يَ + وْ forme le son yawm.",
      retry: "Repère la lettre ي suivie de la diphtongue aw.",
    },
    duration: 14,
    sourceIds: quranSources,
    audioReference: "1:4:2",
  },
  {
    id: "phrase-building",
    order: 13,
    track: "decoding",
    title: "Passer du mot à la courte phrase",
    summary:
      "Garde chaque mot distinct, puis relie la lecture sans effacer les voyelles finales.",
    explanation: [
      "Une phrase arabe se lit mot après mot de droite à gauche. Commence par marquer une petite séparation visuelle entre les mots.",
      "Ensuite, écoute la phrase complète et rapproche les mots. La lecture liée peut modifier certaines attaques, mais l’ordre écrit ne change pas.",
    ],
    objectives: [
      "Repérer les limites de mots",
      "Lire une phrase de trois à cinq mots",
      "Conserver le rythme de droite à gauche",
    ],
    examples: [
      {
        arabic: "الْحَمْدُ لِلَّهِ",
        phonetic: "al-ḥamdu lillāh",
        translation: "La louange appartient à Allah",
      },
      {
        arabic: "رَبِّ الْعَالَمِينَ",
        phonetic: "rabbi l-ʿālamīn",
        translation: "Seigneur des mondes",
      },
    ],
    quiz: {
      question: "Quel mot lis-tu en premier dans الْحَمْدُ لِلَّهِ ?",
      options: ["لِلَّهِ", "الْحَمْدُ", "Les deux ensemble"],
      correctIndex: 1,
      success: "Exact : le premier mot est placé à droite.",
      retry: "Repars du bord droit de la phrase.",
    },
    duration: 12,
    sourceIds: quranSources,
    audioReference: "1:2",
  },
  {
    id: "mushaf-signs",
    order: 14,
    track: "reading",
    title: "Les petits signes propres au muṣḥaf",
    summary:
      "Alif miniature, marques de prolongation et signes de récitation complètent les lettres ordinaires.",
    explanation: [
      "Le texte ʿuthmānī du muṣḥaf contient des signes supplémentaires destinés à préserver la lecture transmise. Une petite alif verticale peut indiquer un ā qui n’apparaît pas comme un alif ordinaire.",
      "Ne supprime pas ces signes comme de simples décorations. Compare toujours le mot avec son audio avant de généraliser une règle.",
    ],
    objectives: [
      "Voir l’alif miniature",
      "Distinguer lettre et signe auxiliaire",
      "Utiliser l’audio comme vérification",
    ],
    examples: [
      { arabic: "الرَّحْمَٰن", phonetic: "ar-Raḥmān" },
      { arabic: "هَٰذَا", phonetic: "hādhā", translation: "ceci" },
    ],
    quiz: {
      question: "Dans الرَّحْمَٰن, le petit trait vertical indique…",
      options: ["un son ā", "un arrêt obligatoire", "une consonne doublée"],
      correctIndex: 0,
      success: "Oui : il signale ici une prolongation ā.",
      retry: "Compare la phonétique Raḥmān avec la petite alif au-dessus.",
    },
    duration: 10,
    sourceIds: quranSources,
    audioReference: "1:1:3",
  },
  {
    id: "pause-symbols",
    order: 15,
    track: "reading",
    title: "Reconnaître les signes de pause",
    summary:
      "Les marques م, لا, ج, قلى et صلى donnent des indications de pause et de continuité.",
    explanation: [
      "Les signes de pause sont distincts du texte des mots. م indique une pause nécessaire selon le système de marquage, لا déconseille l’arrêt à cet endroit et ج permet les deux.",
      "قلى favorise l’arrêt et صلى favorise la continuité. Ces symboles aident la lecture, mais l’apprentissage précis du waqf et de l’ibtidāʾ doit être confirmé avec un enseignant.",
    ],
    objectives: [
      "Reconnaître cinq marques fréquentes",
      "Ne pas les lire comme des lettres",
      "Savoir quand demander une validation",
    ],
    examples: [
      { arabic: "م", phonetic: "pause indiquée" },
      { arabic: "لا", phonetic: "ne pas s’arrêter ici" },
      { arabic: "ج", phonetic: "pause ou liaison possibles" },
    ],
    quiz: {
      question: "Quel signe déconseille l’arrêt à l’endroit marqué ?",
      options: ["ج", "لا", "م"],
      correctIndex: 1,
      success: "Exact : لا indique de ne pas couper ici.",
      retry: "Le signe ressemble au mot arabe lā : « non ».",
    },
    duration: 12,
    sourceIds: tajweedSources,
  },
  {
    id: "breath-and-stop",
    order: 16,
    track: "reading",
    title: "S’arrêter sans déformer le mot",
    summary:
      "À la pause, la terminaison peut changer ; reprends ensuite depuis un endroit cohérent.",
    explanation: [
      "Lors d’un arrêt, la dernière voyelle brève est généralement mise au repos. Les détails varient selon la terminaison et la lecture transmise.",
      "Ne coupe pas uniquement parce que le souffle manque. Prépare une portion courte, repère une pause sûre et reprends depuis un point qui conserve la construction de la phrase.",
    ],
    objectives: [
      "Préparer son souffle",
      "Mettre la finale au repos dans un cas simple",
      "Choisir un point de reprise prudent",
    ],
    examples: [
      { arabic: "الْعَالَمِينَ", phonetic: "al-ʿālamīn" },
      { arabic: "الرَّحِيمِ", phonetic: "ar-Raḥīm" },
    ],
    quiz: {
      question: "Si ton souffle est court, quelle stratégie est la plus sûre ?",
      options: [
        "Accélérer fortement",
        "Préparer une portion plus courte",
        "Couper au milieu de n’importe quel mot",
      ],
      correctIndex: 1,
      success: "Oui : prépare une unité plus courte et une pause cohérente.",
      retry: "La vitesse ne remplace pas un point de pause préparé.",
    },
    duration: 10,
    sourceIds: tajweedSources,
    audioReference: "1:2",
  },
  {
    id: "read-fatiha",
    order: 17,
    track: "reading",
    title: "Lecture guidée d’Al-Fātiḥa 1–2",
    summary:
      "Lis deux versets complets en appliquant voyelles, shadda, liaison et pauses.",
    explanation: [
      "Travaille d’abord mot par mot, puis par groupes : بِسْمِ اللّٰهِ / الرَّحْمٰنِ الرَّحِيمِ. Vérifie chaque groupe avec la récitation.",
      "Dans الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ, observe la lettre lunaire de al-ḥamdu, la shadda de rabbi et la voyelle longue de ʿālamīn.",
    ],
    objectives: [
      "Lire deux versets sans phonétique",
      "Comparer avec la récitation",
      "Identifier trois règles déjà étudiées",
    ],
    examples: [
      {
        arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        phonetic: "bismi llāhi r-Raḥmāni r-Raḥīm",
      },
      {
        arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        phonetic: "al-ḥamdu lillāhi rabbi l-ʿālamīn",
      },
    ],
    quiz: {
      question: "Quel mot contient une shadda clairement visible ?",
      options: ["بِسْمِ", "رَبِّ", "الْعَالَمِينَ"],
      correctIndex: 1,
      success: "Exact : رَبِّ contient bb.",
      retry: "Cherche le signe ّ au-dessus de la consonne.",
    },
    duration: 15,
    sourceIds: quranSources,
    audioReference: "1:1",
  },
  {
    id: "read-quran-phrases",
    order: 18,
    track: "reading",
    title: "Lire des phrases coraniques courtes",
    summary:
      "Transfère tes acquis vers plusieurs structures sans apprendre la phrase par cœur.",
    explanation: [
      "Lis chaque phrase sans phonétique, révèle-la ensuite, puis écoute l’occurrence. Le but est de décoder ce qui est écrit.",
      "Observe les mots déjà connus et les signes nouveaux. Si une lecture ne correspond pas à ta règle supposée, conserve l’exemple et vérifie auprès d’un enseignant.",
    ],
    objectives: [
      "Décoder trois phrases nouvelles",
      "S’appuyer sur les signes",
      "Distinguer lecture et mémorisation",
    ],
    examples: [
      {
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
        phonetic: "qul huwa llāhu aḥad",
        translation: "Dis : Il est Allah, Unique",
      },
      {
        arabic: "مَالِكِ يَوْمِ الدِّينِ",
        phonetic: "māliki yawmi d-dīn",
        translation: "Maître du Jour de la rétribution",
      },
      {
        arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
        phonetic: "ihdinā ṣ-ṣirāṭa l-mustaqīm",
        translation: "Guide-nous vers le droit chemin",
      },
    ],
    quiz: {
      question: "Dans قُلْ, quel signe ferme la lettre ل ?",
      options: ["Fatḥa", "Sukūn", "Tanwīn"],
      correctIndex: 1,
      success: "Oui : le sukūn ferme la syllabe qul.",
      retry: "Observe le petit cercle au-dessus du lām.",
    },
    duration: 15,
    sourceIds: quranSources,
    audioReference: "1:6",
  },
  {
    id: "tajweed-introduction",
    order: 19,
    track: "tajweed",
    title: "Ce que le tajwīd cherche à préserver",
    summary:
      "Le tajwīd organise la prononciation transmise : lettres, qualités, durées et enchaînements.",
    explanation: [
      "Ce parcours suit les fondations courantes de la récitation de Ḥafṣ ʿan ʿĀṣim. Il sert à observer et pratiquer, pas à délivrer une certification.",
      "Une application ne peut pas confirmer seule la justesse d’un point d’articulation. Pour corriger ta récitation, fais-toi écouter par une personne qualifiée.",
    ],
    objectives: [
      "Identifier la récitation de référence",
      "Distinguer aide numérique et validation orale",
      "Préparer une pratique lente",
    ],
    examples: [
      { arabic: "تَجْوِيد", phonetic: "tajwīd" },
      { arabic: "حَفْص عَنْ عَاصِم", phonetic: "Ḥafṣ ʿan ʿĀṣim" },
    ],
    quiz: {
      question: "Qu’est-ce qui peut valider précisément ton articulation ?",
      options: [
        "La couleur d’un écran seule",
        "Une personne qualifiée qui t’écoute",
        "La phonétique française seule",
      ],
      correctIndex: 1,
      success: "Exact : l’écoute et la correction humaines restent essentielles.",
      retry: "Les aides visuelles orientent, mais ne certifient pas la récitation.",
    },
    duration: 8,
    sourceIds: tajweedSources,
    visual: "tajweed-map",
  },
  {
    id: "makharij",
    order: 20,
    track: "tajweed",
    title: "Les grandes zones d’articulation",
    summary:
      "Gorge, langue, lèvres, cavité et nez participent à la production des lettres et de la ghunna.",
    explanation: [
      "Commence par localiser de grandes zones plutôt que forcer un son : cavité pour certaines prolongations, gorge pour ء ه ع ح غ خ, langue pour de nombreuses consonnes et lèvres pour ف ب م و.",
      "La cavité nasale intervient dans la ghunna. L’emplacement exact et les qualités de chaque lettre se travaillent par démonstration et correction.",
    ],
    objectives: [
      "Nommer les grandes zones",
      "Associer quelques lettres aux lèvres et à la gorge",
      "Éviter de forcer la gorge",
    ],
    examples: [
      { arabic: "ه ع ح غ خ", phonetic: "h · ʿ · ḥ · gh · kh" },
      { arabic: "ف ب م و", phonetic: "f · b · m · w" },
    ],
    quiz: {
      question: "Quelle série mobilise clairement les lèvres ?",
      options: ["ف ب م و", "ع ح غ خ", "ق ك ج"],
      correctIndex: 0,
      success: "Oui : observe les lèvres sur f, b, m et w.",
      retry: "Prononce lentement b et m devant un miroir.",
    },
    duration: 14,
    sourceIds: tajweedSources,
  },
  {
    id: "heavy-light-letters",
    order: 21,
    track: "tajweed",
    title: "Lettres emphatiques et lettres légères",
    summary:
      "خ ص ض غ ط ق ظ ont une qualité d’emphase ; la plupart des autres lettres restent légères.",
    explanation: [
      "Les lettres خ ص ض غ ط ق ظ sont regroupées comme lettres d’istiʿlāʾ. Leur résonance est plus pleine, sans transformer la voyelle en une autre voyelle.",
      "ر et le lām du nom d’Allah ont des règles de finesse ou d’emphase dépendant du contexte. Traite-les séparément après avoir stabilisé les sept lettres principales.",
    ],
    objectives: [
      "Mémoriser خ ص ض غ ط ق ظ",
      "Comparer ص et س",
      "Ne pas exagérer l’emphase",
    ],
    examples: [
      { arabic: "صِرَاط", phonetic: "ṣirāṭ", translation: "chemin" },
      { arabic: "سَلَام", phonetic: "salām", translation: "paix" },
    ],
    quiz: {
      question: "Quelle lettre est emphatique ?",
      options: ["س", "ت", "ص"],
      correctIndex: 2,
      success: "Exact : ص fait partie des lettres d’istiʿlāʾ.",
      retry: "Reprends la série خ ص ض غ ط ق ظ.",
    },
    duration: 12,
    sourceIds: tajweedSources,
    audioReference: "1:6",
  },
  {
    id: "madd-foundations",
    order: 22,
    track: "tajweed",
    title: "Le madd naturel : deux temps",
    summary:
      "Une voyelle longue simple se tient deux temps réguliers sans rupture ni oscillation.",
    explanation: [
      "Le madd naturel apparaît avec fatḥa + alif, kasra + yāʾ sākin ou ḍamma + wāw sākin, sans cause supplémentaire de prolongation.",
      "Compte deux unités égales avec les doigts ou un léger mouvement. La durée exacte doit rester liée au rythme de la récitation écoutée.",
    ],
    objectives: [
      "Reconnaître les trois lettres de madd",
      "Tenir deux temps réguliers",
      "Ne pas confondre longueur et volume",
    ],
    examples: [
      { arabic: "قَالَ", phonetic: "qāla" },
      { arabic: "فِي", phonetic: "fī" },
      { arabic: "يَقُولُ", phonetic: "yaqūlu" },
    ],
    quiz: {
      question: "Combien de temps tient le madd naturel de base ?",
      options: ["Un temps", "Deux temps", "Toujours six temps"],
      correctIndex: 1,
      success: "Oui : deux temps réguliers.",
      retry: "Le madd naturel sert de référence : deux temps.",
    },
    duration: 12,
    sourceIds: tajweedSources,
  },
  {
    id: "qalqalah",
    order: 23,
    track: "tajweed",
    title: "La qalqalah sur ق ط ب ج د",
    summary:
      "Lorsque ق ط ب ج د portent un sukūn, une légère résonance rend la consonne audible.",
    explanation: [
      "La qalqalah concerne ق ط ب ج د lorsqu’elles sont non vocalisées. Elle ne consiste pas à ajouter une voyelle complète.",
      "Écoute la consonne se libérer brièvement, surtout à l’arrêt. Évite de transformer أَحَدْ en aḥada ou aḥadu.",
    ],
    objectives: [
      "Mémoriser ق ط ب ج د",
      "Produire une résonance sans voyelle",
      "Écouter la qalqalah à l’arrêt",
    ],
    examples: [
      { arabic: "أَحَدْ", phonetic: "aḥad" },
      { arabic: "يَجْعَل", phonetic: "yajʿal" },
    ],
    quiz: {
      question: "Quelle série contient les lettres de qalqalah ?",
      options: ["ق ط ب ج د", "خ ص ض غ ظ", "ي ر م ل و ن"],
      correctIndex: 0,
      success: "Exact : ق ط ب ج د.",
      retry: "Répète lentement qaṭb jad pour retenir les cinq lettres.",
    },
    duration: 12,
    sourceIds: tajweedSources,
  },
  {
    id: "nun-sakinah-tanwin",
    order: 24,
    track: "tajweed",
    title: "Nūn sākinah et tanwīn : quatre familles",
    summary:
      "Selon la lettre suivante : iẓhār, idghām, iqlāb ou ikhfāʾ.",
    explanation: [
      "Le nūn sākinah نْ et le tanwīn changent d’enchaînement selon la lettre suivante. L’iẓhār clarifie le n, l’idghām l’intègre, l’iqlāb le transforme devant ب et l’ikhfāʾ le dissimule partiellement.",
      "Apprends d’abord à identifier les quatre familles visuellement. La réalisation exacte de la ghunna et de l’assimilation demande une écoute corrigée.",
    ],
    objectives: [
      "Repérer نْ et le tanwīn",
      "Nommer quatre familles de règles",
      "Reconnaître l’iqlāb devant ب",
    ],
    examples: [
      { arabic: "مِنْ هَادٍ", phonetic: "min hādin", translation: "iẓhār" },
      { arabic: "مِنْ رَبِّهِمْ", phonetic: "mir-rabbihim", translation: "idghām" },
      { arabic: "مِنْ بَعْدِ", phonetic: "mim-baʿdi", translation: "iqlāb" },
    ],
    quiz: {
      question: "Quelle famille s’applique devant la lettre ب ?",
      options: ["Iqlāb", "Iẓhār", "Qalqalah"],
      correctIndex: 0,
      success: "Oui : devant ب, le n se transforme vers un m dissimulé.",
      retry: "L’iqlāb est la règle particulière de ب.",
    },
    duration: 16,
    sourceIds: tajweedSources,
  },
  {
    id: "mim-sakinah",
    order: 25,
    track: "tajweed",
    title: "Mīm sākinah : clair, fusionné ou dissimulé",
    summary:
      "Devant م : idghām ; devant ب : ikhfāʾ oral ; ailleurs : iẓhār oral.",
    explanation: [
      "Un mīm sākinah مْ fusionne avec un mīm suivant, est dissimulé devant bāʾ et reste clairement articulé devant les autres lettres.",
      "Garde les lèvres proches sans ajouter une voyelle. La ghunna des cas concernés reste contrôlée et régulière.",
    ],
    objectives: [
      "Repérer مْ",
      "Distinguer les cas devant م et ب",
      "Conserver une fermeture labiale nette",
    ],
    examples: [
      { arabic: "لَهُمْ مَا", phonetic: "lahum-mā", translation: "idghām" },
      { arabic: "عَلَيْهِمْ بِ", phonetic: "ʿalayhim-bi", translation: "ikhfāʾ oral" },
    ],
    quiz: {
      question: "Que se passe-t-il quand مْ est suivi de م ?",
      options: ["Idghām", "Qalqalah", "Madd"],
      correctIndex: 0,
      success: "Exact : les deux mīm fusionnent avec ghunna.",
      retry: "Deux mīm successifs se rejoignent.",
    },
    duration: 12,
    sourceIds: tajweedSources,
  },
  {
    id: "tajweed-guided-practice",
    order: 26,
    track: "tajweed",
    title: "Pratique guidée : Al-Fātiḥa",
    summary:
      "Repère les règles, écoute un verset, imite une courte portion puis fais-toi corriger.",
    explanation: [
      "Choisis un seul objectif par répétition : prolongations, lettres emphatiques, shadda ou pause. Écoute, répète, enregistre-toi puis compare.",
      "Termine la séance en faisant écouter un court passage à une personne qualifiée. Note une correction précise plutôt qu’un jugement général sur ta voix.",
    ],
    objectives: [
      "Isoler une règle par répétition",
      "Comparer sans accélérer",
      "Demander une correction précise",
    ],
    examples: [
      {
        arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
        phonetic: "ihdinā ṣ-ṣirāṭa l-mustaqīm",
      },
      {
        arabic: "وَلَا الضَّالِّينَ",
        phonetic: "wa-lā ḍ-ḍāllīn",
      },
    ],
    quiz: {
      question: "Quelle consigne donne la pratique la plus utile ?",
      options: [
        "Travailler toutes les règles en même temps",
        "Choisir une règle et demander une correction précise",
        "Lire le plus vite possible",
      ],
      correctIndex: 1,
      success: "Oui : un objectif précis rend la correction exploitable.",
      retry: "Réduis la quantité : une règle, une courte portion, une correction.",
    },
    duration: 15,
    sourceIds: tajweedSources,
    audioReference: "1:6",
  },
];

export const lessonById = new Map(
  beginnerLessons.map((lesson) => [lesson.id, lesson]),
);
