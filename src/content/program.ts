import { arabeLessons, bilanLessons } from "@/content/lessons-arabe";
import { lectureLessons } from "@/content/lessons-lecture";
import { tajwidLessons } from "@/content/lessons-tajwid";
import type { Lesson } from "@/content/types";

export const allLessons: Lesson[] = [...lectureLessons, ...tajwidLessons, ...arabeLessons, ...bilanLessons];

export function getLesson(id: string): Lesson {
  const lesson = allLessons.find((l) => l.id === id);
  if (!lesson) throw new Error(`Leçon inconnue : ${id}`);
  return lesson;
}

export interface MemorizeSegment {
  s: number;
  from: number;
  to: number;
}

export interface ProgramDay {
  day: number;
  week: 1 | 2 | 3 | 4 | 5;
  title: string;
  lessons: string[];
  memorize: MemorizeSegment[];
  /** Sourates « bonus » : facultatives pour un débutant complet. */
  bonus?: boolean;
  /** Nouveaux mots du jour (lemmes) : d'abord ceux des versets du jour, puis par fréquence. */
  newWords: number;
  challenge?: { title: string; tasks: string[] };
}

export const WEEKS = [
  { week: 1, title: "Les lettres", subtitle: "Lire l'alphabet · la Fātiḥa à l'écoute" },
  { week: 2, title: "Les signes", subtitle: "Sukūn, madd, shadda, tanwīn · sourates 112 à 114" },
  { week: 3, title: "Le tajwīd essentiel", subtitle: "Nūn, mīm, qalqala, rāʾ · sourates 108, 103, 110, 106" },
  { week: 4, title: "Lire le muṣḥaf", subtitle: "Madd, waqf, conventions · 105, 107, 109 en bonus" },
  { week: 5, title: "La suite", subtitle: "Consolider et continuer" },
] as const;

