import type {
  LearningGoal,
  LearningStage,
} from "@/lib/types";

export type LearningProfileResult = {
  stage: LearningStage;
  goal: LearningGoal;
  recommendedLessonId: string;
  phoneticAssist: "complete" | "progressive" | "hidden";
  learnedSurahIds: number[];
  rationale: string;
};

export function buildLearningProfile(
  answers: Record<string, string>,
): LearningProfileResult {
  const letters = answers.letters;
  const reading = answers.reading;
  const goalAnswer = answers.goal;

  const goal: LearningGoal =
    goalAnswer === "Améliorer mon tajwīd"
      ? "tajweed"
      : goalAnswer === "Apprendre les mots du Coran"
        ? "vocabulary"
        : goalAnswer === "Lire le Coran sans phonétique"
          ? "quran-reading"
          : "read";

  let stage: LearningStage = "alphabet";
  let recommendedLessonId = "alphabet-overview";
  let rationale =
    "Tu commences par les formes et les sons avant d’assembler les lettres.";

  if (letters === "Quelques-unes") {
    recommendedLessonId = "letter-families";
    rationale =
      "Tu reconnais déjà quelques lettres : les familles de formes vont compléter l’alphabet sans tout reprendre.";
  }

  if (
    letters === "La plupart" ||
    letters === "Toutes"
  ) {
    recommendedLessonId = "short-vowels";
    rationale =
      "Tu connais les lettres, mais la lecture demande de stabiliser les voyelles et les signes.";
  }

  if (reading === "Très lentement") {
    stage = "decoding";
    recommendedLessonId = "joining-forms";
    rationale =
      "Tu peux déjà décoder : le travail prioritaire est de reconnaître les formes liées et de fusionner les syllabes.";
  }

  if (reading === "Avec un peu d’aide") {
    stage = "reading";
    recommendedLessonId = "mushaf-signs";
    rationale =
      "La lecture de base est présente : tu peux maintenant apprendre les signes propres au muṣḥaf et les pauses.";
  }

  if (reading === "Oui, seul") {
    if (goal === "tajweed") {
      stage = "tajweed";
      recommendedLessonId = "tajweed-introduction";
      rationale =
        "Tu lis déjà seul et tu veux améliorer ta récitation : le parcours commence par le cadre et les points d’articulation.";
    } else if (goal === "vocabulary") {
      stage = "decoding";
      recommendedLessonId = "frequent-quran-words";
      rationale =
        "Tu lis déjà seul : tu peux travailler directement les mots coraniques les plus fréquents.";
    } else {
      stage = "reading";
      recommendedLessonId = "read-quran-phrases";
      rationale =
        "Tu lis déjà seul : le parcours commence par des phrases coraniques nouvelles et les signes du muṣḥaf.";
    }
  }

  if (goal === "read" && letters === "Aucune pour l’instant") {
    stage = "alphabet";
    recommendedLessonId = "alphabet-overview";
  }

  const learnedSurahIds =
    answers.memorized === "Al-Fātiḥa seulement"
      ? [1]
      : answers.memorized ===
          "Al-Fātiḥa + Al-Ikhlāṣ, Al-Falaq et An-Nās"
        ? [1, 112, 113, 114]
        : answers.memorized === "Ces quatre sourates et d’autres"
          ? [1, 112, 113, 114]
          : [];

  return {
    stage,
    goal,
    recommendedLessonId,
    phoneticAssist:
      reading === "Oui, seul"
        ? "progressive"
        : reading === "Avec un peu d’aide"
          ? "progressive"
          : "complete",
    learnedSurahIds,
    rationale,
  };
}
