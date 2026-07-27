import type { VocabularyUnit } from "@/lib/types";

export const getTodayKey = () => {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${value.year}-${value.month}-${value.day}`;
};

const hash = (value: string) => {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
};

export function selectDailyWords(
  units: VocabularyUnit[],
  date = getTodayKey(),
): VocabularyUnit[] {
  const ready = units
    .filter((unit) => unit.level === 1)
    .slice(0, 180);

  return [...ready]
    .sort((left, right) => {
      const difference =
        hash(`${date}:${left.id}`) - hash(`${date}:${right.id}`);
      return difference || left.id.localeCompare(right.id);
    })
    .slice(0, 5);
}

export function isPreviousDay(previous: string | null, current: string) {
  if (!previous) return false;
  const previousDate = new Date(`${previous}T00:00:00.000Z`);
  previousDate.setUTCDate(previousDate.getUTCDate() + 1);
  return previousDate.toISOString().slice(0, 10) === current;
}
