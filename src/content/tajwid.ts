/**
 * Règles de tajwīd enseignées (riwāya Ḥafṣ ʿan ʿĀṣim, voie de la Shāṭibiyya).
 * Fondement : Tuḥfat al-Aṭfāl (al-Jamzūrī), al-Muqaddima al-Jazariyya (Ibn al-Jazarī).
 * STATUT : rédaction Kalima, relecture requise par un enseignant avec ijāza.
 */
export interface TajwidRule {
  id: string;
  name: string;
  ar: string;
  short: string;
}

export const tajwidRules: TajwidRule[] = [
  { id: "lam-qamariyya", name: "Lām lunaire", ar: "لَام قَمَرِيَّة", short: "Le lām de ال se prononce (ٱلْقَمَر)." },
  { id: "lam-shamsiyya", name: "Lām solaire", ar: "لَام شَمْسِيَّة", short: "Le lām de ال disparaît, la lettre suivante est doublée (ٱلشَّمْس)." },
  { id: "allah-tafkhim", name: "Lām d'Allah épais", ar: "تَفْخِيم", short: "Après une fatḥa ou une ḍamma, le lām d'Allah est épais." },
  { id: "allah-tarqiq", name: "Lām d'Allah fin", ar: "تَرْقِيق", short: "Après une kasra, le lām d'Allah est fin." },
  { id: "izhar", name: "Iẓhār (clarté)", ar: "إِظْهَار حَلْقِي", short: "Nūn sākina ou tanwīn devant ء ه ع ح غ خ : le n est net, sans ghunna prolongée." },
  { id: "idgham-ghunna", name: "Idghām avec ghunna", ar: "إِدْغَام بِغُنَّة", short: "Devant ي ن م و : le n se fond dans la lettre suivante, avec nasalisation (2 temps)." },
  { id: "idgham-sans-ghunna", name: "Idghām sans ghunna", ar: "إِدْغَام بِلَا غُنَّة", short: "Devant ل ر : le n se fond entièrement, sans nasalisation." },
  { id: "iqlab", name: "Iqlāb (conversion)", ar: "إِقْلَاب", short: "Devant ب : le n devient un m caché, avec ghunna. Signe : petit mīm ۢ." },
  { id: "ikhfa", name: "Ikhfāʾ (dissimulation)", ar: "إِخْفَاء", short: "Devant les 15 autres lettres : n à demi caché, nasalisé (2 temps)." },
  { id: "ikhfa-shafawi", name: "Ikhfāʾ labial", ar: "إِخْفَاء شَفَوِي", short: "Mīm sākina devant ب : m caché, avec ghunna." },
  { id: "idgham-mithlayn", name: "Idghām du mīm", ar: "إِدْغَام مِثْلَيْن صَغِير", short: "Mīm sākina devant م : les deux m fusionnent, avec ghunna." },
  { id: "izhar-shafawi", name: "Iẓhār labial", ar: "إِظْهَار شَفَوِي", short: "Mīm sākina devant les autres lettres : m net, surtout devant و et ف." },
  { id: "ghunna", name: "Ghunna", ar: "غُنَّة", short: "نّ et مّ (avec shadda) : nasalisation de 2 temps." },
  { id: "qalqala", name: "Qalqala (rebond)", ar: "قَلْقَلَة", short: "ق ط ب ج د avec sukūn : léger rebond. Plus marqué à l'arrêt." },
  { id: "madd-tabii", name: "Madd naturel", ar: "مَدّ طَبِيعِي", short: "Voyelle longue simple : 2 temps." },
  { id: "madd-muttasil", name: "Madd muttaṣil", ar: "مَدّ مُتَّصِل", short: "Voyelle longue suivie d'une hamza dans le même mot : 4 ou 5 temps." },
  { id: "madd-munfasil", name: "Madd munfaṣil", ar: "مَدّ مُنْفَصِل", short: "Voyelle longue en fin de mot, hamza au début du mot suivant : 4 ou 5 temps." },
  { id: "madd-lazim", name: "Madd lāzim", ar: "مَدّ لَازِم", short: "Voyelle longue suivie d'un sukūn permanent (souvent une shadda) : 6 temps." },
  { id: "madd-arid", name: "Madd ʿāriḍ", ar: "مَدّ عَارِض لِلسُّكُون", short: "Voyelle longue avant la dernière lettre, quand on s'arrête : 2, 4 ou 6 temps." },
  { id: "madd-lin", name: "Madd al-līn", ar: "مَدّ اللِّين", short: "و ou ي sākin après une fatḥa, avant la lettre où l'on s'arrête : 2, 4 ou 6 temps." },
  { id: "ra-tafkhim", name: "Rāʾ épais", ar: "تَفْخِيم ٱلرَّاء", short: "Rāʾ avec fatḥa ou ḍamma, ou sākin après fatḥa ou ḍamma." },
  { id: "ra-tarqiq", name: "Rāʾ fin", ar: "تَرْقِيق ٱلرَّاء", short: "Rāʾ avec kasra, ou sākin après une kasra (cas simples)." },
];

export const ruleById = (id: string) => {
  const rule = tajwidRules.find((r) => r.id === id);
  if (!rule) throw new Error(`Règle inconnue : ${id}`);
  return rule;
};
