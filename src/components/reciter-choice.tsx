"use client";

import { Segmented } from "@/components/segmented";
import { player, type Reciter } from "@/lib/recitation-client";
import { updateState, useHydrated, useKalima } from "@/lib/storage";

export const RECITERS: Array<{ value: Reciter; label: string; full: string }> = [
  { value: "afasy", label: "al-ʿAfāsī", full: "Mishary Rāshid al-ʿAfāsī" },
  { value: "dossari", label: "ad-Dawsarī", full: "Yāsir ad-Dawsarī" },
];

/** Choix du récitant (réglage partagé par Écouter, le Coran, la mémorisation et les cartes). */
export function ReciterChoice({ size = "sm" }: { size?: "sm" | "md" }) {
  const reciter = useKalima().settings.reciter;
  const hydrated = useHydrated();
  if (!hydrated) return null;
  return (
    <Segmented
      size={size}
      label="Récitant"
      value={reciter}
      onChange={(value) => {
        player.stop();
        updateState((s) => ({ ...s, settings: { ...s.settings, reciter: value } }));
      }}
      options={RECITERS.map((r) => ({ value: r.value, label: r.label }))}
    />
  );
}
