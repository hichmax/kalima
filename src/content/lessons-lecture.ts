import type { Lesson } from "@/content/types";

/**
 * Parcours « Lire » : de l'alphabet au texte vocalisé du muṣḥaf.
 * Progression inspirée d'al-Qāʿida an-Nūrāniyya : lettres → voyelles → signes.
 * STATUT : rédaction Kalima, relecture requise.
 */

const LETTER_SOURCES = ["nuraniyya", "jazariyya", "ehri-2014"] as const;

export const lectureLessons: Lesson[] = [
  {
    id: "lettres-1",
    track: "lecture",
    title: "Lire de droite à gauche",
    subtitle: "L'alif et la famille du bāʾ : ب ت ث ن ي",
    minutes: 10,
    status: "draft",
    sources: [...LETTER_SOURCES],
    blocks: [
      {
        kind: "text",
        title: "Une écriture qui part de la droite",
        body: "L'arabe s'écrit et se lit de droite à gauche. L'alphabet compte 28 lettres, toutes des consonnes ou des voyelles longues. Les voyelles brèves sont de petits signes posés au-dessus ou au-dessous des lettres ; dans le Coran, elles sont toujours écrites.",
      },
      {
        kind: "text",
        title: "Une forme, des points",
        body: "Beaucoup de lettres partagent le même corps et ne se distinguent que par leurs points. Aujourd'hui : un trait vertical, l'alif, et une « barque » qui donne cinq lettres selon ses points. Un point dessous : bāʾ. Deux points dessus : tāʾ. Trois points dessus : thāʾ. Un point dessus, corps plus rond : nūn. Deux points dessous : yāʾ.",
      },
      { kind: "letters", title: "Les lettres du jour", chars: ["ا", "ب", "ت", "ث", "ن", "ي"] },
      {
        kind: "tip",
        tone: "info",
        body: "La phonétique de Kalima suit une convention française simple : « ou » pour le son [u], « ch » pour ش, « dj » pour ج. Elle est expliquée dans la légende, toujours accessible. C'est une aide de départ : elle disparaîtra progressivement.",
      },
      {
        kind: "quran",
        ref: "1:1",
        focus: [1, 1],
        label: "Le premier mot du Coran commence par un bāʾ",
        note: "بِسْمِ : bi-smi, « au nom de ». Le point sous la lettre de droite, c'est le bāʾ.",
      },
    ],
    practice: [
      { gen: "letter-name", chars: ["ا", "ب", "ت", "ث", "ن", "ي"] },
      { gen: "name-letter", chars: ["ا", "ب", "ت", "ث", "ن", "ي"] },
      { gen: "letter-sound", chars: ["ب", "ت", "ث", "ن", "ي"] },
    ],
  },
  {
    id: "lettres-2",
    track: "lecture",
    title: "Trois familles : ج ح خ · د ذ · ر ز",
    subtitle: "Des lettres de la gorge et des lettres qui ne se lient pas",
    minutes: 10,
    status: "draft",
    sources: [...LETTER_SOURCES],
    blocks: [
      {
        kind: "text",
        title: "Le crochet : ج ح خ",
        body: "Même corps en forme de crochet. Point dessous : jīm (dj). Sans point : ḥāʾ, un h soufflé du milieu de la gorge, sans raclement. Point dessus : khāʾ, comme la jota espagnole.",
      },
      {
        kind: "text",
        title: "Deux petites familles : د ذ et ر ز",
        body: "dāl et dhāl ont le même angle ; dhāl porte un point et se prononce comme le « th » anglais de « this ». rāʾ et zāy descendent sous la ligne ; zāy porte un point. Ces quatre lettres ne se lient jamais à la lettre qui les suit.",
      },
      { kind: "letters", title: "Les lettres du jour", chars: ["ج", "ح", "خ", "د", "ذ", "ر", "ز"] },
      {
        kind: "quran",
        ref: "1:2",
        focus: [1, 1],
        label: "ḥāʾ dans ٱلْحَمْدُ",
        note: "al-ḥamdou, « la louange » : le ḥ est soufflé, jamais raclé comme le kh.",
      },
    ],
    practice: [
      { gen: "letter-name", chars: ["ج", "ح", "خ", "د", "ذ", "ر", "ز"] },
      { gen: "name-letter", chars: ["ج", "ح", "خ", "د", "ذ", "ر", "ز"] },
      { gen: "letter-sound", chars: ["ج", "ح", "خ", "د", "ذ", "ر", "ز"] },
    ],
  },
  {
    id: "lettres-3",
    track: "lecture",
    title: "Les sifflantes et les lettres épaisses",
    subtitle: "س ش · ص ض · ط ظ",
    minutes: 10,
    status: "draft",
    sources: [...LETTER_SOURCES],
    blocks: [
      {
        kind: "text",
        title: "Les dents : س ش",
        body: "sīn a trois petites dents. Avec trois points, c'est chīn (ch). Attention : le s arabe se lit toujours [s], même entre deux voyelles.",
      },
      {
        kind: "text",
        title: "Quatre lettres épaisses : ص ض ط ظ",
        body: "Ces lettres se prononcent la langue relevée vers le palais, ce qui leur donne un son plein et grave. ṣād est un s épais, ḍād un d épais, ṭāʾ un t épais, ẓāʾ un dh épais. Dans la phonétique, le point sous la lettre (ṣ, ḍ, ṭ, ẓ) signale cette épaisseur.",
      },
      { kind: "letters", title: "Les lettres du jour", chars: ["س", "ش", "ص", "ض", "ط", "ظ"] },
      {
        kind: "tip",
        tone: "warn",
        body: "Une lettre épaisse change le sens d'un mot : سَيْف (sayf, épée) n'est pas صَيْف (ṣayf, été). Écoute toujours le récitant.",
      },
      { kind: "quran", ref: "1:6", focus: [2, 2], label: "ṣād dans ٱلصِّرَٰطَ", note: "aṣ-ṣirâṭa, « le chemin »." },
    ],
    practice: [
      { gen: "letter-name", chars: ["س", "ش", "ص", "ض", "ط", "ظ"] },
      { gen: "name-letter", chars: ["س", "ش", "ص", "ض", "ط", "ظ"] },
      { gen: "letter-sound", chars: ["س", "ش", "ص", "ض", "ط", "ظ"] },
      {
        gen: "choice",
        items: [
          { q: "Laquelle de ces lettres est épaisse ?", options: ["س", "ص", "ش"], answer: 1, explain: "ṣād (ص) est la version épaisse de sīn (س).", card: "letter:ص" },
          { q: "Laquelle de ces lettres est épaisse ?", options: ["ت", "ث", "ط"], answer: 2, explain: "ṭāʾ (ط) est un t épais.", card: "letter:ط" },
          { q: "Laquelle de ces lettres est épaisse ?", options: ["د", "ض", "ذ"], answer: 1, explain: "ḍād (ض) est un d épais.", card: "letter:ض" },
        ],
      },
    ],
  },
  {
    id: "lettres-4",
    track: "lecture",
    title: "Les dernières lettres",
    subtitle: "ع غ · ف ق · ك ل م · ه و · ء",
    minutes: 12,
    status: "draft",
    sources: [...LETTER_SOURCES],
    blocks: [
      {
        kind: "text",
        title: "La gorge : ع غ",
        body: "ʿayn se prononce en serrant le milieu de la gorge : il n'existe pas en français, écoute-le plusieurs fois. Avec un point, c'est ghayn, le r grasseyé de « Paris ».",
      },
      {
        kind: "text",
        title: "Des lettres familières",
        body: "fāʾ (un point) et qāf (deux points) ont une tête ronde ; qāf est un k très profond, au niveau de la luette. kāf, lām, mīm, hāʾ et wāw ressemblent à leurs sons français. La hamza (ء) est un simple coup de glotte ; elle se pose souvent sur un alif, un wāw ou un yāʾ.",
      },
      { kind: "letters", title: "Les lettres du jour", chars: ["ع", "غ", "ف", "ق", "ك", "ل", "م", "ه", "و", "ء"] },
      { kind: "quran", ref: "1:5", focus: [2, 2], label: "ʿayn dans نَعْبُدُ", note: "naʿboudou, « nous adorons »." },
    ],
    practice: [
      { gen: "letter-name", chars: ["ع", "غ", "ف", "ق", "ك", "ل", "م", "ه", "و", "ء"] },
      { gen: "name-letter", chars: ["ع", "غ", "ف", "ق", "ك", "ل", "م", "ه", "و", "ء"] },
      { gen: "letter-sound", chars: ["ع", "غ", "ق", "ك", "ه", "ح"] },
    ],
  },
  {
    id: "lettres-liees",
    track: "lecture",
    title: "Les lettres liées",
    subtitle: "Début, milieu, fin : reconnaître une lettre dans un mot",
    minutes: 12,
    status: "draft",
    sources: [...LETTER_SOURCES],
    blocks: [
      {
        kind: "text",
        title: "Une lettre, jusqu'à quatre formes",
        body: "Dans un mot, les lettres s'attachent les unes aux autres. Elles prennent alors une forme de début, de milieu ou de fin. Le principe reste simple : on garde le « cœur » de la lettre et ses points, on raccourcit la queue.",
      },
      {
        kind: "text",
        title: "Six lettres refusent de se lier à la suivante",
        body: "ا د ذ ر ز و se lient à la lettre qui les précède, jamais à celle qui les suit. Après elles, la lettre suivante reprend une forme de début, même au milieu d'un mot.",
      },
      { kind: "letters", title: "Formes liées", chars: ["ب", "ج", "س", "ع", "ه", "م"], showForms: true },
      { kind: "quran", ref: "1:2", label: "Repère les lettres liées et les coupures", note: "Dans ٱلْعَـٰلَمِينَ, le alif coupe le mot : la lettre suivante reprend une forme de début." },
    ],
    practice: [
      { gen: "letter-forms", chars: ["ب", "ت", "ج", "ح", "س", "ش", "ص", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "ي"] },
      {
        gen: "choice",
        items: [
          { q: "Laquelle de ces lettres ne se lie jamais à la suivante ?", options: ["ب", "د", "س"], answer: 1, explain: "د fait partie des six lettres qui ne se lient pas à gauche : ا د ذ ر ز و.", card: "concept:non-liantes" },
          { q: "Laquelle de ces lettres ne se lie jamais à la suivante ?", options: ["و", "م", "ل"], answer: 0, explain: "و ne se lie jamais à la lettre qui suit.", card: "concept:non-liantes" },
          { q: "Laquelle de ces lettres ne se lie jamais à la suivante ?", options: ["ن", "ك", "ر"], answer: 2, explain: "ر ne se lie jamais à la lettre qui suit.", card: "concept:non-liantes" },
          { q: "Combien de lettres refusent de se lier à la suivante ?", options: ["4", "6", "8"], answer: 1, explain: "Six : ا د ذ ر ز و.", card: "concept:non-liantes" },
        ],
      },
    ],
  },
  {
    id: "voyelles-breves",
    track: "lecture",
    title: "Les voyelles brèves",
    subtitle: "fatḥa, kasra, ḍamma : lire ses premières syllabes",
    minutes: 12,
    status: "draft",
    sources: ["nuraniyya", "abu-rabia-2001", "ehri-2014"],
    blocks: [
      {
        kind: "text",
        title: "Trois petits signes",
        body: "La fatḥa est un petit trait au-dessus de la lettre : « a ». La kasra est le même trait au-dessous : « i ». La ḍamma est une petite boucle au-dessus : « ou ». Une lettre + un signe = une syllabe.",
      },
      {
        kind: "syllables",
        title: "Lis à voix haute, puis vérifie",
        items: [
          { ar: "بَ", ph: "ba" },
          { ar: "بِ", ph: "bi" },
          { ar: "بُ", ph: "bou" },
          { ar: "رَ", ph: "ra" },
          { ar: "رِ", ph: "ri" },
          { ar: "رُ", ph: "rou" },
          { ar: "قَ", ph: "qa" },
          { ar: "قِ", ph: "qi" },
          { ar: "قُ", ph: "qou" },
        ],
      },
      {
        kind: "tip",
        tone: "info",
        body: "Les lettres épaisses (ص ض ط ظ ق خ غ) « assombrissent » la voyelle : qa sonne plus grave que ka. Laisse ton oreille te guider.",
      },
      { kind: "quran", ref: "113:2", focus: [4, 4], label: "Trois syllabes : خَ لَ قَ", note: "khalaqa, « Il a créé »." },
    ],
    practice: [
      { gen: "syllable", chars: ["ب", "ت", "ن", "ر", "س", "د", "م", "ل", "ك", "ف", "ق", "ع", "ح", "ه", "ص", "ط"], vowels: ["a", "i", "u"] },
    ],
  },
  {
    id: "sukun",
    track: "lecture",
    title: "Le sukūn : la lettre sans voyelle",
    subtitle: "Fermer une syllabe",
    minutes: 10,
    status: "draft",
    sources: ["nuraniyya", "mushaf-madina"],
    blocks: [
      {
        kind: "text",
        title: "Une consonne seule",
        body: "Le sukūn indique qu'une lettre ne porte aucune voyelle : elle ferme la syllabe précédente. أَبْ se lit « ab », قُلْ se lit « qoul ». Dans le muṣḥaf de Médine, le sukūn a la forme d'une petite tête de ḥāʾ, sans point ; ailleurs, c'est souvent un petit rond.",
      },
      {
        kind: "tip",
        tone: "warn",
        body: "Dans le muṣḥaf de Médine, le petit rond PARFAIT (۟) ne veut pas dire sukūn : il signale une lettre qui ne se prononce pas du tout. Ce point sera vu en semaine 4.",
      },
      { kind: "quran", ref: "112:1", focus: [1, 1], label: "قُلْ : qoul", note: "Le lām porte un sukūn : la syllabe se ferme." },
      { kind: "quran", ref: "112:3", label: "Lis tout le verset", note: "lam yalid wa lam yoûlad : quatre lettres avec sukūn." },
    ],
    practice: [
      { gen: "syllable", chars: ["ب", "ت", "ن", "ر", "س", "د", "م", "ل", "ك", "ق", "ع", "ح"], vowels: ["sukun", "a", "i", "u"] },
      {
        gen: "choice",
        items: [
          { q: "Comment se lit ce mot ?", ref: "112:1:1", options: ["qoula", "qoul", "qal"], answer: 1, explain: "ق + ḍamma = qou ; ل + sukūn = l.", card: "sign:sukun" },
          { q: "Comment se lit ce mot ?", ref: "112:3:1", options: ["lam", "lama", "lim"], answer: 0, explain: "ل + fatḥa = la ; م + sukūn = m.", card: "sign:sukun" },
        ],
      },
    ],
  },
  {
    id: "voyelles-longues",
    track: "lecture",
    title: "Les voyelles longues",
    subtitle: "ا و ي qui prolongent, et les petites lettres du muṣḥaf",
    minutes: 12,
    status: "draft",
    sources: ["nuraniyya", "tuhfa", "mushaf-madina"],
    blocks: [
      {
        kind: "text",
        title: "Prolonger de deux temps",
        body: "Après une fatḥa, un alif allonge le « a » : بَا = bâ. Après une kasra, un yāʾ sans voyelle allonge le « i » : بِي = bî. Après une ḍamma, un wāw sans voyelle allonge le « ou » : بُو = boû. Cette prolongation naturelle (madd ṭabīʿī) dure deux temps, environ deux fois une voyelle brève.",
      },
      {
        kind: "text",
        title: "Les petites lettres",
        body: "Le muṣḥaf écrit parfois la voyelle longue en petit : un petit alif vertical (ـٰ) comme dans ٱلرَّحْمَـٰنِ, un petit wāw (ۥ) ou un petit yāʾ (ۦ) après le pronom « hi / hou ». Ils se lisent exactement comme des voyelles longues.",
      },
      {
        kind: "syllables",
        items: [
          { ar: "بَا", ph: "bâ" },
          { ar: "بِي", ph: "bî" },
          { ar: "بُو", ph: "boû" },
          { ar: "نَا", ph: "nâ" },
          { ar: "نِي", ph: "nî" },
          { ar: "نُو", ph: "noû" },
        ],
      },
      { kind: "quran", ref: "1:1", focus: [3, 3], label: "Petit alif dans ٱلرَّحْمَـٰنِ", note: "ar-raḥmâni : le petit alif vertical allonge le « a »." },
      { kind: "quran", ref: "112:4", focus: [3, 3], label: "Petit wāw dans لَّهُۥ", note: "lahoû : le petit wāw allonge le « ou »." },
    ],
    practice: [
      { gen: "syllable", chars: ["ب", "ت", "ن", "ر", "س", "د", "م", "ل", "ك", "ق", "ع", "ح", "ف"], vowels: ["aa", "ii", "uu", "a", "i", "u"] },
      {
        gen: "choice",
        items: [
          { q: "Combien de temps dure une voyelle longue naturelle ?", options: ["1 temps", "2 temps", "6 temps"], answer: 1, explain: "Le madd ṭabīʿī dure deux temps.", card: "rule:madd-tabii" },
          { q: "Comment se lit ce mot ?", ref: "1:4:1", options: ["maliki", "mâliki", "malakî"], answer: 1, explain: "Le petit alif après le mīm allonge le « a » : mâliki.", card: "sign:petit-alif" },
          { q: "Comment se lit ce mot ?", ref: "114:3:1", options: ["ilâhi", "ilahi", "alâhi"], answer: 0, explain: "Le petit alif vertical allonge le « a » : ilâhi.", card: "sign:petit-alif" },
        ],
      },
    ],
  },
  {
    id: "shadda",
    track: "lecture",
    title: "La shadda : la lettre doublée",
    subtitle: "Appuyer sur une consonne",
    minutes: 10,
    status: "draft",
    sources: ["nuraniyya"],
    blocks: [
      {
        kind: "text",
        title: "Deux fois la même lettre",
        body: "La shadda (ـّ), un petit « w » au-dessus de la lettre, indique qu'elle est doublée : une première fois avec sukūn, une seconde fois avec sa voyelle. رَبِّ se lit « rab-bi ». La phonétique de Kalima double la consonne : rabbi.",
      },
      { kind: "quran", ref: "1:2", focus: [3, 3], label: "رَبِّ : rabbi", note: "« Seigneur » : le bāʾ est doublé." },
      { kind: "quran", ref: "1:5", focus: [1, 1], label: "إِيَّاكَ : iyyâka", note: "Le yāʾ est doublé." },
      { kind: "quran", ref: "113:2", focus: [2, 2], label: "شَرِّ : charri", note: "Le rāʾ est doublé, et roulé." },
    ],
    practice: [
      { gen: "syllable", chars: ["ب", "ت", "ن", "ر", "س", "د", "م", "ل", "ك", "ق"], vowels: ["shadda", "sukun", "a"] },
      {
        gen: "choice",
        items: [
          { q: "Comment se lit ce mot ?", ref: "1:2:3", options: ["rabi", "rabbi", "rabbî"], answer: 1, explain: "Shadda sur le bāʾ : rab-bi.", card: "sign:shadda" },
          { q: "Comment se lit ce mot ?", ref: "113:2:2", options: ["charri", "chari", "charî"], answer: 0, explain: "Shadda sur le rāʾ : char-ri.", card: "sign:shadda" },
          { q: "Que signifie la shadda ?", options: ["La lettre est muette", "La lettre est doublée", "La voyelle est longue"], answer: 1, explain: "La shadda double la consonne.", card: "sign:shadda" },
        ],
      },
    ],
  },
  {
    id: "tanwin",
    track: "lecture",
    title: "Le tanwīn, la tāʾ marbūṭa et le alif maqṣūra",
    subtitle: "an, in, oun · ة · ى",
    minutes: 12,
    status: "draft",
    sources: ["nuraniyya", "mushaf-madina"],
    blocks: [
      {
        kind: "text",
        title: "Le tanwīn : un « n » final",
        body: "Une voyelle doublée en fin de mot ajoute un « n » : ـً = an, ـٍ = in, ـٌ = oun. Ce n n'est pas écrit comme une lettre, mais il se prononce. Attention : « an » se dit comme dans « Anne », jamais nasal comme dans « an ».",
      },
      {
        kind: "text",
        title: "ة et ى",
        body: "La tāʾ marbūṭa (ة) ressemble à un hāʾ coiffé de deux points : en lecture continue, elle se lit « t ». Le alif maqṣūra (ى) est un yāʾ sans points qui se lit « â » : عَلَىٰ = ʿalâ.",
      },
      { kind: "quran", ref: "112:1", focus: [4, 4], label: "Tanwīn ḍamma : أَحَدٌ", note: "aḥadoun en lecture continue." },
      { kind: "quran", ref: "112:4", focus: [4, 4], label: "Tanwīn fatḥa : كُفُوًا", note: "koufouwan. Le tanwīn fatḥa s'écrit avec un alif, qui ne se lit pas en continu." },
      { kind: "quran", ref: "101:11", focus: [2, 2], label: "tāʾ marbūṭa : حَامِيَةٌ", note: "ḥâmiyatoun en lecture continue." },
      {
        kind: "tip",
        tone: "review",
        body: "À l'arrêt, ces fins changent : أَحَدٌ devient « aḥad », et ة devient « h ». C'est l'objet de la leçon sur le waqf, en semaine 4.",
      },
    ],
    practice: [
      { gen: "syllable", chars: ["ب", "ت", "ن", "ر", "د", "م", "ل", "ك", "ق", "ع"], vowels: ["an", "in", "un", "a", "u"] },
      {
        gen: "choice",
        items: [
          { q: "Comment se lit ce mot en lecture continue ?", ref: "112:1:4", options: ["aḥadoun", "aḥad", "aḥada"], answer: 0, explain: "Tanwīn ḍamma : oun.", card: "sign:tanwin" },
          { q: "Que fait la tāʾ marbūṭa (ة) en lecture continue ?", options: ["Elle se lit t", "Elle est muette", "Elle se lit h"], answer: 0, explain: "En continu, ة se lit t ; à l'arrêt, h.", card: "sign:ta-marbuta" },
          { q: "Comment se lit ce mot ?", ref: "107:3:3", options: ["ʿalî", "ʿalâ", "ʿalay"], answer: 1, explain: "Le ى sans points se lit « â » : ʿalâ.", card: "sign:alif-maqsura" },
        ],
      },
    ],
  },
  {
    id: "hamza-wasl",
    track: "lecture",
    title: "La hamza et la hamzat al-waṣl",
    subtitle: "Le coup de glotte, et le alif qui disparaît",
    minutes: 12,
    status: "draft",
    sources: ["nuraniyya", "jazariyya", "marsafi"],
    blocks: [
      {
        kind: "text",
        title: "La hamza : un coup de glotte",
        body: "La hamza (ء) se pose sur un alif (أ إ), un wāw (ؤ), un yāʾ sans points (ئ) ou directement sur la ligne. Elle se prononce toujours : c'est un bref arrêt de la voix.",
      },
      {
        kind: "text",
        title: "La hamzat al-waṣl (ٱ)",
        body: "Le alif surmonté d'un petit ṣād (ٱ) est une hamza de liaison. En lecture continue, elle ne se prononce JAMAIS : on passe directement de la voyelle précédente à la lettre suivante. Elle se prononce seulement quand on commence la lecture par ce mot.",
      },
      {
        kind: "table",
        title: "Par quelle voyelle commencer ?",
        head: ["Cas", "Voyelle de départ", "Exemple"],
        rows: [
          ["Article ال", "a", "ٱلْحَمْدُ → al-ḥamdou"],
          ["Verbe dont la 3ᵉ lettre a une ḍamma", "ou", "ٱدْخُلُوا۟ → oudkhoulou"],
          ["Autre verbe", "i", "ٱهْدِنَا → ihdinâ"],
          ["Quelques noms (ٱسْم، ٱبْن، ٱمْرَأَة…)", "i", "ٱسْم → ism"],
        ],
      },
      { kind: "quran", ref: "1:6", focus: [1, 1], label: "Commencer par ٱهْدِنَا", note: "Verbe, 3ᵉ lettre avec kasra : on commence par « i » → ihdinâ." },
      { kind: "quran", ref: "1:2", focus: [1, 2], label: "Continuer : ٱلْحَمْدُ لِلَّهِ", note: "En début de lecture : al-ḥamdou. Le ٱ de لِلَّهِ ne se prononce pas : lil-lâhi." },
    ],
    practice: [
      {
        gen: "choice",
        items: [
          { q: "En lecture continue, la hamzat al-waṣl (ٱ)…", options: ["se prononce toujours", "ne se prononce jamais", "se prononce une fois sur deux"], answer: 1, explain: "Elle tombe toujours en lecture continue.", card: "sign:hamzat-wasl" },
          { q: "Tu commences ta lecture par ce mot. Comment le dis-tu ?", ref: "1:6:1", options: ["ihdinâ", "ahdinâ", "hdinâ"], answer: 0, explain: "Verbe dont la 3ᵉ lettre porte une kasra : on commence par « i ».", card: "sign:hamzat-wasl" },
          { q: "Tu commences ta lecture par ce mot. Comment le dis-tu ?", ref: "1:2:1", options: ["oul-ḥamdou", "il-ḥamdou", "al-ḥamdou"], answer: 2, explain: "Avec l'article ال, on commence toujours par « a ».", card: "sign:hamzat-wasl" },
          { q: "Ce mot contient-il une hamza qui se prononce ?", ref: "1:5:1", options: ["Oui, au début", "Non"], answer: 0, explain: "إِ porte une hamza (coup de glotte) : iyyâka.", card: "letter:ء" },
          { q: "Dans ce mot, entends-tu une hamza ?", ref: "110:1:2", options: ["Oui", "Non"], answer: 0, explain: "جَآءَ : djâ'a, la hamza finale se prononce.", card: "letter:ء" },
          { q: "En lecture continue, comment se lit ce mot ?", ref: "108:2:3", options: ["wa nḥar", "wa anḥar", "wa inḥar"], answer: 0, explain: "La hamzat al-waṣl tombe : wa-nḥar.", card: "sign:hamzat-wasl" },
          { q: "Après سَبِّحِ, en continu, comment se lit ce mot ?", ref: "87:1:2", options: ["isma", "sma", "asma"], answer: 1, explain: "sabbiḥi sma : la hamzat al-waṣl tombe.", card: "sign:hamzat-wasl" },
        ],
      },
    ],
  },
  {
    id: "lam-article",
    track: "lecture",
    title: "Lettres solaires et lunaires, et le nom d'Allah",
    subtitle: "Quand le lām de ال se prononce ou disparaît",
    minutes: 12,
    status: "draft",
    sources: ["tuhfa", "jazariyya"],
    blocks: [
      {
        kind: "text",
        title: "Deux comportements",
        body: "Devant 14 lettres « lunaires », le lām de l'article se prononce et porte un sukūn : ٱلْقَمَر = al-qamar. Devant 14 lettres « solaires », il disparaît et la lettre suivante prend une shadda : ٱلشَّمْس = ach-chams. Dans le muṣḥaf, le lām solaire n'a pas de signe et la lettre suivante a une shadda.",
      },
      {
        kind: "table",
        head: ["Lunaires (le lām se prononce)", "Solaires (le lām disparaît)"],
        rows: [["ا ب ج ح خ ع غ ف ق ك م و ه ي", "ت ث د ذ ر ز س ش ص ض ط ظ ل ن"]],
        arabicCols: [0, 1],
      },
      {
        kind: "text",
        title: "Le lām du nom d'Allah",
        body: "Après une fatḥa ou une ḍamma, le lām d'Allah est épais (tafkhīm) : هُوَ ٱللَّهُ. Après une kasra, il est fin (tarqīq) : بِسْمِ ٱللَّهِ.",
      },
      { kind: "quran", ref: "114:1", focus: [4, 4], label: "Solaire : ٱلنَّاسِ", note: "an-nâs : le lām disparaît, le nūn est doublé." },
      { kind: "quran", ref: "113:1", focus: [4, 4], label: "Lunaire : ٱلْفَلَقِ", note: "al-falaq : le lām se prononce." },
      { kind: "quran", ref: "112:1", focus: [2, 3], label: "Allah épais", note: "houwa l-lâhou : fatḥa avant, lām épais." },
      { kind: "quran", ref: "1:1", focus: [1, 2], label: "Allah fin", note: "bismi l-lâhi : kasra avant, lām fin." },
    ],
    practice: [
      {
        gen: "rule",
        prompt: "Le lām de l'article est-il lunaire ou solaire ?",
        options: ["lam-qamariyya", "lam-shamsiyya"],
        items: [
          { ref: "114:1:4", answer: "lam-shamsiyya" },
          { ref: "113:1:4", answer: "lam-qamariyya" },
          { ref: "1:2:1", answer: "lam-qamariyya" },
          { ref: "1:6:2", answer: "lam-shamsiyya" },
          { ref: "108:1:3", answer: "lam-qamariyya" },
          { ref: "1:4:3", answer: "lam-shamsiyya" },
          { ref: "103:1:1", answer: "lam-qamariyya" },
          { ref: "106:2:3", answer: "lam-shamsiyya" },
          { ref: "113:4:5", answer: "lam-qamariyya" },
          { ref: "1:1:3", answer: "lam-shamsiyya" },
        ],
      },
      {
        gen: "rule",
        prompt: "Le lām d'Allah est-il épais ou fin ?",
        options: ["allah-tafkhim", "allah-tarqiq"],
        items: [
          { ref: "112:1:2-3", answer: "allah-tafkhim", explain: "Fatḥa avant (houwa) : épais." },
          { ref: "1:1:1-2", answer: "allah-tarqiq", explain: "Kasra avant (bismi) : fin." },
          { ref: "110:1:3-4", answer: "allah-tafkhim", explain: "Ḍamma avant (naṣrou) : épais." },
          { ref: "110:2:5-6", answer: "allah-tarqiq", explain: "Kasra avant (dîni) : fin." },
        ],
      },
    ],
  },
  {
    id: "mushaf-signes",
    track: "lecture",
    title: "Lire le muṣḥaf de Médine",
    subtitle: "Les petits signes qui changent la lecture",
    minutes: 14,
    status: "draft",
    sources: ["mushaf-madina", "marsafi"],
    blocks: [
      {
        kind: "text",
        title: "Le muṣḥaf parle par ses signes",
        body: "Le muṣḥaf de Médine (Complexe du Roi Fahd) applique des conventions précises, expliquées dans sa postface. Les connaître, c'est pouvoir lire n'importe quelle page sans phonétique.",
      },
      {
        kind: "table",
        head: ["Signe", "Nom", "Effet"],
        rows: [
          ["۟", "petit rond", "Lettre jamais prononcée (ءَامَنُوا۟ : âmanoû)"],
          ["۠", "petit rectangle", "Alif prononcé seulement à l'arrêt (أَنَا۠)"],
          ["ۢ ۭ", "petit mīm", "Iqlāb : le n devient m (لَيُنۢبَذَنَّ)"],
          ["ٓ", "madda", "Prolongation de plus de 2 temps"],
          ["ۜ", "petit sīn sur ص", "Lire s au lieu de ṣ (يَبْصُۜطُ)"],
          ["ۜ", "petit sīn isolé", "Sakta : courte pause sans reprendre son souffle"],
          ["۩", "prosternation", "Lieu de prosternation de récitation"],
        ],
        arabicCols: [0],
      },
      {
        kind: "text",
        title: "Sukūn présent ou absent",
        body: "Une lettre sans voyelle qui porte le sukūn se prononce clairement : مِّنْ خَوْفٍ (iẓhār). Sans sukūn, elle se cache ou se fond dans la suivante : مِن شَرِّ (ikhfāʾ). Si en plus la lettre suivante a une shadda, elle s'y fond entièrement : مِّن مَّسَدٍ (idghām).",
      },
      {
        kind: "tip",
        tone: "info",
        body: "Dans le muṣḥaf imprimé, les deux traits du tanwīn sont superposés (iẓhār) ou décalés (idghām ou ikhfāʾ). Le texte numérique utilisé ici (Tanzil) n'encode pas cette différence : apprends-la sur un muṣḥaf papier.",
      },
      { kind: "quran", ref: "103:3", focus: [3, 4], label: "Petit rond : ءَامَنُوا۟ وَعَمِلُوا۟", note: "Le alif final porte le petit rond : il ne se lit pas." },
      { kind: "quran", ref: "109:4", focus: [2, 2], label: "Petit rectangle : أَنَا۠", note: "« ana » en continu ; « anâ » à l'arrêt." },
      { kind: "quran", ref: "83:14", focus: [2, 3], label: "Sakta : بَلْ ۜ رَانَ", note: "Courte pause sur bal, sans respirer, puis rân." },
    ],
    practice: [
      {
        gen: "choice",
        items: [
          { q: "Comment se lit ce mot ?", ref: "103:3:3", options: ["âmanoûâ", "âmanoû", "amanou"], answer: 1, explain: "Le alif avec le petit rond ne se lit pas.", card: "sign:petit-rond" },
          { q: "Comment se lit ce mot en lecture continue ?", ref: "109:4:2", options: ["ana", "anâ", "anan"], answer: 0, explain: "Le alif avec le petit rectangle ne se lit qu'à l'arrêt.", card: "sign:petit-rectangle" },
          { q: "Que signale le petit mīm (ۢ) ?", ref: "104:4:2", options: ["Une ghunna de 6 temps", "Le n devient m (iqlāb)", "Une lettre muette"], answer: 1, explain: "Iqlāb : لَيُنۢبَذَنَّ se lit layoumbadhanna.", card: "rule:iqlab" },
          { q: "Le nūn est-il prononcé clairement ici ?", ref: "106:4:6", options: ["Oui, il porte le sukūn", "Non, il est caché"], answer: 0, explain: "مِّنْ porte un sukūn devant خ : iẓhār.", card: "rule:izhar" },
          { q: "Le nūn est-il prononcé clairement ici ?", ref: "113:2:1", options: ["Oui", "Non, il est caché (pas de sukūn)"], answer: 1, explain: "مِن sans sukūn devant ش : ikhfāʾ.", card: "rule:ikhfa" },
          { q: "Que fait-on à ce signe ?", ref: "83:14:2", options: ["Une courte pause sans respirer", "On s'arrête et on respire", "On prolonge 6 temps"], answer: 0, explain: "C'est la sakta, une des quatre de la lecture de Ḥafṣ.", card: "sign:sakta" },
        ],
      },
    ],
  },
  {
    id: "lire-87",
    track: "lecture",
    title: "Lire une page inconnue",
    subtitle: "Sourate 87, versets 1 à 8, sans phonétique",
    minutes: 15,
    status: "draft",
    sources: ["mushaf-madina", "tuhfa"],
    blocks: [
      {
        kind: "text",
        title: "Tu sais lire",
        body: "Voici un passage que tu n'as pas mémorisé. Lis-le lentement, sans phonétique, en repérant chaque règle vue ce mois-ci. Puis écoute le récitant et compare.",
      },
      { kind: "quran", ref: "87:1" },
      { kind: "quran", ref: "87:2" },
      { kind: "quran", ref: "87:3" },
      { kind: "quran", ref: "87:4" },
      { kind: "quran", ref: "87:5" },
      { kind: "quran", ref: "87:6" },
      { kind: "quran", ref: "87:7" },
      { kind: "quran", ref: "87:8" },
    ],
    practice: [
      {
        gen: "rule",
        prompt: "Quelle règle repères-tu ici ?",
        options: ["madd-munfasil", "madd-muttasil", "izhar", "ikhfa", "qalqala", "lam-qamariyya", "allah-tafkhim", "ra-tafkhim"],
        items: [
          { ref: "87:4:1-2", answer: "madd-munfasil", explain: "Voyelle longue en fin de mot, hamza au début du suivant." },
          { ref: "87:5:2", answer: "madd-muttasil", explain: "Hamza dans le même mot." },
          { ref: "87:5:2-3", answer: "izhar", explain: "Tanwīn devant une hamza." },
          { ref: "87:6:1", answer: "qalqala", explain: "ق sans voyelle." },
          { ref: "87:6:3", answer: "ikhfa", explain: "Nūn devant س." },
          { ref: "87:7:3", answer: "madd-muttasil", explain: "شَآءَ." },
          { ref: "87:7:7", answer: "lam-qamariyya", explain: "ٱلْجَهْرَ : le lām se prononce." },
          { ref: "87:7:3-4", answer: "allah-tafkhim", explain: "Fatḥa avant le nom d'Allah." },
          { ref: "87:3:2", answer: "ra-tafkhim", explain: "Rāʾ avec fatḥa." },
        ],
      },
    ],
  },
];