export const program: ProgramDay[] = [
  { day: 1, week: 1, title: "Le sens de lecture", lessons: ["lettres-1"], memorize: [{ s: 1, from: 1, to: 1 }], newWords: 6 },
  { day: 2, week: 1, title: "La gorge et les crochets", lessons: ["lettres-2"], memorize: [{ s: 1, from: 2, to: 2 }], newWords: 8 },
  { day: 3, week: 1, title: "Les lettres épaisses", lessons: ["lettres-3", "article"], memorize: [{ s: 1, from: 3, to: 4 }], newWords: 8 },
  { day: 4, week: 1, title: "Tout l'alphabet", lessons: ["lettres-4"], memorize: [{ s: 1, from: 5, to: 5 }], newWords: 10 },
  { day: 5, week: 1, title: "Les lettres liées", lessons: ["lettres-liees"], memorize: [{ s: 1, from: 6, to: 6 }], newWords: 10 },
  { day: 6, week: 1, title: "Premières syllabes", lessons: ["voyelles-breves", "pronoms"], memorize: [{ s: 1, from: 7, to: 7 }], newWords: 10 },
  {
    day: 7, week: 1, title: "Bilan : les lettres", lessons: ["bilan-1"], memorize: [{ s: 1, from: 1, to: 7 }], newWords: 6,
    challenge: { title: "Défi de la semaine 1", tasks: ["Réciter la Fātiḥa en entier, de mémoire, et t'enregistrer", "Réussir 80 % du bilan des lettres"] },
  },
  { day: 8, week: 2, title: "Le sukūn", lessons: ["sukun"], memorize: [{ s: 112, from: 1, to: 2 }], newWords: 10 },
  { day: 9, week: 2, title: "Les voyelles longues", lessons: ["voyelles-longues"], memorize: [{ s: 112, from: 3, to: 4 }], newWords: 10 },
  { day: 10, week: 2, title: "La shadda", lessons: ["shadda", "prefixes"], memorize: [{ s: 113, from: 1, to: 2 }], newWords: 10 },
  { day: 11, week: 2, title: "Le tanwīn", lessons: ["tanwin"], memorize: [{ s: 113, from: 3, to: 5 }], newWords: 10 },
  { day: 12, week: 2, title: "La hamza", lessons: ["hamza-wasl"], memorize: [{ s: 114, from: 1, to: 3 }], newWords: 10 },
  { day: 13, week: 2, title: "Soleil et lune", lessons: ["lam-article", "verbe-passe"], memorize: [{ s: 114, from: 4, to: 6 }], newWords: 10 },
  {
    day: 14, week: 2, title: "Bilan : lire sans aide", lessons: ["bilan-2"], memorize: [{ s: 112, from: 1, to: 4 }, { s: 113, from: 1, to: 5 }, { s: 114, from: 1, to: 6 }], newWords: 6,
    challenge: { title: "Défi de la semaine 2", tasks: ["Enchaîner 1, 112, 113 et 114 sans regarder", "Lire la Fātiḥa sans aucune phonétique"] },
  },
  { day: 15, week: 3, title: "D'où sortent les lettres", lessons: ["makharij"], memorize: [{ s: 108, from: 1, to: 3 }], newWords: 10 },
  { day: 16, week: 3, title: "Iẓhār et iqlāb", lessons: ["nun-1"], memorize: [{ s: 103, from: 1, to: 3 }], newWords: 10 },
  { day: 17, week: 3, title: "Idghām et ikhfāʾ", lessons: ["nun-2", "verbe-present"], memorize: [{ s: 110, from: 1, to: 2 }], newWords: 10 },
  { day: 18, week: 3, title: "Le mīm et la ghunna", lessons: ["mim-ghunna"], memorize: [{ s: 110, from: 3, to: 3 }], newWords: 10 },
  { day: 19, week: 3, title: "La qalqala", lessons: ["qalqala"], memorize: [{ s: 106, from: 1, to: 2 }], newWords: 10 },
  { day: 20, week: 3, title: "Le rāʾ", lessons: ["ra", "negation"], memorize: [{ s: 106, from: 3, to: 4 }], newWords: 10 },
  {
    day: 21, week: 3, title: "Bilan : repérer les règles", lessons: ["bilan-3"], memorize: [{ s: 108, from: 1, to: 3 }, { s: 103, from: 1, to: 3 }, { s: 110, from: 1, to: 3 }, { s: 106, from: 1, to: 4 }], newWords: 6,
    challenge: { title: "Défi de la semaine 3", tasks: ["Réciter 108, 103, 110 et 106, et t'enregistrer", "Dans 112 à 114, retrouver un exemple de chaque règle du nūn"] },
  },
  { day: 22, week: 4, title: "Muttaṣil et munfaṣil", lessons: ["madd-1", "idafa"], memorize: [{ s: 105, from: 1, to: 2 }], bonus: true, newWords: 10 },
  { day: 23, week: 4, title: "Six temps", lessons: ["madd-2"], memorize: [{ s: 105, from: 3, to: 5 }], bonus: true, newWords: 10 },
  { day: 24, week: 4, title: "S'arrêter", lessons: ["waqf"], memorize: [{ s: 107, from: 1, to: 3 }], bonus: true, newWords: 10 },
  { day: 25, week: 4, title: "Les signes du muṣḥaf", lessons: ["mushaf-signes"], memorize: [{ s: 107, from: 4, to: 7 }], bonus: true, newWords: 10 },
  { day: 26, week: 4, title: "Racines et schèmes", lessons: ["adab", "racines"], memorize: [{ s: 109, from: 1, to: 3 }], bonus: true, newWords: 10 },
  { day: 27, week: 4, title: "Lire une page inconnue", lessons: ["lire-87"], memorize: [{ s: 109, from: 4, to: 6 }], bonus: true, newWords: 10 },
  {
    day: 28, week: 4, title: "Bilan : tout le muṣḥaf", lessons: ["bilan-4"], memorize: [{ s: 1, from: 1, to: 7 }, { s: 112, from: 1, to: 4 }, { s: 113, from: 1, to: 5 }, { s: 114, from: 1, to: 6 }], newWords: 6,
    challenge: { title: "Défi de la semaine 4", tasks: ["Lire la sourate 87 (versets 1 à 8) sans phonétique", "Réciter tout ton parcours et t'enregistrer"] },
  },
  { day: 29, week: 5, title: "Révision générale", lessons: ["bilan-3"], memorize: [{ s: 108, from: 1, to: 3 }, { s: 103, from: 1, to: 3 }, { s: 110, from: 1, to: 3 }, { s: 106, from: 1, to: 4 }], newWords: 0 },
  {
    day: 30, week: 5, title: "Évaluation finale", lessons: ["bilan-final"], memorize: [{ s: 1, from: 1, to: 7 }], newWords: 0,
    challenge: { title: "Défi final", tasks: ["Enregistrer ta récitation complète", "La faire écouter à un enseignant ou à un proche qui maîtrise la lecture"] },
  },
];

export function getDay(day: number): ProgramDay {
  const found = program.find((d) => d.day === day);
  if (!found) throw new Error(`Jour inconnu : ${day}`);
  return found;
}

/** Sourates mémorisées dans le programme, dans l'ordre d'apprentissage. */
export const PROGRAM_SURAHS = [1, 112, 113, 114, 108, 103, 110, 106, 105, 107, 109] as const;

/** Phase de phonétique par défaut selon le jour (réglage « auto »). */
export function phoneticPhase(day: number): "always" | "tap" | "after" {
  if (day <= 7) return "always";
  if (day <= 14) return "tap";
  return "after";
}
