/** Jour civil local de l'appareil, au format AAAA-MM-JJ (fuseau de l'utilisateur). */
export function localDayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dayKeyToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Nombre de jours civils entre deux clés (b - a). */
export function daysBetween(a: string, b: string): number {
  const ms = dayKeyToDate(b).getTime() - dayKeyToDate(a).getTime();
  return Math.round(ms / 86_400_000);
}

export function addDays(key: string, delta: number): string {
  const date = dayKeyToDate(key);
  date.setDate(date.getDate() + delta);
  return localDayKey(date);
}

/**
 * Série de jours actifs consécutifs se terminant aujourd'hui (ou hier si la séance
 * du jour n'est pas encore faite). Un jour de repos par période de 7 jours protège la série.
 */
export function computeStreak(activeDays: Set<string>, today: string): { current: number; restUsed: boolean } {
  let cursor = activeDays.has(today) ? today : addDays(today, -1);
  let current = 0;
  let restBudget = 1;
  let restUsed = false;
  let windowCount = 0;
  while (true) {
    if (activeDays.has(cursor)) {
      current += 1;
    } else if (restBudget > 0 && current > 0 && activeDays.has(addDays(cursor, -1))) {
      restBudget -= 1;
      restUsed = true;
    } else {
      break;
    }
    windowCount += 1;
    if (windowCount % 7 === 0) restBudget = 1;
    cursor = addDays(cursor, -1);
  }
  return { current, restUsed };
}
