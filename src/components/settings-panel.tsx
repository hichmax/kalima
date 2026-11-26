"use client";

import { DownloadSimple, UploadSimple } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { QuranText } from "@/components/quran";
import type { QuranWord } from "@/lib/quran-types";
import { applyAppearance } from "@/lib/appearance";
import { PHONETIC_LEGEND } from "@/content/alphabet";
import { exportState, importState, isPersistent, resetState, updateState, useHydrated, useKalima, type Settings } from "@/lib/storage";

const PHONETIC_OPTIONS: Array<[Settings["phonetic"], string, string]> = [
  ["auto", "Progressive", "Visible la 1re semaine, à la demande la 2e, après ta lecture ensuite."],
  ["always", "Toujours", "Toujours visible (déconseillé au-delà de la 2e semaine)."],
  ["tap", "À la demande", "Un bouton pour l'afficher."],
  ["after", "Après lecture", "Lis d'abord, puis vérifie."],
  ["never", "Jamais", "Pour lire sans aucune aide."],
];

export function SettingsPanel({ preview }: { preview: QuranWord[] }) {
  const state = useKalima();
  const hydrated = useHydrated();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  if (!hydrated) return null;
  const settings = state.settings;

  const set = (patch: Partial<Settings>) => {
    updateState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
    applyAppearance(patch);
  };

  const download = () => {
    const blob = new Blob([exportState()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kalima-progression-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const upload = async (file: File) => {
    const result = importState(await file.text());
    setMessage(result.ok ? "Progression importée." : result.error);
  };

  return (
    <div className="stack" style={{ "--gap": "16px" } as React.CSSProperties}>
      {!isPersistent() ? (
        <p className="tip tip-warn" role="alert">
          Ton navigateur refuse l&apos;enregistrement local (navigation privée ou stockage plein). Ta progression sera perdue
          à la fermeture : exporte-la avant de partir.
        </p>
      ) : null}

      <section className="glass card stack" style={{ "--gap": "12px" } as React.CSSProperties}>
        <h2 className="h3">Phonétique</h2>
        <div className="options">
          {PHONETIC_OPTIONS.map(([value, label, hint]) => (
            <button key={value} type="button" className="option setting-option" data-state={settings.phonetic === value ? "correct" : undefined} aria-pressed={settings.phonetic === value} onClick={() => set({ phonetic: value })}>
              <span className="stack" style={{ "--gap": "2px", textAlign: "left" } as React.CSSProperties}>
                <strong>{label}</strong>
                <span className="faint">{hint}</span>
              </span>
            </button>
          ))}
        </div>
        <details className="legend">
          <summary>La convention de transcription</summary>
          <table className="table">
            <tbody>
              {PHONETIC_LEGEND.map((row) => (
                <tr key={row.ph}>
                  <td><strong>{row.ph}</strong></td>
                  <td className="ar table-ar" lang="ar" dir="rtl">{row.ar}</td>
                  <td className="muted">{row.hint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </section>

      <section className="glass card stack" style={{ "--gap": "12px" } as React.CSSProperties}>
        <h2 className="h3">Texte arabe</h2>
        <label className="stack" style={{ "--gap": "6px" } as React.CSSProperties}>
          <span className="muted">Taille : {Math.round(settings.arabicScale * 100)} %</span>
          <input type="range" min={0.8} max={1.8} step={0.1} value={settings.arabicScale} onChange={(e) => set({ arabicScale: Number(e.target.value) })} />
        </label>
        <QuranText words={preview} />
      </section>

      <section className="glass card stack" style={{ "--gap": "12px" } as React.CSSProperties}>
        <h2 className="h3">Apparence</h2>
        <div className="segmented">
          <button type="button" aria-pressed={settings.theme === "nuit"} onClick={() => set({ theme: "nuit" })}>Nuit</button>
          <button type="button" aria-pressed={settings.theme === "papier"} onClick={() => set({ theme: "papier" })}>Papier</button>
        </div>
        <p className="faint">Les animations suivent le réglage « réduire les animations » de ton appareil.</p>
      </section>

      <section className="glass card stack" style={{ "--gap": "12px" } as React.CSSProperties}>
        <h2 className="h3">Ma progression</h2>
        <p className="muted">
          Elle est enregistrée sur cet appareil uniquement, sans compte. Exporte-la pour la sauvegarder ou la transférer.
        </p>
        <div className="row">
          <button type="button" className="btn" onClick={download}>
            <DownloadSimple aria-hidden="true" /> Exporter
          </button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
            <UploadSimple aria-hidden="true" /> Importer
          </button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
        </div>
        {message ? <p className="faint" role="status">{message}</p> : null}
        <hr className="divider" />
        {confirmReset ? (
          <div className="row">
            <span className="muted">Tout effacer ? C&apos;est définitif.</span>
            <button type="button" className="btn small" onClick={() => { resetState(); setConfirmReset(false); setMessage("Progression effacée."); }}>Oui, effacer</button>
            <button type="button" className="btn small ghost" onClick={() => setConfirmReset(false)}>Annuler</button>
          </div>
        ) : (
          <button type="button" className="btn small ghost danger-text" onClick={() => setConfirmReset(true)}>
            Effacer ma progression
          </button>
        )}
      </section>
    </div>
  );
}
