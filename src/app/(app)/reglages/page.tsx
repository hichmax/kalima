import type { Metadata } from "next";
import { SettingsPanel } from "@/components/settings-panel";
import { resolveRef } from "@/lib/quran-data";

export const metadata: Metadata = { title: "Réglages" };

export default async function SettingsPage() {
  // Aperçu de la taille du texte : verset 1:2, issu de Tanzil.
  const preview = await resolveRef("1:2");
  return (
    <main className="narrow page stack" style={{ "--gap": "22px" } as React.CSSProperties}>
      <header className="stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <span className="eyebrow plain">Réglages</span>
        <h1>À ta façon</h1>
      </header>
      <SettingsPanel preview={preview.words} />
    </main>
  );
}
